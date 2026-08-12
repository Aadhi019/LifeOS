import os
import json
import random
from typing import Dict, Any, List
from langchain_core.messages import HumanMessage
from lifeos.app.agents.state import AgentState

def load_mock_flights() -> List[Dict[str, Any]]:
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    mock_file_path = os.path.join(current_dir, "mock_flights.json")
    if os.path.exists(mock_file_path):
        with open(mock_file_path, "r") as f:
            return json.load(f)
    return []

def generate_dynamic_flights(origin: str, destination: str, date_str: str) -> List[Dict[str, Any]]:
    """Generates fallback mock flights if no match is found in mock_flights.json."""
    airlines = ["IndiGo", "Air India", "Vistara", "Akasa Air", "SpiceJet"]
    is_international = destination.lower() in ["paris", "london", "new york", "tokyo", "singapore"]
    
    flights = []
    base_price = 45000 if is_international else 4000
    base_duration = 12.0 if is_international else 2.0
    
    for i in range(3):
        stops = 0 if i == 0 else (1 if i == 1 else 2)
        price_factor = 1.0 - (stops * 0.15) + (random.random() * 0.1)
        duration_factor = 1.0 + (stops * 0.3) + (random.random() * 0.05)
        
        price = int(base_price * price_factor)
        duration = round(base_duration * duration_factor, 1)
        rating = round(3.8 + (random.random() * 1.2), 1)
        
        flights.append({
            "origin": origin,
            "destination": destination,
            "airline": airlines[i % len(airlines)],
            "price": price,
            "duration": duration,
            "departure": f"0{6+i}:00 AM" if i % 2 == 0 else f"0{4+i}:30 PM",
            "arrival": f"0{8+i}:30 AM" if i % 2 == 0 else f"0{9+i}:00 PM",
            "stops": stops,
            "rating": rating
        })
    return flights

def rank_flights(flights: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if not flights:
        return []
        
    prices = [f["price"] for f in flights]
    durations = [f["duration"] for f in flights]
    
    min_price = min(prices) if prices else 1
    min_duration = min(durations) if durations else 1
    
    ranked = []
    for f in flights:
        price_score = (min_price / f["price"]) * 100 if f["price"] > 0 else 100
        duration_score = (min_duration / f["duration"]) * 100 if f["duration"] > 0 else 100
        stops_score = max(0, 100 - (f["stops"] * 50))
        rating_score = (f["rating"] / 5.0) * 100
        
        weighted_score = (0.40 * price_score) + (0.30 * duration_score) + (0.20 * stops_score) + (0.10 * rating_score)
        
        f_copy = f.copy()
        f_copy["score"] = round(weighted_score, 1)
        ranked.append(f_copy)
        
    return sorted(ranked, key=lambda x: x["score"], reverse=True)

def parse_duration(duration_val: Any) -> float:
    """Helper to convert various duration formats (e.g., float, '11.5', '11h 30m') to float hours."""
    if isinstance(duration_val, (int, float)):
        return float(duration_val)
    
    val_str = str(duration_val).strip().lower()
    if not val_str:
        return 1.0
        
    try:
        # Check if it's already a float string
        return float(val_str)
    except ValueError:
        pass
        
    # Attempt to parse format like "11h 30m" or "11h" or "30m"
    hours = 0.0
    minutes = 0.0
    import re
    h_match = re.search(r'(\d+)\s*h', val_str)
    m_match = re.search(r'(\d+)\s*m', val_str)
    
    if h_match:
        hours = float(h_match.group(1))
    if m_match:
        minutes = float(m_match.group(1))
        
    if h_match or m_match:
        return hours + (minutes / 60.0)
        
    # Attempt parsing any digits found
    digits = re.findall(r'[\d\.]+', val_str)
    if digits:
        try:
            return float(digits[0])
        except ValueError:
            pass
            
    return 1.0

def fetch_real_flights_via_search(origin: str, destination: str, date_str: str) -> List[Dict[str, Any]]:
    """Searches DuckDuckGo for real flights between origin and destination on travel date."""
    try:
        from ddgs import DDGS
        query = f"flights from {origin} to {destination} on {date_str} price airlines booking"
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=8))
            return results
    except Exception as e:
        print(f"Error fetching real-time flights from DDGS: {e}")
        return []

