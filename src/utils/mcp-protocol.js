// MCP Protocol utilities
// Helper functions for Model Context Protocol message formatting

/**
 * Create a successful MCP response
 * @param {string} method - The method name
 * @param {object} result - The result data
 * @returns {object} MCP response object
 */
export function createMCPResponse(method, result) {
  return {
    jsonrpc: "2.0",
    id: generateId(),
    result: result,
  };
}

/**
 * Create an MCP error response
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {object} data - Optional error data
 * @returns {object} MCP error object
 */
export function createMCPError(code, message, data = null) {
  const error = {
    jsonrpc: "2.0",
    id: generateId(),
    error: {
      code: getErrorCode(code),
      message: message,
    },
  };

  if (data) {
    error.error.data = data;
  }

  return error;
}

/**
 * Validate MCP request format
 * @param {object} request - The request object
 * @returns {object} Validation result
 */
export function validateMCPRequest(request) {
  if (!request) {
    return {
      valid: false,
      error: "Request is required",
    };
  }

  if (request.jsonrpc && request.jsonrpc !== "2.0") {
    return {
      valid: false,
      error: "Invalid JSON-RPC version. Must be '2.0'",
    };
  }

  if (!request.method && !request.result && !request.error) {
    return {
      valid: false,
      error: "Request must have method, result, or error",
    };
  }

  return {
    valid: true,
  };
}

/**
 * Generate a unique ID for MCP messages
 * @returns {string} Unique identifier
 */
function generateId() {
  return `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get numeric error code from string code
 * @param {string} code - Error code string
 * @returns {number} Numeric error code
 */
function getErrorCode(code) {
  const errorCodes = {
    PARSE_ERROR: -32700,
    INVALID_REQUEST: -32600,
    METHOD_NOT_FOUND: -32601,
    INVALID_PARAMS: -32602,
    INTERNAL_ERROR: -32603,
    NOT_FOUND: -32000,
    UNAUTHORIZED: -32001,
    FORBIDDEN: -32002,
    TIMEOUT: -32003,
  };

  return errorCodes[code] || -32000;
}

/**
 * Create MCP tool definition
 * @param {string} name - Tool name
 * @param {string} description - Tool description
 * @param {object} inputSchema - JSON schema for tool inputs
 * @returns {object} MCP tool definition
 */
export function createMCPTool(name, description, inputSchema) {
  return {
    name,
    description,
    inputSchema: {
      type: "object",
      ...inputSchema,
    },
  };
}

/**
 * Create MCP content block
 * @param {string} type - Content type ('text', 'image', etc.)
 * @param {any} content - Content data
 * @returns {object} MCP content block
 */
export function createMCPContent(type, content) {
  switch (type) {
    case "text":
      return {
        type: "text",
        text:
          typeof content === "string"
            ? content
            : JSON.stringify(content, null, 2),
      };
    case "image":
      return {
        type: "image",
        data: content.data,
        mimeType: content.mimeType || "image/png",
      };
    default:
      return {
        type: "text",
        text: JSON.stringify(content, null, 2),
      };
  }
}

/**
 * Format tool result for MCP response
 * @param {any} result - Tool execution result
 * @returns {object} Formatted MCP tool result
 */
export function formatToolResult(result) {
  return {
    content: [createMCPContent("text", result)],
    isError: result.success === false,
  };
}

/**
 * Log MCP message for debugging
 * @param {string} direction - 'incoming' or 'outgoing'
 * @param {object} message - MCP message
 */
export function logMCPMessage(direction, message) {
  if (process.env.NODE_ENV !== "production") {
    const timestamp = new Date().toISOString();
    const arrow = direction === "incoming" ? "📥" : "📤";
    console.log(
      `${arrow} ${timestamp} MCP ${direction}:`,
      JSON.stringify(message, null, 2)
    );
  }
}
