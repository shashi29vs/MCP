// Root level server.js for FastMCP compatibility
// This imports and starts the main server from src/

import app from './src/server.js';

// FastMCP will automatically handle the port
const port = process.env.PORT || 3000;

console.log('🚀 Starting MCP server on port', port);
console.log('📍 FastMCP deployment ready!');
