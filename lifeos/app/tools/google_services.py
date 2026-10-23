import os
import json
import base64
import re
import html
from email.message import EmailMessage
from typing import Dict, Any, Optional

# Google API Imports
try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    GOOGLE_LIBS_AVAILABLE = True
except ImportError:
    GOOGLE_LIBS_AVAILABLE = False

# Scopes required for Calendar and Gmail
SCOPES = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/gmail.compose'
]

# File paths
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(CURRENT_DIR)
CREDENTIALS_PATH = os.path.join(APP_DIR, "credentials.json")
TOKEN_PATH = os.path.join(APP_DIR, "token.json")

MOCK_CALENDAR_PATH = os.path.join(APP_DIR, "mock_calendar.json")
MOCK_EMAILS_PATH = os.path.join(APP_DIR, "mock_emails.json")

def get_google_credentials() -> Any:
    """Retrieves or refreshes Google OAuth2 credentials."""
    from lifeos.app.config import USE_MOCK_GOOGLE_SERVICES
    if USE_MOCK_GOOGLE_SERVICES:
        return None

    if not GOOGLE_LIBS_AVAILABLE:
        return None

    creds = None
    # Token file stores the user's access and refresh tokens
    if os.path.exists(TOKEN_PATH):
        try:
            creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
        except Exception as e:
            print(f"Error loading token.json: {e}")
            creds = None

    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        refreshed = False
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                with open(TOKEN_PATH, 'w') as token:
                    token.write(creds.to_json())
                refreshed = True
            except Exception as e:
                print(f"Error refreshing credentials: {e}")
                creds = None
                if os.path.exists(TOKEN_PATH):
                    try:
                        os.remove(TOKEN_PATH)
                    except Exception:
                        pass
        
        if not refreshed:
            if not os.path.exists(CREDENTIALS_PATH):
                # No credentials file, fallback to mock mode
                return None
            try:
                flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
                creds = flow.run_local_server(port=0)
                # Save the credentials for the next run
                with open(TOKEN_PATH, 'w') as token:
                    token.write(creds.to_json())
            except Exception as e:
                print(f"Error running OAuth flow: {e}")
                return None
    return creds

def create_calendar_event(summary: str, start_time: str, end_time: str, description: str = "", location: str = "") -> str:
    """
    Creates a calendar event. Uses the Google Calendar API if credentials are set up,
    otherwise falls back to a local JSON file.
    `start_time` and `end_time` should be ISO format strings (e.g. 'YYYY-MM-DDTHH:MM:SS')
    """
    creds = get_google_credentials()
    
    if creds:
        try:
            service: Any = build('calendar', 'v3', credentials=creds)
            event = {
                'summary': summary,
                'location': location,
                'description': description,
                'start': {
                    'dateTime': start_time,
                    'timeZone': 'Asia/Kolkata',  # Default timezone, customizable
                },
                'end': {
                    'dateTime': end_time,
                    'timeZone': 'Asia/Kolkata',
                },
            }
            created_event = service.events().insert(calendarId='primary', body=event).execute()
            return f"Success: Calendar event created on Google Calendar. Event Link: {created_event.get('htmlLink')}"
        except Exception as e:
            print(f"Failed to create Google Calendar event: {e}. Falling back to mock file.")
            
    # Mock fallback
    try:
        events = []
        if os.path.exists(MOCK_CALENDAR_PATH):
            with open(MOCK_CALENDAR_PATH, "r") as f:
                try:
                    events = json.load(f)
                except json.JSONDecodeError:
                    events = []
        
        new_event = {
            "id": f"mock-{len(events) + 1}",
            "summary": summary,
            "location": location,
            "description": description,
            "start": start_time,
            "end": end_time,
            "mode": "offline/mock"
        }
        events.append(new_event)
        
        with open(MOCK_CALENDAR_PATH, "w") as f:
            json.dump(events, f, indent=2)
            
        return f"Mock Success: Calendar event proposed & saved locally in mock_calendar.json (Event ID: {new_event['id']})."
    except Exception as ex:
        return f"Error: Failed to save mock calendar event. Details: {str(ex)}"

