import sys
import json
import spacy

nlp = spacy.load("en_core_web_sm")

text = sys.stdin.read()
doc = nlp(text)

sentences = []
for sent in doc.sents:
    entities = [
        {"text": ent.text, "label": ent.label_}
        for ent in sent.ents
    ]
    sentences.append({
        "text": sent.text,
        "entities": entities
    })

print(json.dumps(sentences))
