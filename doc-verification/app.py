from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import shutil
import numpy as np
import json
import re
from werkzeug.utils import secure_filename
import logging
import traceback
try:
    import pytesseract
    # Comment out the explicit path for now
    # pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    from PIL import Image
    import cv2
    ADVANCED_FEATURES = True
except ImportError:
    ADVANCED_FEATURES = False
    print("Advanced features disabled: Install pytesseract, pillow, and opencv-python for OCR capabilities")

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS to accept requests from all origins with all methods
CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"], 
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], supports_credentials=True)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'analysis_results'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RESULTS_FOLDER'] = RESULTS_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Create necessary folders if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

# Keywords for license verification
LICENSE_KEYWORDS = [
    'license', 'medical', 'practice', 'doctor', 'physician', 'council',
    'board', 'certification', 'certificate', 'registration', 'medicine',
    'practitioner', 'authorized', 'health', 'approved', 'pmdc', 'valid'
]

# Keywords for degree verification
DEGREE_KEYWORDS = [
    'degree', 'university', 'medicine', 'medical', 'doctor', 'graduate',
    'college', 'bachelor', 'master', 'mbbs', 'md', 'science', 'faculty',
    'awarded', 'academic', 'diploma', 'education', 'institution', 'student'
]

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(image_path):
    """Preprocess image for better OCR results"""
    if not ADVANCED_FEATURES:
        return None
        
    try:
        # Load image
        img = cv2.imread(image_path)
        if img is None:
            logger.warning(f"Could not read image: {image_path}")
            return None
            
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply thresholding
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Apply noise removal
        denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
        
        # Save preprocessed image temporarily
        temp_path = f"{image_path}_processed.jpg"
        cv2.imwrite(temp_path, denoised)
        
        return temp_path
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        return None

def extract_text_from_image(image_path):
    """Extract text from image using OCR"""
    if not ADVANCED_FEATURES:
        return "OCR capability not available. Install pytesseract, pillow, and opencv-python."
        
    try:
        # Preprocess image
        processed_path = preprocess_image(image_path)
        if processed_path is None:
            # If preprocessing failed, use original image
            processed_path = image_path
            
        # Extract text using Tesseract OCR
        text = pytesseract.image_to_string(Image.open(processed_path))
        
        # Clean up temp file if it exists
        if processed_path != image_path and os.path.exists(processed_path):
            os.remove(processed_path)
            
        # Clean up text
        text = text.strip().lower()
        # Remove non-alphanumeric characters except for spaces
        text = re.sub(r'[^\w\s]', ' ', text)
        # Replace multiple spaces with a single space
        text = re.sub(r'\s+', ' ', text)
        
        return text
    except Exception as e:
        logger.error(f"Error extracting text from image: {str(e)}")
        return ""

def calculate_keyword_matches(text, keywords):
    """Calculate keyword match percentage in extracted text"""
    if not text:
        return 0, []
        
    text_words = set(text.lower().split())
    matches = [keyword for keyword in keywords if keyword.lower() in text_words or keyword.lower() in text.lower()]
    match_percentage = len(matches) / len(keywords) if keywords else 0
    
    return match_percentage, matches

def verify_document(filepath, document_type, doctor_data=None):
    """
    Enhanced document verification function
    
    Parameters:
    - filepath: Path to the document file
    - document_type: Type of document (license, degree, etc.)
    - doctor_data: Additional doctor information for verification
    
    Returns:
    - Verification result with status and confidence
    """
    logger.info(f"Verifying {document_type} document: {filepath}")
    
    # Create result file path
    result_id = str(uuid.uuid4())
    result_path = os.path.join(app.config['RESULTS_FOLDER'], f"{result_id}_{document_type}.json")
    
    # Select keywords based on document type
    keywords = LICENSE_KEYWORDS if document_type == 'license' else DEGREE_KEYWORDS
    
    # Basic verification - always return pending_review
    basic_result = {
        'status': 'pending_review',
        'confidence': 0.5,
        'method': 'basic',
        'document_type': document_type
    }
    
    # If advanced features are not available, return basic result
    if not ADVANCED_FEATURES:
        basic_result['note'] = "OCR not available. Install dependencies for AI analysis."
        return basic_result
    
    try:
        # Extract text from document
        extracted_text = extract_text_from_image(filepath)
        
        # Check for presence of keywords
        match_percentage, matches = calculate_keyword_matches(extracted_text, keywords)
        
        # Calculate confidence based on match percentage
        confidence = min(0.3 + match_percentage * 0.7, 0.95)  # Max 95% confidence
        
        # Determine status based on confidence
        if confidence >= 0.9:
            status = 'verified'
            method = 'ai_ocr'
        elif confidence >= 0.7:
            status = 'likely_valid'
            method = 'ai_ocr'
        elif confidence >= 0.4:
            status = 'pending_review'
            method = 'ai_ocr'
        else:
            status = 'suspicious'
            method = 'ai_ocr'
        
        # Save analysis results to file
        result = {
            'status': status,
            'confidence': round(confidence, 2),
            'method': method,
            'document_type': document_type,
            'keyword_matches': matches,
            'match_percentage': round(match_percentage, 2),
            'extracted_text': extracted_text[:500],  # First 500 chars
            'doctor_name': doctor_data.get('name', '') if doctor_data else '',
            'document_path': filepath,
            'result_id': result_id
        }
        
        # Save result to file
        with open(result_path, 'w') as f:
            json.dump(result, f, indent=2)
        
        # Return verification result
        return result
    except Exception as e:
        logger.error(f"Error in document verification: {str(e)}")
        logger.error(traceback.format_exc())
        
        # Return basic result in case of error
        basic_result['error'] = str(e)
        return basic_result

