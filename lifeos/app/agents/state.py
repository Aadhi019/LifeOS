from typing import TypedDict, List, Dict, Any, Annotated, Sequence
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    """
    State definition for the LifeOS agent orchestrator.
    """
    messages: Annotated[Sequence[BaseMessage], add_messages]
    user_intent: str
    active_agent: str  # 'travel_agent' | 'calendar_agent' | 'email_agent' | 'supervisor'
    agent_outputs: Dict[str, Any]  # Storing outputs for travel, finance, calendar, email
    requires_approval: bool
