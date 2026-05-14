/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║         Vedic AI Core — Master Entry Point v3.0                  ║
 * ║  Hybrid NLP + Swiss Ephemeris + Rule Engine + NLG                ║
 * ║                                                                  ║
 * ║  Pipeline:                                                       ║
 * ║  Input → Preprocess → Split → Intent+Entity → Context →          ║
 * ║  Plan → Execute(Swiss+Rules) → NLG → Response                    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ── NLP Layer ──────────────────────────────────────────────────────────────
const preprocessor    = require('./nlp/preprocessor');
const querySplitter   = require('./nlp/querySplitter');
const intentEngine    = require('./nlp/intentEngine');
const entityEngine    = require('./nlp/entityEngine');
const pythonBridge    = require('./nlp/pythonBridge');

// ── Context Layer ──────────────────────────────────────────────────────────
const contextManager  = require('./context/contextManager');

// ── Planner Layer ──────────────────────────────────────────────────────────
const dependencyResolver = require('./planner/dependencyResolver');

// ── Executor Layer ─────────────────────────────────────────────────────────
const swissAdapter    = require('./executor/swissAdapter');
const ruleEngine      = require('./executor/ruleEngine');

// ── Response Layer ─────────────────────────────────────────────────────────
const nlgEngine       = require('./response/nlgEngine');
const summaryEngine   = require('./response/summaryEngine');

/**
 * Map intent strings from classifier to action plan step names
 */
const INTENT_TO_ACTION = {
  'GET_LAGNA':           'GET_LAGNA',
  'COMPUTE_LAGNA':       'GET_LAGNA',
  'GET_NAKSHATRA':       'GET_NAKSHATRA',
  'COMPUTE_NAKSHATRA':   'GET_NAKSHATRA',
  'GET_TODAY_NAKSHATRA': 'GET_TODAY_NAKSHATRA',
  'EVAL_BUSINESS':       'EVAL_BUSINESS',
  'EVALUATE_BUSINESS':   'EVAL_BUSINESS',
  'EVAL_TRAVEL':         'EVAL_TRAVEL',
  'EVALUATE_TRAVEL':     'EVAL_TRAVEL',
  'EVAL_GENERAL_DAY':    'EVAL_GENERAL_DAY',
  'FIND_BEST_TIME':      'FIND_BEST_TIME',
  'GET_PLANET_INFO':     'GET_PLANET_INFO',
  'GET_PANCHANG':        'GET_PANCHANG',
  'GET_BIRTH_CHART':     'GET_BIRTH_CHART',
  'UPDATE_PROFILE':      'UPDATE_PROFILE',
  'GET_HISTORY':         'GET_HISTORY',
  'SUMMARY_ENGINE':      'SUMMARY_ENGINE',
  'COMPARE_NAKSHATRA':   'COMPARE_NAKSHATRA',
  'GREETING':            'GREETING',
  'FAREWELL':            'FAREWELL',
  'ACKNOWLEDGE':         'ACKNOWLEDGE',
  'HELP':                'HELP',
  'FUTURE_PREDICTION':   'FUTURE_PREDICTION',
  'CHAT_STATUS':         'CHAT_STATUS',
  'SELF_QUERY':          'SELF_QUERY',
  'GENERAL_ASTROLOGY':   'GENERAL_ASTROLOGY',
};

/**
 * Build execution plan from classified intents.
 * Handles dependencies: EVAL_BUSINESS/TRAVEL requires Lagna + Moon.
 */
