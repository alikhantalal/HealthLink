const tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');

// Keywords for license verification
const LICENSE_KEYWORDS = [
    'license', 'medical', 'practice', 'doctor', 'physician', 'council',
    'board', 'certification', 'certificate', 'registration', 'medicine',
    'practitioner', 'authorized', 'health', 'approved', 'pmdc', 'valid'
];

// Keywords for degree verification
const DEGREE_KEYWORDS = [
    'degree', 'university', 'medicine', 'medical', 'doctor', 'graduate',
    'college', 'bachelor', 'master', 'mbbs', 'md', 'science', 'faculty',
    'awarded', 'academic', 'diploma', 'education', 'institution', 'student'
];

// Function to preprocess an image for better OCR results
async function preprocessImage(imagePath) {
    try {
        const outputPath = `${imagePath}_processed.jpg`;
        
        // Use sharp to enhance the image
        await sharp(imagePath)
            .greyscale() // Convert to grayscale
            .normalize() // Normalize image contrast
            .sharpen() // Sharpen the image
            .toFile(outputPath);
            
        return outputPath;
    } catch (error) {
        console.error('Error preprocessing image:', error);
        return imagePath; // Return original if processing fails
    }
}

// Extract text from an image using Tesseract OCR
async function extractTextFromImage(imagePath) {
    try {
        console.log(`Extracting text from: ${imagePath}`);
        
        // Preprocess the image
        const processedPath = await preprocessImage(imagePath);
        
        // Run OCR
        const result = await tesseract.recognize(processedPath, 'eng');
        
        // Clean up processed image if it's different from original
        if (processedPath !== imagePath) {
            await fs.remove(processedPath);
        }
        
        // Clean up text
        let text = result.data.text.toLowerCase().trim();
        // Remove special characters and extra spaces
        text = text.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
        
        console.log(`Text extracted (sample): ${text.substring(0, 100)}...`);
        return text;
    } catch (error) {
        console.error('Error extracting text:', error);
        return '';
    }
}

// Calculate keyword matches in the extracted text
function calculateKeywordMatches(text, keywords) {
    if (!text) return { percentage: 0, matches: [] };
    
    const textWords = new Set(text.toLowerCase().split(' '));
    const matches = keywords.filter(keyword => 
        textWords.has(keyword.toLowerCase()) || text.includes(keyword.toLowerCase())
    );
    
    const percentage = matches.length / keywords.length;
    
    return {
        percentage,
        matches
    };
}

