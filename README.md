# CX TimeFilter MCP Server

A **Model Context Protocol (MCP) server** providing time filter tools for CX Dashboard. This server exposes time filtering functionality that can be used by any MCP-compatible client, including Langflow.

## 🎯 **Features**

- **Set Predefined Time Periods**: Last Month, Last 7 days, This Quarter, etc.
- **Set Custom Date Ranges**: Specify exact start and end dates
- **List Available Periods**: Get all supported time periods
- **HTTP-based MCP Protocol**: Easy integration with any MCP client
- **Optional Authentication**: API key protection
- **Comprehensive Validation**: Input validation and error handling

## 🚀 **Quick Start**

### **1. Installation**

```bash
# Clone or create the project directory
mkdir cx-timefilter-mcp-server
cd cx-timefilter-mcp-server

# Install dependencies
npm install
```

### **2. Configuration**

```bash
# Copy environment template
cp env.example .env

# Edit .env file
PORT=3000
NODE_ENV=development
MCP_API_KEY=your-secret-api-key-here
ALLOWED_ORIGINS=http://localhost:3001,https://your-langflow-instance.com
```

### **3. Run the Server**

```bash
# Development mode
npm run dev

# Production mode
npm start

# Run tests
npm test
```

### **4. Verify Installation**

```bash
# Health check
curl http://localhost:3000/health

# List available tools
curl http://localhost:3000/mcp/tools

# Test a tool (with API key if configured)
curl -X POST http://localhost:3000/mcp/tools/call \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "name": "set_time_period",
    "arguments": {
      "timePeriodName": "Last Month",
      "tabName": "Overview"
    }
  }'
```

## 🛠️ **Available Tools**

### **1. set_time_period**

Set a predefined time period for dashboard tabs.

**Parameters:**

- `timePeriodName` (string): Exact name of the time period
- `tabName` (string): Dashboard tab name

**Example:**

```json
{
  "name": "set_time_period",
  "arguments": {
    "timePeriodName": "Last Month",
    "tabName": "Overview"
  }
}
```

### **2. set_custom_date_range**

Set a custom date range with specific start and end dates.

**Parameters:**

- `startDate` (string): Start date in YYYY-MM-DD format
- `endDate` (string): End date in YYYY-MM-DD format
- `tabName` (string): Dashboard tab name

**Example:**

```json
{
  "name": "set_custom_date_range",
  "arguments": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "tabName": "Comparison"
  }
}
```

### **3. list_time_periods**

List all available predefined time periods.

**Parameters:** None

**Example:**

```json
{
  "name": "list_time_periods",
  "arguments": {}
}
```

## 🔗 **API Endpoints**

| Endpoint          | Method | Description                |
| ----------------- | ------ | -------------------------- |
| `/health`         | GET    | Health check               |
| `/mcp/info`       | GET    | MCP protocol information   |
| `/mcp/tools`      | GET    | List available tools       |
| `/mcp/tools/call` | POST   | Execute a tool             |
| `/mcp`            | POST   | Full MCP protocol endpoint |

## 🔐 **Authentication**

The server supports optional API key authentication:

1. **Set API Key**: Add `MCP_API_KEY=your-secret-key` to `.env`
2. **Include in Requests**: Add `Authorization: Bearer your-secret-key` header
3. **Alternative Formats**: `ApiKey your-secret-key` or `Key your-secret-key`

## 🌐 **Langflow Integration**

### **Step 1: Add MCP Tools Component**

1. Open your Langflow project
2. Add an "MCP Tools" component
3. Configure the connection

### **Step 2: Configure Connection**

```json
{
  "serverName": "CX TimeFilter Server",
  "connectionMode": "HTTP",
  "serverUrl": "http://localhost:3000",
  "apiKey": "your-api-key",
  "endpoints": {
    "tools": "/mcp/tools",
    "call": "/mcp/tools/call"
  }
}
```

### **Step 3: Use Tools in Flows**

The tools will appear in Langflow and can be used in your AI workflows.

## 📦 **Deployment**

### **Railway (Recommended)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### **Render**

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### **Docker**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 **Testing**

```bash
# Run built-in tests
npm test

# Manual testing with curl
curl -X POST http://localhost:3000/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "list_time_periods",
    "arguments": {}
  }'
```

## 📊 **Supported Time Periods**

**Calendar Periods:**

- All Time, Today, Yesterday
- This Week, Last Week
- This Month, Last Month
- This Quarter, Last Quarter
- This Year, Last Year

**Rolling Periods:**

- Last 24 hours, Last 7 days, Last 14 days
- Last 30 days, Last 90 days, Last 180 days
- Last 12 Months

**Custom Periods:**

- Any date range in YYYY-MM-DD format

## 🔧 **Development**

### **Project Structure**

```
cx-timefilter-mcp-server/
├── src/
│   ├── server.js              # Main server
│   ├── tools/
│   │   └── timefilter.js      # Time filter tools
│   ├── utils/
│   │   └── mcp-protocol.js    # MCP utilities
│   ├── middleware/
│   │   └── auth.js            # Authentication
│   └── test.js                # Test suite
├── package.json
├── .env
└── README.md
```

### **Adding New Tools**

1. Create tool definition in `src/tools/`
2. Add validation schema
3. Implement execute function
4. Export in tools array
5. Update README

## 🐛 **Troubleshooting**

**Common Issues:**

1. **Port already in use**: Change `PORT` in `.env`
2. **CORS errors**: Update `ALLOWED_ORIGINS` in `.env`
3. **Auth failures**: Check `MCP_API_KEY` configuration
4. **Tool not found**: Verify tool name matches exactly

**Debug Mode:**

```bash
NODE_ENV=development npm start
```

## 📄 **License**

MIT License - see LICENSE file for details.

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

**Ready to integrate with Langflow and start filtering time periods via MCP! 🎉**
