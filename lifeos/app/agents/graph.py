import json
import re
from datetime import datetime, date
from typing import Dict, Any, Literal, List

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, START, END

from lifeos.app.config import GEMINI_API_KEY, GEMINI_MODEL
from lifeos.app.agents.state import AgentState
from lifeos.app.tools.weather import get_weather_forecast

from lifeos.app.agents.flight_agent import process as flight_agent_node
from lifeos.app.agents.hotel_agent import process as hotel_agent_node
from lifeos.app.agents.budget_agent import process as budget_agent_node
from lifeos.app.agents.risk_agent import process as risk_agent_node
from lifeos.app.agents.memory_agent import process as memory_agent_node
from lifeos.app.agents.calendar_conflict_agent import process as calendar_conflict_node

class MockLLM:
    def invoke(self, messages):
        prompt = ""
        for m in messages:
            if hasattr(m, "content"):
                prompt += m.content + "\n"
        
        # Determine which prompt it is and return corresponding mock content
        if "parsing assistant" in prompt.lower():
            user_req = ""
            match = re.search(r'Analyze the user request:\s*"([^"]+)"', prompt)
            if match:
                user_req = match.group(1).lower()
            
            city = "Bangalore"
            if "paris" in user_req:
                city = "Paris"
            elif "london" in user_req:
                city = "London"
                
            start_date = "2026-07-31" # Default Next Friday from 2026-07-25
            if "monday" in user_req:
                start_date = "2026-07-27"
            elif "2026-08-10" in user_req:
                start_date = "2026-08-10"
                
            return AIMessage(content=json.dumps({
                "city": city,
                "start_date": start_date
            }))
            
        elif "travel and finance planner" in prompt.lower():
            city_match = re.search(r"traveling to ([A-Za-z]+)", prompt)
            city = city_match.group(1) if city_match else "Bangalore"
            
            date_match = re.search(r"on (\d{4}-\d{2}-\d{2})", prompt)
            start_date = date_match.group(1) if date_match else "2026-07-31"
            
            weather_desc = f"Warm and pleasant in {city} with partial clouds."
            packing = ["Sunglasses", "Light jacket", "Comfortable shoes", "Charger"]
            costs = {"lodging": "5000", "transit": "2500", "food": "1500", "activities": "1500", "total": "10500"}
            
            if city.lower() == "paris":
                weather_desc = "Mild showers, high of 22°C, low of 15°C."
                packing = ["Raincoat", "Umbrella", "Travel adapter", "Walking shoes"]
                costs = {"lodging": "12000", "transit": "4000", "food": "3500", "activities": "3000", "total": "22500"}
            elif city.lower() == "london":
                weather_desc = "Cloudy and windy with light drizzle."
                packing = ["Windbreaker", "Umbrella", "Oyster card", "Warm sweater"]
                costs = {"lodging": "15000", "transit": "5000", "food": "4000", "activities": "3500", "total": "27500"}
                
            return AIMessage(content=json.dumps({
                "city": city,
                "dates": start_date,
                "weather_summary": weather_desc,
                "packing_list": packing,
                "finance": costs
            }))
            
        elif "calendar manager" in prompt.lower():
            city_match = re.search(r"traveling to ([A-Za-z]+)", prompt)
            city = city_match.group(1) if city_match else "Bangalore"
            
            date_match = re.search(r"on (\d{4}-\d{2}-\d{2})", prompt)
            travel_date = date_match.group(1) if date_match else "2026-07-31"
            
            return AIMessage(content=json.dumps({
                "summary": f"Trip to {city}",
                "location": city,
                "description": f"LifeOS Auto-Scheduled: Trip to {city}. Weather forecast: partial clouds.",
                "start_time": f"{travel_date}T09:00:00",
                "end_time": f"{travel_date}T18:00:00"
            }))
            
        elif "email assistant" in prompt.lower():
            city_match = re.search(r"Destination:\s*([A-Za-z]+)", prompt)
            city = city_match.group(1) if city_match else "Bangalore"
            
            date_match = re.search(r"Date:\s*(\d{4}-\d{2}-\d{2})", prompt)
            travel_date = date_match.group(1) if date_match else "2026-07-31"
            
            return AIMessage(content=json.dumps({
                "to": "me",
                "subject": f"Itinerary Summary: Trip to {city} on {travel_date}",
                "body": f"Here is your completed itinerary for {city} on {travel_date}. Safe travels!"
            }))
            
        return AIMessage(content="{}")

