import os
import json
import base64
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

def get_google_credentials() -> Optional[Credentials]:
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
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                with open(TOKEN_PATH, 'w') as token:
                    token.write(creds.to_json())
            except Exception as e:
                print(f"Error refreshing credentials: {e}")
                creds = None
        else:
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
            service = build('calendar', 'v3', credentials=creds)
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

def draft_email(to: str, subject: str, body: str) -> str:
    """
    Creates an email draft. Uses Gmail API if credentials are set up,
    otherwise falls back to saving to a local JSON file.
    """
    creds = get_google_credentials()
    
    if creds:
        try:
            service = build('gmail', 'v1', credentials=creds)
            message = EmailMessage()
            message.set_content(body)
            message['To'] = to
            message['Subject'] = subject
            
            encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            create_message = {
                'message': {
                    'raw': encoded_message
                }
            }
            draft = service.users().drafts().create(userId="me", body=create_message).execute()
            return f"Success: Email draft created on Gmail (Draft ID: {draft.get('id')})."
        except Exception as e:
            print(f"Failed to create Gmail draft: {e}. Falling back to mock file.")
            
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
            "body": body,
            "mode": "offline/mock"
        }
        drafts.append(new_draft)
        
        with open(MOCK_EMAILS_PATH, "w") as f:
            json.dump(drafts, f, indent=2)
            
        return f"Mock Success: Email draft proposed & saved locally in mock_emails.json (Draft ID: {new_draft['id']})."
    except Exception as ex:
        return f"Error: Failed to save mock email draft. Details: {str(ex)}"