NEARBY_AIRPORT_LOOKUP = {
    "ooty": {
        "has_airport": False,
        "airport_city": "Coimbatore",
        "airport_code": "CJB",
        "distance": "88 km",
        "transit_time": "2.5 hours via taxi/bus",
        "note": "Coimbatore Airport (CJB) is the nearest commercial airport to Ooty."
    },
    "coorg": {
        "has_airport": False,
        "airport_city": "Kannur",
        "airport_code": "CNN",
        "distance": "110 km",
        "transit_time": "3 hours via taxi",
        "note": "Kannur International Airport (CNN) is the nearest commercial airport to Coorg."
    },
    "pondicherry": {
        "has_airport": False,
        "airport_city": "Chennai",
        "airport_code": "MAA",
        "distance": "150 km",
        "transit_time": "3.5 hours via taxi/bus",
        "note": "Chennai International Airport (MAA) is the nearest major airport to Pondicherry."
    }
}

def resolve_destination_airport(destination: str) -> Dict[str, Any]:
    """
    Checks if the destination has a commercial passenger airport.
    If not, finds the nearest city/airport and calculates distance/ground transit time.
    """
    dest_lower = destination.strip().lower()
    if dest_lower in NEARBY_AIRPORT_LOOKUP:
        return NEARBY_AIRPORT_LOOKUP[dest_lower]
        
    from lifeos.app.agents.graph import get_llm, extract_json
    llm = get_llm()
    prompt = f"""
    You are a travel geolocator assistant.
    Analyze the destination: "{destination}"
    Determine:
    1. Does this destination have a commercial airport facility with active passenger flights?
    2. If not, what is the nearest city with a major commercial passenger airport? 
       Estimate the road distance (in km) and the typical ground transit time (e.g. taxi/bus/train) from that airport to the destination.
    
    Return ONLY a JSON object:
    {{
      "has_airport": true_or_false,
      "airport_city": "City Name of the airport (or same as destination if has_airport is true)",
      "airport_code": "IATA Code if known, e.g. CJB, or empty string",
      "distance": "Distance description, e.g. '88 km' or null if it has its own airport",
      "transit_time": "Ground transit description, e.g. '2.5 hours via taxi' or null if it has its own airport",
      "note": "Short explanation, e.g. 'Coimbatore Airport (CJB) is the nearest airport to Ooty.'"
    }}
    """
    try:
        from langchain_core.messages import HumanMessage
        res = llm.invoke([HumanMessage(content=prompt)])
        data = extract_json(res.content)
        if isinstance(data, dict) and "has_airport" in data:
            return data
    except Exception as e:
        print(f"Error resolving destination airport: {e}")
    
    # Fallback to defaults
    return {
        "has_airport": True,
        "airport_city": destination,
        "airport_code": "",
        "distance": None,
        "transit_time": None,
        "note": ""
    }