def clean_formal_text(text: str) -> str:
    """
    Cleans raw AI formatting, asterisks, hashes, and casual emojis into an
    elegant, formal executive business text.
    """
    if not text:
        return ""
    # Strip emojis
    cleaned = re.sub(r'[\U00010000-\U0010ffff]', '', text)
    cleaned = re.sub(r'[\u2600-\u27ff]', '', cleaned)
    cleaned = re.sub(r'[\u2300-\u23ff]', '', cleaned)
    # Strip markdown bold/italics
    cleaned = re.sub(r'\*\*(.*?)\*\*', r'\1', cleaned)
    cleaned = re.sub(r'\*(.*?)\*', r'\1', cleaned)
    # Strip markdown headers
    cleaned = re.sub(r'^#+\s*', '', cleaned, flags=re.MULTILINE)
    
    # Replace casual greetings
    cleaned = re.sub(r'^(Hi|Hello|Hi there),?\s*$', 'Dear Traveler,', cleaned, flags=re.MULTILINE | re.IGNORECASE)
    cleaned = re.sub(r'^Here is the summary of your upcoming trip.*?:', 'Please find detailed below your official travel briefing and confirmed itinerary:', cleaned, flags=re.MULTILINE | re.IGNORECASE)
    cleaned = re.sub(r'^Have a (great|safe and wonderful|wonderful and safe) trip!?', 'Should you require adjustments to your itinerary or further arrangements, please let us know.', cleaned, flags=re.MULTILINE | re.IGNORECASE)
    cleaned = re.sub(r'(Best regards|Warm regards|Regards),?\s*\n(Your )?LifeOS (Email )?Assistant', 'Sincerely,\nExecutive Travel Operations | LifeOS', cleaned, flags=re.IGNORECASE)
    
    # Clean redundant trailing spaces per line
    lines = [line.rstrip() for line in cleaned.splitlines()]
    return '\n'.join(lines).strip()

def generate_formal_html_email(subject: str, text: str) -> str:
    """
    Renders an executive, responsive HTML email memorandum for Gmail and Outlook.
    """
    cleaned = clean_formal_text(text)
    lines = cleaned.splitlines()
    
    body_parts = []
    in_list = False
    
    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            if in_list:
                body_parts.append('</ul>')
                in_list = False
            continue
            
        header_check = line.strip('-=: ')
        is_section_header = False
        
        # Identify section headings
        if (
            (line.isupper() and len(line) > 3 and not line.startswith('HTTP'))
            or (line.startswith('---') and line.endswith('---'))
            or re.match(r'^\d+\.\s+[A-Z\s&]+$', line)
            or any(k in line.upper() for k in [
                'CALENDAR EVENT', 'CALENDAR REMINDER', 'SCHEDULE & CALENDAR',
                'WEATHER FORECAST', 'METEOROLOGICAL OUTLOOK',
                'PACKING LIST', 'RECOMMENDED ATTIRE', 'PACKING GUIDELINES',
                'ESTIMATED BUDGET', 'FINANCIAL ALLOCATION',
                'BOOKING LINKS', 'RESERVATIONS & BOOKING',
                'PLANNED ACTIVITIES', 'SCHEDULED ITINERARY'
            ])
        ):
            if not line.startswith('http') and not line.startswith('•') and not line.startswith('-') and not line.startswith('*'):
                is_section_header = True
                
        if is_section_header:
            if in_list:
                body_parts.append('</ul>')
                in_list = False
            title = header_check.replace('---', '').strip()
            body_parts.append(f'''
            <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; margin-bottom: 12px;">
                {html.escape(title)}
            </div>
            ''')
            continue
            
        # Bullet list items
        if line.startswith('•') or line.startswith('-') or line.startswith('*'):
            bullet_text = re.sub(r'^[•\-\*]\s*', '', line)
            
            # Extract URLs if present
            url_match = re.search(r'(https?://[^\s]+)', bullet_text)
            if url_match:
                url = url_match.group(1)
                label = bullet_text.replace(url, '').strip(' :()-')
                bullet_content = f'{html.escape(label)} <a href="{url}" style="color: #0284c7; text-decoration: underline; font-weight: 600;">View Details &rarr;</a>'
            else:
                if ':' in bullet_text and not bullet_text.startswith('http'):
                    key, val = bullet_text.split(':', 1)
                    bullet_content = f'<strong style="color: #0f172a;">{html.escape(key)}:</strong>{html.escape(val)}'
                else:
                    bullet_content = html.escape(bullet_text)
                
            if not in_list:
                body_parts.append('<ul style="margin: 0 0 14px 0; padding-left: 20px; color: #334155; font-size: 13.5px; line-height: 1.7;">')
                in_list = True
            body_parts.append(f'<li style="margin-bottom: 5px;">{bullet_content}</li>')
            continue
            
        if in_list:
            body_parts.append('</ul>')
            in_list = False
            
        # Standalone links (e.g. 'Book Flight: https://...')
        url_match = re.search(r'(https?://[^\s]+)', line)
        if url_match:
            url = url_match.group(1)
            prefix = line.replace(url, '').strip(' :()-')
            body_parts.append(f'''
            <div style="margin: 8px 0 12px 0; padding-left: 12px;">
                <span style="color: #64748b; font-size: 12.5px;">{html.escape(prefix)}: </span>
                <a href="{url}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 6px 14px; border-radius: 4px; font-size: 11.5px; font-weight: 600; margin-left: 4px;">Book Reservation &rarr;</a>
            </div>
            ''')
            continue
            
        # Check for signature block
        if line.startswith('Sincerely,') or line.startswith('Executive Travel Operations'):
            body_parts.append(f'<p style="margin: 16px 0 4px 0; color: #475569; font-size: 13.5px; font-weight: 600; line-height: 1.5;">{html.escape(line)}</p>')
            continue
            
        # Standard paragraph
        body_parts.append(f'<p style="margin: 0 0 12px 0; color: #334155; font-size: 14px; line-height: 1.6;">{html.escape(line)}</p>')
        
    if in_list:
        body_parts.append('</ul>')

    content_html = '\n'.join(body_parts)
    
    return f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{html.escape(subject)}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <tr>
            <td style="background-color: #0f172a; padding: 24px 28px; border-bottom: 3px solid #ff4b2b;">
                <div style="font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">LIFEOS EXECUTIVE TRAVEL CONCIERGE</div>
                <div style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.2px;">{html.escape(subject)}</div>
                <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px;">Official Itinerary Memorandum &amp; Logistical Briefing</div>
            </td>
        </tr>
        <tr>
            <td style="padding: 28px 28px 24px 28px;">
                {content_html}
            </td>
        </tr>
        <tr>
            <td style="background-color: #f8fafc; padding: 16px 28px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                This document is a confidential travel memorandum prepared by LifeOS.<br>
                For itinerary updates or adjustments, consult your LifeOS Chief of Staff console.
            </td>
        </tr>
    </table>
