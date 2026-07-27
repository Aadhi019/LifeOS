import os
import json
from typing import Dict, Any, List
from langchain_core.messages import HumanMessage
from lifeos.app.agents.state import AgentState

def load_mock_risk_data() -> Dict[str, Any]:
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    mock_file_path = os.path.join(current_dir, "mock_risk_data.json")
    if os.path.exists(mock_file_path):
        with open(mock_file_path, "r") as f:
            return json.load(f)
    return {}

def process(state: AgentState) -> AgentState:
    """
    Risk Analysis Agent node.
    Checks destination risks including weather, disasters, traffic, holidays, safety, and flight disruption probability.
    """
    from lifeos.app.agents.graph import get_llm, extract_json
    outputs = state.get("agent_outputs", {}).copy()
    travel_info = outputs.get("travel", {})
    
    if not travel_info:
        outputs["risk"] = {
            "risk_level": "Low",
            "score": 0,
            "risks": ["No travel plans specified."],
            "recommendations": []
        }
        return {**state, "agent_outputs": outputs}
        
    city = travel_info.get("city", "Paris")
    weather_summary = travel_info.get("weather_summary", "").lower()
    
    # Load and find risk profile
    all_risks = load_mock_risk_data()
    
    # Matching city case insensitively
    city_key = None
    for k in all_risks.keys():
        if k.lower() == city.lower():
            city_key = k
            break
            
    if city_key:
        profile = all_risks[city_key]
    else:
        # Fallback profile
        profile = {
            "traffic": "Moderate traffic delays in city center.",
            "holidays": "No major holidays expected.",
            "political_events": "None planned.",
            "safety": "Standard safety level. Guard personal belongings in tourist centers.",
            "medical_alerts": "No active medical warnings.",
            "disasters": "None",
            "disruption_prob": 5,
            "crowd_density": 50
        }
        
    # Weather-based dynamic risk modifications
    weather_risk_items = []
    weather_score_addition = 0
    if "rain" in weather_summary or "shower" in weather_summary or "drizzle" in weather_summary:
        weather_risk_items.append("Precipitation forecasted, increasing road slickness and airport delay risk.")
        weather_score_addition += 15
    if "storm" in weather_summary or "heavy rain" in weather_summary:
        weather_risk_items.append("Severe rain/storm alert, high potential for flight disruptions and local waterlogging.")
        weather_score_addition += 30
    if "wind" in weather_summary or "gale" in weather_summary:
        weather_risk_items.append("High wind warnings which might affect light transit and flights.")
        weather_score_addition += 10

    llm = get_llm()
    prompt = f"""
    You are the Risk Analysis Agent for LifeOS.
    Analyze the safety and travel risk profiles for a trip to {city}:
    - General City Risk Parameters: {json.dumps(profile)}
    - Weather-based Additional Risks: {json.dumps(weather_risk_items)}
    
    Calculate a comprehensive risk score (0-100) and determine the overall risk level (Low, Medium, High).
    Identify a list of 2-4 primary risks and provide corresponding mitigation recommendations.
    
    Return ONLY a JSON object with this exact structure:
    {{
      "risk_level": "Low/Medium/High",
      "score": risk_score_integer_0_to_100,
      "risks": ["Risk details 1", "Risk details 2"],
      "recommendations": ["Mitigation advice 1", "Mitigation advice 2"]
    }}
    """
    
    default_risk_output = {
        "risk_level": "Low",
        "score": 15 + weather_score_addition,
        "risks": ["Standard city travel risks."] + weather_risk_items,
        "recommendations": ["Carry travel insurance.", "Check flight details before departure."]
    }
    
    try:
        res = llm.invoke([HumanMessage(content=prompt)])
        risk_data = extract_json(res.content)
        if not isinstance(risk_data, dict) or "score" not in risk_data:
            risk_data = default_risk_output
    except Exception as e:
        print(f"Error in Risk Agent LLM call: {e}")
        risk_data = default_risk_output
        
    outputs["risk"] = risk_data
    return {
        **state,
        "agent_outputs": outputs,
        "risk_report": risk_data,
        "active_agent": "supervisor"
    }