// Check verification cache
async function checkVerificationCache(pmdcNumber) {
    try {
        // Simple file-based cache
        const cacheDir = path.join(__dirname, '../cache/pmdc');
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        
        const cacheFile = path.join(cacheDir, `${pmdcNumber}.json`);
        
        if (fs.existsSync(cacheFile)) {
            const stat = fs.statSync(cacheFile);
            const fileAge = Date.now() - stat.mtimeMs;
            
            // Use cache if less than 30 days old
            if (fileAge < 30 * 24 * 60 * 60 * 1000) {
                console.log(`Using cached verification for PMDC #${pmdcNumber}`);
                const cachedData = fs.readFileSync(cacheFile, 'utf8');
                return JSON.parse(cachedData);
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error checking verification cache:', error);
        return null;
    }
}

// Save verification result to cache
async function cacheVerificationResult(pmdcNumber, result) {
    try {
        // File-based cache
        const cacheDir = path.join(__dirname, '../cache/pmdc');
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        
        const cacheFile = path.join(cacheDir, `${pmdcNumber}.json`);
        fs.writeFileSync(cacheFile, JSON.stringify(result));
        
        console.log(`Cached verification result for PMDC #${pmdcNumber}`);
    } catch (error) {
        console.error('Error caching verification result:', error);
    }
}

// Verify PMDC registration using the PMDC API
async function verifyPmdcRegistration(pmdcNumber) {
    console.log(`Verifying PMDC registration: ${pmdcNumber}`);
    
    if (!pmdcNumber || pmdcNumber.trim() === '') {
        console.error('Empty PMDC number provided');
        return {
            pmdc_verified: false,
            status: 'rejected',
            message: 'PMDC registration number is required',
            verification_source: 'Validation',
            verification_time: new Date().toISOString()
        };
    }
    
    // Check cache first
    const cachedResult = await checkVerificationCache(pmdcNumber);
    if (cachedResult) {
        return cachedResult;
    }
    
    // Define retry settings
    const maxRetries = 3;
    let retries = 0;
    
    while (retries < maxRetries) {
        try {
            console.log(`API verification attempt ${retries + 1} for PMDC: ${pmdcNumber}`);
            
            // Use the PMDC API directly
            const apiUrl = 'https://hospitals-inspections.pmdc.pk/api/DRC/GetData';
            
            // Prepare the form data
            const formData = new URLSearchParams();
            formData.append('RegistrationNo', pmdcNumber);
            formData.append('Name', ''); // We can leave Name and FatherName empty
            formData.append('FatherName', '');
            
            console.log("Sending API request with data:", formData.toString());
            
            // Make the API request
            const response = await axios.post(apiUrl, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
                }
            });
            
            console.log(`API response status: ${response.status}`);
            
            // Check if the API response was successful
            if (response.status === 200) {
                console.log('API response data:', JSON.stringify(response.data, null, 2));
                
                // The API returns a different format than expected. It has a nested data property
                if (response.data && response.data.status === true && response.data.data && response.data.data.length > 0) {
                    const doctorData = response.data.data[0];
                    console.log("Doctor data found:", doctorData);
                    
                    // Create the verification result
                    const verificationResult = {
                        pmdc_verified: true,
                        status: 'verified',
                        doctor_name: doctorData.Name || 'Name not provided',
                        father_name: doctorData.FatherName || '',
                        license_status: doctorData.Status === 'ACTIVE' ? 'active' : 'unknown',
                        registration_type: doctorData.RegistrationType || '',
                        registration_date: doctorData.RegistrationDate || '',
                        valid_until: doctorData.ValidUpto || '',
                        verification_source: 'PMDC API',
                        verification_time: new Date().toISOString(),
                        pmdc_number: pmdcNumber
                    };
                    
                    // Cache the result
                    await cacheVerificationResult(pmdcNumber, verificationResult);
                    
                    return verificationResult;
                } else {
                    console.log('No doctor found with the provided PMDC number');
                    
                    // Not found
                    const verificationResult = {
                        pmdc_verified: false,
                        status: 'rejected',
                        message: 'PMDC registration number not found or invalid',
                        verification_source: 'PMDC API',
                        verification_time: new Date().toISOString(),
                        pmdc_number: pmdcNumber
                    };
                    
                    // Cache the negative result
                    await cacheVerificationResult(pmdcNumber, verificationResult);
                    
                    return verificationResult;
                }
            } else {
                throw new Error(`API request failed with status: ${response.status}`);
            }
        } catch (error) {
            retries++;
            console.error(`PMDC API verification attempt ${retries} failed:`, error.message);
            
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            
            // If API fails after max retries, fall back to pending review
            if (retries >= maxRetries) {
                console.error(`Maximum API retries (${maxRetries}) reached, falling back to pending review`);
                
                return {
                    pmdc_verified: false,
                    status: 'pending_review',
                    message: 'PMDC verification could not be completed automatically. Manual review required.',
                    verification_source: 'System',
                    verification_time: new Date().toISOString(),
                    pmdc_number: pmdcNumber,
                    error: error.message
                };
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 2000 * retries));
        }
    }
}

