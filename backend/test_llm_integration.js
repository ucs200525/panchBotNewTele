/**
 * standalone integration test for the Generative LLM Vedic Astro Copilot pipeline
 */

const { processQuery } = require('./ai_core/index');

async function testIntegration() {
  console.log("Starting Standalone LLM Pipeline Integration Test...");

  const contextParams = {
    sessionId: "test_llm_session_" + Date.now(),
    date: "2026-05-25",
    userProfile: {
      dob: "2004-08-12",
      time: "10:30",
      city: "Hyderabad",
      nakshatra: "Chitra",
      rashi: "Virgo",
      name: "Aryan"
    },
    hasBirthDetails: true,
    history: []
  };

  const queries = [
    "tell me about me",
    "tell about my studies and when i will get a job"
  ];

  for (const q of queries) {
    console.log(`\n========================================`);
    console.log(`INPUT QUERY: "${q}"`);
    console.log(`========================================`);

    try {
      const start = Date.now();
      const result = await processQuery(q, contextParams);
      const elapsed = ((Date.now() - start) / 1000).toFixed(2);

      console.log(`\nSTATUS: ${result.success ? "SUCCESS" : "FAILED"}`);
      console.log(`ELAPSED TIME: ${elapsed}s`);
      console.log(`METADATA:`, result.meta);
      
      console.log(`\nGENERATED RESPONSE:`);
      console.log(result.response?.text || result.response?.markdown);
    } catch (err) {
      console.error("Pipeline execution error:", err);
    }
  }
}

testIntegration();
