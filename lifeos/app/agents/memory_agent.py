import os
import json
from typing import Dict, Any
from lifeos.app.agents.state import AgentState

def get_memory_file_path() -> str:
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(current_dir, "mock_memory.json")

def load_memory_from_file() -> Dict[str, Any]:
    file_path = get_memory_file_path()
    if os.path.exists(file_path):
        try:
            with open(file_path, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading memory file: {e}")
    return {
        "preferred_airline": "IndiGo",
        "preferred_hotel_type": "Business",
        "meal": "Vegetarian",
        "seat": "Window",
        "budget": "25000",
        "home_city": "Bangalore",
        "frequently_visited_cities": ["Bangalore", "Mumbai", "Chennai"],
        "travel_style": "Comfort & Efficiency"
    }

def save_memory_to_file(memory_data: Dict[str, Any]) -> None:
    file_path = get_memory_file_path()
    try:
        with open(file_path, "w") as f:
            json.dump(memory_data, f, indent=2)
    except Exception as e:
        print(f"Error writing to memory file: {e}")

def process(state: AgentState) -> AgentState:
    """
    Memory Agent node.
    Retrieves the long-term memory configuration to personalize outputs.
    """
    outputs = state.get("agent_outputs", {}).copy()
    
    # Retrieve current user memory
    user_memory = load_memory_from_file()
    
    outputs["memory"] = user_memory
    
    return {
        **state,
        "agent_outputs": outputs,
        "user_memory": user_memory,
        "active_agent": "supervisor"
    }

def update_memory_on_confirmation(confirmed_state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Invoked when /api/confirm is called to update long-term user preferences.
    """
    memory_data = load_memory_from_file()
    outputs = confirmed_state.get("agent_outputs", {})
    
    travel_info = outputs.get("travel", {})
    flights_info = outputs.get("flights", [])
    hotels_info = outputs.get("hotels", [])
    
    # 1. Update frequently visited cities
    city = travel_info.get("city")
    if city:
        visited = memory_data.setdefault("frequently_visited_cities", [])
        if city not in visited:
            visited.append(city)
            
    # 2. Update preferred airline based on the highest ranked flight choice if available
    if flights_info and isinstance(flights_info, list):
        # Pick the airline of the first option
        first_flight = flights_info[0]
        if isinstance(first_flight, dict) and first_flight.get("airline"):
            memory_data["preferred_airline"] = first_flight["airline"]
            
    # 3. Update preferred hotel category based on the highest ranked hotel choice if available
    if hotels_info and isinstance(hotels_info, list):
        first_hotel = hotels_info[0]
        if isinstance(first_hotel, dict) and first_hotel.get("category"):
            memory_data["preferred_hotel_type"] = first_hotel["category"]
            
    save_memory_to_file(memory_data)
    return memory_data
