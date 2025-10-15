// Time Filter Tools - Converted from LangChain to MCP format
// Based on your original timefiltertool.js

import { z } from "zod";

// Predefined time periods (same as your original tool)
const PREDEFINED_PERIODS = [
  { name: "All Time", scale: 0, isCustom: false },
  { name: "Today", scale: 5, isCustom: false },
  { name: "Yesterday", scale: 80, isCustom: false },
  { name: "Last 24 hours", scale: 10, isCustom: false },
  { name: "This Week", scale: 15, isCustom: false },
  { name: "Last Week", scale: 25, isCustom: false },
  { name: "Last 7 days", scale: 20, isCustom: false },
  { name: "Last 14 days", scale: 85, isCustom: false },
  { name: "This Month", scale: 30, isCustom: false },
  { name: "Last Month", scale: 35, isCustom: false },
  { name: "Last 30 days", scale: 50, isCustom: false },
  { name: "This Quarter", scale: 40, isCustom: false },
  { name: "Last Quarter", scale: 45, isCustom: false },
  { name: "Last 90 days", scale: 55, isCustom: false },
  { name: "Last 180 days", scale: 60, isCustom: false },
  { name: "This Year", scale: 65, isCustom: false },
  { name: "Last Year", scale: 75, isCustom: false },
  { name: "Last 12 Months", scale: 70, isCustom: false },
  { name: "Custom", scale: 100, isCustom: true },
];

// Validation schemas
const setTimePeriodSchema = z.object({
  timePeriodName: z.string().min(1, "Time period name is required"),
  tabName: z.string().min(1, "Tab name is required"),
});

const setCustomDateRangeSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
  tabName: z.string().min(1, "Tab name is required"),
});

