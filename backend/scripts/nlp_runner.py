import sys
import json
import spacy
import re
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine



ENTERPRISE_PATTERNS = {
    "EMPLOYEE_ID": re.compile(r"\bEMP[-_ ]?\d{3,8}\b", re.IGNORECASE),
    "ASSET_ID": re.compile(r"\bAST[-_ ]?\d{3,8}\b", re.IGNORECASE),
    "TICKET_ID": re.compile(r"\b(TKT|INC|REQ)[-_ ]?\d{4,10}\b", re.IGNORECASE),
    "PROJECT_CODE": re.compile(r"\bPRJ[-_ ]?[A-Z0-9]{3,10}\b"),
    "INVOICE_ID": re.compile(r"\bINV[-_ ]?\d{5,12}\b", re.IGNORECASE),
    "SERVER_NAME": re.compile(r"\b(SRV|HOST)[-_ ]?[A-Z0-9\-]{3,15}\b"),
}

def mask_enterprise_patterns(text):
    detected = []

    for label, pattern in ENTERPRISE_PATTERNS.items():
        if pattern.search(text):
            text = pattern.sub(f"<{label}>", text)
            detected.append(label)

    return text, detected


nlp = spacy.load("en_core_web_sm")
analyzer = AnalyzerEngine()
anonymizer = AnonymizerEngine()

raw = sys.stdin.buffer.read()
text = raw.decode("utf-8", errors="ignore")
text = text.replace("\u00a0", " ").strip()

doc = nlp(text)

results = []

for sent in doc.sents:
    sentence_text = sent.text.strip()

    if not sentence_text:
        continue

    entities = analyzer.analyze(
        text=sentence_text,
        language="en"
    )

    if entities:
        anonymized = anonymizer.anonymize(
            text=sentence_text,
            analyzer_results=entities
        )

        masked_text, enterprise_entities = mask_enterprise_patterns(anonymized.text)

        results.append({
            "content": masked_text,
            "pii_masked": True,
            "entities": list(
                set(
                    [e.entity_type for e in entities] + enterprise_entities
                )
            )
        })
    else:
        masked_text, enterprise_entities = mask_enterprise_patterns(sentence_text)

        results.append({
            "content": masked_text,
            "pii_masked": bool(enterprise_entities),
            "entities": enterprise_entities
        })


print(json.dumps(results))
