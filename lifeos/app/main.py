import os
import sys

# Ensure parent directory is in sys.path so 'lifeos' package can always be resolved
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, "..", ".."))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
workspace_dir = os.path.abspath(os.path.join(current_dir, ".."))
if workspace_dir not in sys.path:
    sys.path.insert(0, workspace_dir)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

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

# Destination Emergency & Survival Kit Database
CITY_EMERGENCY_DATA = {
    "london": {
        "city": "London",
        "country": "United Kingdom",
        "currency": "GBP",
        "exchange_rate": "1 GBP ≈ 106.50 INR",
        "police": "999 (Emergency) / 101 (Non-Emergency)",
        "medical": "999 / NHS 111",
        "hospital": "St Thomas' Hospital (Westminster Bridge Rd, SE1 7EH)",
        "embassy": "High Commission of India (India House, Aldwych, WC2B 4NA)",
        "embassy_phone": "+44 20 7836 9147",
        "transit_advice": "Tap-in/Tap-out with Contactless debit/credit or Oyster card across the London Underground (Tube) and buses. Cash is not accepted on buses.",
        "plug_type": "Type G (230V, 50Hz, 3 rectangular pins)"
    },
    "paris": {
        "city": "Paris",
        "country": "France",
        "currency": "EUR",
        "exchange_rate": "1 EUR ≈ 91.20 INR",
        "police": "17 (Police) / 112 (European Emergency)",
        "medical": "15 (SAMU Medical Dispatch)",
        "hospital": "Hôpital Hôtel-Dieu (1 Parvis Notre-Dame, 75004)",
        "embassy": "Embassy of India (13-15 Rue Alfred Dehodencq, 75016)",
        "embassy_phone": "+33 1 40 50 70 70",
        "transit_advice": "Use the Navigo Easy card or Île-de-France Mobilités mobile app for Métro and RER trains.",
        "plug_type": "Type C & E (230V, 50Hz)"
    },
    "bangalore": {
        "city": "Bangalore",
        "country": "India",
        "currency": "INR",
        "exchange_rate": "Local Currency (INR)",
        "police": "112 / 100",
        "medical": "108 / 102",
        "hospital": "Manipal Hospital (Old Airport Road) / Apollo Hospital",
        "embassy": "Local Domestic Hub / FRRO Indiranagar",
        "embassy_phone": "+91 80 2294 2188",
        "transit_advice": "Use Namma Metro smart card or QR tickets on WhatsApp. Uber and Ola available 24/7.",
        "plug_type": "Type C, D, M (230V, 50Hz)"
    },
    "mumbai": {
        "city": "Mumbai",
        "country": "India",
        "currency": "INR",
        "exchange_rate": "Local Currency (INR)",
        "police": "100 / 112",
        "medical": "108",
        "hospital": "Lilavati Hospital / Bombay Hospital",
        "embassy": "Local Domestic Commercial Capital",
        "embassy_phone": "+91 22 2262 0821",
        "transit_advice": "Local trains and Mumbai Metro line 1, 2A, 7. Metred black-and-yellow cabs require exact cash or UPI.",
        "plug_type": "Type C, D, M (230V, 50Hz)"
    },
    "tokyo": {
        "city": "Tokyo",
        "country": "Japan",
        "currency": "JPY",
        "exchange_rate": "100 JPY ≈ 56.50 INR",
        "police": "110",
        "medical": "119",
        "hospital": "St. Luke's International Hospital (Chuo City)",
        "embassy": "Embassy of India (2 Chome-2-11 Kudanminami, Chiyoda)",
        "embassy_phone": "+81 3 3262 2391",
        "transit_advice": "Load digital Suica or Pasmo on Apple/Google Wallet for all JR lines and Tokyo Metro.",
        "plug_type": "Type A & B (100V, 50/60Hz, 2 flat pins)"
    },
    "new york": {
        "city": "New York",
        "country": "United States",
        "currency": "USD",
        "exchange_rate": "1 USD ≈ 86.80 INR",
        "police": "911",
        "medical": "911",
        "hospital": "NewYork-Presbyterian / Weill Cornell Medical Center",
        "embassy": "Consulate General of India (3 E 64th St, NY 10065)",
        "embassy_phone": "+1 212 774 0600",
        "transit_advice": "OMNY contactless tap-and-go at all NYC subway turnstiles and MTA buses.",
        "plug_type": "Type A & B (120V, 60Hz)"
    }
}

class RescheduleRequest(BaseModel):
    colleague_name: str
    colleague_email: str
    original_event: str
    trip_destination: str
    proposed_slots: List[str]
    custom_note: str = ""

