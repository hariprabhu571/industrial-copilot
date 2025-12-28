/**
 * Enterprise-grade section detector
 * Works for policies, SOPs, manuals, training docs, technical docs
 */

const SECTION_RULES = [
  {
    section: "safety",
    keywords: [
      "safety",
      "ppe",
      "hazard",
      "emergency",
      "risk",
      "incident",
      "accident",
      "protective equipment",
    ],
  },
  {
    section: "policy",
    keywords: [
      "policy",
      "rules",
      "guidelines",
      "compliance",
      "code of conduct",
      "regulation",
    ],
  },
  {
    section: "procedure",
    keywords: [
      "procedure",
      "steps",
      "process",
      "workflow",
      "how to",
      "instructions",
    ],
  },
  {
    section: "technical",
    keywords: [
      "architecture",
      "system",
      "technical",
      "implementation",
      "configuration",
      "api",
      "database",
    ],
  },
  {
    section: "training",
    keywords: [
      "training",
      "course",
      "learning",
      "certification",
      "workshop",
      "curriculum",
    ],
  },
];

/**
 * Detect section for a given text chunk
 * @param {string} text
 * @returns {string} section name
 */
export function detectSection(text) {
  const normalized = text.toLowerCase();

  for (const rule of SECTION_RULES) {
    for (const keyword of rule.keywords) {
      if (normalized.includes(keyword)) {
        return rule.section;
      }
    }
  }

  return "general"; // safe fallback
}
