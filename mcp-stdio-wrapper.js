#!/usr/bin/env node
// STDIO wrapper for MCP Inspector
// This allows MCP Inspector to connect to your HTTP server via STDIO

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";

const SERVER_URL = "http://localhost:3000";

// Create MCP server
const server = new Server(
  {
    name: "cx-timefilter-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  try {
    const response = await fetch(`${SERVER_URL}/mcp/tools`);
    const data = await response.json();
    return {
      tools: data.result?.tools || [],
    };
  } catch (error) {
    console.error("Failed to fetch tools:", error);
    return { tools: [] };
  }
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    const response = await fetch(`${SERVER_URL}/mcp/tools/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, arguments: args }),
    });

    const data = await response.json();

    if (data.result) {
      return {
        content: data.result.content,
        isError: false,
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${data.error?.message || "Unknown error"}`,
          },
        ],
        isError: true,
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error calling tool: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start STDIO transport
const transport = new StdioServerTransport();
server.connect(transport);

console.error("🔗 STDIO MCP wrapper started - connecting to", SERVER_URL);
