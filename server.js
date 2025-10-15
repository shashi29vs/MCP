// MCP Server for CX Dashboard Time Filter Tools
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Predefined time periods
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
  { name: "Custom", scale: 100, isCustom: true }
];

// Validation schemas
const setTimePeriodSchema = z.object({
  timePeriodName: z.string().min(1),
  tabName: z.string().min(1)
});

const setCustomDateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tabName: z.string().min(1)
});

// MCP Tools
const tools = [
  {
    name: "set_time_period",
    description: "Set a predefined time period for dashboard tabs",
    inputSchema: {
      type: "object",
      properties: {
        timePeriodName: {
          type: "string",
          enum: PREDEFINED_PERIODS.map(p => p.name)
        },
        tabName: {
          type: "string",
          enum: ["Overview", "Comparison", "Prediction", "Text Analysis", "Customer Journey"]
        }
      },
      required: ["timePeriodName", "tabName"]
    }
  },
  {
    name: "set_custom_date_range",
    description: "Set a custom date range for dashboard tabs",
    inputSchema: {
      type: "object",
      properties: {
        startDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        endDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        tabName: {
          type: "string",
          enum: ["Overview", "Comparison", "Prediction", "Text Analysis", "Customer Journey"]
        }
      },
      required: ["startDate", "endDate", "tabName"]
    }
  },
  {
    name: "list_time_periods",
    description: "List all available time periods",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  }
];

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'cx-timefilter-mcp-server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// MCP Info
app.get('/mcp/info', (req, res) => {
  res.json({
    protocolVersion: '2024-11-05',
    serverInfo: {
      name: 'CX TimeFilter MCP Server',
      version: '1.0.0'
    },
    capabilities: { tools: {} }
  });
});

// List tools
app.get('/mcp/tools', (req, res) => {
  res.json({
    jsonrpc: "2.0",
    result: { tools }
  });
});

// Execute tool
app.post('/mcp/tools/call', async (req, res) => {
  try {
    const { name, arguments: args } = req.body;

    if (name === 'set_time_period') {
      const validation = setTimePeriodSchema.safeParse(args);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
      }

      const { timePeriodName, tabName } = validation.data;
      const period = PREDEFINED_PERIODS.find(p => 
        p.name.toLowerCase() === timePeriodName.toLowerCase()
      );

      if (!period) {
        return res.status(400).json({ error: 'Invalid time period' });
      }

      res.json({
        jsonrpc: "2.0",
        result: {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `✅ Set ${period.name} for ${tabName} tab`,
              filterConfig: {
                periodScale: period.scale,
                tabName,
                periodName: period.name
              }
            }, null, 2)
          }]
        }
      });

    } else if (name === 'set_custom_date_range') {
      const validation = setCustomDateRangeSchema.safeParse(args);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.message });
      }

      const { startDate, endDate, tabName } = validation.data;
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        return res.status(400).json({ error: 'Start date cannot be after end date' });
      }

      res.json({
        jsonrpc: "2.0",
        result: {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `✅ Set custom range ${startDate} to ${endDate} for ${tabName} tab`,
              filterConfig: {
                periodScale: 100,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                tabName
              }
            }, null, 2)
          }]
        }
      });

    } else if (name === 'list_time_periods') {
      const calendarPeriods = PREDEFINED_PERIODS.filter(p => 
        !p.isCustom && (p.name.includes('This') || p.name.includes('Last') && 
        !p.name.includes('days') && !p.name.includes('hours'))
      );
      const rollingPeriods = PREDEFINED_PERIODS.filter(p => 
        !p.isCustom && !calendarPeriods.includes(p)
      );

      res.json({
        jsonrpc: "2.0",
        result: {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `📅 Available Time Periods:\n\nCalendar: ${calendarPeriods.map(p => p.name).join(', ')}\n\nRolling: ${rollingPeriods.map(p => p.name).join(', ')}`,
              data: {
                calendarPeriods,
                rollingPeriods,
                totalCount: PREDEFINED_PERIODS.length - 1
              }
            }, null, 2)
          }]
        }
      });

    } else {
      res.status(404).json({ error: 'Tool not found' });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 MCP Server running on port ${port}`);
  console.log(`📍 Ready for FastMCP deployment!`);
});

export default app;