"""
LLM service for structured medical information extraction using OpenAI
"""
# import boto3
import json
# from botocore.exceptions import ClientError
from openai import OpenAI
from app.config import settings
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)


class LLMService:
    """Service for OpenAI LLM operations"""
    
    def __init__(self):
        """Initialize OpenAI client"""
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model
        logger.info(f"Initialized LLM service with OpenAI model: {self.model}")
    
    def extract_structured_data(self, raw_text: str) -> Optional[Dict]:
        """
        Extract structured medical information from raw text using OpenAI
        
        Args:
            raw_text: Raw text extracted from medical document
            
        Returns:
            Dictionary containing structured medical data, or None if extraction fails
        """
        try:
            logger.info("Starting LLM structured extraction with OpenAI")
            
            # Construct the extraction prompt
            prompt = self._build_extraction_prompt(raw_text)
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a medical information extraction system. Extract structured data from medical documents and return ONLY valid JSON, no commentary."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0,  # Deterministic output
                response_format={"type": "json_object"}  # Force JSON response
            )
            
            # Parse response
            extracted_text = response.choices[0].message.content
            
            logger.info(f"LLM extraction completed. Response length: {len(extracted_text)} chars")
            
            # Parse JSON from response
            json_text = self._extract_json_from_response(extracted_text)
            structured_data = json.loads(json_text)
            
            logger.info("Successfully parsed structured data from LLM response")
            return structured_data
            
        except Exception as e:
            error_msg = f"OpenAI extraction failed: {str(e)}"
            logger.error(error_msg)
            logger.error(f"Model: {self.model}")
            return None
    
    def _build_extraction_prompt(self, raw_text: str) -> str:
        """
        Build the extraction prompt with strict instructions
        
        Args:
            raw_text: Raw text from document
            
        Returns:
            Formatted prompt string
        """
        prompt = f"""You are a medical information extraction system. Extract structured data from the following medical document text.

STRICT RULES:
1. Return ONLY valid JSON, no commentary, no markdown formatting
2. Extract only the fields defined in the schema below
3. If a field is missing from the document, use null
4. Do NOT hallucinate or infer ICD codes - only include if explicitly stated
5. Do NOT assume chronic conditions - only mark chronic: true if explicitly stated
6. All dates MUST be in ISO format YYYY-MM-DD
7. All IDs (patient_id, encounter_id, claim_id) are REQUIRED - if missing, try to infer from document numbers/codes
8. If you cannot find required IDs, generate them in format: PATIENT_XXX, ENCOUNTER_XXX, CLAIM_XXX where XXX is derived from document

REQUIRED JSON SCHEMA:
{{
  "patient": {{
    "patient_id": "string (REQUIRED)",
    "name": "string or null",
    "dob": "YYYY-MM-DD or null",
    "gender": "M/F/Other or null",
    "insurance_policy_id": "string or null"
  }},
  "encounter": {{
    "encounter_id": "string (REQUIRED)",
    "admission_date": "YYYY-MM-DD or null",
    "discharge_date": "YYYY-MM-DD or null",
    "visit_type": "inpatient/outpatient/emergency or null",
    "department": "string or null"
  }},
  "claim": {{
    "claim_id": "string (REQUIRED)",
    "claim_amount": number or null,
    "approved_amount": number or null,
    "status": "submitted/approved/rejected/pending or null",
    "insurer_name": "string or null",
    "submission_date": "YYYY-MM-DD or null"
  }},
  "conditions": [
    {{
      "condition_name": "string (REQUIRED)",
      "icd_code": "string or null (only if explicitly stated)",
      "chronic": boolean or null (only true if explicitly stated as chronic)
    }}
  ],
  "hospital": {{
    "hospital_id": "string or null",
    "name": "string or null",
    "city": "string or null"
  }}
}}

DOCUMENT TEXT:
{raw_text}

Return ONLY the JSON object, nothing else:"""
        
        return prompt
    
    def _extract_json_from_response(self, response_text: str) -> str:
        """
        Extract JSON from LLM response, handling markdown code blocks
        
        Args:
            response_text: Raw response from LLM
            
        Returns:
            Clean JSON string
        """
        # Remove markdown code blocks if present
        text = response_text.strip()
        
        # Remove ```json and ``` markers
        if text.startswith('```json'):
            text = text[7:]  # Remove ```json
        elif text.startswith('```'):
            text = text[3:]  # Remove ```
        
        if text.endswith('```'):
            text = text[:-3]  # Remove trailing ```
        
        return text.strip()


# Global LLM service instance
llm_service = LLMService()
