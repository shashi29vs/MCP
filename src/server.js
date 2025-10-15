// MCP Server for CX Dashboard Time Filter Tools
// HTTP-based Model Context Protocol implementation

import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { timeFilterTools } from "./tools/timefilter.js";
import {
  validateMCPRequest,
  createMCPResponse,
  createMCPError,
} from "./utils/mcp-protocol.js";
import { authMiddleware } from "./middleware/auth.js";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["*"];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-MCP-Version"],
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));

// Request logging
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "cx-timefilter-mcp-server",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// MCP Protocol Info endpoint
app.get("/mcp/info", (req, res) => {
  res.json({
    protocolVersion: "2024-11-05",
    serverInfo: {
      name: "CX TimeFilter MCP Server",
      version: "1.0.0",
      description: "MCP server providing time filter tools for CX Dashboard",
    },
    capabilities: {
      tools: {
        listChanged: false,
      },
    },
  });
});

// MCP Tools List endpoint
app.get("/mcp/tools", authMiddleware, (req, res) => {
  try {
    const tools = timeFilterTools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));

    res.json(createMCPResponse("tools/list", { tools }));
  } catch (error) {
    console.error("❌ Error listing tools:", error);
    res
      .status(500)
      .json(createMCPError("INTERNAL_ERROR", "Failed to list tools"));
  }
});

// MCP Tool Call endpoint
app.post("/mcp/tools/call", authMiddleware, async (req, res) => {
  try {
    const { name, arguments: toolArgs } = req.body;

    if (!name || !toolArgs) {
      return res
        .status(400)
        .json(
          createMCPError("INVALID_REQUEST", "Missing tool name or arguments")
        );
    }

    // Find the requested tool
    const tool = timeFilterTools.find((t) => t.name === name);
    if (!tool) {
      return res
        .status(404)
        .json(createMCPError("METHOD_NOT_FOUND", `Tool '${name}' not found`));
    }

    // Validate tool arguments
    const validation = tool.validateArgs(toolArgs);
    if (!validation.success) {
      return res
        .status(400)
        .json(
          createMCPError(
            "INVALID_PARAMS",
            `Invalid arguments: ${validation.error}`
          )
        );
    }

    // Execute the tool
    console.log(`🔧 Executing tool: ${name}`);
    const result = await tool.execute(validation.data);

    res.json(
      createMCPResponse("tools/call", {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      })
    );
  } catch (error) {
    console.error("❌ Error executing tool:", error);
    res
      .status(500)
      .json(
        createMCPError(
          "INTERNAL_ERROR",
          `Tool execution failed: ${error.message}`
        )
      );
  }
});

// MCP Protocol endpoint (for full MCP clients)
app.post("/mcp", authMiddleware, async (req, res) => {
  try {
    const { method, params } = req.body;

    switch (method) {
      case "initialize":
        res.json(
          createMCPResponse("initialize", {
            protocolVersion: "2024-11-05",
            serverInfo: {
              name: "CX TimeFilter MCP Server",
              version: "1.0.0",
            },
            capabilities: {
              tools: { listChanged: false },
            },
          })
        );
        break;

      case "tools/list":
        const tools = timeFilterTools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        }));
        res.json(createMCPResponse("tools/list", { tools }));
        break;

      case "tools/call":
        const { name, arguments: toolArgs } = params;
        const tool = timeFilterTools.find((t) => t.name === name);

        if (!tool) {
          return res
            .status(404)
            .json(
              createMCPError("METHOD_NOT_FOUND", `Tool '${name}' not found`)
            );
        }

        const validation = tool.validateArgs(toolArgs);
        if (!validation.success) {
          return res
            .status(400)
            .json(createMCPError("INVALID_PARAMS", validation.error));
        }

        const result = await tool.execute(validation.data);
        res.json(
          createMCPResponse("tools/call", {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          })
        );
        break;

      default:
        res
          .status(404)
          .json(
            createMCPError(
              "METHOD_NOT_FOUND",
              `Method '${method}' not supported`
            )
          );
    }
  } catch (error) {
    console.error("❌ MCP Protocol error:", error);
    res.status(500).json(createMCPError("INTERNAL_ERROR", error.message));
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("❌ Unhandled error:", error);
  res
    .status(500)
    .json(createMCPError("INTERNAL_ERROR", "An unexpected error occurred"));
});

// 404 handler
app.use((req, res) => {
  res
    .status(404)
    .json(createMCPError("NOT_FOUND", `Endpoint ${req.path} not found`));
});

// Start server
app.listen(port, () => {
  console.log(`🚀 CX TimeFilter MCP Server running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
  console.log(`🛠️ MCP Info: http://localhost:${port}/mcp/info`);
  console.log(`📋 Available tools: http://localhost:${port}/mcp/tools`);
  console.log("");
  console.log("🎯 Ready to serve MCP requests!");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down MCP server gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

export default app;
