// test-pmdc-api.js - Run this file directly with Node
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Create cache directory if it doesn't exist
const cacheDir = path.join(__dirname, 'cache/pmdc');
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
    console.log('Created PMDC cache directory');
}

// PMDC number to test
const pmdcNumber = '716293-01-M';

// Clear the cache for this PMDC number
const cacheFile = path.join(cacheDir, `${pmdcNumber}.json`);
if (fs.existsSync(cacheFile)) {
    fs.unlinkSync(cacheFile);
    console.log(`Deleted cached verification for ${pmdcNumber}`);
}

async function verifyPMDC() {
    try {
        console.log(`Testing PMDC API verification for number: ${pmdcNumber}`);
        
        // Prepare the API request
        const apiUrl = 'https://hospitals-inspections.pmdc.pk/api/DRC/GetData';
        
        // Prepare the form data
        const formData = new URLSearchParams();
        formData.append('RegistrationNo', pmdcNumber);
        formData.append('Name', '');
        formData.append('FatherName', '');
        
        console.log('Sending API request to:', apiUrl);
        console.log('Form data:', formData.toString());
        
        // Make the API request
        const response = await axios.post(apiUrl, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
            }
        });
        
        console.log(`API response status: ${response.status}`);
        console.log('API response data:', JSON.stringify(response.data, null, 2));
        
        // Check for successful response with data
        if (response.data && response.data.status === true && response.data.data && response.data.data.length > 0) {
            console.log('Verification successful! Doctor is registered.');
            
            const doctorData = response.data.data[0];
            console.log('Doctor Name:', doctorData.Name);
            console.log('Father Name:', doctorData.FatherName);
            console.log('Status:', doctorData.Status);
            console.log('Registration Type:', doctorData.RegistrationType);
            console.log('Valid Until:', doctorData.ValidUpto);
            
            // Create and save a verification result
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
            
            // Save to cache
            fs.writeFileSync(cacheFile, JSON.stringify(verificationResult, null, 2));
            console.log('Verification result saved to cache');
        } else {
            console.log('API returned no results - doctor not found');
        }
    } catch (error) {
        console.error('API Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
    }
}

// Run the test
verifyPMDC();