// Extract PMDC number from text (helper function)
function extractPmdcNumber(text) {
    // Look for patterns that might be PMDC numbers
    // This is a simplified pattern - adjust based on actual PMDC number format
    const pmdcPattern = /[a-z]*-?\d{3,7}-?[a-z]?/gi;
    const matches = text.match(pmdcPattern);
    
    if (matches && matches.length > 0) {
        // Get the first match that looks like a PMDC number
        // You may need to improve this logic based on actual PMDC number format
        for (const match of matches) {
            // Clean up the match
            const cleaned = match.replace(/[^a-z0-9]/gi, '');
            if (cleaned.length >= 5 && cleaned.length <= 10) {
                return cleaned;
            }
        }
    }
    
    return null;
}

// Verify a document using combined OCR and PMDC verification
async function verifyDocument(filePath, documentType, doctorData = {}) {
    try {
        console.log(`Verifying ${documentType} document: ${filePath}`);
        
        // Select the appropriate keywords based on document type
        const keywords = documentType === 'license' ? LICENSE_KEYWORDS : DEGREE_KEYWORDS;
        
        // Extract text from the document
        const extractedText = await extractTextFromImage(filePath);
        
        if (!extractedText) {
            return {
                status: 'pending_review',
                confidence: 0.5,
                method: 'basic',
                document_type: documentType,
                message: 'Could not extract text from document'
            };
        }
        
        // Calculate keyword matches
        const { percentage, matches } = calculateKeywordMatches(extractedText, keywords);
        
        // Calculate confidence based on match percentage
        const confidence = Math.min(0.3 + percentage * 0.7, 0.95);
        
        // Default result based on OCR
        let status, method;
        if (confidence >= 0.9) {
            status = 'verified';
            method = 'ai_ocr';
        } else if (confidence >= 0.7) {
            status = 'likely_valid';
            method = 'ai_ocr';
        } else if (confidence >= 0.4) {
            status = 'pending_review';
            method = 'ai_ocr';
        } else {
            status = 'suspicious';
            method = 'ai_ocr';
        }
        
        // Create initial result object
        let result = {
            status,
            confidence: parseFloat(confidence.toFixed(2)),
            method,
            document_type: documentType,
            keyword_matches: matches,
            match_percentage: parseFloat(percentage.toFixed(2)),
            extracted_text_sample: extractedText.substring(0, 500),
            doctor_name: doctorData.name || '',
        };
        
        // If it's a license document and we have PMDC number, try to verify with PMDC API
        if (documentType === 'license' && doctorData) {
            try {
                // Get PMDC number - either from doctorData or try to extract from text
                let pmdcNumber = doctorData.pmdc;
                
                // If not provided in doctor data, try to extract from the document
                if (!pmdcNumber) {
                    pmdcNumber = extractPmdcNumber(extractedText);
                }
                
                console.log("PMDC number for verification:", pmdcNumber);
                
                if (pmdcNumber) {
                    // Verify with PMDC API
                    const pmdcVerification = await verifyPmdcRegistration(pmdcNumber);
                    
                    // Add PMDC verification result
                    result.pmdc_verification = pmdcVerification;
                    
                    // If PMDC verification was successful, update status and confidence
                    if (pmdcVerification.pmdc_verified) {
                        result.status = pmdcVerification.status;
                        result.confidence = 0.95; // High confidence for PMDC verification
                        result.method = 'pmdc_api_verification';
                    }
                } else {
                    console.log("No PMDC number found for verification");
                }
            } catch (pmdcError) {
                console.error(`PMDC verification error: ${pmdcError.message}`);
                // Continue with OCR result, but note the PMDC verification failure
                result.pmdc_verification_error = pmdcError.message;
            }
        }
        
        return result;
    } catch (error) {
        console.error(`Error verifying document: ${error.message}`);
        
        // Return basic result in case of error
        return {
            status: 'pending_review',
            confidence: 0.5,
            method: 'basic',
            document_type: documentType,
            error: error.message
        };
    }
}

// Export functions
module.exports = {
    verifyDocument,
    verifyPmdcRegistration,
    extractTextFromImage,
    extractPmdcNumber
};