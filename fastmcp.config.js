// FastMCP Configuration (optional)
// This file helps FastMCP understand your project better

export default {
  // Project metadata
  name: "cx-timefilter-mcp-server",
  description: "Time filter tools for CX Dashboard via MCP protocol",
  version: "1.0.0",

  // Runtime configuration
  runtime: "nodejs",
  buildCommand: "npm install",
  startCommand: "npm start",

  // Environment variables (can also be set in FastMCP dashboard)
  env: {
    NODE_ENV: "production",
    PORT: "3000",
  },

  // MCP-specific configuration
  mcp: {
    protocol: "http",
    endpoints: {
      health: "/health",
      info: "/mcp/info",
      tools: "/mcp/tools",
      call: "/mcp/tools/call",
    },
  },

  // Security settings (FastMCP handles OAuth automatically)
  security: {
    cors: true,
    rateLimit: true,
  },
};
