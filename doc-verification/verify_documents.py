import os
import logging
import pytesseract
# Comment out the explicit path
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
from PIL import Image
import fitz  # PyMuPDF for PDF processing
import numpy as np
import cv2
import re
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from pathlib import Path
import time

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DocVerifier:
    """Class for verifying medical documents using AI techniques"""
    
    def __init__(self):
        """Initialize the document verifier with necessary models"""
        logger.info("Initializing document verifier")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Initialize medical document classification model
        try:
            model_name = "distilbert-base-uncased"  # Replace with specialized model fine-tuned for medical documents
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)
            self.model.to(self.device)
            self.model.eval()
            logger.info(f"Model loaded successfully on {self.device}")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            # Fallback to rule-based verification if model fails to load
            self.model = None
            self.tokenizer = None
            
        # Keywords for rule-based verification
        self.license_keywords = [
            'medical license', 'license to practice', 'medical board', 
            'physician', 'doctor of medicine', 'licensed medical practitioner',
            'medical council', 'state medical board', 'registration number'
        ]
        
        self.degree_keywords = [
            'doctor of medicine', 'md', 'mbbs', 'bachelor of medicine',
            'medical school', 'university', 'college of medicine',
            'school of medicine', 'medical degree', 'graduated'
        ]
        
        # Common OCR errors and corrections
        self.ocr_corrections = {
            'rned|cal': 'medical',
            'l|cense': 'license',
            'docfor': 'doctor',
            'rnedicine': 'medicine',
            'univers|ty': 'university'
        }

    def extract_text_from_image(self, image_path):
        """Extract text from image using OCR"""
        try:
            # Preprocess image for better OCR results
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"Could not read image from {image_path}")
                
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Apply threshold to get black and white image
            _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
            
            # Apply noise removal
            denoised = cv2.fastNlMeansDenoising(thresh, h=10)
            
            # Save preprocessed image temporarily
            temp_path = f"{image_path}_preprocessed.jpg"
            cv2.imwrite(temp_path, denoised)
            
            # Extract text using Tesseract OCR
            text = pytesseract.image_to_string(Image.open(temp_path))
            
            # Clean up temp file
            os.remove(temp_path)
            
            # Apply OCR corrections
            for error, correction in self.ocr_corrections.items():
                text = re.sub(error, correction, text, flags=re.IGNORECASE)
                
            return text
            
        except Exception as e:
            logger.error(f"Error extracting text from image: {str(e)}")
            return ""

    def extract_text_from_pdf(self, pdf_path):
        """Extract text from PDF document"""
        try:
            text = ""
            doc = fitz.open(pdf_path)
            
            # Extract text from each page
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                page_text = page.get_text()
                text += page_text
                
                # If page has no text, it might be a scanned image
                if not page_text.strip():
                    # Extract images from the page
                    image_list = page.get_images(full=True)
                    for img_index, img in enumerate(image_list):
                        xref = img[0]
                        base_image = doc.extract_image(xref)
                        image_bytes = base_image["image"]
                        
                        # Save image temporarily
                        temp_img_path = f"{pdf_path}_page{page_num}_img{img_index}.png"
                        with open(temp_img_path, "wb") as img_file:
                            img_file.write(image_bytes)
                            
                        # Extract text from image
                        img_text = self.extract_text_from_image(temp_img_path)
                        text += img_text
                        
                        # Clean up temp file
                        os.remove(temp_img_path)
            
            return text
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            return ""

    def extract_text(self, document_path):
        """Extract text from document based on file type"""
        file_ext = os.path.splitext(document_path)[1].lower()
        
        if file_ext in ['.pdf']:
            return self.extract_text_from_pdf(document_path)
        elif file_ext in ['.png', '.jpg', '.jpeg']:
            return self.extract_text_from_image(document_path)
        else:
            logger.warning(f"Unsupported file type: {file_ext}")
            return ""

    def verify_with_model(self, text, document_type):
        """Verify document using the ML model"""
        if not self.model or not self.tokenizer:
            logger.warning("Model not available, falling back to rule-based verification")
            return self.verify_with_rules(text, document_type)
            
        try:
            # Prepare text for model
            inputs = self.tokenizer(text, truncation=True, padding=True, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Get model prediction
            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = torch.softmax(outputs.logits, dim=1)
                score = predictions[0][1].item()  # Probability of being a valid document
                
            # Use confidence threshold to determine if verified
            threshold = 0.7  # Can be adjusted based on requirements
            is_verified = score >= threshold
            
            return {
                'status': 'verified' if is_verified else 'pending_review',
                'confidence': score,
                'method': 'ai_model'
            }
            
        except Exception as e:
            logger.error(f"Error in model verification: {str(e)}")
            # Fallback to rule-based verification
            return self.verify_with_rules(text, document_type)

    def verify_with_rules(self, text, document_type):
        """Verify document using rule-based approach"""
        text = text.lower()
        
        # Select keywords based on document type
        keywords = (self.license_keywords if document_type == 'license' 
                    else self.degree_keywords)
        
        # Count how many keywords are found in the text
        matches = sum(1 for keyword in keywords if keyword.lower() in text)
        match_ratio = matches / len(keywords)
        
        # Determine verification status based on match ratio
        if match_ratio >= 0.3:  # At least 30% of keywords should be present
            status = 'verified'
            confidence = match_ratio
        else:
            status = 'pending_review'
            confidence = match_ratio
            
        return {
            'status': status,
            'confidence': confidence,
            'method': 'rule_based',
            'matches': matches,
            'total_keywords': len(keywords)
        }

    def verify_document(self, document_path, document_type, doctor_data=None):
        """
        Verify a medical document
        
        Parameters:
        - document_path: Path to the document file
        - document_type: Type of document (license, degree, etc.)
        - doctor_data: Additional doctor information for verification
        
        Returns:
        - Verification result with status and confidence
        """
        logger.info(f"Verifying {document_type} document: {document_path}")
        
        try:
            # Ensure file exists
            if not os.path.exists(document_path):
                return {
                    'status': 'error',
                    'message': f"File not found: {document_path}"
                }
                
            # Extract text from document
            start_time = time.time()
            extracted_text = self.extract_text(document_path)
            extraction_time = time.time() - start_time
            logger.info(f"Text extraction took {extraction_time:.2f} seconds")
            
            if not extracted_text:
                return {
                    'status': 'pending_review',
                    'message': "Could not extract text from document"
                }
            
            # Perform verification
            start_time = time.time()
            
            # Try AI model verification first
            if self.model and self.tokenizer:
                verification_result = self.verify_with_model(extracted_text, document_type)
            else:
                # Fallback to rule-based verification
                verification_result = self.verify_with_rules(extracted_text, document_type)
                
            verification_time = time.time() - start_time
            logger.info(f"Verification took {verification_time:.2f} seconds")
            
            # Add metadata to result
            verification_result['document_type'] = document_type
            verification_result['extraction_time'] = f"{extraction_time:.2f}s"
            verification_result['verification_time'] = f"{verification_time:.2f}s"
            
            # For debugging, include a sample of extracted text (truncated)
            max_text_sample = 200  # characters
            verification_result['text_sample'] = (extracted_text[:max_text_sample] + '...' 
                                                if len(extracted_text) > max_text_sample 
                                                else extracted_text)
            
            return verification_result
            
        except Exception as e:
            logger.error(f"Error verifying document: {str(e)}")
            return {
                'status': 'error',
                'message': f"Verification failed: {str(e)}"
            }