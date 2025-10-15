#!/usr/bin/env python3
"""
CX TimeFilter MCP Server
Provides time filter tools for CX Dashboard
"""

import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from fastmcp import FastMCP

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastMCP server
mcp = FastMCP("CX TimeFilter MCP Server")

# Predefined time periods
PREDEFINED_PERIODS = [
    {"name": "All Time", "scale": 0, "isCustom": False},
    {"name": "Today", "scale": 5, "isCustom": False},
    {"name": "Yesterday", "scale": 80, "isCustom": False},
    {"name": "Last 24 hours", "scale": 10, "isCustom": False},
    {"name": "This Week", "scale": 15, "isCustom": False},
    {"name": "Last Week", "scale": 25, "isCustom": False},
    {"name": "Last 7 days", "scale": 20, "isCustom": False},
    {"name": "Last 14 days", "scale": 85, "isCustom": False},
    {"name": "This Month", "scale": 30, "isCustom": False},
    {"name": "Last Month", "scale": 35, "isCustom": False},
    {"name": "Last 30 days", "scale": 50, "isCustom": False},
    {"name": "This Quarter", "scale": 40, "isCustom": False},
    {"name": "Last Quarter", "scale": 45, "isCustom": False},
    {"name": "Last 90 days", "scale": 55, "isCustom": False},
    {"name": "Last 180 days", "scale": 60, "isCustom": False},
    {"name": "This Year", "scale": 65, "isCustom": False},
    {"name": "Last Year", "scale": 75, "isCustom": False},
    {"name": "Last 12 Months", "scale": 70, "isCustom": False},
    {"name": "Custom", "scale": 100, "isCustom": True}
]

DASHBOARD_TABS = ["Overview", "Comparison", "Prediction", "Text Analysis", "Customer Journey"]

@mcp.tool()
def set_time_period(time_period_name: str, tab_name: str) -> Dict[str, Any]:
    """
    Set a predefined time period for dashboard tabs.
    
    Args:
        time_period_name: EXACT name of the time period
        tab_name: Dashboard tab to apply the filter to
    
    Returns:
        Dict containing success status and filter configuration
    """
    try:
        # Validate tab name
        if tab_name not in DASHBOARD_TABS:
            return {
                "success": False,
                "message": f"Invalid tab name '{tab_name}'. Available tabs: {', '.join(DASHBOARD_TABS)}"
            }
        
        # Find the period by name (case insensitive)
        period = None
        for p in PREDEFINED_PERIODS:
            if p["name"].lower() == time_period_name.lower():
                period = p
                break
        
        if not period:
            available_periods = [p["name"] for p in PREDEFINED_PERIODS if not p["isCustom"]]
            return {
                "success": False,
                "message": f"Time period '{time_period_name}' not found. Available periods: {', '.join(available_periods)}"
            }
        
        # Create filter configuration
        filter_config = {
            "periodScale": period["scale"],
            "tabName": tab_name,
            "periodName": period["name"],
            "isCustom": period["isCustom"],
            "timestamp": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "message": f"✅ Successfully set time filter to '{period['name']}' for {tab_name} tab.",
            "filterConfig": filter_config,
            "action": {
                "type": "time_period_changed",
                "target": f"filter-{tab_name.lower().replace(' ', '-')}",
                "data": filter_config
            }
        }
        
    except Exception as e:
        logger.error(f"Error setting time period: {e}")
        return {
            "success": False,
            "message": f"Error setting time period: {str(e)}"
        }

@mcp.tool()
def set_custom_date_range(start_date: str, end_date: str, tab_name: str) -> Dict[str, Any]:
    """
    Set a custom date range with specific start and end dates for dashboard tabs.
    
    Args:
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        tab_name: Dashboard tab to apply the filter to
    
    Returns:
        Dict containing success status and filter configuration
    """
    try:
        # Validate tab name
        if tab_name not in DASHBOARD_TABS:
            return {
                "success": False,
                "message": f"Invalid tab name '{tab_name}'. Available tabs: {', '.join(DASHBOARD_TABS)}"
            }
        
        # Validate date formats
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError as e:
            return {
                "success": False,
                "message": f"Invalid date format. Use YYYY-MM-DD format. Error: {str(e)}"
            }
        
        # Validate date logic
        if start > end:
            return {
                "success": False,
                "message": "Start date cannot be after end date"
            }
        
        if end > datetime.now():
            return {
                "success": False,
                "message": "End date cannot be in the future"
            }
        
        date_range_text = f"{start_date} to {end_date}"
        
        # Create filter configuration
        filter_config = {
            "periodScale": 100,  # Custom period scale
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
            "tabName": tab_name,
            "periodName": f"Custom ({date_range_text})",
            "isCustom": True,
            "timestamp": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "message": f"✅ Successfully set custom date range '{date_range_text}' for {tab_name} tab.",
            "filterConfig": filter_config,
            "action": {
                "type": "time_period_changed",
                "target": f"filter-{tab_name.lower().replace(' ', '-')}",
                "data": filter_config
            }
        }
        
    except Exception as e:
        logger.error(f"Error setting custom date range: {e}")
        return {
            "success": False,
            "message": f"Error setting custom date range: {str(e)}"
        }

@mcp.tool()
def list_time_periods() -> Dict[str, Any]:
    """
    List all available predefined time periods and their descriptions.
    
    Returns:
        Dict containing all available time periods categorized by type
    """
    try:
        # Categorize periods
        calendar_periods = []
        rolling_periods = []
        custom_periods = []
        
        for period in PREDEFINED_PERIODS:
            if period["isCustom"]:
                custom_periods.append({
                    "name": period["name"],
                    "scale": period["scale"],
                    "isCustom": period["isCustom"],
                    "category": "Custom"
                })
            elif ("This" in period["name"] or 
                  ("Last" in period["name"] and 
                   "days" not in period["name"] and 
                   "hours" not in period["name"])):
                calendar_periods.append({
                    "name": period["name"],
                    "scale": period["scale"],
                    "isCustom": period["isCustom"],
                    "category": "Calendar"
                })
            else:
                rolling_periods.append({
                    "name": period["name"],
                    "scale": period["scale"],
                    "isCustom": period["isCustom"],
                    "category": "Rolling"
                })
        
        message = f"""📅 **Available Time Periods:**

**📅 Calendar Periods:**
{chr(10).join([f"• {p['name']}" for p in calendar_periods])}

**🔄 Rolling Periods:**  
{chr(10).join([f"• {p['name']}" for p in rolling_periods])}

**⚙️ Custom Periods:**
{chr(10).join([f"• {p['name']}" for p in custom_periods])}

**💡 Usage Examples:**
- "Set Last Month for Overview tab"
- "Set Last 30 days for Comparison tab"
- "Set custom date range 2024-01-01 to 2024-01-31 for Text Analysis tab\""""
        
        return {
            "success": True,
            "message": message,
            "data": {
                "calendarPeriods": calendar_periods,
                "rollingPeriods": rolling_periods,
                "customPeriods": custom_periods,
                "totalCount": len(PREDEFINED_PERIODS)
            }
        }
        
    except Exception as e:
        logger.error(f"Error listing time periods: {e}")
        return {
            "success": False,
            "message": f"Error listing time periods: {str(e)}"
        }

if __name__ == "__main__":
    # This allows the server to be run directly
    mcp.run()
