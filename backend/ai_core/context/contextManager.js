/**
 * AI Core — Context Manager v1.0
 * Merges all contextual signals into a single unified context object:
 *   - User profile (birth details, name, nakshatra, rashi)
 *   - Panchang / Bhargava data (tithi, muhurat, rahu kaal)
 *   - Conversation history (last N messages)
 *   - Extracted entities from current query
 *   - Session state
 */

const sessionStore = require('./sessionStore');

/**
 * Build a unified context object for the AI pipeline.
 * @param {object} params
 * @param {object} params.userProfile     — { name, dob, time, lat, lng, nakshatra, rashi }
 * @param {object} params.panchang        — Panchang/Bhargava/Muhurat data
 * @param {string} params.city            — City name
 * @param {string} params.date            — ISO date string
 * @param {Array}  params.history         — Last N conversation turns
 * @param {object} params.entities        — Entities extracted from current query
 * @param {string} params.sessionId       — Optional session ID for memory
 */
async function buildContext(params) {
  const {
    userProfile = {},
    panchang = {},
    city = 'Hyderabad',
    date = new Date().toISOString().split('T')[0],
    entities = {},
    sessionId = null,
  } = params;
  let history = params.history || [];

  // Load session memory
  let sessionMemory = {};
  if (sessionId) {
    sessionMemory = await sessionStore.getSession(sessionId) || {};
    if (sessionMemory.history && sessionMemory.history.length > 0) {
       history = sessionMemory.history; // override passed history with session history
    }
  }

  // ── QUERY TYPE DETECTION (INDUSTRY STANDARD) ──────────────────────────────
  const queryText = (entities.raw || '').toLowerCase();
  const hasTransitKeyword = /\b(today|tomorrow|yesterday|now|current|transit|active|running|lunar|overview)\b/i.test(queryText);
  const hasBirthKeyword = /\b(my|birth|born|natal|janma|kundali)\b/i.test(queryText);
  const hasDOBEntity = !!(entities.dates && entities.dates.some(d => d.type !== 'relative'));
  
  let queryType = 'GENERAL_QUERY';
  if (hasTransitKeyword) queryType = 'TRANSIT_QUERY';
  else if (hasBirthKeyword || hasDOBEntity) queryType = 'BIRTH_QUERY';
  else if (sessionMemory.userProfile && sessionMemory.userProfile.dob) queryType = 'BIRTH_QUERY';

  // Resolve city from entities if user mentioned it in query
  const resolvedCity = entities.city || city;

  // ── CONTEXT BUILDER (SINGLE SOURCE OF TRUTH) ───────────────────────────────
  let resolvedDate = date; // Default system date
  const sessionProfile = sessionMemory.userProfile || {};
  const isUpdatingProfile = entities.is_providing_dob || (entities.intents && entities.intents.includes('UPDATE_PROFILE'));

  const profile = {
    name: sessionProfile.name || userProfile.name,
    dob: sessionProfile.dob || userProfile.dob,
    time: sessionProfile.time || userProfile.time,
    lat: sessionProfile.lat || userProfile.lat,
    lng: sessionProfile.lng || userProfile.lng,
    city: sessionProfile.city || userProfile.city,
    nakshatra: sessionProfile.nakshatra || userProfile.nakshatra,
    rashi: sessionProfile.rashi || userProfile.rashi,
  };

  const updatedFields = [];

  // Resolve City/Place from Entities
  if (entities.city && entities.city !== profile.city) {
    profile.city = entities.city;
    updatedFields.push('place');
  }

  // Resolve Dates from Entities
  if (entities.dates && entities.dates.length > 0) {
    const baseDate = new Date(date); // Use the date passed in params as "today"
    for (const dt of entities.dates) {
      let parsed = null;
      if (dt.value === 'today') {
        parsed = baseDate;
      } else if (dt.value === 'tomorrow') {
        parsed = new Date(baseDate);
        parsed.setDate(baseDate.getDate() + 1);
      } else if (dt.value === 'yesterday') {
        parsed = new Date(baseDate);
        parsed.setDate(baseDate.getDate() - 1);
      } else {
        // Normalize DD-MM-YYYY to YYYY-MM-DD for reliable parsing
        let val = dt.value;
        const ddmmyyyy = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.exec(val);
        if (ddmmyyyy) {
          val = `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`;
        }
        parsed = new Date(val);
      }

      if (parsed && !isNaN(parsed.getTime())) {
        // preserve local date components to avoid TZ shift to previous day
        const y = parsed.getFullYear();
        const m = (parsed.getMonth() + 1).toString().padStart(2, '0');
        const d = parsed.getDate().toString().padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        const isRelative = dt.type === 'relative';
        
        // ── VALIDATION LAYER ──────────────────────────────────────────────────
        if (!isRelative && parsed.getFullYear() < 1900) {
           profile.error = "Invalid date. Please enter full year (e.g., 2004).";
        } else if (isUpdatingProfile && isRelative) {
           profile.error = "⚠️ Birth date cannot be relative. Please enter actual DOB.";
        } else if (isUpdatingProfile && !isRelative) {
          const now = new Date(); // still use real clock for "future" check
          if (parsed > now) {
            profile.error = "Birth date cannot be in the future.";
          } else {
            profile.dob = dateStr;
            updatedFields.push('date');
            if (entities.dates.length === 1) resolvedDate = dateStr;
          }
        } else {
          resolvedDate = dateStr;
        }
      }
    }
  }

  if (entities.times && entities.times.length > 0) {
    const exactTime = entities.times.find(t => t.type === 'exact_time');
    if (exactTime) {
      let timeStr = exactTime.raw.toLowerCase().replace(/\s+/g, '');
      const isPm = timeStr.includes('pm');
      const isAm = timeStr.includes('am');
      let [h, m] = timeStr.replace(/[ap]m/g, '').split(':').map(Number);
      if (isPm && h < 12) h += 12;
      if (isAm && h === 12) h = 0;
      
      const resolvedTime = `${h.toString().padStart(2, '0')}:${(m || 0).toString().padStart(2, '0')}`;
      if (isUpdatingProfile) {
        profile.time = resolvedTime;
        updatedFields.push('time');
      } else {
        profile.transitTime = resolvedTime; 
      }
    }
  }

  // Resolve coordinates for profile if missing but city is present
  if (profile.city && (!profile.lat || !profile.lng)) {
    const { fetchCoordinates } = require('../../utils/geoUtils');
    try {
      const coords = await fetchCoordinates(profile.city);
      if (coords) {
        profile.lat = coords.lat;
        profile.lng = coords.lng;
        profile.timeZone = coords.timeZone;
        console.log(`[ContextManager] Auto-resolved coordinates for profile city: ${profile.city}`);
      }
    } catch (err) {
      console.warn(`[ContextManager] Failed to auto-resolve profile city: ${err.message}`);
    }
  }

  // Default time to 12:00 if date is provided but no time is available
  if (profile.dob && !profile.time) {
    profile.time = '12:00';
  }

  // Check if birth details are complete enough for Swiss calculations
  const hasBirthDetails = !!(
    profile.dob &&
    profile.time &&
    profile.lat &&
    profile.lng
  );

  // Check if partial profile (nakshatra/rashi saved but no full birth time)
  const hasPartialProfile = !!(profile.nakshatra || profile.rashi);



  // Summarize panchang for quick access
  const panchangSummary = {
    hasRahuKaal: !!(panchang.rahuKaal || panchang.rahuKaal_time),
    rahuKaal: panchang.rahuKaal || panchang.rahuKaal_time || null,
    hasAbhijit: !!(panchang.abhijitMuhurat || panchang.abhijit),
    abhijitMuhurat: panchang.abhijitMuhurat || panchang.abhijit || null,
    panchaRahita: panchang.panchaRahitaMuhurat || panchang.panchaRahita || [],
    tithi: panchang.tithi || null,
    vara: panchang.vara || null,
    moonNakshatra: panchang.nakshatra || panchang.moonNakshatra || null,
  };

  return {
    // Profile
    userProfile: profile,
    hasBirthDetails,
    hasPartialProfile,
    queryType,

    // Location & Time
    city: resolvedCity,
    date: resolvedDate,

    // Panchang
    panchang: panchangSummary,
    rawPanchang: panchang,

    // Conversation
    history: history.slice(-6), // Last 6 turns for context window

    // Current Query Entities
    entities,

    // Session memory
    sessionMemory,

    // Meta
    resolvedAt: new Date().toISOString(),
    updatedFields,
  };
}

/**
 * Update session memory after a successful response
 */
async function updateSession(sessionId, data) {
  if (!sessionId) return;
  await sessionStore.updateSession(sessionId, data);
}

module.exports = { buildContext, updateSession };
