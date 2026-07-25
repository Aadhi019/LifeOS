import requests
import json
from typing import Dict, Any, Optional

def get_weather_forecast(city: str) -> str:
    """
    Fetches the 7-day weather forecast for a given city using the free Open-Meteo APIs.
    Returns a formatted string summary with temperature ranges and rain probabilities.
    """
    if not city:
        return "Error: City name is required."

    try:
        # Step 1: Geocoding API to get Lat/Lon
        geocode_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json"
        geo_response = requests.get(geocode_url, timeout=10)
        geo_response.raise_for_status()
        geo_data = geo_response.json()

        if not geo_data.get("results"):
            return f"Error: City '{city}' could not be resolved to geographical coordinates."

        location = geo_data["results"][0]
        lat = location["latitude"]
        lon = location["longitude"]
        resolved_name = f"{location.get('name')}, {location.get('country')}"

        # Step 2: Forecast API
        forecast_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto"
        forecast_response = requests.get(forecast_url, timeout=10)
        forecast_response.raise_for_status()
        forecast_data = forecast_response.json()

        daily = forecast_data.get("daily", {})
        if not daily:
            return f"Error: Failed to retrieve daily forecast data for {resolved_name}."

        # Step 3: Format the response
        dates = daily.get("time", [])
        max_temps = daily.get("temperature_2m_max", [])
        min_temps = daily.get("temperature_2m_min", [])
        rain_probs = daily.get("precipitation_probability_max", [])

        summary_lines = [f"Weather Forecast for {resolved_name}:"]
        for i in range(len(dates)):
            date_str = dates[i]
            max_t = max_temps[i] if i < len(max_temps) else "N/A"
            min_t = min_temps[i] if i < len(min_temps) else "N/A"
            rain_p = rain_probs[i] if i < len(rain_probs) else "N/A"
            summary_lines.append(
                f"- {date_str}: Max {max_t}°C, Min {min_t}°C, Rain Prob: {rain_p}%"
            )

        return "\n".join(summary_lines)

    except requests.exceptions.RequestException as e:
        return f"Error connecting to Open-Meteo APIs: {str(e)}"
    except Exception as e:
        return f"Error processing weather data: {str(e)}"

# Simple self-test code when run directly
if __name__ == "__main__":
    print(get_weather_forecast("Bangalore"))