// Set Predefined Time Period Tool
const setTimePeriodTool = {
  name: "set_time_period",
  description:
    "Set a predefined time period for dashboard tabs. Supports calendar periods (This Month, Last Week) and rolling periods (Last 30 days, Last 7 days).",

  inputSchema: {
    type: "object",
    properties: {
      timePeriodName: {
        type: "string",
        description: "EXACT name of the time period",
        enum: PREDEFINED_PERIODS.map((p) => p.name),
      },
      tabName: {
        type: "string",
        description: "Dashboard tab to apply the filter to",
        enum: [
          "Overview",
          "Comparison",
          "Prediction",
          "Text Analysis",
          "Customer Journey",
        ],
      },
    },
    required: ["timePeriodName", "tabName"],
  },

  validateArgs: (args) => {
    try {
      const validated = setTimePeriodSchema.parse(args);
      return { success: true, data: validated };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  execute: async ({ timePeriodName, tabName }) => {
    try {
      // Find the period by name (case insensitive)
      const searchKey = timePeriodName.toLowerCase();
      let selectedPeriod = null;

      for (const period of PREDEFINED_PERIODS) {
        if (
          period.name.toLowerCase().includes(searchKey) ||
          searchKey.includes(period.name.toLowerCase())
        ) {
          selectedPeriod = period;
          break;
        }
      }

      if (!selectedPeriod) {
        const availablePeriods = PREDEFINED_PERIODS.map((p) => p.name).join(
          ", "
        );
        return {
          success: false,
          message: `Time period "${timePeriodName}" not found. Available periods: ${availablePeriods}`,
          availablePeriods: PREDEFINED_PERIODS.map((p) => p.name),
        };
      }

      // Calculate basic date info
      let startDate = null;
      let endDate = null;

      if (selectedPeriod.scale === 0) {
        // All Time - no dates needed
        startDate = null;
        endDate = null;
      } else {
        // For other periods, provide current timestamp as placeholder
        const now = new Date();
        startDate = now.toISOString();
        endDate = now.toISOString();
      }

      // Return the filter configuration
      const filterConfig = {
        periodScale: selectedPeriod.scale,
        tabName: tabName,
        periodName: selectedPeriod.name,
        isCustom: selectedPeriod.isCustom,
        timestamp: new Date().toISOString(),
      };

      // Only include dates for custom periods
      if (selectedPeriod.scale === 100) {
        filterConfig.startDate = startDate;
        filterConfig.endDate = endDate;
      }

      return {
        success: true,
        message: `✅ Successfully set time filter to "${selectedPeriod.name}" for ${tabName} tab.`,
        filterConfig: filterConfig,
        action: {
          type: "time_period_changed",
          target: `filter-${tabName.toLowerCase().replace(" ", "-")}`,
          data: filterConfig,
        },
      };
    } catch (error) {
      console.error("❌ Error setting time period:", error);
      return {
        success: false,
        message: `Error setting time period: ${error.message}`,
        error: error.message,
      };
    }
  },
};

// Set Custom Date Range Tool
const setCustomDateRangeTool = {
  name: "set_custom_date_range",
  description:
    "Set a custom date range with specific start and end dates for dashboard tabs.",

  inputSchema: {
    type: "object",
    properties: {
      startDate: {
        type: "string",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
        description: "Start date in YYYY-MM-DD format",
      },
      endDate: {
        type: "string",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
        description: "End date in YYYY-MM-DD format",
      },
      tabName: {
        type: "string",
        description: "Dashboard tab to apply the filter to",
        enum: [
          "Overview",
          "Comparison",
          "Prediction",
          "Text Analysis",
          "Customer Journey",
        ],
      },
    },
    required: ["startDate", "endDate", "tabName"],
  },

  validateArgs: (args) => {
    try {
      const validated = setCustomDateRangeSchema.parse(args);
      return { success: true, data: validated };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  execute: async ({ startDate, endDate, tabName }) => {
    try {
      // Validate date formats and logic
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime())) {
        return {
          success: false,
          message: `Invalid start date: ${startDate}. Please use format YYYY-MM-DD`,
        };
      }

      if (isNaN(end.getTime())) {
        return {
          success: false,
          message: `Invalid end date: ${endDate}. Please use format YYYY-MM-DD`,
        };
      }

      if (start > end) {
        return {
          success: false,
          message: "Start date cannot be after end date",
        };
      }

      if (end > new Date()) {
        return {
          success: false,
          message: "End date cannot be in the future",
        };
      }

      const dateRangeText = `${startDate} to ${endDate}`;

      // Create filter configuration
      const filterConfig = {
        periodScale: 100, // Custom period scale
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        tabName: tabName,
        periodName: `Custom (${dateRangeText})`,
        isCustom: true,
        timestamp: new Date().toISOString(),
      };

      return {
        success: true,
        message: `✅ Successfully set custom date range "${dateRangeText}" for ${tabName} tab.`,
        filterConfig: filterConfig,
        action: {
          type: "time_period_changed",
          target: `filter-${tabName.toLowerCase().replace(" ", "-")}`,
          data: filterConfig,
        },
      };
    } catch (error) {
      console.error("❌ Error setting custom date range:", error);
      return {
        success: false,
        message: `Error setting custom date range: ${error.message}`,
        error: error.message,
      };
    }
  },
};

// List Available Time Periods Tool
const listTimePeriodsTools = {
  name: "list_time_periods",
  description:
    "List all available predefined time periods and their descriptions.",

  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },

  validateArgs: (args) => {
    return { success: true, data: args };
  },

  execute: async () => {
    try {
      const periodsInfo = PREDEFINED_PERIODS.map((period) => ({
        name: period.name,
        scale: period.scale,
        isCustom: period.isCustom,
        category: period.isCustom
          ? "Custom"
          : period.name.includes("This") ||
            (period.name.includes("Last") &&
              !period.name.includes("days") &&
              !period.name.includes("hours"))
          ? "Calendar"
          : "Rolling",
      }));

      const calendarPeriods = periodsInfo.filter(
        (p) => p.category === "Calendar"
      );
      const rollingPeriods = periodsInfo.filter(
        (p) => p.category === "Rolling"
      );
      const customPeriods = periodsInfo.filter((p) => p.category === "Custom");

      return {
        success: true,
        message: `📅 **Available Time Periods:**

**📅 Calendar Periods:**
${calendarPeriods.map((p) => `• ${p.name}`).join("\n")}

**🔄 Rolling Periods:**  
${rollingPeriods.map((p) => `• ${p.name}`).join("\n")}

**⚙️ Custom Periods:**
${customPeriods.map((p) => `• ${p.name}`).join("\n")}

**💡 Usage Examples:**
- "Set Last Month for Overview tab"
- "Set Last 30 days for Comparison tab"
- "Set custom date range 2024-01-01 to 2024-01-31 for Text Analysis tab"`,
        data: {
          calendarPeriods,
          rollingPeriods,
          customPeriods,
          totalCount: periodsInfo.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error listing time periods: ${error.message}`,
        error: error.message,
      };
    }
  },
};

// Export all tools
export const timeFilterTools = [
  setTimePeriodTool,
  setCustomDateRangeTool,
  listTimePeriodsTools,
];

export default timeFilterTools;
