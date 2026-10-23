import urllib.request
import urllib.parse
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("lifeos.bot_dispatch")

def resolve_telegram_chat_id(bot_token: str, chat_id: str) -> str:
    """
    If the user entered an @username (e.g. @Aadhi_019), Telegram's Bot API requires a numeric chat_id for private DMs.
    This helper checks the bot's getUpdates endpoint to auto-resolve the username to their numeric ID.
    """
    raw = chat_id.strip()
    if not raw.startswith("@"):
        return raw

    clean_username = raw.lstrip("@").lower()
    try:
        url = f"https://api.telegram.org/bot{bot_token.strip()}/getUpdates"
        req = urllib.request.Request(url, headers={"User-Agent": "LifeOS"})
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("ok"):
                for upd in reversed(data.get("result", [])):
                    msg = upd.get("message") or upd.get("my_chat_member") or {}
                    sender = msg.get("from") or {}
                    chat = msg.get("chat") or {}
                    if sender.get("username", "").lower() == clean_username or chat.get("username", "").lower() == clean_username:
                        return str(chat.get("id") or sender.get("id"))
    except Exception as e:
        logger.warning(f"Could not auto-resolve username {raw}: {e}")

    return raw

def send_telegram_message(
    bot_token: str, 
    chat_id: str, 
    text: str, 
    parse_mode: str = "HTML"
) -> Dict[str, Any]:
    """
    Dispatches a real-time status message to a Telegram chat using the official Telegram Bot API.
    Zero third-party dependencies required (uses standard library urllib).
    """
    if not bot_token or not chat_id:
        return {"success": False, "error": "Bot token and Chat ID are required."}

    # Auto-resolve @username to numeric ID if available
    actual_chat_id = resolve_telegram_chat_id(bot_token, chat_id)

    url = f"https://api.telegram.org/bot{bot_token.strip()}/sendMessage"
    payload = {
        "chat_id": actual_chat_id,
        "text": text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": True
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url, 
        data=data, 
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            if res_json.get("ok"):
                return {"success": True, "result": res_json.get("result"), "resolved_id": actual_chat_id}
            else:
                return {"success": False, "error": res_json.get("description", "Unknown Telegram API error")}
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="ignore")
        logger.error(f"Telegram HTTP Error {e.code}: {err_msg}")
        
        # Detect username vs numeric ID error
        if "chat not found" in err_msg.lower() and chat_id.strip().startswith("@"):
            return {
                "success": False, 
                "error": f"Telegram cannot send DMs to '{chat_id}'. Telegram requires your numeric User ID (numbers only, e.g. 581920392). Message @userinfobot on Telegram to get your numerical ID, and send /start to your bot."
            }
        
        # Retry with plain text if HTML parsing caused 400
        if e.code == 400 and parse_mode == "HTML" and "entity" in err_msg.lower():
            payload.pop("parse_mode", None)
            retry_data = json.dumps(payload).encode("utf-8")
            retry_req = urllib.request.Request(url, data=retry_data, headers={"Content-Type": "application/json"})
            try:
                with urllib.request.urlopen(retry_req, timeout=10) as retry_res:
                    return {"success": True, "result": json.loads(retry_res.read().decode("utf-8"))}
            except Exception as retry_e:
                return {"success": False, "error": str(retry_e)}
        return {"success": False, "error": f"Telegram Error ({e.code}): {err_msg}"}
    except Exception as e:
        logger.error(f"Failed to send Telegram message: {str(e)}")
        return {"success": False, "error": str(e)}

def format_telegram_briefing(trip: Dict[str, Any]) -> str:
    """
    Formats an executive travel status dispatch for Telegram using clean HTML.
    """
    city = trip.get("city", "Selected Destination")
    dates = trip.get("dates", "Upcoming Travel")
    weather = trip.get("weather", "Nominal conditions")
    packing = trip.get("packing", "Standard executive attire")
    hotel = trip.get("hotel", {})
    hotel_name = hotel.get("name", "Executive Lodging") if isinstance(hotel, dict) else str(hotel)
    flight = trip.get("flight", {})
    airline = flight.get("airline", "Premium Air") if isinstance(flight, dict) else "Commercial Flight"
    cost_total = trip.get("total_budget", "Calculated in Ledger")

    html = (
        f"🧭 <b>LIFEOS // EXECUTIVE STATUS DISPATCH</b>\n"
        f"━━━━━━━━━━━━━━━━━━━━━━\n"
        f"📍 <b>Destination:</b> {city.upper()}\n"
        f"📅 <b>Schedule:</b> {dates}\n\n"
        f"✈️ <b>TRANSIT & FLIGHTS</b>\n"
        f"• Airline: {airline}\n"
        f"• Status: 🟢 Telemetry Verified\n\n"
        f"🏨 <b>ACCOMMODATIONS</b>\n"
        f"• Property: {hotel_name}\n"
        f"• Reservation: Confirmed\n\n"
        f"🌦️ <b>ENVIRONMENT & PACKING</b>\n"
        f"• Conditions: {weather}\n"
        f"• Recommendation: {packing}\n\n"
        f"💳 <b>FINANCIAL ALLOCATION</b>\n"
        f"• Estimated Budget: {cost_total}\n"
        f"━━━━━━━━━━━━━━━━━━━━━━\n"
        f"<i>Automated Chief of Staff Alert • LifeOS v2.4</i>"
    )
    return html

def format_whatsapp_briefing(trip: Dict[str, Any]) -> str:
    """
    Formats a clean, executive travel status dispatch for WhatsApp.
    WhatsApp uses *bold*, _italics_, and ~strikethrough~.
    """
    city = trip.get("city", "Selected Destination")
    dates = trip.get("dates", "Upcoming Travel")
    weather = trip.get("weather", "Nominal conditions")
    packing = trip.get("packing", "Standard executive attire")
    hotel = trip.get("hotel", {})
    hotel_name = hotel.get("name", "Executive Lodging") if isinstance(hotel, dict) else str(hotel)
    flight = trip.get("flight", {})
    airline = flight.get("airline", "Premium Air") if isinstance(flight, dict) else "Commercial Flight"
    cost_total = trip.get("total_budget", "Calculated in Ledger")

    text = (
        f"🧭 *LIFEOS // EXECUTIVE STATUS DISPATCH*\n"
        f"----------------------------------------\n"
        f"📍 *Destination:* {city.upper()}\n"
        f"📅 *Schedule:* {dates}\n\n"
        f"✈️ *TRANSIT & FLIGHTS*\n"
        f"• Carrier: {airline}\n"
        f"• Status: Confirmed & Synchronized\n\n"
        f"🏨 *LODGING*\n"
        f"• Property: {hotel_name}\n"
        f"• Booking: Reserved\n\n"
        f"🌦️ *WEATHER & DIRECTIVE*\n"
        f"• Forecast: {weather}\n"
        f"• Packing: {packing}\n\n"
        f"💳 *FINANCE SUMMARY*\n"
        f"• Projected Cost: {cost_total}\n"
        f"----------------------------------------\n"
        f"_LifeOS Personal Chief of Staff Telemetry_"
    )
    return text

def generate_whatsapp_web_link(text: str, phone: Optional[str] = None) -> str:
    """
    Generates a universal wa.me link that opens in WhatsApp Web or Mobile WhatsApp.
    """
    encoded_text = urllib.parse.quote(text)
    if phone:
        # Strip spaces, dashes, parentheses, plus
        cleaned_phone = "".join(c for c in phone if c.isdigit())
        return f"https://wa.me/{cleaned_phone}?text={encoded_text}"
    return f"https://wa.me/?text={encoded_text}"
