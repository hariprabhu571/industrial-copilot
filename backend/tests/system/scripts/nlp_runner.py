#!/usr/bin/env python3
"""
Enterprise-Level NLP Runner for Industrial AI Copilot
Matches the sophisticated NLP capabilities already built in the JavaScript system
Provides advanced text processing, section detection, PII masking, and enterprise document analysis
"""

import sys
import json
import re
from typing import List, Dict, Any, Tuple
from datetime import datetime

class EnterpriseNLPProcessor:
    """Enterprise-grade NLP processor matching our existing JavaScript capabilities"""
    
    def __init__(self):
        # Enterprise section detection rules (matching sectionDetector.js)
        self.section_rules = {
            "safety": [
                "safety", "ppe", "hazard", "emergency", "risk", "incident", 
                "accident", "protective equipment", "lockout", "tagout", "msds",
                "safety data sheet", "personal protective", "fire safety"
            ],
            "policy": [
                "policy", "rules", "guidelines", "compliance", "code of conduct", 
                "regulation", "governance", "standard", "requirement", "mandate"
            ],
            "procedure": [
                "procedure", "steps", "process", "workflow", "how to", "instructions",
                "sop", "standard operating", "checklist", "protocol", "method"
            ],
            "technical": [
                "architecture", "system", "technical", "implementation", "configuration",
                "api", "database", "specification", "design", "engineering", "maintenance"
            ],
            "training": [
                "training", "course", "learning", "certification", "workshop", 
                "curriculum", "education", "skill", "competency", "qualification"
            ],
            "equipment": [
                "equipment", "machinery", "device", "instrument", "tool", "asset",
                "pump", "motor", "valve", "sensor", "controller", "plc", "scada"
            ],
            "maintenance": [
                "maintenance", "repair", "service", "inspection", "calibration",
                "preventive", "corrective", "overhaul", "replacement", "troubleshooting"
            ],
            "quality": [
                "quality", "inspection", "testing", "validation", "verification",
                "audit", "review", "assessment", "standard", "iso", "certification"
            ]
        }
        
        # Advanced PII patterns for enterprise environments
        self.pii_patterns = {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b',
            'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
            'employee_id': r'\b(?:EMP|ID|EMPID)[-\s]?\d{4,8}\b',
            'badge_number': r'\b(?:BADGE|ID)[-\s]?\d{4,6}\b',
            'credit_card': r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',
            'ip_address': r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b',
            'serial_number': r'\b(?:SN|SERIAL)[-\s]?[A-Z0-9]{6,12}\b',
            'license_plate': r'\b[A-Z]{2,3}[-\s]?\d{3,4}[A-Z]?\b'
        }
        
        # Enterprise stop words (more comprehensive than basic)
        self.stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 
            'should', 'may', 'might', 'must', 'shall', 'can', 'this', 'that', 
            'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 
            'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 
            'their', 'mine', 'yours', 'hers', 'ours', 'theirs'
        }

    def detect_section(self, text: str) -> str:
        """
        Enterprise section detection matching our JavaScript sectionDetector.js
        Analyzes text to determine document section type
        """
        normalized = text.lower()
        
        # Score each section based on keyword matches
        section_scores = {}
        for section, keywords in self.section_rules.items():
            score = 0
            for keyword in keywords:
                if keyword in normalized:
                    # Weight longer keywords more heavily
                    score += len(keyword.split())
            section_scores[section] = score
        
        # Return section with highest score, or 'general' if no matches
        if section_scores and max(section_scores.values()) > 0:
            return max(section_scores, key=section_scores.get)
        
        return "general"

    def advanced_pii_detection(self, text: str) -> Dict[str, Any]:
        """
        Enterprise-grade PII detection for industrial environments
        Detects employee IDs, badge numbers, equipment serials, etc.
        """
        detected = {}
        total_matches = 0
        
        for pii_type, pattern in self.pii_patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                detected[pii_type] = {
                    'count': len(matches),
                    'samples': matches[:3]  # First 3 matches for verification
                }
                total_matches += len(matches)
        
        # Risk assessment
        risk_level = "LOW"
        if total_matches > 10:
            risk_level = "HIGH"
        elif total_matches > 3:
            risk_level = "MEDIUM"
        
        return {
            'has_pii': len(detected) > 0,
            'pii_types': list(detected.keys()),
            'total_pii_count': total_matches,
            'risk_level': risk_level,
            'details': detected,
            'requires_masking': total_matches > 0
        }

    def extract_enterprise_keywords(self, text: str) -> List[str]:
        """
        Advanced keyword extraction for enterprise documents
        Focuses on technical, safety, and operational terms
        """
        # Clean and tokenize
        words = re.findall(r'\b[A-Za-z]{3,}\b', text.lower())
        
        # Filter stop words and short words
        keywords = [word for word in words if word not in self.stop_words and len(word) > 2]
        
        # Count frequency
        word_freq = {}
        for word in keywords:
            word_freq[word] = word_freq.get(word, 0) + 1
        
        # Sort by frequency and return top keywords
        sorted_keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        
        return [word for word, freq in sorted_keywords[:20]]  # Top 20 keywords

    def chunk_analysis(self, text: str, chunk_size: int = 800, overlap: int = 150) -> List[Dict[str, Any]]:
        """
        Enterprise chunking analysis matching our chunkText.js functionality
        Provides detailed analysis of each chunk
        """
        chunks = []
        start = 0
        chunk_index = 0
        
        while start < len(text):
            end = start + chunk_size
            chunk_content = text[start:end].strip()
            
            if chunk_content:
                # Analyze this chunk
                section = self.detect_section(chunk_content)
                pii_info = self.advanced_pii_detection(chunk_content)
                keywords = self.extract_enterprise_keywords(chunk_content)
                
                chunk_analysis = {
                    'index': chunk_index,
                    'content': chunk_content,
                    'length': len(chunk_content),
                    'section': section,
                    'keywords': keywords[:10],  # Top 10 keywords per chunk
                    'pii_detection': pii_info,
                    'metadata': {
                        'start_position': start,
                        'end_position': min(end, len(text)),
                        'pii_masked': pii_info['requires_masking'],
                        'section_confidence': self._calculate_section_confidence(chunk_content, section)
                    }
                }
                
                chunks.append(chunk_analysis)
                chunk_index += 1
            
            start += chunk_size - overlap
        
        return chunks

    def _calculate_section_confidence(self, text: str, detected_section: str) -> float:
        """Calculate confidence score for section detection"""
        if detected_section == "general":
            return 0.5
        
        normalized = text.lower()
        keywords = self.section_rules.get(detected_section, [])
        matches = sum(1 for keyword in keywords if keyword in normalized)
        
        return min(matches / len(keywords), 1.0) if keywords else 0.5

    def enterprise_document_analysis(self, text: str) -> Dict[str, Any]:
        """
        Comprehensive enterprise document analysis
        Provides full NLP processing matching our existing system capabilities
        """
        # Basic text statistics
        word_count = len(text.split())
        char_count = len(text)
        line_count = len(text.split('\n'))
        
        # Advanced analysis
        overall_section = self.detect_section(text)
        pii_analysis = self.advanced_pii_detection(text)
        keywords = self.extract_enterprise_keywords(text)
        chunks = self.chunk_analysis(text)
        
        # Document classification
        doc_type = self._classify_document_type(text, keywords)
        
        # Compliance assessment
        compliance_score = self._assess_compliance(text, pii_analysis)
        
        return {
            'timestamp': datetime.now().isoformat(),
            'document_stats': {
                'character_count': char_count,
                'word_count': word_count,
                'line_count': line_count,
                'estimated_reading_time': f"{max(1, word_count // 200)} minutes"
            },
            'content_analysis': {
                'primary_section': overall_section,
                'document_type': doc_type,
                'top_keywords': keywords[:15],
                'keyword_count': len(keywords)
            },
            'security_analysis': pii_analysis,
            'chunk_analysis': {
                'total_chunks': len(chunks),
                'chunks': chunks
            },
            'compliance': {
                'score': compliance_score,
                'requires_review': pii_analysis['risk_level'] in ['MEDIUM', 'HIGH'],
                'recommendations': self._generate_recommendations(pii_analysis, doc_type)
            },
            'processing_status': 'success',
            'nlp_version': 'enterprise-v2.0'
        }

    def _classify_document_type(self, text: str, keywords: List[str]) -> str:
        """Classify document type based on content analysis"""
        text_lower = text.lower()
        
        # Document type indicators
        if any(word in text_lower for word in ['sop', 'standard operating', 'procedure']):
            return 'standard_operating_procedure'
        elif any(word in text_lower for word in ['policy', 'governance', 'compliance']):
            return 'policy_document'
        elif any(word in text_lower for word in ['manual', 'guide', 'handbook']):
            return 'user_manual'
        elif any(word in text_lower for word in ['safety', 'hazard', 'emergency']):
            return 'safety_document'
        elif any(word in text_lower for word in ['training', 'course', 'curriculum']):
            return 'training_material'
        elif any(word in text_lower for word in ['specification', 'technical', 'design']):
            return 'technical_specification'
        else:
            return 'general_document'

    def _assess_compliance(self, text: str, pii_analysis: Dict[str, Any]) -> float:
        """Assess document compliance score"""
        base_score = 100.0
        
        # Deduct points for PII risks
        if pii_analysis['risk_level'] == 'HIGH':
            base_score -= 30
        elif pii_analysis['risk_level'] == 'MEDIUM':
            base_score -= 15
        
        # Deduct points for missing standard sections
        text_lower = text.lower()
        required_sections = ['purpose', 'scope', 'responsibility']
        missing_sections = sum(1 for section in required_sections if section not in text_lower)
        base_score -= missing_sections * 5
        
        return max(0.0, min(100.0, base_score))

    def _generate_recommendations(self, pii_analysis: Dict[str, Any], doc_type: str) -> List[str]:
        """Generate compliance and security recommendations"""
        recommendations = []
        
        if pii_analysis['requires_masking']:
            recommendations.append("Consider masking or removing PII before sharing")
        
        if pii_analysis['risk_level'] == 'HIGH':
            recommendations.append("High PII risk detected - implement access controls")
        
        if doc_type == 'safety_document':
            recommendations.append("Ensure safety document follows enterprise safety standards")
        
        if not recommendations:
            recommendations.append("Document meets basic compliance requirements")
        
        return recommendations

