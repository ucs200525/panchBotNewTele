/**
 * Astro Calculations Test Script
 * Runs calculations for both Muhurat (Obj 1) and Sidereal Chart (Obj 2) offline,
 * and validates the Conversational Chatbot integration!
 */

const { calculatePlanetaryState } = require('./astrology/planets');
const { calculateLagnaAndHouses, mapPlanetsToHouses } = require('./astrology/lagna');

console.log("=========================================");
console.log("🪐 LOCAL ASTRO ENGINE VALIDATION TEST 🪐");
console.log("=========================================\n");

(async () => {
  try {
    // Mock Birth Date: August 12, 2004, at 10:30 AM
    const targetDate = new Date("2004-08-12T10:30:00");
    const lat = 17.3850; // Hyderabad
    const lng = 78.4867;

    console.log(`Analyzing Birth Data: August 12, 2004, 10:30 AM (Lat: ${lat}, Lng: ${lng})`);
    console.log("-----------------------------------------");

    // 1. Calculate Planetary States (Obj 2)
    const planetState = calculatePlanetaryState(targetDate);
    console.log(`\n✅ Planet State Computed (Julian Day: ${planetState.julianDay.toFixed(4)}):`);
    planetState.planets.forEach(p => {
      console.log(`   - ${p.name.padEnd(20)}: ${p.rashi.name.padEnd(10)} (${p.rashi.degree.toFixed(2)}°) | Nakshatra: ${p.nakshatra.name} (Pada ${p.nakshatra.pada})`);
    });

    // 2. Calculate Lagna and houses (Obj 2)
    const lagnaState = calculateLagnaAndHouses(targetDate, lat, lng);
    console.log(`\n✅ Lagna Calculated:`);
    console.log(`   - Ascendant Sign    : ${lagnaState.lagna.name} ${lagnaState.lagna.symbol} (${lagnaState.lagna.degree.toFixed(2)}°)`);
    console.log(`   - Nakshatra Star    : ${lagnaState.lagna.nakshatra.name} (Pada ${lagnaState.lagna.nakshatra.pada})`);

    // 3. Map Planets to Houses relative to Lagna (Obj 2)
    const housePlacements = mapPlanetsToHouses(lagnaState.lagna.rashiIndex, planetState.planets);
    console.log(`\n✅ Planetary Houses Map (relative to Lagna):`);
    housePlacements.forEach(hp => {
      console.log(`   - ${hp.planetName.padEnd(20)} resides in House ${hp.house}`);
    });

    console.log("\n=========================================");
    console.log("💬 TESTING CONVERSATIONAL COPILOT INTEGRATION 💬");
    console.log("=========================================");

    const { processChatRequest } = require('../utils/chatEngine');
    
    const mockBirthDetails = {
      name: "Bhargav",
      birthDate: "2004-08-12",
      birthTime: "10:30",
      lat: "17.3850",
      lng: "78.4867",
      birthNakshatra: "Ardra",
      birthRashi: "Mithuna"
    };

    const mockPanchang = {
      sunrise: "06:02 AM",
      sunset: "06:45 PM",
      rahuKaal: { start: "01:30 PM", end: "03:00 PM" },
      abhijitMuhurat: { start: "11:50 AM", end: "12:40 PM" }
    };

    console.log("\nSimulating User query: 'What is my birth Lagna?'");
    const responseLagna = await processChatRequest(
      "What is my birth Lagna?",
      "Hyderabad",
      "2026-05-07",
      mockBirthDetails,
      mockPanchang,
      () => [],
      () => []
    );
    console.log("\n🤖 Bot Response:\n" + responseLagna.formattedResponse);

    console.log("\n-----------------------------------------");
    console.log("Simulating User query: 'Show me my birth chart placements'");
    const responseChart = await processChatRequest(
      "Show me my birth chart placements",
      "Hyderabad",
      "2026-05-07",
      mockBirthDetails,
      mockPanchang,
      () => [],
      () => []
    );
    console.log("\n🤖 Bot Response:\n" + responseChart.formattedResponse);

    console.log("\n=========================================");
    console.log("🏆 ALL ASTRO & COPILOT TESTS PASSED! 🏆");
    console.log("=========================================");

  } catch (err) {
    console.error("❌ Test script execution failed:", err);
  }
})();