@app.post("/api/reschedule-conflict")
async def reschedule_conflict_endpoint(request: RescheduleRequest):
    try:
        slots_text = "\n".join([f"  • {slot}" for slot in request.proposed_slots]) if request.proposed_slots else "  • Tomorrow at 11:00 AM\n  • Early next week"
        
        subject = f"Reschedule Request: {request.original_event}"
        body = (
            f"Dear {request.colleague_name},\n\n"
            f"I hope this message finds you well.\n\n"
            f"Due to confirmed business travel commitments to {request.trip_destination}, "
            f"I will be traveling and unavailable during our scheduled session for '{request.original_event}'.\n\n"
            f"To ensure we still connect without disruption, would any of the following alternate windows work for you?\n"
            f"{slots_text}\n\n"
            f"{request.custom_note}\n\n"
            f"Please let me know if one of these options suits your calendar, or feel free to propose another convenient time.\n\n"
            f"Thank you for your understanding.\n\n"
            f"Sincerely,\n"
            f"Executive Office | LifeOS Autonomous Assistant"
        )
        
        # Dispatch the reschedule email via send_email
        send_result = send_email(
            to=request.colleague_email,
            subject=subject,
            body=body
        )
        
        return {
            "success": True,
            "subject": subject,
            "body": body,
            "status": send_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send reschedule request: {str(e)}")

@app.get("/api/emergency-kit/{city}")
async def emergency_kit_endpoint(city: str):
    key = city.lower().strip()
    data = CITY_EMERGENCY_DATA.get(key)
    
    if not data:
        # Generic graceful fallback
        data = {
            "city": city.title(),
            "country": "International Travel Hub",
            "currency": "Foreign Currency",
            "exchange_rate": "Check live banking rates",
            "police": "112 / 911 (International Standard)",
            "medical": "112 / 911",
            "hospital": f"Central General Hospital in {city.title()}",
            "embassy": f"Embassy / Consulate Mission in {city.title()}",
            "embassy_phone": "Refer to Ministry of External Affairs portal",
            "transit_advice": "Consult local municipal metro and airport express rail counters upon arrival.",
            "plug_type": "Universal International Travel Adapter Recommended"
        }
        
    return {"success": True, "kit": data}

class ReceiptItem(BaseModel):
    expense_name: str
    category: str  # lodging, transit, food, activities
    amount: float
    currency: str = "INR"

@app.post("/api/receipt-audit")
async def receipt_audit_endpoint(item: ReceiptItem):
    try:
        # Audit logic: analyze against category guidelines
        benchmarks = {
            "lodging": 5000.0,
            "transit": 2500.0,
            "food": 2000.0,
            "activities": 1500.0
        }
        ref = benchmarks.get(item.category.lower(), 3000.0)
        status = "Within Norm" if item.amount <= ref else "High Expenditure Alert"
        
        return {
            "success": True,
            "item": {
                "name": item.expense_name,
                "category": item.category.title(),
                "amount": item.amount,
                "currency": item.currency,
                "audit_status": status,
                "budget_impact": f"{round((item.amount / ref) * 100, 1)}% of typical category allowance"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audit failed: {str(e)}")

# ==========================================
# TELEGRAM & WHATSAPP STATUS DISPATCH
# ==========================================
class TelegramDispatchRequest(BaseModel):
    bot_token: Optional[str] = None
    chat_id: Optional[str] = None
    trip_data: Dict[str, Any]
    custom_note: Optional[str] = None

class WhatsAppDispatchRequest(BaseModel):
    trip_data: Dict[str, Any]
    phone_number: Optional[str] = None

class TelegramTestRequest(BaseModel):
    bot_token: str
    chat_id: str

@app.post("/api/dispatch/telegram")
async def dispatch_telegram_endpoint(request: TelegramDispatchRequest):
    from lifeos.app.tools.bot_dispatch import send_telegram_message, format_telegram_briefing
    
    token = request.bot_token or os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = request.chat_id or os.getenv("TELEGRAM_CHAT_ID")
    
    if not token or not chat_id:
        raise HTTPException(
            status_code=400, 
            detail="Telegram Bot Token and Chat ID are required. Configure them in the UI modal or set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in environment."
        )
    
    text = format_telegram_briefing(request.trip_data)
    if request.custom_note:
        text += f"\n\n📝 <b>Note:</b> {request.custom_note}"
        
    result = send_telegram_message(token, chat_id, text)
    if not result.get("success"):
        raise HTTPException(status_code=502, detail=result.get("error", "Telegram dispatch failed"))
        
    return {
        "success": True, 
        "message": "Executive itinerary successfully pushed to your Telegram device.",
        "telegram_response": result.get("result")
    }

@app.post("/api/dispatch/whatsapp")
async def dispatch_whatsapp_endpoint(request: WhatsAppDispatchRequest):
    from lifeos.app.tools.bot_dispatch import format_whatsapp_briefing, generate_whatsapp_web_link
    
    formatted_text = format_whatsapp_briefing(request.trip_data)
    wa_url = generate_whatsapp_web_link(formatted_text, request.phone_number)
    
    return {
        "success": True,
        "wa_link": wa_url,
        "raw_text": formatted_text,
        "message": "WhatsApp executive memo generated."
    }

@app.post("/api/dispatch/test-telegram")
async def test_telegram_endpoint(request: TelegramTestRequest):
    from lifeos.app.tools.bot_dispatch import send_telegram_message
    
    test_msg = (
        "🤖 <b>LIFEOS // TELEMETRY CONNECTED</b>\n"
        "━━━━━━━━━━━━━━━━━━━━━━\n"
        "Status: 🟢 <i>Online and Synchronized</i>\n"
        "Chief of Staff notifications are linked to this device."
    )
    res = send_telegram_message(request.bot_token, request.chat_id, test_msg)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Connection failed"))
        
    return {"success": True, "message": "Test handshake confirmed on Telegram!"}

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