</body>
</html>'''

def send_email(to: str, subject: str, body: str) -> str:
    """
    Sends an email directly. Uses Gmail API if credentials are set up,
    delivering both a clean formal plain text body and an executive HTML template,
    with local fallback.
    """
    creds = get_google_credentials()
    clean_body = clean_formal_text(body)
    html_content = generate_formal_html_email(subject, clean_body)
    
    if creds:
        try:
            service: Any = build('gmail', 'v1', credentials=creds)
            
            # Resolve special 'me' alias to actual authenticated email address
            if to.strip().lower() == "me":
                try:
                    profile = service.users().getProfile(userId='me').execute()
                    resolved_email = profile.get('emailAddress')
                    if resolved_email:
                        to = resolved_email
                except Exception as pe:
                    print(f"Failed to resolve 'me' email address: {pe}")

            message = EmailMessage()
            message.set_content(clean_body)
            message.add_alternative(html_content, subtype='html')
            message['To'] = to
            message['Subject'] = subject
            
            encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            create_message = {
                'raw': encoded_message
            }
            sent_message = service.users().messages().send(userId="me", body=create_message).execute()
            return f"Success: Email sent directly via Gmail (Message ID: {sent_message.get('id')})."
        except Exception as e:
            print(f"Failed to send Gmail message: {e}. Falling back to mock file.")
            
    # Mock fallback
    try:
        drafts = []
        if os.path.exists(MOCK_EMAILS_PATH):
            with open(MOCK_EMAILS_PATH, "r") as f:
                try:
                    drafts = json.load(f)
                except json.JSONDecodeError:
                    drafts = []
                    
        new_draft = {
            "id": f"mock-{len(drafts) + 1}",
            "to": to,
            "subject": subject,
            "body": clean_body,
            "html_body": html_content,
            "mode": "offline/mock"
        }
        drafts.append(new_draft)
        
        with open(MOCK_EMAILS_PATH, "w") as f:
            json.dump(drafts, f, indent=2)
            
        return f"Mock Success: Email proposed & saved locally in mock_emails.json (Message ID: {new_draft['id']})."
    except Exception as ex:
        return f"Error: Failed to save mock email. Details: {str(ex)}"
