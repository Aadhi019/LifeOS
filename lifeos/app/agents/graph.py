import json
import re
from datetime import datetime, date
from typing import Dict, Any, Literal

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, START, END

from lifeos.app.config import GEMINI_API_KEY
from lifeos.app.agents.state import AgentState
from lifeos.app.tools.weather import get_weather_forecast

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
                "to": "balaaadhityaa@gmail.com",
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
        model="gemini-3.5-flash",
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
    """
    outputs = state.get("agent_outputs", {})
    
    # Simple logical routing
    if "travel" not in outputs:
        next_agent = "travel_agent"
    elif "calendar" not in outputs:
        next_agent = "calendar_agent"
    elif "email" not in outputs:
        next_agent = "email_agent"
    else:
        next_agent = "approval"
        
    return {
        "active_agent": next_agent
    }

def travel_agent_node(state: AgentState) -> Dict[str, Any]:
    """
    Travel & Finance Agent node.
    Extracts destination/dates, gets weather, suggests packing list, estimates trip costs.
    """
    llm = get_llm()
    user_intent = state.get("user_intent", "")
    today_str = date.today().strftime("%Y-%m-%d")
    day_of_week = date.today().strftime("%A")
    
    # Step 1: Extract city and date
    extraction_prompt = f"""
    You are a parsing assistant.
    Today is {today_str} ({day_of_week}).
    Analyze the user request: "{user_intent}"
    Extract:
    1. The destination city (be precise, e.g., 'Bangalore', 'Paris').
    2. The start date of travel as YYYY-MM-DD. Map relative terms like 'next Friday', 'tomorrow', 'this weekend' to correct calendar dates relative to {today_str}.
    
    Return ONLY a JSON object:
    {{
      "city": "city_name",
      "start_date": "YYYY-MM-DD"
    }}
    """
    
    try:
        extraction_res = llm.invoke([HumanMessage(content=extraction_prompt)])
        details = extract_json(extraction_res.content)
        city = details.get("city", "Bangalore")
        start_date = details.get("start_date", today_str)
    except Exception as e:
        print(f"Error extracting travel details: {e}")
        city = "Bangalore"
        start_date = today_str
        
    # Step 2: Fetch weather forecast
    weather_info = get_weather_forecast(city)
    
    # Step 3: Run Gemini to construct the packing list and estimate finances
    travel_prompt = f"""
    You are the Travel and Finance Planner for LifeOS.
    The user is traveling to {city} on {start_date}.
    Here is the weather forecast for {city}:
    {weather_info}
    
    Today's date is {today_str}.
    
    Based on the destination, dates, and weather, perform the following:
    1. Summarize the weather on the travel date.
    2. Generate a practical packing list of 4-6 items.
    3. Estimate travel costs in INR (Indian Rupee) for: lodging, transit, food, activities.
    
    Return ONLY a JSON object with this exact structure (do not include markdown block):
    {{
      "city": "{city}",
      "dates": "{start_date}",
      "weather_summary": "Short 1-sentence description",
      "packing_list": ["item1", "item2", "item3"],
      "finance": {{
        "lodging": "Estimated cost for lodging (e.g. 3500)",
        "transit": "Estimated transit cost (e.g. 2000)",
        "food": "Estimated food cost (e.g. 1500)",
        "activities": "Estimated activities cost (e.g. 1000)",
        "total": "Sum of above costs"
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
    
    Details:
    - Destination: {city}
    - Date: {travel_date}
    - Weather: {weather_desc}
    - Packing list: {packing}
    - Estimated Budget: Lodging: INR {finance_info.get('lodging')}, Transit: INR {finance_info.get('transit')}, Food: INR {finance_info.get('food')}, Activities: INR {finance_info.get('activities')}. Total: INR {finance_info.get('total')}.
    - Calendar event: {calendar_info.get('summary')} from {calendar_info.get('start_time')} to {calendar_info.get('end_time')}
    
    Generate a JSON object containing:
    {{
      "to": "balaaadhityaa@gmail.com",
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

def route_next(state: AgentState) -> Literal["travel_agent", "calendar_agent", "email_agent", "approval", "end"]:
    active = state.get("active_agent")
    if active in ["travel_agent", "calendar_agent", "email_agent", "approval"]:
        return active
    return "end"

def get_agent_graph():
    workflow = StateGraph(AgentState)
    
    # Add Nodes
    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("travel_agent", travel_agent_node)
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
            "calendar_agent": "calendar_agent",
            "email_agent": "email_agent",
            "approval": "approval",
            "end": END
        }
    )
    
    workflow.add_edge("travel_agent", "supervisor")
    workflow.add_edge("calendar_agent", "supervisor")
    workflow.add_edge("email_agent", "supervisor")
    workflow.add_edge("approval", END)
    
    return workflow.compile()