def process(state: AgentState) -> AgentState:
    """
    Flight Search Agent node.
    Finds flight options for the target travel destination.
    """
    from lifeos.app.agents.graph import get_llm, extract_json
    outputs: Dict[str, Any] = state.get("agent_outputs", {}).copy()
    travel_info = outputs.get("travel", {})
    
    if not travel_info:
        outputs["flights"] = []
        return {**state, "agent_outputs": outputs}
        
    destination = travel_info.get("city", "Paris")
    travel_date = travel_info.get("dates", "")
    
    # Retrieve user preference/memory
    from lifeos.app.agents.memory_agent import load_memory_from_file
    memory_info = load_memory_from_file()
    preferred_airline = memory_info.get("preferred_airline", "IndiGo")
    home_city = memory_info.get("home_city", "Bangalore")
    
    # Resolve nearest airport if the destination does not have commercial airport facility
    airport_res = resolve_destination_airport(destination)
    outputs["airport_info"] = airport_res
    
    search_destination = destination
    if not airport_res.get("has_airport", True) and airport_res.get("airport_city"):
        search_destination = airport_res["airport_city"]
    
    # Attempt real-time flight search
    search_results = fetch_real_flights_via_search(home_city, search_destination, travel_date)
    flight_data = []
    
    if search_results:
        snippets = []
        for i, res in enumerate(search_results, 1):
            snippets.append(f"Result {i}:\nTitle: {res.get('title')}\nSnippet: {res.get('body')}\nURL: {res.get('href')}\n")
        search_text = "\n".join(snippets)
        
        llm = get_llm()
        prompt = f"""
        You are the Flight Search Agent for LifeOS.
        Below are real web search results about flights from {home_city} to {search_destination} on {travel_date}:
        {search_text}
        
        Analyze the search results. Identify and extract at least 3-4 real, specific flight options.
        Do NOT use aggregator names or directories like 'Expedia', 'Booking.com', 'Tripadvisor', 'Skyscanner', 'Kayak', 'Bing', or 'Google Flights' as the airline name. The airline name must be the actual operating airline (e.g., 'Air India', 'IndiGo', 'Air France', 'Lufthansa', 'Emirates', etc.).
        If specific departure/arrival times, durations, or stops are mentioned in the results, use them. If not, estimate realistic values based on typical schedules.
        If prices are mentioned in the results, use them. If not, estimate realistic prices (convert USD/EUR/GBP to INR: 1 USD ≈ 85 INR, 1 EUR ≈ 92 INR, 1 GBP ≈ 110 INR).
        Return ONLY a JSON list of flights, where each flight item includes all fields:
        - origin: The starting city name (e.g., '{home_city}')
        - destination: The target arrival city name (e.g., '{search_destination}')
        - airline: The actual operating airline name (e.g., 'IndiGo', 'Air India', 'Air France', etc.)
        - price: integer (price in INR)
        - duration: float representing duration in hours (e.g. 2.5 or 11.5)
        - departure: string (e.g. "06:00 AM" or "10:30 PM")
        - arrival: string (e.g. "08:30 AM" or "09:00 AM")
        - stops: integer (0 for direct, 1, 2 etc.)
        - rating: float (0.0 to 5.0, estimate realistically)

        Structure the return payload as a JSON array:
        [
          {{
            "origin": "{home_city}",
            "destination": "{search_destination}",
            "airline": "Airline Name",
            "price": price_integer,
            "duration": duration_float,
            "departure": "departure_time",
            "arrival": "arrival_time",
            "stops": stops_integer,
            "rating": rating_float
          }}
        ]
        """
        try:
            res = llm.invoke([HumanMessage(content=prompt)])
            extracted = extract_json(res.content)
            if isinstance(extracted, list) and len(extracted) > 0:
                # Sanitize extracted fields to match required types for ranking
                for f in extracted:
                    f["origin"] = str(f.get("origin") or home_city).strip()
                    f["destination"] = str(f.get("destination") or search_destination).strip()
                    try:
                        f["price"] = int(float(str(f.get("price", 10000)).replace(",", "").strip()))
                    except Exception:
                        f["price"] = 10000
                    f["duration"] = parse_duration(f.get("duration", 1.0))
                    try:
                        f["stops"] = int(f.get("stops", 0))
                    except Exception:
                        f["stops"] = 0
                    try:
                        f["rating"] = float(f.get("rating", 4.0))
                    except Exception:
                        f["rating"] = 4.0
                flight_data = extracted
        except Exception as e:
            print(f"Error in Flight Agent LLM extraction: {e}")
            
    # Fallback to mock data if real-time search was empty or failed
    if not flight_data:
        all_flights = load_mock_flights()
        filtered = [f for f in all_flights if f["destination"].lower() == search_destination.lower()]
        if not filtered:
            filtered = generate_dynamic_flights(home_city, search_destination, travel_date)
        flight_data = filtered
        
    # Rank the flights (real-time or fallback)
    ranked = rank_flights(flight_data)
    
    # Apply minor boost to preferred airline in rank score
    if preferred_airline:
        for f in ranked:
            if f.get("airline", "").lower() == preferred_airline.lower():
                f["score"] = min(100.0, round(f.get("score", 0.0) + 5.0, 1))
        # Re-sort after boost
        ranked = sorted(ranked, key=lambda x: x.get("score", 0.0), reverse=True)
        
    outputs["flights"] = ranked
    return {
        **state,
        "agent_outputs": outputs,
        "flight_options": ranked,
        "active_agent": "supervisor"
    }
