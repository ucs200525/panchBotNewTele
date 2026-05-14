/**
 * AI Core — Python Bridge v2.0
 * HTTP client to call the Python FastAPI intelligence microservice.
 * Designed with a timeout + graceful fallback — if Python is offline,
 * the Node.js regex engine is used automatically.
 *
 * FIXED: HTTP status codes are now checked. 4xx/5xx responses resolve null
 * so the fallback chain triggers correctly instead of parsing error bodies.
 */

const http = require('http');

const PYTHON_SERVICE_URL = process.env.PYTHON_AI_URL || 'http://localhost:8001';
const TIMEOUT_MS = 5000; // 5s — FastAPI has cold-start overhead on first request

/**
 * Make a POST request to the Python AI service.
 * Returns null on: timeout, network error, non-2xx status, or invalid JSON.
 * @param {string} endpoint - e.g., '/classify'
 * @param {object} payload - JSON body
 * @returns {Promise<object|null>}
 */
function callPythonService(endpoint, payload) {
  return new Promise((resolve) => {
    const body = JSON.stringify(payload);
    const url = new URL(endpoint, PYTHON_SERVICE_URL);

    const options = {
      hostname: url.hostname,
      port: url.port || 8001,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const timer = setTimeout(() => {
      req.destroy();
      console.warn(`[Python Bridge] Timeout after ${TIMEOUT_MS}ms`);
      resolve({ intent: null, confidence: 0, error: 'timeout' });
    }, TIMEOUT_MS);

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        clearTimeout(timer);
        if (res.statusCode < 200 || res.statusCode >= 300) {
          resolve({ intent: null, confidence: 0, error: `HTTP ${res.statusCode}` });
          return;
        }
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch {
          resolve({ intent: null, confidence: 0, error: 'parse_error' });
        }
      });
    });

    req.on('error', (err) => {
      clearTimeout(timer);
      console.warn(`[Python Bridge] Request error: ${err.message}`);
      resolve({ intent: null, confidence: 0, error: err.message });
    });

    req.write(body);
    req.end();
  });
}

/**
 * Classify a query using the Python ML model.
 * Tries the new DistilBERT /predict endpoint first, falls back to /classify TF-IDF.
 * @param {string} query - Preprocessed query text
 * @param {object} context - Optional context hints { hasProfile: bool }
 * @returns {Promise<{intent: string, confidence: number, error?: string, source?: string, all_intents?: string[]}>}
 */
async function classifyIntent(query, context = {}) {
  // 1. Try DistilBERT
  const predictResult = await callPythonService('/predict', { text: query });
  
  if (predictResult && !predictResult.error && predictResult.intents && predictResult.intents.length > 0) {
    return {
      intent: predictResult.intents[0], // Keep backward compatibility with single-intent pipeline
      confidence: predictResult.confidence || 0,
      source: 'distilbert',
      all_intents: predictResult.intents
    };
  }

  // 2. Fallback to Legacy TF-IDF
  const result = await callPythonService('/classify', { query, context });
  if (!result) return { intent: null, confidence: 0, error: 'no_response' };
  
  // Return the result directly, index.js will handle the logic
  return { 
    intent: result.intent, 
    confidence: result.confidence || 0,
    error: result.error || (predictResult ? predictResult.error : null),
    source: 'tfidf'
  };
}

/**
 * Extract entities using Python spaCy NER.
 * @param {string} query
 * @returns {Promise<object>}
 */
async function extractEntitiesPython(query) {
  const result = await callPythonService('/entities', { query });
  if (!result) return { entities: [], error: 'no_response' };
  return result;
}

/**
 * Semantic similarity search against the knowledge base.
 * @param {string} query
 * @returns {Promise<object|null>}
 */
async function semanticSearch(query) {
  return await callPythonService('/semantic', { query });
}

/**
 * Health check — is the Python service running?
 */
async function isPythonServiceAvailable() {
  const result = await callPythonService('/health', {});
  return result !== null && result.status === 'ok';
}

module.exports = { classifyIntent, extractEntitiesPython, semanticSearch, isPythonServiceAvailable };
