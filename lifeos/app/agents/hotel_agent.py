import os
import json
import random
from typing import Dict, Any, List
from langchain_core.messages import HumanMessage
from lifeos.app.agents.state import AgentState

def load_mock_hotels() -> List[Dict[str, Any]]:
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    mock_file_path = os.path.join(current_dir, "mock_hotels.json")
    if os.path.exists(mock_file_path):
        with open(mock_file_path, "r") as f:
            return json.load(f)
    return []

def generate_dynamic_hotels(city: str) -> List[Dict[str, Any]]:
    """Generates fallback mock hotels for a city."""
    categories = ["Budget", "Business", "Luxury", "Family"]
    hotel_names = {
        "Budget": f"{city} Budget Lodge",
        "Business": f"{city} Plaza Hotel",
        "Luxury": f"The Grand {city} Resort & Spa",
        "Family": f"{city} Family Suites"
    }
    amenity_pool = {
        "Budget": ["Wi-Fi", "AC", "Breakfast"],
        "Business": ["Wi-Fi", "Workspace", "Meeting Room", "Gym", "Breakfast"],
        "Luxury": ["Wi-Fi", "Pool", "Gym", "Spa", "Bar", "24/7 Butler"],
        "Family": ["Wi-Fi", "Kitchenette", "Pool", "Play Area", "Laundry"]
    }
    
    hotels = []
    base_prices = {"Budget": 1800, "Business": 5500, "Luxury": 14000, "Family": 6500}
    
    for cat in categories:
        price = int(base_prices[cat] * (0.9 + random.random() * 0.2))
        rating = round(3.5 + random.random() * 1.5, 1)
        distance = round(0.5 + random.random() * 5.0, 1)
        safety = int(80 + random.random() * 20)
        
        hotels.append({
            "city": city,
            "name": hotel_names[cat],
            "category": cat,
            "rating": rating,
            "distance": distance,
            "price": price,
            "amenities": amenity_pool[cat],
            "safety_score": safety
        })
    return hotels

def rank_hotels(hotels: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if not hotels:
        return []
        
    prices = [h["price"] for h in hotels]
    min_price = min(prices) if prices else 1
    
    ranked = []
    for h in hotels:
        price_score = (min_price / h["price"]) * 100 if h["price"] > 0 else 100
        rating_score = (h["rating"] / 5.0) * 100
        safety_score = h["safety_score"]
        distance_score = max(0, 100 - (h["distance"] * 10))
        
        max_amenities = 6
        amenities_score = (len(h["amenities"]) / max_amenities) * 100
        
        weighted_score = (0.30 * price_score) + (0.30 * rating_score) + (0.20 * safety_score) + (0.10 * distance_score) + (0.10 * amenities_score)
        
        h_copy = h.copy()
        h_copy["overall_score"] = round(weighted_score, 1)
        ranked.append(h_copy)
        
    return sorted(ranked, key=lambda x: x["overall_score"], reverse=True)

def fetch_real_hotels_via_search(city: str) -> List[Dict[str, Any]]:
    """Searches DuckDuckGo for real hotels in the destination city."""
    try:
        from ddgs import DDGS
        query = f"hotels in {city} price rating reviews booking"
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=8))
            return results
    except Exception as e:
        print(f"Error fetching real-time hotels from DDGS: {e}")
        return []

def process(state: AgentState) -> AgentState:
    """
    Hotel Recommendation Agent node.
    Finds and ranks hotel options for the trip destination.
    """
    from lifeos.app.agents.graph import get_llm, extract_json
    outputs: Dict[str, Any] = state.get("agent_outputs", {}).copy()
    travel_info = outputs.get("travel", {})
    
    if not travel_info:
        outputs["hotels"] = []
        return {**state, "agent_outputs": outputs}
        
    city = travel_info.get("city", "Paris")
    
    # Retrieve user preference/memory
    from lifeos.app.agents.memory_agent import load_memory_from_file
    memory_info = load_memory_from_file()
    preferred_hotel_type = memory_info.get("preferred_hotel_type", "Business")
    
    # Attempt real-time hotel search
    search_results = fetch_real_hotels_via_search(city)
    hotel_data = []
    
    if search_results:
        # Build snippets from search results
        snippets = []
        for i, res in enumerate(search_results, 1):
            snippets.append(f"Result {i}:\nTitle: {res.get('title')}\nSnippet: {res.get('body')}\nURL: {res.get('href')}\n")
        search_text = "\n".join(snippets)
        
        llm = get_llm()
        prompt = f"""
        You are the Hotel Recommendation Agent for LifeOS.
        Below are real web search results about hotels in {city}:
        {search_text}
        
        Analyze the search results. Identify and extract at least 3-4 real, specific hotels currently operating in {city}.
        Do NOT use aggregator names, directories, search engine listings, or booking platforms like 'Expedia', 'Booking.com', 'Tripadvisor', 'Bing', or 'Hotels' as the hotel name. The hotel name must be the actual name of a specific physical hotel (e.g., 'Paris France Hotel' or 'Hôtel Mayfair Paris' or 'Le Bristol Paris').
        Based on the search descriptions, classify/infer their Category (Budget, Business, Luxury, or Family).
        If ratings or prices are mentioned in the results, use them. If not, estimate realistic values based on typical rates for that hotel (convert USD/EUR/GBP to INR: 1 USD ≈ 85 INR, 1 EUR ≈ 92 INR, 1 GBP ≈ 110 INR).
        Return ONLY a JSON list of hotels, where each hotel item includes all fields:
        - name: The real hotel name extracted from search results
        - category: One of Budget, Business, Luxury, or Family
        - rating: float (0.0 to 5.0)
        - distance: float (estimated distance from city center in km)
        - price: integer (price per night in INR)
        - amenities: list of strings representing amenities (e.g. ["Wi-Fi", "Pool", "Gym"])
        - safety_score: integer (0 to 100, estimate realistically)

        Structure the return payload as a JSON array:
        [
          {{
            "name": "Hotel Name",
            "category": "Budget/Business/Luxury/Family",
            "rating": rating_float,
            "distance": distance_float,
            "price": price_integer,
            "amenities": ["amenity1", "amenity2"],
            "safety_score": safety_score_integer
          }}
        ]
        """
        try:
            res = llm.invoke([HumanMessage(content=prompt)])
            extracted = extract_json(res.content)
            if isinstance(extracted, list) and len(extracted) > 0:
                hotel_data = extracted
        except Exception as e:
            print(f"Error in Hotel Agent LLM extraction: {e}")
            
    # Fallback to mock data if real-time search was empty or failed
    if not hotel_data:
        all_hotels = load_mock_hotels()
        filtered = [h for h in all_hotels if h["city"].lower() == city.lower()]
        if not filtered:
            filtered = generate_dynamic_hotels(city)
        hotel_data = filtered
        
    # Rank the hotels (real-time or fallback)
    ranked = rank_hotels(hotel_data)
    
    # Boost rating for preferred hotel type
    if preferred_hotel_type:
        for h in ranked:
            if h.get("category", "").lower() == preferred_hotel_type.lower():
                h["overall_score"] = min(100.0, round(h.get("overall_score", 0.0) + 5.0, 1))
        # Re-sort after boost
        ranked = sorted(ranked, key=lambda x: x.get("overall_score", 0.0), reverse=True)
        
    outputs["hotels"] = ranked
    return {
        **state,
        "agent_outputs": outputs,
        "hotel_options": ranked,
        "active_agent": "supervisor"
    }
