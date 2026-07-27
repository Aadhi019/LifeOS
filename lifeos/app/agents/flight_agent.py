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
    
    # Load and filter flights
    all_flights = load_mock_flights()
    filtered = [f for f in all_flights if f["destination"].lower() == destination.lower()]
    
    if not filtered:
        # Fallback dynamic generator
        filtered = generate_dynamic_flights("Bangalore", destination, travel_date)
        
    ranked = rank_flights(filtered)
    
    # Apply minor boost to preferred airline in rank score
    if preferred_airline:
        for f in ranked:
            if f["airline"].lower() == preferred_airline.lower():
                f["score"] = min(100.0, round(f["score"] + 5.0, 1))
        # Re-sort after boost
        ranked = sorted(ranked, key=lambda x: x["score"], reverse=True)

    llm = get_llm()
    prompt = f"""
    You are the Flight Search Agent for LifeOS.
    Analyze the following flight options from Bangalore to {destination} on {travel_date}:
    {json.dumps(ranked, indent=2)}
    
    Summarize these flight options, identify the recommended choice (highest score), and explain why.
    Return ONLY a JSON list of flights, where each flight item includes all fields: airline, price, duration, departure, arrival, stops, rating, and score.
    Structure the return payload as a JSON array:
    [
      {{
        "airline": "Airline Name",
        "price": price_integer,
        "duration": "duration_string_or_hours",
        "departure": "departure_time",
        "arrival": "arrival_time",
        "stops": stops_integer,
        "rating": rating_float,
        "score": score_float
      }},
      ...
    ]
    """
    
    try:
        res = llm.invoke([HumanMessage(content=prompt)])
        flight_data = extract_json(res.content)
        # Ensure it is a list
        if not isinstance(flight_data, list):
            flight_data = ranked
    except Exception as e:
        print(f"Error in Flight Agent LLM call: {e}")
        flight_data = ranked
        
    outputs["flights"] = flight_data
    return {
        **state,
        "agent_outputs": outputs,
        "flight_options": flight_data,
        "active_agent": "supervisor"
    }