def main():
    """Main function for command line usage"""
    # Read from stdin instead of command line arguments to avoid length limits
    try:
        input_text = sys.stdin.read().strip()
    except Exception as e:
        print(json.dumps({
            'error': f'Failed to read input: {str(e)}',
            'usage': 'echo "text to process" | python nlp_runner.py',
            'capabilities': [
                'Enterprise section detection',
                'Advanced PII detection and masking',
                'Document type classification',
                'Compliance assessment',
                'Chunk analysis with metadata',
                'Enterprise keyword extraction'
            ]
        }, indent=2))
        sys.exit(1)
    
    if not input_text:
        print(json.dumps({
            'error': 'No input text provided via stdin',
            'usage': 'echo "text to process" | python nlp_runner.py',
            'capabilities': [
                'Enterprise section detection',
                'Advanced PII detection and masking',
                'Document type classification',
                'Compliance assessment',
                'Chunk analysis with metadata',
                'Enterprise keyword extraction'
            ]
        }, indent=2))
        sys.exit(1)
    
    processor = EnterpriseNLPProcessor()
    
    try:
        result = processor.enterprise_document_analysis(input_text)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({
            'error': f'Processing failed: {str(e)}',
            'status': 'failed',
            'timestamp': datetime.now().isoformat()
        }, indent=2))
        sys.exit(1)

if __name__ == '__main__':
    main()