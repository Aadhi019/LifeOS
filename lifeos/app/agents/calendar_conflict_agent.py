import os
import json
from datetime import datetime
from typing import Dict, Any, List
from langchain_core.messages import HumanMessage
from lifeos.app.agents.state import AgentState

def load_mock_calendar() -> List[Dict[str, Any]]:
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    mock_file_path = os.path.join(current_dir, "mock_calendar.json")
    if os.path.exists(mock_file_path):
        try:
            with open(mock_file_path, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading mock calendar: {e}")
    return []

def process(state: AgentState) -> AgentState:
    """
    Calendar Conflict Agent node.
    Inspects existing events on the proposed travel dates to identify overlapping,
    back-to-back, lunch, working-hour, or weekend conflicts, and suggests alternative slots.
    """
    from lifeos.app.agents.graph import get_llm, extract_json
    outputs = state.get("agent_outputs", {}).copy()
    travel_info = outputs.get("travel", {})
    
    if not travel_info:
        outputs["calendar_conflicts"] = {
            "hasConflict": False,
            "conflicts": [],
            "suggestedSlots": []
        }
        return {**state, "agent_outputs": outputs}
        
    travel_date = travel_info.get("dates", "")
    
    # Retrieve existing calendar items
    existing_events = load_mock_calendar()
    
    # Filter calendar items for the target date
    day_events = []
    for ev in existing_events:
        start_time = ev.get("start", "") or ev.get("start_time", "")
        if travel_date in start_time:
            day_events.append(ev)
            
    # Proposed slot
    proposed_start = f"{travel_date}T09:00:00"
    proposed_end = f"{travel_date}T18:00:00"
    
    # Determine day of week to flag weekend conflicts
    try:
        dt_obj = datetime.strptime(travel_date, "%Y-%m-%d")
        day_name = dt_obj.strftime("%A")
        is_weekend = day_name in ["Saturday", "Sunday"]
    except Exception:
        day_name = "Unknown"
        is_weekend = False

    llm = get_llm()
    prompt = f"""
    You are the Calendar Conflict Agent for LifeOS.
    Analyze potential conflicts for the proposed travel slot:
    - Proposed Slot: {proposed_start} to {proposed_end}
    - Travel Date Day of Week: {day_name}
    - Existing Events for this Date: {json.dumps(day_events, indent=2)}
    
    Evaluate the following constraints:
    1. Overlapping meetings (any overlap with the 09:00 to 18:00 slot).
    2. Back-to-back meetings.
    3. Working hours (standard 09:00 to 18:00).
    4. Lunch break conflicts (typically 13:00 to 14:00).
    5. Weekend conflicts (is travel date Saturday or Sunday?).
    
    If any conflicts exist, set 'hasConflict' to true, list all conflicts in detail, and suggest 2 alternate travel slots (e.g., different hours or next business day).
    If no conflicts exist, return 'hasConflict' as false and provide clean status.
    
    Return ONLY a JSON object:
    {{
      "hasConflict": true_or_false,
      "conflicts": ["conflict description 1", "conflict description 2"],
      "suggestedSlots": ["YYYY-MM-DDT09:00:00 to YYYY-MM-DDT18:00:00", "YYYY-MM-DDT14:00:00 to YYYY-MM-DDT17:00:00"]
    }}
    """
    
    default_conflict_output = {
        "hasConflict": is_weekend or len(day_events) > 0,
        "conflicts": [f"Travel scheduled on a weekend ({day_name})." if is_weekend else f"Existing schedule checks: {len(day_events)} event(s) found."],
        "suggestedSlots": [f"{travel_date}T10:00:00 to {travel_date}T16:00:00"]
    }
    
    try:
        res = llm.invoke([HumanMessage(content=prompt)])
        conflict_report = extract_json(res.content)
        if not isinstance(conflict_report, dict) or "hasConflict" not in conflict_report:
            conflict_report = default_conflict_output
    except Exception as e:
        print(f"Error in Calendar Conflict Agent LLM: {e}")
        conflict_report = default_conflict_output
        
    outputs["calendar_conflicts"] = conflict_report
    return {
        **state,
        "agent_outputs": outputs,
        "calendar_conflicts": conflict_report,
        "active_agent": "supervisor"
    }
