import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List

from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from lifeos.app.agents.graph import get_agent_graph, get_content_text
from lifeos.app.tools.google_services import create_calendar_event, send_email

app = FastAPI(title="LifeOS - Personal Chief of Staff API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://(localhost|127\\.0\\.0\\.1)(:\\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class ConfirmRequest(BaseModel):
    state: Dict[str, Any]

class MemoryUpdateRequest(BaseModel):
    preferred_airline: str
    preferred_hotel_type: str
    meal: str
    seat: str
    budget: str
    home_city: str
    frequently_visited_cities: List[str]
    travel_style: str


def serialize_message(m) -> Dict[str, str]:
    """Helper to convert LangChain messages to serializable dictionaries."""
    m_type = "human"
    if isinstance(m, AIMessage):
        m_type = "ai"
    elif isinstance(m, SystemMessage):
        m_type = "system"
    return {"type": m_type, "content": get_content_text(m.content)}

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # Initialize graph
        graph = get_agent_graph()
        
        # Prepare initial state
        initial_state = {
            "messages": [HumanMessage(content=request.message)],
            "user_intent": request.message,
            "active_agent": "supervisor",
            "agent_outputs": {},
            "requires_approval": False
        }
        
        # Run graph execution
        final_state = graph.invoke(initial_state)
        
        # Serialize messages for JSON response
        serialized_messages = [serialize_message(m) for m in final_state.get("messages", [])]
        
        outputs = final_state.get("agent_outputs", {})
        return {
            "messages": serialized_messages,
            "user_intent": final_state.get("user_intent"),
            "active_agent": final_state.get("active_agent"),
            "agent_outputs": outputs,
            "requires_approval": final_state.get("requires_approval"),
            
            # Explicit API response requirements
            "travel": outputs.get("travel"),
            "weather": outputs.get("travel", {}).get("weather_summary") if outputs.get("travel") else None,
            "flights": outputs.get("flights"),
            "hotels": outputs.get("hotels"),
            "optimized_budget": outputs.get("optimized_budget"),
            "risk": outputs.get("risk"),
            "calendar_conflicts": outputs.get("calendar_conflicts"),
            "recommendations": outputs.get("optimized_budget", {}).get("recommendations", []),
            "memory": outputs.get("memory"),
            "email": outputs.get("email"),
            "approval": final_state.get("requires_approval")
        }
    except ValueError as ve:
        # Treat environment/API key setup errors nicely
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph execution failed: {str(e)}")

@app.post("/api/memory")
async def update_memory_endpoint(request: MemoryUpdateRequest):
    try:
        from lifeos.app.agents.memory_agent import save_memory_to_file
        memory_data = {
            "preferred_airline": request.preferred_airline,
            "preferred_hotel_type": request.preferred_hotel_type,
            "meal": request.meal,
            "seat": request.seat,
            "budget": request.budget,
            "home_city": request.home_city,
            "frequently_visited_cities": request.frequently_visited_cities,
            "travel_style": request.travel_style
        }
        save_memory_to_file(memory_data)
        return {"success": True, "memory": memory_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save memory: {str(e)}")

@app.post("/api/confirm")
async def confirm_endpoint(request: ConfirmRequest):
    try:
        state = request.state
        outputs = state.get("agent_outputs", {})
        
        calendar_result = "No calendar event requested."
        email_result = "No email draft requested."
        
        # 1. Execute Calendar Event Proposal
        if "calendar" in outputs and not outputs.get("calendar", {}).get("skipped"):
            cal = outputs["calendar"]
            calendar_result = create_calendar_event(
                summary=cal.get("summary", "Trip Event"),
                start_time=cal.get("start_time"),
                end_time=cal.get("end_time"),
                description=cal.get("description", ""),
                location=cal.get("location", "")
            )
            
        # 2. Execute Email Draft Proposal
        if "email" in outputs and not outputs.get("email", {}).get("skipped"):
            em = outputs["email"]
            email_result = send_email(
                to=em.get("to", "me"),
                subject=em.get("subject", "Trip Summary"),
                body=em.get("body", "")
            )
            
        # 3. Update memory automatically after confirmation
        from lifeos.app.agents.memory_agent import update_memory_on_confirmation
        updated_memory = update_memory_on_confirmation(state)
        if "agent_outputs" in state:
            state["agent_outputs"]["memory"] = updated_memory
            
        # Clear the approval flag and active agent
        state["requires_approval"] = False
        state["active_agent"] = "supervisor"
        
        return {
            "success": True,
            "calendar_status": calendar_result,
            "email_status": email_result,
            "state": state
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Action execution failed: {str(e)}")

@app.get("/api/health")
async def health_check():
    from lifeos.app.tools.google_services import GOOGLE_LIBS_AVAILABLE, CREDENTIALS_PATH, TOKEN_PATH
    from lifeos.app.config import USE_MOCK_GOOGLE_SERVICES
    return {
        "status": "ok", 
        "message": "LifeOS Backend is active",
        "GOOGLE_LIBS_AVAILABLE": GOOGLE_LIBS_AVAILABLE,
        "USE_MOCK_GOOGLE_SERVICES": USE_MOCK_GOOGLE_SERVICES,
        "CREDENTIALS_PATH_exists": os.path.exists(CREDENTIALS_PATH),
        "TOKEN_PATH_exists": os.path.exists(TOKEN_PATH)
    }
