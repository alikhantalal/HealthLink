const mongoose = require('mongoose');
const { Schema } = mongoose;

const UnverifiedDoctorSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  qualification: {
    type: [String],
    default: []
  },
  experience: {
    type: Number,
    required: true
  },
  fee: {
    type: Number,
    required: true
  },
  pmdc: {  // Added PMDC field
    type: String,
    required: true  // Make it required for new records
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  profile_photo: {
    type: String,
    default: ''
  },
  verification_status: {
    type: String,
    enum: ['pending', 'pending_approval', 'approved', 'rejected', 'suspicious'],
    default: 'pending'
  },
  documents: {
    license: {
      type: String,
      required: true
    },
    degree: {
      type: String,
      required: true
    }
  },
  submitted_at: {
    type: Date,
    default: Date.now
  },
  reviewed_at: {
    type: Date,
    default: null
  },
  admin_notes: {
    type: String,
    default: ''
  },
  ai_analysis_results: {
    type: Schema.Types.Mixed,
    default: {
      success: true,
      status: 'pending_review',
      message: 'Documents are pending review by our team.'
    }
  }
});

module.exports = mongoose.model('unverified_doctor', UnverifiedDoctorSchema);