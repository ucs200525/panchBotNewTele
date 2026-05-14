/**
 * Objective 2: Sidereal Astrological Calculations
 * nakshatra.js - Maps celestial longitude to classical Vedic Nakshatras and quarters
 */

const NAKSHATRAS = [
  { name: "Ashwini", lord: "Ketu", quality: "Swift, Light", deity: "Ashwini Kumaras", activity: "Initiating, travel, healing, starting medical treatments." },
  { name: "Bharani", lord: "Venus", quality: "Fierce, Severe", deity: "Yama", activity: "Cleansing, renovation, competitive sports, ending old cycles." },
  { name: "Krittika", lord: "Sun", quality: "Mixed, Sharp", deity: "Agni", activity: "Cooking, debate, analysis, starting projects requiring focus." },
  { name: "Rohini", lord: "Moon", quality: "Stable, Growth", deity: "Brahma", activity: "Agriculture, long-term deals, marriage, home construction." },
  { name: "Mrigashirsha", lord: "Mars", quality: "Soft, Searching", deity: "Soma", activity: "Research, artistic creation, travel, light commercial deals." },
  { name: "Ardra", lord: "Rahu", quality: "Sharp, Piercing", deity: "Rudra", activity: "Overcoming challenges, restructuring, tech development." },
  { name: "Punarvasu", lord: "Jupiter", quality: "Mobile, Light", deity: "Aditi", activity: "Travel, starting study, launching campaigns, charity." },
  { name: "Pushya", lord: "Saturn", quality: "Nourishing, Auspicious", deity: "Brihaspati", activity: "Wealth creation, investing, launching businesses, spiritual rites." },
  { name: "Ashlesha", lord: "Mercury", quality: "Sharp, Intense", deity: "Sarpas", activity: "Strategic plans, commercial deals, administration, writing." },
  { name: "Magha", lord: "Ketu", quality: "Fierce, Royal", deity: "Pitris", activity: "Coronations, ancestor rituals, managing legacy projects." },
  { name: "Purva Phalguni", lord: "Venus", quality: "Fierce, Creative", deity: "Bhaga", activity: "Leisure, art, fashion, relaxation, dating, networking." },
  { name: "Uttara Phalguni", lord: "Sun", quality: "Stable, Supportive", deity: "Aryaman", activity: "Signing contracts, starting long-term relationships, home buying." },
  { name: "Hasta", lord: "Moon", quality: "Light, Swift", deity: "Savitr", activity: "Handicrafts, starting travel, business transactions, healing." },
  { name: "Chitra", lord: "Mars", quality: "Soft, Creative", deity: "Vishwakarma", activity: "Design, construction, modeling, signing creative partnerships." },
  { name: "Swati", lord: "Rahu", quality: "Mobile, Flexible", deity: "Vayu", activity: "Acquisition, starting transport, commercial deals, public events." },
  { name: "Vishakha", lord: "Jupiter", quality: "Mixed, Dual", deity: "Indra-Agni", activity: "Ambitious goal setting, auditing, competitive marketing." },
  { name: "Anuradha", lord: "Saturn", quality: "Soft, Friendly", deity: "Mitra", activity: "Friendships, marriages, forming long-term alliances, music." },
  { name: "Jyeshtha", lord: "Mercury", quality: "Sharp, Commanding", deity: "Indra", activity: "Leadership tasks, executive meetings, signing strategic agreements." },
  { name: "Mula", lord: "Ketu", quality: "Sharp, Rooting", deity: "Nirriti", activity: "Deep study, research, agriculture, resolving deep-seated problems." },
  { name: "Purva Ashadha", lord: "Venus", quality: "Fierce, Fluid", deity: "Apas", activity: "Water-related activities, starting therapy, restructuring assets." },
  { name: "Uttara Ashadha", lord: "Sun", quality: "Stable, Unconquerable", deity: "Vishvadevas", activity: "Starting business, major corporate structures, laying foundations." },
  { name: "Shravana", lord: "Moon", quality: "Mobile, Listening", deity: "Vishnu", activity: "Learning, starting colleges, purchasing vehicles, public lectures." },
  { name: "Dhanishta", lord: "Mars", quality: "Mobile, Wealthy", deity: "Vasus", activity: "Purchasing property, starting musical/cultural work, investing." },
  { name: "Shatabhisha", lord: "Rahu", quality: "Mobile, Healing", deity: "Varuna", activity: "Medical treatments, therapy, science/tech development." },
  { name: "Purva Bhadrapada", lord: "Jupiter", quality: "Fierce, Spiritual", deity: "Aja Ekapada", activity: "Introspection, closing old ventures, deep calculations." },
  { name: "Uttara Bhadrapada", lord: "Saturn", quality: "Stable, Wise", deity: "Ahirbudhnya", activity: "Marriage, long-term wealth, charity, constructing buildings." },
  { name: "Revati", lord: "Venus", quality: "Soft, Gentle", deity: "Pushan", activity: "Travel, starting creative arts, financial planning, relaxation." }
];

/**
 * Maps any sidereal longitude (0 to 360) to its Nakshatra, Pada, and lord
 * @param {number} longitude - Sidereal longitude in degrees
 */
function getNakshatraDetails(longitude) {
  // Bound longitude between 0 and 360
  const normalizedLong = (longitude % 360 + 360) % 360;
  
  const nakshatraWidth = 360 / 27; // 13.33333 degrees
  const index = Math.floor(normalizedLong / nakshatraWidth);
  const data = NAKSHATRAS[index];

  const remainingDegrees = normalizedLong % nakshatraWidth;
  const padaWidth = nakshatraWidth / 4; // 3.33333 degrees
  const pada = Math.floor(remainingDegrees / padaWidth) + 1;

  return {
    index,
    name: data.name,
    lord: data.lord,
    quality: data.quality,
    deity: data.deity,
    pada,
    activityAdvice: data.activity
  };
}

module.exports = {
  NAKSHATRAS,
  getNakshatraDetails
};