function buildPlan(classifiedIntents) {
  const plan = [];
  const seen = new Set();
  
  // Convert intents to actions with metadata
  let rawPlan = classifiedIntents.map(c => ({
    action: INTENT_TO_ACTION[c.intent] || 'GENERAL_ASTROLOGY',
    isNatal: c.isNatal || false,
    confidence: c.confidence
  }));

  // ── Dependency Injection ──────────────────────────────────────────────
  
  // 1. COMPARE_NAKSHATRA requires both birth and transit stars
  if (rawPlan.some(p => p.action === 'COMPARE_NAKSHATRA')) {
    if (!rawPlan.some(p => p.action === 'GET_NAKSHATRA' && p.isNatal)) {
      rawPlan.unshift({ action: 'GET_NAKSHATRA', isNatal: true, implicit: true });
    }
    if (!rawPlan.some(p => p.action === 'GET_TODAY_NAKSHATRA')) {
      rawPlan.unshift({ action: 'GET_TODAY_NAKSHATRA', isNatal: false, implicit: true });
    }
  }

  // 2. Evaluation intents require Transit Lagna
  if (rawPlan.some(p => ['EVAL_BUSINESS', 'EVAL_TRAVEL', 'EVAL_GENERAL_DAY'].includes(p.action))) {
    if (!rawPlan.some(p => p.action === 'GET_LAGNA' && !p.isNatal)) {
      rawPlan.unshift({ action: 'GET_LAGNA', isNatal: false, implicit: true });
    }
  }

  const needsSwiss = rawPlan.some(a => [
    'EVAL_BUSINESS', 'EVAL_TRAVEL', 'EVAL_GENERAL_DAY',
    'GET_LAGNA', 'GET_NAKSHATRA', 'GET_TODAY_NAKSHATRA',
    'GET_PLANET_INFO', 'GET_BIRTH_CHART', 'SUMMARY_ENGINE',
    'COMPARE_NAKSHATRA'
  ].includes(a.action));
  
  if (needsSwiss) {
    plan.push({ action: '_SWISS_PREP', implicit: true });
  }

  for (const p of rawPlan) {
    const key = `${p.action}_${p.isNatal ? 'natal' : 'transit'}`;
    if (!seen.has(key)) {
      plan.push(p);
      seen.add(key);
    }
  }

  return plan;
}

/**
 * Execute the plan — compute Swiss data, apply rules, return results map.
 */
