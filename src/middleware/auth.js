// Authentication middleware for MCP server
// Optional API key authentication

/**
 * Authentication middleware
 * Checks for API key in Authorization header if MCP_API_KEY is set
 */
export function authMiddleware(req, res, next) {
  // Skip auth if no API key is configured
  const requiredApiKey = process.env.MCP_API_KEY;
  if (!requiredApiKey) {
    return next();
  }

  // Check Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      jsonrpc: "2.0",
      error: {
        code: -32001,
        message: "Authorization header required",
      },
    });
  }

  // Support both "Bearer" and "ApiKey" formats
  let providedKey = null;

  if (authHeader.startsWith("Bearer ")) {
    providedKey = authHeader.substring(7);
  } else if (authHeader.startsWith("ApiKey ")) {
    providedKey = authHeader.substring(7);
  } else if (authHeader.startsWith("Key ")) {
    providedKey = authHeader.substring(4);
  } else {
    // Direct key without prefix
    providedKey = authHeader;
  }

  if (providedKey !== requiredApiKey) {
    return res.status(401).json({
      jsonrpc: "2.0",
      error: {
        code: -32001,
        message: "Invalid API key",
      },
    });
  }

  // Authentication successful
  next();
}

/**
 * Generate a secure API key
 * @param {number} length - Key length (default: 32)
 * @returns {string} Generated API key
 */
export function generateApiKey(length = 32) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Validate API key format
 * @param {string} key - API key to validate
 * @returns {boolean} True if valid format
 */
export function validateApiKeyFormat(key) {
  if (!key || typeof key !== "string") {
    return false;
  }

  // Must be at least 16 characters and contain only alphanumeric characters
  return key.length >= 16 && /^[A-Za-z0-9]+$/.test(key);
}
