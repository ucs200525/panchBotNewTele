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
/**
 * Make a POST request to the Python AI service.
 * Returns null on: timeout, network error, non-2xx status, or invalid JSON.
 * @param {string} endpoint - e.g., '/classify'
 * @param {object} payload - JSON body
 * @param {number} [customTimeoutMs] - Optional custom timeout override
 * @returns {Promise<object|null>}
 */
function callPythonService(endpoint, payload, customTimeoutMs) {
  return new Promise((resolve) => {
    const body = JSON.stringify(payload);
    const url = new URL(endpoint, PYTHON_SERVICE_URL);
    const activeTimeout = customTimeoutMs || TIMEOUT_MS;

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
      console.warn(`[Python Bridge] Timeout after ${activeTimeout}ms`);
      resolve({ intent: null, confidence: 0, error: 'timeout' });
    }, activeTimeout);

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
  // Run DistilBERT (/predict) and TF-IDF (/classify) IN PARALLEL to avoid
  // sequential timeout waits (previously 5s + 5s = 10s wasted on every request).
  const [predictResult, tfidfResult] = await Promise.all([
    callPythonService('/predict', { text: query }),
    callPythonService('/classify', { query, context })
  ]);

  // 1. Prefer DistilBERT if it returned valid intents
  if (predictResult && !predictResult.error && predictResult.intents && predictResult.intents.length > 0) {
    return {
      intent: predictResult.intents[0],
      confidence: predictResult.confidence || 0,
      source: 'distilbert',
      all_intents: predictResult.intents
    };
  }

  // 2. Fall back to TF-IDF classifier
  if (tfidfResult && !tfidfResult.error && tfidfResult.intent) {
    return {
      intent: tfidfResult.intent,
      confidence: tfidfResult.confidence || 0,
      source: 'tfidf'
    };
  }

  return { intent: null, confidence: 0, error: 'no_response' };
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
 * Generate conversational Vedic astrology response using local LLM.
 * @param {string} query
 * @param {object} contextData
 * @param {array} history
 * @returns {Promise<string|null>}
 */
async function generateLLMResponse(query, contextData, history = []) {
  // 5-minute timeout (300000ms) to allow the local CPU LLM to generate the full ~1000 tokens
  // without dropping the request and falling back to the deterministic NLG engine.
  const result = await callPythonService('/generate', { query, context: contextData, history }, 300000);
  if (result && !result.error && result.text) {
    return result.text;
  }
  return null;
}

/**
 * Health check — is the Python service running?
 */
async function isPythonServiceAvailable() {
  const result = await callPythonService('/health', {});
  return result !== null && result.status === 'ok';
}

module.exports = { classifyIntent, extractEntitiesPython, semanticSearch, generateLLMResponse, isPythonServiceAvailable };
