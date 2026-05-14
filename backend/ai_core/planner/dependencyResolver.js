module.exports = {
  resolve: (intents) => {
    // Determine dependencies between intents
    // e.g., EVALUATE_BUSINESS needs COMPUTE_LAGNA
    const plan = [];
    let hasLagna = false;

    for (const item of intents) {
      if (item.intent === 'COMPUTE_LAGNA') {
        plan.push({ action: 'COMPUTE_LAGNA' });
        hasLagna = true;
      } else if (item.intent === 'EVALUATE_BUSINESS' || item.intent === 'EVALUATE_TRAVEL') {
        if (!hasLagna) {
          plan.push({ action: 'COMPUTE_LAGNA', implicit: true });
          hasLagna = true;
        }
        plan.push({ action: item.intent, dependsOn: 'COMPUTE_LAGNA' });
      } else {
        plan.push({ action: item.intent });
      }
    }
    
    // Deduplicate actions while preserving order and dependencies
    const uniquePlan = [];
    const seen = new Set();
    for (const step of plan) {
      if (!seen.has(step.action)) {
        seen.add(step.action);
        uniquePlan.push(step);
      }
    }
    
    return uniquePlan;
  }
};
