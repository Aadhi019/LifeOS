from typing import TypedDict, List, Dict, Any, Annotated, Sequence
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class AgentState(TypedDict, total=False):
    """
    State definition for the LifeOS agent orchestrator, extended with new multi-agent fields.
    """
    messages: Annotated[Sequence[BaseMessage], add_messages]
    user_intent: str
    active_agent: str  # 'travel_agent' | 'flight_agent' | 'hotel_agent' | ...
    agent_outputs: Dict[str, Any]  # Storing outputs for travel, finance, calendar, email, etc.
    requires_approval: bool
    
    # Extended Multi-Agent Fields
    budget_analysis: Dict[str, Any]
    flight_options: List[Dict[str, Any]]
    hotel_options: List[Dict[str, Any]]
    risk_report: Dict[str, Any]
    calendar_conflicts: Dict[str, Any]
    user_memory: Dict[str, Any]
    preferences: Dict[str, Any]
    trip_constraints: Dict[str, Any]
    recommendations: List[str]
    optimized_plan: Dict[str, Any]