# Initialize Gemini Model
def get_llm():
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        print("INFO: GEMINI_API_KEY not configured. Falling back to local offline MockLLM.")
        return MockLLM()
    return ChatGoogleGenerativeAI(
        model=GEMINI_MODEL,
        google_api_key=GEMINI_API_KEY,
        temperature=0.1
    )


def get_content_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for part in content:
            if isinstance(part, str):
                parts.append(part)
            elif isinstance(part, dict) and "text" in part:
                parts.append(part["text"])
        return "".join(parts)
    return str(content)

# Robust JSON extraction helper
def extract_json(text: Any) -> Dict[str, Any]:
    text_str = get_content_text(text)
    cleaned = text_str.strip()
    if cleaned.startswith("```"):
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
        if match:
            cleaned = match.group(1).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Try a regex search for the first { and last }
        match = re.search(r"({[\s\S]*})", cleaned)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        raise ValueError(f"Could not parse JSON from output: {text_str}")

# --- NODES ---

def supervisor_node(state: AgentState) -> Dict[str, Any]:
    """
    Supervisor router node. Inspects the state of agent_outputs and routes to the next agent.
    Includes skip heuristics for local travel, single-day visits, and skipped calendar scheduling.
    """
    outputs = state.get("agent_outputs", {}).copy()
    user_intent = state.get("user_intent", "").lower()
    
    while True:
        # 1. Travel Agent
        if "travel" not in outputs:
            return {"agent_outputs": outputs, "active_agent": "travel_agent"}
            
        # 2. Flight Search Agent
        if "flights" not in outputs:
            travel_info = outputs.get("travel", {})
            city = travel_info.get("city", "").lower()
            home_city = "bangalore"
            memory_info = outputs.get("memory", {})
            if memory_info:
                home_city = memory_info.get("home_city", "bangalore").lower()
                
            is_local = (city == home_city) or any(k in user_intent for k in ["local", "drive", "cab", "road trip", "car", "train"])
            if is_local:
                outputs["flights"] = {"skipped": True, "reason": "Local travel does not require flight bookings."}
                continue
            return {"agent_outputs": outputs, "active_agent": "flight_agent"}
            
        # 3. Hotel Recommendation Agent
        if "hotels" not in outputs:
            is_single_day = any(k in user_intent for k in ["single day", "one day", "same day", "back today", "day trip", "single-day"])
            if is_single_day:
                outputs["hotels"] = {"skipped": True, "reason": "Single-day trip does not require hotel bookings."}
                continue
            return {"agent_outputs": outputs, "active_agent": "hotel_agent"}
            
        # 4. Budget Optimization Agent
        if "optimized_budget" not in outputs:
            return {"agent_outputs": outputs, "active_agent": "budget_agent"}
            
        # 5. Risk Analysis Agent
        if "risk" not in outputs:
            return {"agent_outputs": outputs, "active_agent": "risk_agent"}
            
        # 6. Memory Agent
        if "memory" not in outputs:
            return {"agent_outputs": outputs, "active_agent": "memory_agent"}
            
        # 7. Calendar Conflict Agent
        if "calendar_conflicts" not in outputs:
            no_calendar = any(k in user_intent for k in ["no calendar", "don't schedule", "dont schedule", "skip calendar"])
            if no_calendar:
                outputs["calendar_conflicts"] = {"skipped": True, "reason": "No calendar event requested."}
                outputs["calendar"] = {"skipped": True, "reason": "No calendar event requested."}
                continue
            return {"agent_outputs": outputs, "active_agent": "calendar_conflict_agent"}
            
        # 8. Calendar Agent
        if "calendar" not in outputs:
            conflict_info = outputs.get("calendar_conflicts", {})
            if conflict_info.get("skipped"):
                outputs["calendar"] = {"skipped": True, "reason": "No calendar event requested."}
                continue
            return {"agent_outputs": outputs, "active_agent": "calendar_agent"}
            
        # 9. Email Agent
        if "email" not in outputs:
            return {"agent_outputs": outputs, "active_agent": "email_agent"}
            
        # 10. Approval
        return {"agent_outputs": outputs, "active_agent": "approval"}

