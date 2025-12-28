/**
 * Infer preferred section from user query
 * This is lightweight and deterministic
 */

export function inferPreferredSection(question) {
  const q = question.toLowerCase();

  if (
    q.includes("skill") ||
    q.includes("technical") ||
    q.includes("technology") ||
    q.includes("framework") ||
    q.includes("language")
  ) {
    return "technical";
  }

  if (
    q.includes("certificate") ||
    q.includes("certification") ||
    q.includes("training") ||
    q.includes("course")
  ) {
    return "training";
  }

  if (
    q.includes("policy") ||
    q.includes("rule") ||
    q.includes("compliance")
  ) {
    return "policy";
  }

  if (
    q.includes("procedure") ||
    q.includes("process") ||
    q.includes("steps") ||
    q.includes("how to")
  ) {
    return "procedure";
  }

  if (
    q.includes("safety") ||
    q.includes("risk") ||
    q.includes("hazard")
  ) {
    return "safety";
  }

  return "general"; // safe fallback
}