async function executePlan(plan, context) {
  const results = {};

  // ── Pre-compute Swiss data once (shared across steps) ──────────────────
  if (plan.some(s => s.action === '_SWISS_PREP')) {
    const birthDate = context.userProfile.dob ? new Date(`${context.userProfile.dob}T${context.userProfile.time || '12:00'}`) : null;
    const transitTime = context.userProfile?.transitTime || '12:00';
    const transitDate = new Date(`${context.date}T${transitTime}`);
    
    results['_NATAL_LAGNA'] = birthDate ? swissAdapter.computeLagna(context.userProfile, birthDate) : null;
    results['_TRANSIT_LAGNA'] = swissAdapter.computeLagna(context.userProfile, transitDate);
    results['_NATAL_PLANETS'] = birthDate ? swissAdapter.computePlanets(context.userProfile, birthDate) : null;
    results['_TRANSIT_PLANETS'] = swissAdapter.computePlanets(context.userProfile, transitDate);
    results['_TODAY_MOON'] = swissAdapter.computeTodayMoon(transitDate);
    
    // ── Transit Panchang (Rahu Kaal, Abhijit, etc.) ──────────────────────────
    results['_TRANSIT_PANCHANG'] = await swissAdapter.computeTransitPanchang(context.userProfile, transitDate);
    
    // Inject the calculated transit panchang into the context for Rule Engine
    if (results['_TRANSIT_PANCHANG']) {
      // Create a summary for the rule engine
      const p = results['_TRANSIT_PANCHANG'];
      context.panchang = {
        hasRahuKaal: !!p.rahuKaal,
        rahuKaal: p.rahuKaal,
        hasAbhijit: !!p.abhijitMuhurat,
        abhijitMuhurat: p.abhijitMuhurat,
        panchaRahita: p.panchaRahitaMuhurat || [],
        tithi: p.tithi,
        vara: p.vara,
        moonNakshatra: p.nakshatra,
      };
      context.rawPanchang = p; // Store full data
    }
    
    if (context.hasBirthDetails) {
      results['BIRTH_PANCHANG'] = swissAdapter.computeBirthPanchang(context.userProfile);
      // Auto-update profile markers for downstream use
      if (results['BIRTH_PANCHANG']) {
        if (!context.userProfile.nakshatra) context.userProfile.nakshatra = results['BIRTH_PANCHANG'].nakshatra;
        if (!context.userProfile.rashi) context.userProfile.rashi = results['BIRTH_PANCHANG'].rashi;
      }
    }
  }

  for (const step of plan) {
    const { action, isNatal } = step;
    if (action === '_SWISS_PREP') continue; 

    // ── GET_LAGNA ────────────────────────────────────────────────────────
    if (action === 'GET_LAGNA') {
      const targetLagna = isNatal ? results['_NATAL_LAGNA'] : results['_TRANSIT_LAGNA'];
      results['LAGNA'] = targetLagna || results['_TRANSIT_LAGNA'];
      results['LAGNA_TYPE'] = isNatal && targetLagna ? 'NATAL' : 'TRANSIT';
    }

    // ── GET_NAKSHATRA ────────────────────────────────────────────────────
    else if (action === 'GET_NAKSHATRA') {
      results['NAKSHATRA'] = results['BIRTH_PANCHANG']?.nakshatra || { name: context.userProfile.nakshatra };
    }

    // ── GET_TODAY_NAKSHATRA ──────────────────────────────────────────────
    else if (action === 'GET_TODAY_NAKSHATRA') {
      results['TODAY_NAKSHATRA'] = results['_TODAY_MOON']?.nakshatra;
    }

    // ── EVALUATION INTENTS ────────────────────────────────────────────────
    else if (action === 'EVAL_BUSINESS') {
      const moonSign = results['_TODAY_MOON']?.rashi || null;
      const moonNak = results['_TODAY_MOON']?.nakshatra || null;
      results['BUSINESS'] = ruleEngine.evaluateBusiness(results['_TRANSIT_LAGNA'], moonSign, moonNak, context.panchang);
    }

    else if (action === 'EVAL_TRAVEL') {
      const moonSign = results['_TODAY_MOON']?.rashi || null;
      const moonNak = results['_TODAY_MOON']?.nakshatra || null;
      results['TRAVEL'] = ruleEngine.evaluateTravel(results['_TRANSIT_LAGNA'], moonSign, moonNak, context.panchang);
    }

    else if (action === 'EVAL_GENERAL_DAY') {
      const moonSign = results['_TODAY_MOON']?.rashi || null;
      const moonNak = results['_TODAY_MOON']?.nakshatra || null;
      results['GENERAL_DAY'] = ruleEngine.evaluateGeneralDay(results['_TRANSIT_LAGNA'], moonSign, moonNak, context.panchang);
    }

    // ── FIND_BEST_TIME ───────────────────────────────────────────────────────
    else if (action === 'FIND_BEST_TIME') {
      const timeFilter = context.userProfile?.transitTime || null;
      results['BEST_TIME'] = ruleEngine.findBestTime(context.panchang, timeFilter);
    }

    // ── GET_PLANET_INFO ──────────────────────────────────────────────────
    else if (action === 'GET_PLANET_INFO') {
      results['PLANETS'] = results['_TRANSIT_PLANETS'];
    }
  }

  // Final mapping for Summary compatibility
  results['PLANETS'] = results['PLANETS'] || results['_TRANSIT_PLANETS'];
  results['TODAY_MOON'] = results['TODAY_MOON'] || results['_TODAY_MOON'];
  results['PANCHANG'] = context.rawPanchang || context.panchang;

  return results;
}




/**
 * ═══════════════════════════════════════════════════════
 * processSingleQuery
 * Processes a single decomposed query segment.
 * ═══════════════════════════════════════════════════════
 */
