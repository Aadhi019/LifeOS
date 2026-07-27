import json
from typing import Dict, Any, List
from langchain_core.messages import HumanMessage
from lifeos.app.agents.state import AgentState

def process(state: AgentState) -> AgentState:
    """
    Budget Optimization Agent node.
    Compares travel costs, analyzes potential savings, and proposes budget optimization.
    """
    from lifeos.app.agents.graph import get_llm, extract_json
    outputs = state.get("agent_outputs", {}).copy()
    finance = outputs.get("finance", {})
    flights = outputs.get("flights", [])
    hotels = outputs.get("hotels", [])
    memory = outputs.get("memory", {})
    
    # 1. Retrieve original cost
    try:
        original_cost = int(finance.get("total", 0))
    except (ValueError, TypeError):
        # Strip commas or non-numeric if any
        try:
            original_cost = int(str(finance.get("total", "0")).replace(",", "").replace("INR", "").strip())
        except:
            original_cost = 0
            
    # 2. Get user budget limit
    user_budget_limit = 25000
    if memory:
        try:
            user_budget_limit = int(memory.get("budget", 25000))
        except:
            pass
            
    # 3. Analyze flights & hotels to find cheaper alternatives
    valid_flights = [f for f in flights if isinstance(f, dict) and "price" in f] if isinstance(flights, list) else []
    valid_hotels = [h for h in hotels if isinstance(h, dict) and "price" in h] if isinstance(hotels, list) else []
    
    cheapest_flight = None
    if valid_flights:
        cheapest_flight = min(valid_flights, key=lambda x: x["price"])
        
    cheapest_hotel = None
    if valid_hotels:
        cheapest_hotel = min(valid_hotels, key=lambda x: x["price"])

    llm = get_llm()
    prompt = f"""
    You are the Budget Optimization Agent for LifeOS.
    Analyze the current trip expenses:
    - Original Estimated Cost Breakdown: {json.dumps(finance)}
    - Total Cost: INR {original_cost}
    - User's Budget Limit: INR {user_budget_limit}
    
    Cheapest flight alternative found: {json.dumps(cheapest_flight)}
    Cheapest hotel alternative found: {json.dumps(cheapest_hotel)}
    
    Evaluate savings opportunities. Suggest actions like switching to the cheaper flight, switching to the cheaper hotel, reducing lodging/transit days, or trimming unnecessary expenses.
    
    Compute:
    1. original_cost: The original total cost (e.g. {original_cost})
    2. optimized_cost: The new optimized total cost after applying recommendations.
    3. savings: original_cost - optimized_cost.
    4. recommendations: A list of 2-4 concrete text recommendations on how to achieve these savings (e.g. "Switch to Akasa Air to save INR 700", "Choose egmore budget inn instead of Taj").
    
    Return ONLY a JSON object:
    {{
        "original_cost": original_cost_integer,
        "optimized_cost": optimized_cost_integer,
        "savings": savings_integer,
        "recommendations": ["recommendation 1", "recommendation 2"]
    }}
    """
    
    default_budget_output = {
        "original_cost": original_cost,
        "optimized_cost": original_cost,
        "savings": 0,
        "recommendations": ["No flights or hotels available to optimize.", "Budget is already within user limit."]
    }
    
    try:
        res = llm.invoke([HumanMessage(content=prompt)])
        budget_data = extract_json(res.content)
        # Verify structure
        if not isinstance(budget_data, dict) or "optimized_cost" not in budget_data:
            budget_data = default_budget_output
    except Exception as e:
        print(f"Error in Budget Agent LLM call: {e}")
        budget_data = default_budget_output
        
    outputs["optimized_budget"] = budget_data
    return {
        **state,
        "agent_outputs": outputs,
        "budget_analysis": budget_data,
        "active_agent": "supervisor"
    }
