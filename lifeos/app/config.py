import os
from dotenv import load_dotenv

# Try loading from the workspace root (two levels up from lifeos/app)
current_dir = os.path.dirname(os.path.abspath(__file__))
workspace_env = os.path.abspath(os.path.join(current_dir, "..", "..", ".env"))
if os.path.exists(workspace_env):
    load_dotenv(workspace_env)
else:
    # Try current directory or general fallback
    load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
USE_MOCK_GOOGLE_SERVICES = os.getenv("USE_MOCK_GOOGLE_SERVICES", "false").lower() in ("true", "1", "yes")

if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
    print("WARNING: GEMINI_API_KEY is not configured or is a placeholder. Please configure it in the .env file at the workspace root.")