async function processSingleQuery(segmentQuery, userQuery, contextParams = {}, isMultiPart = false) {
  try {
    // ── STEP 1: Preprocess ─────────────────────────────────────────────
    const cleaned = segmentQuery;

    // ── STEP 2: Extract Entities (Hybrid Node Regex + Python spaCy) ────
    const regexEntities = entityEngine.extractEntities(cleaned);
    let entities = { ...regexEntities };
    
    // Try to enhance entities using Python spaCy + sentence-transformers
    let pyEntities = null;
    try {
      pyEntities = await pythonBridge.extractEntitiesPython(cleaned);
    } catch (err) {
      console.warn(`[AI Core] Python Entity extraction failed: ${err.message}`);
    }
    
    if (pyEntities && !pyEntities.error) {
      const regexCount = Object.keys(regexEntities).filter(k => Array.isArray(regexEntities[k]) ? regexEntities[k].length > 0 : regexEntities[k]).length;
      const pyCount = (pyEntities.dates?.length || 0) + (pyEntities.times?.length || 0) + (pyEntities.locations?.length || 0);
      
      console.log(`[AI Core] Entity Merge: Regex found ${regexCount}, Python found ${pyCount}`);
      
      // 1. Better Date Merging: Python (spaCy) often detects "12 Aug 2004" better than basic regex
      if (pyEntities.dates && pyEntities.dates.length > 0) {
        if (!entities.date || pyEntities.dates[0].length > (entities.date || '').length) {
          entities.date = pyEntities.dates[0];
          if (!entities.dates) entities.dates = [];
          entities.dates.push({ raw: pyEntities.dates[0], value: pyEntities.dates[0], type: 'ml_extracted' });
          console.log(`[AI Core] Entity: Preferred Python Date -> ${entities.date}`);
        }
      }
      
      // 2. Multi-Time Merging: Combine both
      if (pyEntities.times && pyEntities.times.length > 0) {
        if (!entities.times) entities.times = [];
        for (const t of pyEntities.times) {
           if (!entities.times.some(et => et.raw.toLowerCase() === t.toLowerCase())) {
             entities.times.push({ type: 'ml_extracted', raw: t });
             console.log(`[AI Core] Entity: Added Python Time -> ${t}`);
           }
        }
      }
      
      // 3. Location/City Merging: Python is much better at global cities
      if (pyEntities.locations && pyEntities.locations.length > 0) {
        const pyCity = pyEntities.locations[0];
        if (!entities.city || entities.city.toLowerCase() !== pyCity.toLowerCase()) {
          entities.city = pyCity;
          console.log(`[AI Core] Entity: Preferred Python City -> ${entities.city}`);
        }
      }

      if (pyEntities.is_providing_dob) {
        entities.is_providing_dob = true;
      }
    }

    // ── STEP 2.5: Resolve City Coordinates if mentioned ────────────────
    if (entities.city) {
      const { fetchCoordinates } = require('../utils/geoUtils');
      const coords = await fetchCoordinates(entities.city);
      if (coords) {
        entities.lat = coords.lat;
        entities.lng = coords.lng;
        entities.timeZone = coords.timeZone;
      }
    }

    // ── STEP 2.8: Force Birth Query Type ─────────────────────────────────────
    if (cleaned.includes('birth') || cleaned.includes('born') || cleaned.includes('my dob')) {
      contextParams.queryType = 'BIRTH_QUERY';
    }

    // ── STEP 3: Build Unified Context ─────────────────────────────────
    const context = await contextManager.buildContext({
      ...contextParams,
      entities,
    });

    // ── STEP 3.5: Validation Check ─────────────────────────────────────
    if (context.userProfile.error) {
       return {
         success: false,
         query: userQuery,
         response: { text: `⚠️ ${context.userProfile.error}` }
       };
    }

    // ── STEP 5: Classify Intent (Hybrid Decision Layer) ──
    let regexIntents = [];
    let pythonResult = null;

    // ── 5a: Run Regex Engine ──
    const segIntents = intentEngine.classifyQuery(cleaned);
    for (const si of segIntents) {
      if (si.intent !== 'GENERAL_ASTROLOGY' && !regexIntents.some(c => c.intent === si.intent)) {
        regexIntents.push({ ...si, source: 'regex' });
      }
    }

    // ── 5b: Always call Python (Authoritative AI) ──
    try {
      pythonResult = await pythonBridge.classifyIntent(cleaned, { hasProfile: context.hasBirthDetails });
    } catch (err) {
      console.error(`[AI Core] Python Bridge Error: ${err.message}`);
    }

    // ── 5c: Decision Layer (Hybrid Logic) ──
    let finalIntents = [];
    
    // Detect Global Natal Context (for the whole query)
    const isNatalGlobal = /\b(my|birth|born|natal|janma|mine)\b/i.test(cleaned);

    // DEBUG LOGGING (MANDATORY)
    console.log(`[AI Core] DECISION PROCESS:
    - User Query: "${userQuery}"
    - Regex Intents: [${regexIntents.map(i => `${i.intent}(${i.confidence})`).join(', ')}]
    - Python Intent: ${pythonResult ? `${pythonResult.intent}(${pythonResult.confidence})` : 'FAILED/TIMEOUT'}
    - Global Natal: ${isNatalGlobal}
    `);

    // 1. Authoritative Override: If Python is highly confident (>0.7), it wins/overrides regex
    if (pythonResult && pythonResult.confidence > 0.7) {
      console.log(`[AI Core] Decision: Python Authoritative Winner -> ${pythonResult.intent}`);
      
      // We still keep regex matches if they are different (multi-intent), 
      // but if they conflict on the same "domain", Python wins.
      finalIntents.push({ 
        ...pythonResult, 
        isNatal: isNatalGlobal || pythonResult.isNatal, // Inherit natal context
        source: 'python_authoritative' 
      });
      
      // Add regex intents that are NOT the same as Python's (to support multi-intent queries)
      for (const ri of regexIntents) {
        if (ri.intent !== pythonResult.intent) {
          finalIntents.push(ri);
        }
      }
    } 
    // 2. Fallback: If Python failed or is unsure, use Regex
    else if (regexIntents.length > 0) {
      console.log(`[AI Core] Decision: Regex Authoritative (Python low confidence or failed)`);
      finalIntents = [...regexIntents];
    }
    // 3. Last Resort: Python Fallback (Regex found nothing)
    else if (pythonResult && pythonResult.confidence > 0.4) {
      console.log(`[AI Core] Decision: Python fallback (Regex found nothing) -> ${pythonResult.intent}`);
      finalIntents.push({ 
        ...pythonResult, 
        isNatal: isNatalGlobal,
        source: 'python_fallback' 
      });
    }

    let classifiedIntents = finalIntents;

    // ── 5c: Disambiguate Intents Based on Query Type ────────────────────────
    for (let i = 0; i < classifiedIntents.length; i++) {
      if (classifiedIntents[i].intent === 'GET_NAKSHATRA' && !classifiedIntents[i].isNatal) {
        classifiedIntents[i].intent = 'GET_TODAY_NAKSHATRA';
      }
      if (classifiedIntents[i].intent === 'GET_TODAY_NAKSHATRA' && classifiedIntents[i].isNatal) {
        classifiedIntents[i].intent = 'GET_NAKSHATRA';
      }
    }

    // ── 5c: Default fallback ────────────────────────────────────────────────
    if (classifiedIntents.length === 0) {
      // Last resort: check if full cleaned query has any match
      const fullQueryIntents = intentEngine.classifyQuery(cleaned);
      classifiedIntents = fullQueryIntents.filter(i => i.intent !== 'GENERAL_ASTROLOGY');
    }
    if (classifiedIntents.length === 0) {
      if (entities.is_providing_dob) {
        classifiedIntents = [{ intent: 'UPDATE_PROFILE', confidence: 0.9, source: 'spacy_semantic' }];
      } else {
        classifiedIntents = [{ intent: 'GENERAL_ASTROLOGY', confidence: 0.3, source: 'default' }];
      }
    }

    // ── STEP 5.5: Validate Profile Update ────────────────────────────────────
    if (classifiedIntents.some(i => i.intent === 'UPDATE_PROFILE')) {
      // If we are updating the profile, but dob is missing or invalid
      if (!entities.date && !context.hasBirthDetails && !entities.is_providing_dob) {
        return {
          success: false,
          query: userQuery,
          intents: classifiedIntents,
          response: { text: "I couldn't understand the birth details. Please provide a valid Date, Time, and City." }
        };
      }
    }

    // ── STEP 5.6: Enforce Birth Details for Natal Queries ────────────────────
    const needsBirth = classifiedIntents.some(i => i.isNatal);
    const isProfileUpdate = classifiedIntents.some(i => i.intent === 'UPDATE_PROFILE');
    if (needsBirth && !context.hasBirthDetails && !entities.date && !entities.is_providing_dob && !isProfileUpdate) {
      return {
        success: true,
        query: userQuery,
        intents: classifiedIntents,
        response: { text: "### 👤 Birth Profile Required\n\nTo provide personalized readings, I need your birth details.\n\nPlease provide your birth date, time, and place.\n\n*Example: \"I was born on 12 Aug 2004 10:30 AM in Hyderabad\"*" }
      };
    }

    // ── STEP 6: Build Execution Plan ───────────────────────────────────
    const plan = buildPlan(classifiedIntents);

    // ── STEP 7: Execute Plan (Swiss + Rules) ───────────────────────────
    const executionResults = await executePlan(plan, context);

    // ── STEP 8: Generate Natural Language Response ─────────────────────
    // Filter out internal prep steps from NLG plan
    const nlgPlan = plan.filter(s => !s.action.startsWith('_'));
    const responseText = nlgEngine.generate(nlgPlan, executionResults, context);

    return {
      success: true,
      query: userQuery,
      cleaned,
      intents: classifiedIntents,
      plan: nlgPlan,
      results: executionResults,
      context: context, // Return context for the wrapper
      response: {
        text: responseText,
        markdown: responseText,
      },
      meta: {
        pythonUsed: classifiedIntents.some(c => c.source === 'python_authoritative' || c.source === 'python_fallback'),
        entityCount: Object.values(entities).flat().filter(Boolean).length,
        hasBirthDetails: context.hasBirthDetails,
      }
    };

  } catch (error) {
    console.error('[AI Core] processQuery error:', error.message, error.stack);
    return {
      success: false,
      error: 'AI Core processing failed',
      details: error.message,
      response: {
        text: 'I encountered an internal error. Please try rephrasing your question.',
        markdown: '⚠️ Internal error. Please try again.',
      }
    };
  }
}

