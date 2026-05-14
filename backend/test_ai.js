const fs = require('fs');
const axios = require('axios');

const URL = 'http://localhost:4000/api/ai/chat';
const sessionId = 'test_stable_final_' + Date.now();
const logs = [];

async function runTest(name, message) {
  try {
    const res = await axios.post(URL, {
      sessionId,
      message,
      city: 'Hyderabad',
      date: '2026-05-08'
    });

    const logEntry = `
==============================
🧪 TEST: ${name}
👉 INPUT: ${message}
📌 INTENT: ${res.data.intents?.map(i => i.intent).join('+') || res.data.intent}
🧾 RESPONSE:
${res.data.formattedResponse || res.data.response?.text}
`;
    console.log(`✅ Completed: ${name}`);
    logs.push(logEntry);
  } catch (e) {
    const errorLog = `\n❌ ERROR: ${name} - ${e.message}\n`;
    console.log(errorLog);
    logs.push(errorLog);
  }
}

async function test() {
  console.log('🚀 Starting Stable Test Suite...');
  
  // 🟢 LEVEL 1: BASIC
  await runTest('Tithi', 'What is today’s tithi?');
  await runTest('Nakshatra', 'What is today’s nakshatra?');
  await runTest('Rahu Kaal', 'Rahu kaal today');
  await runTest('Moon', 'Moon position now');
  await runTest('Best Time', 'Best time today');

  // 🟡 LEVEL 2: PARAPHRASE
  await runTest('Star Today', 'Which star is active today?');
  await runTest('Ascendant', 'Tell my ascendant');
  await runTest('Lunar Day', 'Which lunar day is running?');
  await runTest('Moon Star', 'Current moon star');
  await runTest('Rising Sign', 'What’s the rising sign at my birth?');

  // 🔵 LEVEL 3: PROFILE
  await runTest('Set Profile', 'My DOB is 12 Aug 2004 10:30 Hyderabad');
  await runTest('Lagna', 'What is my lagna?');
  await runTest('Nakshatra from Context', 'What about nakshatra?');
  await runTest('Rising Sign Again', 'Tell my rising sign');
  await runTest('General Day', 'Is today good for me?');

  // 🟣 LEVEL 4: CONSISTENCY
  await runTest('Consistency 1', 'What is my lagna?');
  await runTest('Consistency 2', 'What is my lagna?');
  await runTest('Consistency 3', 'Tell my ascendant');

  // 🔴 LEVEL 5: MULTI QUERY
  await runTest('Multi Lagna Nakshatra', 'What is my lagna and nakshatra?');
  await runTest('Multi Tithi Time', 'Tell me today’s tithi and best time');
  await runTest('Multi Rahu Good', 'Rahu kaal and good time today');
  await runTest('Multi Business', 'My lagna and is today good for business');
  await runTest('Multi Favorable', 'My nakshatra and is today favorable');

  // ⚫ LEVEL 6: TRANSIT vs BIRTH
  await runTest('Birth Lagna', 'What is my lagna?');
  await runTest('Transit Lagna', 'What is lagna tomorrow?');
  await runTest('Explicit Birth', 'What is my birth lagna?');
  await runTest('Transit Nakshatra', 'Nakshatra tomorrow');
  await runTest('Current Lagna', 'Current lagna now');

  // 🟤 LEVEL 7: VALIDATION
  await runTest('Invalid Date', 'What is my lagna for 12 Aug 200');
  await runTest('Missing Info', 'What is my lagna');
  await runTest('Invalid DOB', 'My DOB is tomorrow');
  await runTest('Bad Input', 'What is lagna for invalid date');

  // ⚡ LEVEL 8: EDGE
  await runTest('Short Lagna', 'Lagna?');
  await runTest('Short Nakshatra', 'Nakshatra?');
  await runTest('Short Today', 'Today good?');
  await runTest('Short Star', 'Star?');
  await runTest('Short Time', 'Good time?');

  // 🧠 LEVEL 9: REASONING
  await runTest('Travel', 'Is today good for travel?');
  await runTest('Why Travel', 'Why is today good for travel?');
  await runTest('Business Start', 'Should I start business today?');
  await runTest('Avoid Time', 'When should I avoid work today?');
  await runTest('After 2PM', 'Best time after 2 PM today');

  // 🚀 LEVEL 10: HYBRID
  await runTest('Hybrid Business', 'What is my lagna and is it good for business?');
  await runTest('Hybrid Compare', 'Compare my nakshatra with today');
  await runTest('Hybrid Travel', 'Based on my lagna is today good for travel');
  await runTest('Hybrid Best Time', 'My birth details and best time today');

  // 💀 LEVEL 11: EXTREME
  await runTest('Extreme 1',
    'I was born on 12 Aug 2004 at 10:30 Hyderabad. Tell my lagna, nakshatra, and also whether today is good for business and travel and give best time');

  await runTest('Extreme 2',
    'Tell me everything important about today from astrology perspective');

  await runTest('Extreme 3',
    'Based on my birth details what should I do today and what should I avoid');

  await runTest('Extreme 4',
    'Tell my lagna nakshatra travel business best time and summary');

  // 🏛️ LEVEL 12: INDUSTRY STANDARDS
  await runTest('Ind-Std 1: Mixed', 'My lagna and is today good for business');
  await runTest('Ind-Std 2: Transit Lagna', 'Lagna tomorrow');
  await runTest('Ind-Std 3: Comparison', 'Compare my nakshatra with today');
  await runTest('Ind-Std 4: Star Override', 'star');
  await runTest('Ind-Std 5: Old Year', 'My birth details are 12 Aug 1850 10:30 Hyderabad');
  await runTest('Ind-Std 6: Future Birth', 'I was born on 12 Aug 2027');
  await runTest('Greeting', 'hi');
  await runTest('Empty DOB', 'my dob');
  await runTest('Farewell', 'bye');
  await runTest('Acknowledge', 'ok');
  await runTest('Help Request', 'what next');
  await runTest('Future Query', 'tell me my future');
  await runTest('Self Query', 'who am i');
  
  await runTest('Override Step 1', 'I was born on 12 Aug 2004 10:30 AM in Hyderabad');
  await runTest('Override Step 2 (Verification)', 'who am i');
  
  await runTest('Chat Status Query', 'what are we discussing?');
  await runTest('DD-MM-YYYY Override', 'but i was born on 25-12-2006');
  
  // 💎 FINAL POLISH TESTS
  await runTest('Natal/Transit Mix', 'My lagna and is today good for business');
  await runTest('Star Short Query', 'star');
  await runTest('Small Talk', 'hi cutie');
  await runTest('Invalid Date', 'What is my lagna for 12 Aug 200');
  await runTest('TZ Check', 'DOB: 12 Aug 2004');
  await runTest('Context Reuse', 'What about nakshatra?');
  await runTest('Extreme Flow', 'I was born on 12 Aug 2004 10:30 AM in Hyderabad. What is my lagna?');

  fs.writeFileSync('test_results_stable.txt', logs.join('\n'), 'utf-8');
  console.log('\n🏁 Test suite complete. Results saved to test_results_stable.txt');
}

test();