/**
 * AI Core — Summary Engine (Insight Engine)
 * Analyzes results from multi-part queries to provide cross-segment reasoning.
 */

function generateSummary(segmentsData) {
  // segmentsData: Array<{ segment: string, results: object, context: object }>
  
  if (!segmentsData || segmentsData.length < 2) return '';

  const insights = [];
  
  // 1. Check for Business Comparison
  const businessEvaluations = segmentsData
    .filter(s => s.results.BUSINESS)
    .map(s => ({ 
      date: s.context.date, 
      score: s.results.BUSINESS.score,
      verdict: s.results.BUSINESS.verdict,
      reasons: s.results.BUSINESS.reasons
    }));

  if (businessEvaluations.length >= 2) {
    const sorted = [...businessEvaluations].sort((a, b) => b.score - a.score);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    if (best.score > worst.score) {
      insights.push(`👉 **${best.date}** is more favorable for business than ${worst.date} (Score ${best.score}/10 vs ${worst.score}/10).`);
    } else {
      insights.push(`👉 Both days show similar business prospects. Choose based on specific muhurat slots.`);
    }
  }

  // 2. Check for Travel Comparison
  const travelEvaluations = segmentsData
    .filter(s => s.results.TRAVEL)
    .map(s => ({ 
      date: s.context.date, 
      score: s.results.TRAVEL.score,
      verdict: s.results.TRAVEL.verdict
    }));

  if (travelEvaluations.length >= 2) {
    const sorted = [...travelEvaluations].sort((a, b) => b.score - a.score);
    const best = sorted[0];
    if (best.score > sorted[1].score) {
      insights.push(`👉 **${best.date}** is the preferred time for travel.`);
    }
  }

  // 3. Nakshatra Transition Insight
  const nakshatras = segmentsData
    .filter(s => s.results.TODAY_NAKSHATRA)
    .map(s => ({ date: s.context.date, name: s.results.TODAY_NAKSHATRA.name }));

  if (nakshatras.length >= 2) {
    const n1 = nakshatras[0];
    const n2 = nakshatras[nakshatras.length - 1];
    if (n1.name !== n2.name) {
      insights.push(`👉 The energy shifts from **${n1.name}** to **${n2.name}** over this period, supporting different types of activities.`);
    }
  }

  if (insights.length === 0) return '';

  return `\n\n🔮 **Final Insight:**\n` + insights.join('\n');
}

module.exports = { generateSummary };