/**
 * ═══════════════════════════════════════════════════════
 * MAIN ENTRY POINT — processQuery
 * Handles Decomposition, Execution Loop, and Response Composition
 * ═══════════════════════════════════════════════════════
 */
async function processQuery(userQuery, contextParams = {}) {
  try {
    // 1. Normalization
    const cleaned = preprocessor.preprocess(userQuery);

    // 2. Decomposition
    const segments = querySplitter.splitQuery(cleaned);

    console.log(`[AI Core] Query Decomposed into ${segments.length} segments:`, segments);

    // If only one segment, process normally
    if (segments.length === 1) {
      const result = await processSingleQuery(segments[0], userQuery, contextParams, false);
      
      // Persist Session Memory
      if (contextParams.sessionId && result.success && result.context) {
        const context = result.context;
        const sessionData = {};
        if (context.userProfile) {
          if (context.userProfile.dob) sessionData.dob = context.userProfile.dob;
          if (context.userProfile.time) sessionData.time = context.userProfile.time;
          if (context.userProfile.lat) sessionData.lat = context.userProfile.lat;
          if (context.userProfile.lng) sessionData.lng = context.userProfile.lng;
          if (context.userProfile.nakshatra) sessionData.nakshatra = context.userProfile.nakshatra;
          if (context.userProfile.rashi) sessionData.rashi = context.userProfile.rashi;
          if (context.userProfile.name) sessionData.name = context.userProfile.name;
        }
        
        await contextManager.updateSession(contextParams.sessionId, { 
          userProfile: Object.keys(sessionData).length > 0 ? sessionData : undefined,
          historyItems: [
            { role: 'user', content: userQuery },
            { role: 'assistant', content: result.response.text }
          ]
        });
      }
      return result;
    }

    // 6. Execution Loop for multiple segments
    let composedText = '';
    let allIntents = [];
    let allResults = {};
    let allPlans = [];
    let finalContext = null;
    const segmentsData = []; // Store data for final summary comparison

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      // Run the pipeline for each segment independently
      const res = await processSingleQuery(segment, userQuery, contextParams, true);
      
      if (res.success) {
        // Compose the header
        let header = `### 📅 For: ${res.context.date || segment}\n`;
        
        composedText += header + res.response.text + '\n\n---\n\n';
        allIntents.push(...res.intents);
        allPlans.push(...res.plan);
        Object.assign(allResults, res.results);
        finalContext = res.context;
        
        // Save for summary comparison
        segmentsData.push({
          segment,
          results: res.results,
          context: res.context
        });
      } else {
        composedText += `⚠️ Error processing: "${segment}"\n\n`;
      }
    }

    composedText = composedText.trim();
    if (composedText.endsWith('---')) {
      composedText = composedText.slice(0, -3).trim();
    }

    // 7. Add Final Insight Summary (Reasoning Layer)
    const summaryText = summaryEngine.generateSummary(segmentsData);
    if (summaryText) {
      composedText += summaryText;
    }

    // 7. Response Composition & Persistence
    if (contextParams.sessionId && finalContext) {
      const context = finalContext;
      const sessionData = {};
      if (context.userProfile) {
        if (context.userProfile.dob) sessionData.dob = context.userProfile.dob;
        if (context.userProfile.time) sessionData.time = context.userProfile.time;
        if (context.userProfile.lat) sessionData.lat = context.userProfile.lat;
        if (context.userProfile.lng) sessionData.lng = context.userProfile.lng;
        if (context.userProfile.nakshatra) sessionData.nakshatra = context.userProfile.nakshatra;
        if (context.userProfile.rashi) sessionData.rashi = context.userProfile.rashi;
        if (context.userProfile.name) sessionData.name = context.userProfile.name;
      }
      
      await contextManager.updateSession(contextParams.sessionId, { 
        userProfile: Object.keys(sessionData).length > 0 ? sessionData : undefined,
        historyItems: [
          { role: 'user', content: userQuery },
          { role: 'assistant', content: composedText }
        ]
      });
    }

    return {
      success: true,
      query: userQuery,
      cleaned,
      intents: allIntents,
      plan: allPlans,
      results: allResults,
      response: {
        text: composedText,
        markdown: composedText,
      },
      meta: {
        isMultiPart: true,
        segmentCount: segments.length
      }
    };

  } catch (error) {
    console.error('[AI Core] processQuery wrapper error:', error.message, error.stack);
    return {
      success: false,
      error: 'AI Core multi-query processing failed',
      details: error.message,
      response: {
        text: 'I encountered an internal error processing multiple questions. Please try again.',
        markdown: '⚠️ Internal error. Please try again.',
      }
    };
  }
}

module.exports = { processQuery };