def fetch_real_travel_costs_via_search(city: str) -> List[Dict[str, Any]]:
    """Searches DuckDuckGo for typical travel costs in the destination city."""
    try:
        from ddgs import DDGS
        query = f"average daily travel cost in {city} lodging food transit INR USD"
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=5))
            return results
    except Exception as e:
        print(f"Error fetching travel cost info from DDGS: {e}")
        return []

def travel_agent_node(state: AgentState) -> Dict[str, Any]:
    """
    Travel & Finance Agent node.
    Extracts destination/dates, supports multi-leg itineraries, gets weather, suggests packing list, estimates trip costs.
    """
    llm = get_llm()
    user_intent = state.get("user_intent", "")
    today_str = date.today().strftime("%Y-%m-%d")
    day_of_week = date.today().strftime("%A")
    
    # Step 1: Extract city, date, and multiple legs
    extraction_prompt = f"""
    You are a parsing assistant.
    Today is {today_str} ({day_of_week}).
    Analyze the user request: "{user_intent}"
    Extract:
    1. The primary destination city (be precise, e.g., 'Bangalore', 'Paris').
    2. The start date of travel as YYYY-MM-DD. Map relative terms like 'next Friday', 'tomorrow', 'this weekend' relative to {today_str}.
    3. The list of legs if this is a multi-leg or multi-city trip. Each leg should specify the destination city name and start date (YYYY-MM-DD). If it is a single destination, return one leg.
    
    Return ONLY a JSON object:
    {{
      "city": "city_name",
      "start_date": "YYYY-MM-DD",
      "legs": [
        {{"city": "city_name", "start_date": "YYYY-MM-DD"}}
      ]
    }}
    """
    
    try:
        extraction_res = llm.invoke([HumanMessage(content=extraction_prompt)])
        details = extract_json(extraction_res.content)
        city = details.get("city", "Bangalore")
        start_date = details.get("start_date", today_str)
        legs = details.get("legs", [])
    except Exception as e:
        print(f"Error extracting travel details: {e}")
        city = "Bangalore"
        start_date = today_str
        legs = []
        
    if not legs:
        legs = [{"city": city, "start_date": start_date}]
        
    # Step 2: Fetch weather forecast for all legs
    weather_forecasts = []
    for leg in legs:
        leg_city = leg.get("city", "Bangalore")
        leg_weather = get_weather_forecast(leg_city)
        weather_forecasts.append(f"Destination: {leg_city}\n{leg_weather}\n")
    weather_info = "\n\n".join(weather_forecasts)
    
    # Step 2.5: Fetch real-time travel costs for primary city
    cost_search_results = fetch_real_travel_costs_via_search(city)
    cost_snippets = []
    for i, res in enumerate(cost_search_results, 1):
        cost_snippets.append(f"Result {i}:\nTitle: {res.get('title')}\nSnippet: {res.get('body')}\n")
    cost_search_text = "\n".join(cost_snippets) if cost_snippets else "No search results available."
    
    # Step 3: Run Gemini to construct the packing list and estimate finances
    travel_prompt = f"""
    You are the Travel and Finance Planner for LifeOS.
    The user is traveling on a trip with these legs:
    {json.dumps(legs, indent=2)}
    
    Here is the weather forecast for these locations:
    {weather_info}
    
    Here are real-time web search results about travel expenses in {city}:
    {cost_search_text}
    
    Today's date is {today_str}.
    
    Based on the destination, dates, weather, and real-time travel cost data above, perform the following:
    1. Summarize the weather on the travel date(s) across all destinations.
    2. Generate a practical packing list of 4-6 items suitable for this itinerary.
    3. Estimate travel costs in INR (Indian Rupee) for: lodging, transit, food, activities.
       Use the search results to formulate a realistic cost estimate for that city (converting USD/EUR/GBP to INR: 1 USD ≈ 85 INR, 1 EUR ≈ 92 INR, 1 GBP ≈ 110 INR if necessary).
    
    Return ONLY a JSON object with this exact structure (do not include markdown block):
    {{
      "city": "{city}",
      "dates": "{start_date}",
      "legs": {json.dumps(legs)},
      "weather_summary": "Short summary of weather for all destinations",
      "packing_list": ["item1", "item2", "item3"],
      "finance": {{
        "lodging": "Estimated cost for lodging (integer or clean numeric string)",
        "transit": "Estimated transit cost (integer or clean numeric string)",
        "food": "Estimated food cost (integer or clean numeric string)",
        "activities": "Estimated activities cost (integer or clean numeric string)",
        "total": "Sum of above costs (integer or clean numeric string)"
      }}
    }}
    """
    
    travel_res = llm.invoke([HumanMessage(content=travel_prompt)])
    travel_data = extract_json(travel_res.content)
    
    # Separate outputs
    outputs = state.get("agent_outputs", {}).copy()
    outputs["travel"] = {
        "city": travel_data.get("city"),
        "dates": travel_data.get("dates"),
        "legs": travel_data.get("legs", legs),
        "weather_summary": travel_data.get("weather_summary"),
        "packing_list": travel_data.get("packing_list")
    }
    outputs["finance"] = travel_data.get("finance", {})
    
    return {
        "agent_outputs": outputs,
        "active_agent": "supervisor"
    }

