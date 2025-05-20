const express = require('express');
const connectToMongo = require('./db');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs-extra'); // Add this import for fs-extra

// Create the Express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());

// Updated middleware configuration for better form handling
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); // For PDF generation

// Increase payload size limit for all routes
app.use(bodyParser.json({ limit: '50mb' }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// PDF Generation Route
app.post('/api/generate-appointment-pdf', (req, res) => {
  try {
    // Extract appointment data from request body
    const {
      doctorName,
      doctorSpecialty,
      patientName,
      patientEmail,
      patientPhone,
      appointmentDate,
      appointmentTime,
      reason,
      fee,
      clinicAddress,
      notes
    } = req.body;

    // Import PDFDocument only when needed
    const PDFDocument = require('pdfkit');

    // Format date for display
    const formattedDate = appointmentDate ? new Date(appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Not specified';

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=HealthLink_Appointment_${patientName ? patientName.replace(/\s+/g, '_') : 'Patient'}.pdf`);

    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: 'HealthLink Appointment Confirmation',
        Author: 'HealthLink Medical Center'
      }
    });

    // Pipe the PDF directly to the response
    doc.pipe(res);

    // Add document styling and content
    // Header
    doc.fontSize(22).fill('#0066cc').font('Helvetica-Bold').text('HealthLink', { align: 'center' });
    doc.fontSize(18).text('Appointment Confirmation', { align: 'center' });
    
    // Appointment ID
    doc.fontSize(10).fill('#646464').font('Helvetica').text(
      `Appointment ID: AP${Date.now().toString().slice(-8)}`, 
      { align: 'center' }
    );
    
    // Decorative line
    doc.moveDown(1);
    doc.strokeColor('#0066cc').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Doctor Information Section
    doc.fontSize(14).fill('#0066cc').font('Helvetica-Bold').text('Doctor Information');
    doc.moveDown(0.5);
    doc.fontSize(12).fill('#000000');
    doc.font('Helvetica-Bold').text('Doctor:', 50, doc.y);
    doc.font('Helvetica').text(`Dr. ${doctorName || 'Not specified'}`, 150, doc.y);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Specialty:', 50, doc.y);
    doc.font('Helvetica').text(`${doctorSpecialty || 'Not specified'}`, 150, doc.y);
    doc.moveDown(1);

    // Patient Information Section
    doc.fontSize(14).fill('#0066cc').font('Helvetica-Bold').text('Patient Information');
    doc.moveDown(0.5);
    doc.fontSize(12).fill('#000000');
    doc.font('Helvetica-Bold').text('Name:', 50, doc.y);
    doc.font('Helvetica').text(`${patientName || 'Not specified'}`, 150, doc.y);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Email:', 50, doc.y);
    doc.font('Helvetica').text(`${patientEmail || 'Not specified'}`, 150, doc.y);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Phone:', 50, doc.y);
    doc.font('Helvetica').text(`${patientPhone || 'Not specified'}`, 150, doc.y);
    doc.moveDown(1);

    // Appointment Details Section
    doc.fontSize(14).fill('#0066cc').font('Helvetica-Bold').text('Appointment Details');
    doc.moveDown(0.5);
    doc.fontSize(12).fill('#000000');
    doc.font('Helvetica-Bold').text('Date:', 50, doc.y);
    doc.font('Helvetica').text(`${formattedDate}`, 150, doc.y);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Time:', 50, doc.y);
    doc.font('Helvetica').text(`${appointmentTime || 'Not specified'}`, 150, doc.y);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Reason:', 50, doc.y);
    doc.font('Helvetica').text(`${reason || 'Consultation'}`, 150, doc.y);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Fee:', 50, doc.y);
    doc.font('Helvetica').text(`Rs. ${fee || '3999'}`, 150, doc.y);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Location:', 50, doc.y);
    doc.font('Helvetica').text(`${clinicAddress || 'HealthLink Medical Center, Islamabad'}`, 150, doc.y);
    
    // Notes if available
    if (notes) {
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Notes:', 50, doc.y);
      doc.font('Helvetica').text(`${notes}`, 150, doc.y);
    }
    doc.moveDown(1.5);

    // Important Information Box
    const boxY = doc.y;
    doc.rect(50, boxY, 500, 80).fillAndStroke('#f0f8ff', '#0066cc');
    doc.fill('#0066cc').font('Helvetica-Bold').text('Important Information:', 60, boxY + 10);
    doc.fill('#000000').font('Helvetica').text(
      '• Please arrive 15 minutes before your scheduled appointment time.\n' +
      '• Bring this appointment confirmation with you (printed or digital).\n' +
      '• Bring any relevant medical records, test results, or prescriptions.',
      60, boxY + 30
    );
    doc.moveDown(4);

    // Footer
    doc.fontSize(9).fill('#646464').font('Helvetica').text(
      'HealthLink - Your Health, Our Priority', 
      { align: 'center' }
    );
    doc.text(
      'Contact: support@healthlink.com | Helpline: 0800-12345', 
      { align: 'center' }
    );
    doc.text(
      `Generated on: ${new Date().toLocaleString()}`, 
      { align: 'center' }
    );

    // Add border around the page
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#0066cc');

    // Finalize the PDF
    doc.end();

    console.log("PDF generated successfully");
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF. Please try again.");
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HealthLink API is running...',
    timestamp: new Date().toISOString()
  });
});

// Create necessary directories
const createDirectories = async () => {
  try {
    // Create services directory if it doesn't exist
    const servicesDir = path.join(__dirname, 'services');
    if (!fs.existsSync(servicesDir)) {
      fs.mkdirSync(servicesDir, { recursive: true });
      console.log('Created services directory');
    }

    // Create cache directory for PMDC verifications
    const cacheDir = path.join(__dirname, 'cache/pmdc');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
      console.log('Created PMDC cache directory');
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('Created uploads directory');
    }
  } catch (error) {
    console.error('Error creating directories:', error);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize the server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    console.log('Connecting to MongoDB...');
    await connectToMongo();
    console.log('MongoDB connection established successfully');
    
    // Wait a moment for the connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create necessary directories
    await createDirectories();
    
    // NOW load routes (after MongoDB connection is established)
    // This ensures models are only loaded after MongoDB is connected
    console.log('Loading routes...');
    app.use('/api/auth', require('./routes/authentication'));
    app.use('/api/doctor-registration', require('./routes/doctor-registration'));
    app.use('/api/doctors', require('./routes/doctors'));
    app.use('/api/fetchdoctorsdata', require('./routes/fetchdoctorsdata'));
    app.use('/api/chatbot', require('./routes/chatbot'));
    app.use('/api/appointments', require('./routes/appointments'));
    app.use('/api/doctor-profile', require('./routes/doctor-profile'));
    app.use('/api/admin', require('./routes/admin'));
    app.use('/api/pmdc-verification', require('./routes/pmdc-verification'));
    console.log('Routes loaded successfully');
    
    // Start the server only after successful DB connection and route loading
    app.listen(port, () => {
      console.log(`HealthLink Server listening on port ${port}`);
      console.log('All systems ready!');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    console.error('Please check your MongoDB connection settings');
    process.exit(1);
  }
};

// Start the server
startServer();