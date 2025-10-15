// Quick MCP server test script
// Run this to test your tools before using MCP Inspector

import fetch from "node-fetch";

const SERVER_URL = "http://localhost:3000";

async function testMCPServer() {
  console.log("🧪 Testing MCP Server at", SERVER_URL);
  console.log("");

  try {
    // Test 1: Health check
    console.log("1️⃣ Testing health endpoint...");
    const healthResponse = await fetch(`${SERVER_URL}/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Health:", healthData.status);
    console.log("");

    // Test 2: MCP Info
    console.log("2️⃣ Testing MCP info endpoint...");
    const infoResponse = await fetch(`${SERVER_URL}/mcp/info`);
    const infoData = await infoResponse.json();
    console.log("✅ Protocol Version:", infoData.protocolVersion);
    console.log("✅ Server Name:", infoData.serverInfo.name);
    console.log("");

    // Test 3: List Tools
    console.log("3️⃣ Testing tools list...");
    const toolsResponse = await fetch(`${SERVER_URL}/mcp/tools`);
    const toolsData = await toolsResponse.json();
    console.log("✅ Available tools:", toolsData.result?.tools?.length || 0);
    toolsData.result?.tools?.forEach((tool, i) => {
      console.log(`   ${i + 1}. ${tool.name} - ${tool.description}`);
    });
    console.log("");

    // Test 4: Call a tool
    console.log("4️⃣ Testing tool execution...");
    const callResponse = await fetch(`${SERVER_URL}/mcp/tools/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "list_time_periods",
        arguments: {},
      }),
    });

    const callData = await callResponse.json();
    if (callData.result) {
      console.log("✅ Tool execution successful");
      const content = JSON.parse(callData.result.content[0].text);
      console.log("✅ Available periods:", content.data?.totalCount || 0);
    } else {
      console.log("❌ Tool execution failed:", callData.error);
    }
    console.log("");

    // Test 5: Test with parameters
    console.log("5️⃣ Testing tool with parameters...");
    const paramCallResponse = await fetch(`${SERVER_URL}/mcp/tools/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "set_time_period",
        arguments: {
          timePeriodName: "Last Month",
          tabName: "Overview",
        },
      }),
    });

    const paramCallData = await paramCallResponse.json();
    if (paramCallData.result) {
      console.log("✅ Parameterized tool execution successful");
      const content = JSON.parse(paramCallData.result.content[0].text);
      console.log("✅ Result:", content.success ? "SUCCESS" : "FAILED");
      console.log("   Message:", content.message);
    } else {
      console.log(
        "❌ Parameterized tool execution failed:",
        paramCallData.error
      );
    }

    console.log("");
    console.log("🎉 All tests completed!");
    console.log("");
    console.log("🔍 Next steps:");
    console.log("1. Use MCP Inspector: npx @modelcontextprotocol/inspector");
    console.log("2. Configure Inspector to connect to:", SERVER_URL);
    console.log("3. Test all tools interactively");
    console.log("4. Deploy to FastMCP Cloud when ready");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("");
    console.log("💡 Make sure your server is running:");
    console.log("   npm start");
  }
}

// Add node-fetch to package.json if needed
console.log("📦 Installing node-fetch if needed...");
try {
  await import("node-fetch");
} catch (e) {
  console.log("❌ node-fetch not found. Installing...");
  console.log("Run: npm install node-fetch");
  process.exit(1);
}

testMCPServer();
