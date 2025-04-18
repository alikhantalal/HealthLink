// Doctor data processors and helpers

/**
 * Process doctor data to ensure consistent format
 * @param {Object} doctorData Raw doctor data from API
 * @returns {Object} Normalized doctor data
 */
export const processDoctor = (doctorData) => {
    if (!doctorData) return null;
    
    // Ensure qualification is always an array
    let qualifications = [];
    
    if (doctorData.qualification) {
      if (typeof doctorData.qualification === 'string') {
        // If it's a comma-separated string
        qualifications = doctorData.qualification.split(',').map(q => q.trim());
      } else if (Array.isArray(doctorData.qualification)) {
        qualifications = doctorData.qualification;
      }
    }
    
    // Check for qualification in other potential fields
    if (qualifications.length === 0) {
      if (doctorData.qualifications && Array.isArray(doctorData.qualifications)) {
        qualifications = doctorData.qualifications;
      } else if (doctorData['qualifications[0]']) {
        qualifications.push(doctorData['qualifications[0]']);
        if (doctorData['qualifications[1]']) {
          qualifications.push(doctorData['qualifications[1]']);
        }
      }
    }
    
    // If we still don't have qualifications, use specialization
    if (qualifications.length === 0 && doctorData.specialization) {
      qualifications.push(doctorData.specialization);
    }
    
    // Process links if they exist
    let links = [];
    if (doctorData.links) {
      if (typeof doctorData.links === 'string') {
        links = doctorData.links.split(',').map(link => link.trim());
      } else if (Array.isArray(doctorData.links)) {
        links = doctorData.links;
      }
    }
    
    // Process services if they exist
    let services = [];
    if (doctorData.Services) {
      if (typeof doctorData.Services === 'string') {
        services = doctorData.Services.split(',').map(service => service.trim());
      } else if (Array.isArray(doctorData.Services)) {
        services = doctorData.Services;
      }
    }
    
    // Process reviews
    let reviews = [];
    if (doctorData.Reviews || doctorData.Review || doctorData.Reviewa) {
      const reviewText = doctorData.Reviews || doctorData.Review || doctorData.Reviewa;
      if (typeof reviewText === 'string') {
        reviews.push({
          text: reviewText,
          rating: 5,
          author: "Patient",
          date: "Recent"
        });
      }
    }
    
    // If no reviews, add some placeholder reviews
    if (reviews.length === 0) {
      reviews = generatePlaceholderReviews(doctorData.name);
    }
    
    // Ensure profile and profile_link are properly set
    const profile = doctorData.profile || doctorData.profile_link || '';
    
    return {
      ...doctorData,
      qualification: qualifications,
      links: links,
      services: services,
      reviews: reviews,
      profile: profile
    };
  };
  
  /**
   * Generate placeholder reviews for doctors without reviews
   * @param {string} doctorName The doctor's name
   * @returns {Array} Array of review objects
   */
  export const generatePlaceholderReviews = (doctorName) => {
    return [
      {
        text: `Dr. ${doctorName?.split(' ')[0] || 'The doctor'} was very professional and thorough. Highly recommended! The clinic was clean and the staff was friendly. I was seen on time and didn't have to wait long.`,
        rating: 5,
        author: "Anonymous Patient",
        date: "2 months ago"
      },
      {
        text: `Good experience with the doctor. Explained everything clearly and provided effective treatment. Would definitely recommend to family and friends.`,
        rating: 4,
        author: "Anonymous",
        date: "3 months ago"
      },
      {
        text: `Very knowledgeable doctor who took the time to understand my concerns. The appointment was not rushed and all my questions were answered.`,
        rating: 5,
        author: "Verified Patient",
        date: "1 month ago",
        verified: true
      }
    ];
  };
  
  /**
   * Generate initials from doctor's name
   * @param {string} name Doctor's full name
   * @returns {string} Initials (up to 2 characters)
   */
  export const getInitials = (name) => {
    if (!name) return 'DR';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };
  
  /**
   * Calculate the year the doctor started their career based on experience
   * @param {Object} doctor Doctor data object
   * @returns {number} Year the doctor started practicing
   */
  export const calculateCareerStart = (doctor) => {
    if (!doctor || !doctor.experience) return new Date().getFullYear() - 5;
    
    const currentYear = new Date().getFullYear();
    const experience = typeof doctor.experience === 'number' 
      ? doctor.experience 
      : parseInt(doctor.experience, 10) || 5;
      
    return currentYear - experience;
  };
  
  /**
   * Generate services based on doctor specialty
   * @param {string} specialty The doctor's specialty/specialization
   * @returns {Array} Array of service strings
   */
  export const generateServicesFromSpecialty = (specialty) => {
    const lowerSpecialty = specialty.toLowerCase();
    
    // Return specific services based on common specialties
    if (lowerSpecialty.includes('cardio')) {
      return [
        'Cardiac Consultation',
        'ECG Analysis',
        'Heart Disease Management',
        'Blood Pressure Management',
        'Cholesterol Management',
        'Heart Failure Treatment'
      ];
    } else if (lowerSpecialty.includes('derma')) {
      return [
        'Skin Disease Diagnosis',
        'Acne Treatment',
        'Eczema Management',
        'Skin Cancer Screening',
        'Psoriasis Treatment',
        'Cosmetic Consultation'
      ];
    } else if (lowerSpecialty.includes('ortho')) {
      return [
        'Joint Pain Treatment',
        'Fracture Management',
        'Sports Injuries',
        'Arthritis Treatment',
        'Back Pain Management',
        'Rehabilitation Planning'
      ];
    } else if (lowerSpecialty.includes('gastro')) {
      return [
        'Digestive Problem Diagnosis',
        'Colonoscopy',
        'IBS Management',
        'Liver Disease Treatment',
        'Acid Reflux Treatment',
        'Stomach Pain Diagnosis'
      ];
    } else if (lowerSpecialty.includes('neuro')) {
      return [
        'Headache Treatment',
        'Seizure Management',
        'Stroke Rehabilitation',
        'Memory Disorder Evaluation',
        'Nerve Pain Treatment',
        'Movement Disorder Management'
      ];
    } else if (lowerSpecialty.includes('eye') || lowerSpecialty.includes('ophthal')) {
      return [
        'Vision Testing',
        'Eye Disease Diagnosis',
        'Glaucoma Screening',
        'Cataract Evaluation',
        'LASIK Consultation',
        'Contact Lens Fitting'
      ];
    } else if (lowerSpecialty.includes('dent')) {
      return [
        'Dental Check-up',
        'Teeth Cleaning',
        'Cavity Treatment',
        'Root Canal',
        'Teeth Whitening',
        'Dental Emergency Care'
      ];
    }
    
    // Default for general practitioners
    return [
      'General Consultation',
      'Preventive Health Check',
      'Chronic Disease Management',
      'Vaccination Services',
      'Health Screening',
      'Medical Certificates'
    ];
  };
  
  /**
   * Generate description for a specific service
   * @param {string} service The service name
   * @returns {string} Service description
   */
  export const generateServiceDescription = (service) => {
    const serviceDescriptions = {
      // Cardiology
      'Cardiac Consultation': 'Comprehensive evaluation of heart health and cardiovascular system.',
      'ECG Analysis': 'Interpretation of electrocardiogram results to detect heart abnormalities.',
      'Heart Disease Management': 'Ongoing care and treatment plans for patients with heart conditions.',
      'Blood Pressure Management': 'Monitoring and treatment strategies for hypertension.',
      'Cholesterol Management': 'Assessment and treatment of cholesterol levels to reduce heart disease risk.',
      'Heart Failure Treatment': 'Specialized care for patients with heart failure conditions.',
      
      // Dermatology
      'Skin Disease Diagnosis': 'Identification and treatment plans for various skin conditions.',
      'Acne Treatment': 'Personalized treatment options for acne and related skin issues.',
      'Eczema Management': 'Care plans for managing eczema symptoms and flare-ups.',
      'Skin Cancer Screening': 'Examination of suspicious skin lesions for early cancer detection.',
      'Psoriasis Treatment': 'Treatment options for managing psoriasis symptoms.',
      'Cosmetic Consultation': 'Advice on cosmetic procedures for skin enhancement.',
      
      // General Services
      'General Consultation': 'Comprehensive medical evaluation, diagnosis and treatment planning.',
      'Preventive Health Check': 'Regular screening to detect potential health issues before they become serious.',
      'Chronic Disease Management': 'Ongoing care for long-term health conditions with regular monitoring.',
      'Vaccination Services': 'Protection against common infectious diseases through immunization.',
      'Health Screening': 'Comprehensive tests to evaluate overall health status and identify risk factors.',
      'Medical Certificates': 'Official documentation for work, school, or travel purposes.',
      
      // Default description for any other service
      'default': 'Professional medical care provided by our experienced healthcare team.'
    };
    
    return serviceDescriptions[service] || serviceDescriptions['default'];
  };