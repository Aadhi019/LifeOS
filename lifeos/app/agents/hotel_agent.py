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
    
    # Load and filter hotels
    all_hotels = load_mock_hotels()
    filtered = [h for h in all_hotels if h["city"].lower() == city.lower()]
    
    if not filtered:
        # Fallback dynamic hotels
        filtered = generate_dynamic_hotels(city)
        
    ranked = rank_hotels(filtered)
    
    # Boost rating for preferred hotel type
    if preferred_hotel_type:
        for h in ranked:
            if h["category"].lower() == preferred_hotel_type.lower():
                h["overall_score"] = min(100.0, round(h["overall_score"] + 5.0, 1))
        # Re-sort after boost
        ranked = sorted(ranked, key=lambda x: x["overall_score"], reverse=True)

    llm = get_llm()
    prompt = f"""
    You are the Hotel Recommendation Agent for LifeOS.
    Analyze the following hotel recommendations for {city}:
    {json.dumps(ranked, indent=2)}
    
    Summarize these hotel choices, identify the best options across Budget, Business, Luxury, and Family, and explain why.
    Return ONLY a JSON list of hotels, where each hotel item includes all fields: name, category, rating, distance, price, amenities, safety_score, and overall_score.
    Structure the return payload as a JSON array:
    [
      {{
        "name": "Hotel Name",
        "category": "Budget/Business/Luxury/Family",
        "rating": rating_float,
        "distance": distance_float,
        "price": price_integer,
        "amenities": ["amenity1", "amenity2"],
        "safety_score": safety_score_integer,
        "overall_score": overall_score_float
      }},
      ...
    ]
    """
    
    try:
        res = llm.invoke([HumanMessage(content=prompt)])
        hotel_data = extract_json(res.content)
        # Ensure it is a list
        if not isinstance(hotel_data, list):
            hotel_data = ranked
    except Exception as e:
        print(f"Error in Hotel Agent LLM call: {e}")
        hotel_data = ranked
        
    outputs["hotels"] = hotel_data
    return {
        **state,
        "agent_outputs": outputs,
        "hotel_options": hotel_data,
        "active_agent": "supervisor"
    }
