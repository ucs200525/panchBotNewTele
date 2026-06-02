const { processQuery } = require('./ai_core/index');
const mongoose = require('mongoose');
require('dotenv').config();

async function testBornQuery() {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/panchBot';
    await mongoose.connect(mongoURI, { w: 1 });

  try {
    const sessionId = "test_born_session_" + Date.now();
    
    // Step 1: Save profile details
    console.log("Saving birth details...");
    const saveResult = await processQuery("I was born 12 Aug 2005 12:05 Tanuku", {
      sessionId,
      date: "2026-05-25",
      history: []
    });
    console.log("Save Response:", saveResult.response.text);
    console.log("hasBirthDetails after save:", saveResult.context?.hasBirthDetails);
    
    // Step 2: Retrieve profile details
    console.log("\nQuerying: 'when i was born ?'...");
    const retrieveResult = await processQuery("when i was born ?", {
      sessionId,
      date: "2026-05-25",
      history: saveResult.context ? [
        { role: 'user', content: "I was born 12 Aug 2005 12:05 Tanuku" },
        { role: 'assistant', content: saveResult.response.text }
      ] : []
    });
    console.log("Retrieve userProfile:", JSON.stringify(retrieveResult.context?.userProfile));
    console.log("Retrieve hasBirthDetails:", retrieveResult.context?.hasBirthDetails);
    console.log("Retrieve Intents:", retrieveResult.intents);
    console.log("Retrieve Response:", retrieveResult.response.text);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

testBornQuery();
