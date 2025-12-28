export function detectSectionWeights(question) {
  const q = question.toLowerCase();
  const weights = {};

  const rules = [
    {
      section: "technical",
      keywords: ["architecture", "system", "technical", "configuration", "stack"],
      weight: 0.15,
    },
    {
      section: "procedure",
      keywords: ["procedure", "process", "steps", "how to"],
      weight: 0.12,
    },
    {
      section: "safety",
      keywords: ["safety", "hazard", "risk", "emergency"],
      weight: 0.12,
    },
    {
      section: "policy",
      keywords: ["policy", "compliance", "regulation"],
      weight: 0.10,
    },
    {
      section: "training",
      keywords: ["training", "course", "certification", "learning"],
      weight: 0.10,
    },
  ];

  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      if (q.includes(keyword)) {
        weights[rule.section] = rule.weight;
        break;
      }
    }
  }

  return Object.keys(weights).length > 0
    ? weights
    : { general: 0.05 };
}
