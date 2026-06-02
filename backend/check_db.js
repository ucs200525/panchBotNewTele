const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/panchBot';

async function checkDb() {
  console.log(`Connecting to: ${mongoURI}...`);
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`Connection state: ${mongoose.connection.readyState} (1 = Connected)`);
    
    // Test Write
    const AiSession = require('./models/AiSession');
    const sessionId = "test_diag_" + Date.now();
    
    console.log("Testing Database Write...");
    await AiSession.create({
      sessionId,
      userProfile: { name: "Test User", dob: "2000-01-01" },
      history: []
    });
    console.log("Write Succeeded!");
    
    console.log("Testing Database Read...");
    const found = await AiSession.findOne({ sessionId });
    console.log("Read Succeeded! Found:", found.userProfile);
    
    console.log("Testing Database Delete...");
    await AiSession.deleteOne({ sessionId });
    console.log("Delete Succeeded!");
    
    console.log("\nDATABASE IS 100% OPERATIONAL!");
  } catch (err) {
    console.error("\nDATABASE ERROR:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkDb();
