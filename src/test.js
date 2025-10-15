// Test script for MCP server
// Simple tests to verify functionality

import { timeFilterTools } from "./tools/timefilter.js";

console.log("🧪 Testing CX TimeFilter MCP Server\n");

// Test 1: Tool validation
console.log("📋 Available Tools:");
timeFilterTools.forEach((tool, index) => {
  console.log(`${index + 1}. ${tool.name} - ${tool.description}`);
});
console.log("");

// Test 2: Set Time Period Tool
console.log("🔧 Testing set_time_period tool:");
try {
  const tool = timeFilterTools.find((t) => t.name === "set_time_period");

  // Valid test
  const validArgs = { timePeriodName: "Last Month", tabName: "Overview" };
  const validation = tool.validateArgs(validArgs);
  console.log("✅ Valid args validation:", validation.success);

  if (validation.success) {
    const result = await tool.execute(validation.data);
    console.log(
      "✅ Tool execution result:",
      result.success ? "SUCCESS" : "FAILED"
    );
    console.log("   Message:", result.message);
  }

  // Invalid test
  const invalidArgs = { timePeriodName: "", tabName: "InvalidTab" };
  const invalidValidation = tool.validateArgs(invalidArgs);
  console.log(
    "❌ Invalid args validation:",
    invalidValidation.success ? "UNEXPECTED SUCCESS" : "CORRECTLY FAILED"
  );
} catch (error) {
  console.error("❌ Test error:", error.message);
}

console.log("");

// Test 3: Custom Date Range Tool
console.log("🔧 Testing set_custom_date_range tool:");
try {
  const tool = timeFilterTools.find((t) => t.name === "set_custom_date_range");

  const validArgs = {
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    tabName: "Comparison",
  };

  const validation = tool.validateArgs(validArgs);
  console.log("✅ Valid args validation:", validation.success);

  if (validation.success) {
    const result = await tool.execute(validation.data);
    console.log(
      "✅ Tool execution result:",
      result.success ? "SUCCESS" : "FAILED"
    );
    console.log("   Message:", result.message);
  }
} catch (error) {
  console.error("❌ Test error:", error.message);
}

console.log("");

// Test 4: List Time Periods Tool
console.log("🔧 Testing list_time_periods tool:");
try {
  const tool = timeFilterTools.find((t) => t.name === "list_time_periods");

  const result = await tool.execute({});
  console.log(
    "✅ Tool execution result:",
    result.success ? "SUCCESS" : "FAILED"
  );
  console.log("   Available periods count:", result.data?.totalCount || 0);
} catch (error) {
  console.error("❌ Test error:", error.message);
}

console.log("\n🎯 All tests completed!");
console.log("\n💡 To test the HTTP server:");
console.log("1. Run: npm start");
console.log("2. Visit: http://localhost:3000/health");
console.log("3. Test tools: http://localhost:3000/mcp/tools");
console.log("4. Call tool: POST http://localhost:3000/mcp/tools/call");
console.log(
  '   Body: {"name": "set_time_period", "arguments": {"timePeriodName": "Last Month", "tabName": "Overview"}}'
);