def calendar_agent_node(state: AgentState) -> Dict[str, Any]:
    """
    Calendar Agent node. Prepares a calendar event proposal based on travel details.
    """
    llm = get_llm()
    outputs = state.get("agent_outputs", {})
    travel_info = outputs.get("travel", {})
    city = travel_info.get("city", "Bangalore")
    travel_date = travel_info.get("dates", "")
    weather_desc = travel_info.get("weather_summary", "")
    
    calendar_prompt = f"""
    You are the Calendar Manager for LifeOS.
    The user is traveling to {city} on {travel_date}.
    Weather: {weather_desc}
    
    Create a proposed Google Calendar Event payload.
    The start time should be 09:00:00 on the travel date.
    The end time should be 18:00:00 on the travel date.
    
    Return ONLY a JSON object with this structure:
    {{
      "summary": "Trip to {city}",
      "location": "{city}",
      "description": "LifeOS Auto-Generated: Trip to {city}. Weather forecast: {weather_desc}",
      "start_time": "{travel_date}T09:00:00",
      "end_time": "{travel_date}T18:00:00"
    }}
    """
    
    cal_res = llm.invoke([HumanMessage(content=calendar_prompt)])
    calendar_data = extract_json(cal_res.content)
    
    new_outputs = outputs.copy()
    new_outputs["calendar"] = calendar_data
    
    return {
        "agent_outputs": new_outputs,
        "active_agent": "supervisor"
    }