@app.route('/api/verify-doctor', methods=['POST', 'OPTIONS'])
def verify_doctor_documents():
    """
    Endpoint to handle doctor document verification
    Expected form data:
    - name: doctor's name
    - email: doctor's email
    - specialization: area of specialization
    - license: medical license document (file)
    - degree: medical degree document (file)
    - profile_photo: profile photo (file)
    """
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        logger.info("Received verification request")
        logger.info(f"Request form data keys: {list(request.form.keys())}")
        logger.info(f"Request files keys: {list(request.files.keys())}")
        
        # Extract form data
        doctor_data = {
            'name': request.form.get('name', ''),
            'email': request.form.get('email', ''),
            'specialization': request.form.get('specialization', ''),
            'phone': request.form.get('phone', '')
        }
        
        logger.info(f"Doctor data received: {doctor_data}")
        
        if not all([doctor_data['name'], doctor_data['email']]):
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        # Process files
        files_data = {}
        verification_results = {}
        
        # Check if files exist in the request
        if not request.files:
            return jsonify({'success': False, 'error': 'No files were uploaded'}), 400
            
        for file_type in ['license', 'degree', 'profile_photo']:
            if file_type not in request.files:
                logger.warning(f"File type {file_type} not found in request.files")
                continue
                
            file = request.files[file_type]
            if file.filename == '':
                logger.warning(f"File {file_type} has empty filename")
                continue
                
            if file and allowed_file(file.filename):
                # Generate unique filename
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                
                # Log file info
                logger.info(f"Saving {file_type} file: {filename} to {filepath}")
                
                # Save file
                file.save(filepath)
                files_data[file_type] = {
                    'original_name': filename,
                    'path': filepath
                }
                
                # Copy file for admin review if it's a credential
                if file_type in ['license', 'degree']:
                    review_copy = os.path.join(app.config['RESULTS_FOLDER'], unique_filename)
                    shutil.copy2(filepath, review_copy)
                    
                    # Verify document
                    verification_result = verify_document(
                        filepath, 
                        document_type=file_type,
                        doctor_data=doctor_data
                    )
                    verification_results[file_type] = verification_result
                    logger.info(f"{file_type.title()} verification result: {verification_result['status']}")
        
        # Determine overall verification status
        overall_status = 'pending_review'
        if all(result.get('status') == 'verified' for result in verification_results.values()):
            overall_status = 'verified'
        elif any(result.get('status') == 'suspicious' for result in verification_results.values()):
            overall_status = 'suspicious'
        
        # Prepare verification summary
        verification_summary = {
            'success': True,
            'doctor_data': doctor_data,
            'verification_results': verification_results,
            'status': overall_status,
            'message': 'Documents have been analyzed using AI technology and are now ready for review.' 
        }
        
        logger.info(f"Verification complete. Status: {verification_summary['status']}")
        return jsonify(verification_summary)
        
    except Exception as e:
        logger.error(f"Error processing verification request: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False, 
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    features_status = "enabled" if ADVANCED_FEATURES else "disabled"
    return jsonify({
        'status': 'healthy',
        'advanced_features': features_status
    })

if __name__ == '__main__':
    logger.info("Starting Flask verification service on port 5001")
    logger.info(f"Advanced features: {'ENABLED' if ADVANCED_FEATURES else 'DISABLED'}")
    
    if not ADVANCED_FEATURES:
        logger.warning("""
        --------------------------------------------------
        Advanced OCR and AI features are DISABLED
        Install the following packages for full functionality:
        - pytesseract
        - pillow
        - opencv-python
        
        Install using:
        pip install pytesseract pillow opencv-python
        
        You also need to install Tesseract OCR:
        - Windows: https://github.com/UB-Mannheim/tesseract/wiki
        - Linux: sudo apt-get install tesseract-ocr
        - Mac: brew install tesseract
        --------------------------------------------------
        """)
    
    app.run(host='0.0.0.0', port=5001, debug=True)