def email_agent_node(state: AgentState) -> Dict[str, Any]:
    """
    Email Agent node. Prepares a draft email itinerary summary.
    """
    llm = get_llm()
    outputs = state.get("agent_outputs", {})
    user_intent = state.get("user_intent", "")
    travel_info = outputs.get("travel", {})
    finance_info = outputs.get("finance", {})
    calendar_info = outputs.get("calendar", {})
    
    city = travel_info.get("city", "Bangalore")
    travel_date = travel_info.get("dates", "")
    weather_desc = travel_info.get("weather_summary", "")
    packing = ", ".join(travel_info.get("packing_list", []))
    
    email_prompt = f"""
    You are the Email Assistant for LifeOS.
    Prepare a professional draft email itinerary to summarize the user's travel plans.
    
    User Intent: {user_intent}
    
    Details:
    - Destination: {city}
    - Date: {travel_date}
    - Weather: {weather_desc}
    - Packing list: {packing}
    - Estimated Budget: Lodging: INR {finance_info.get('lodging')}, Transit: INR {finance_info.get('transit')}, Food: INR {finance_info.get('food')}, Activities: INR {finance_info.get('activities')}. Total: INR {finance_info.get('total')}.
    - Calendar event: {calendar_info.get('summary')} from {calendar_info.get('start_time')} to {calendar_info.get('end_time')}
    
    Instructions for JSON fields:
    1. "to": If the user specified a specific recipient email address in the User Intent above, use that email address. Otherwise, this field MUST be set exactly to "me". DO NOT invent or use placeholder email addresses like "test@example.com" or "user@example.com".
    2. "subject": Set to "Itinerary Summary: Trip to {city} on {travel_date}"
    3. "body": Provide a well-structured summary of weather, packing details, estimated finance, and calendar reminder.
    
    Generate a JSON object containing:
    {{
      "to": "me",
      "subject": "Itinerary Summary: Trip to {city} on {travel_date}",
      "body": "Provide a well-structured summary of weather, packing details, estimated finance, and calendar reminder."
    }}
    """
    
    email_res = llm.invoke([HumanMessage(content=email_prompt)])
    email_data = extract_json(email_res.content)
    
    new_outputs = outputs.copy()
    new_outputs["email"] = email_data
    
    return {
        "agent_outputs": new_outputs,
        "active_agent": "supervisor"
    }

def approval_waiting_node(state: AgentState) -> Dict[str, Any]:
    """
    Sets the state to requires_approval = True and ends the run.
    """
    return {
        "requires_approval": True,
        "active_agent": "approval"
    }

# --- GRAPH BUILDER ---

def route_next(state: AgentState) -> Literal[
    "travel_agent", 
    "flight_agent", 
    "hotel_agent", 
    "budget_agent", 
    "risk_agent", 
    "memory_agent", 
    "calendar_conflict_agent", 
    "calendar_agent", 
    "email_agent", 
    "approval", 
    "end"
]:
    active = state.get("active_agent")
    if active in [
        "travel_agent", 
        "flight_agent", 
        "hotel_agent", 
        "budget_agent", 
        "risk_agent", 
        "memory_agent", 
        "calendar_conflict_agent", 
        "calendar_agent", 
        "email_agent", 
        "approval"
    ]:
        return active
    return "end"

def get_agent_graph():
    workflow = StateGraph(AgentState)  # type: ignore[bad-specialization]
    
    # Add Nodes
    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("travel_agent", travel_agent_node)
    workflow.add_node("flight_agent", flight_agent_node)
    workflow.add_node("hotel_agent", hotel_agent_node)
    workflow.add_node("budget_agent", budget_agent_node)
    workflow.add_node("risk_agent", risk_agent_node)
    workflow.add_node("memory_agent", memory_agent_node)
    workflow.add_node("calendar_conflict_agent", calendar_conflict_node)
    workflow.add_node("calendar_agent", calendar_agent_node)
    workflow.add_node("email_agent", email_agent_node)
    workflow.add_node("approval", approval_waiting_node)
    
    # Add Edges
    workflow.add_edge(START, "supervisor")
    
    workflow.add_conditional_edges(
        "supervisor",
        route_next,
        {
            "travel_agent": "travel_agent",
            "flight_agent": "flight_agent",
            "hotel_agent": "hotel_agent",
            "budget_agent": "budget_agent",
            "risk_agent": "risk_agent",
            "memory_agent": "memory_agent",
            "calendar_conflict_agent": "calendar_conflict_agent",
            "calendar_agent": "calendar_agent",
            "email_agent": "email_agent",
            "approval": "approval",
            "end": END
        }
    )
    
    workflow.add_edge("travel_agent", "supervisor")
    workflow.add_edge("flight_agent", "supervisor")
    workflow.add_edge("hotel_agent", "supervisor")
    workflow.add_edge("budget_agent", "supervisor")
    workflow.add_edge("risk_agent", "supervisor")
    workflow.add_edge("memory_agent", "supervisor")
    workflow.add_edge("calendar_conflict_agent", "supervisor")
    workflow.add_edge("calendar_agent", "supervisor")
    workflow.add_edge("email_agent", "supervisor")
    workflow.add_edge("approval", END)
    
    return workflow.compile()
