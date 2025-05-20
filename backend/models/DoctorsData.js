const mongoose = require('mongoose');
const { Schema } = mongoose;

const DoctorSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true
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
  profile: {
    type: String,
    default: ''
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  about: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: 'Islamabad'
  },
  // Using a function to create a fresh object for each new document
  availability: {
    type: Object,
    default: function() {
      return {
        monday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
        tuesday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
        wednesday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
        thursday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
        friday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM', '05:00 PM - 08:00 PM'] },
        saturday: { isAvailable: true, slots: ['09:00 AM - 12:00 PM'] },
        sunday: { isAvailable: false, slots: [] }
      };
    }
  },
  reviews: {
    type: [
      {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: 'user'
        },
        rating: {
          type: Number,
          required: true
        },
        comment: {
          type: String
        },
        created_at: {
          type: Date,
          default: Date.now
        }
      }
    ],
    default: []
  },
  average_rating: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  last_active: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('doctor', DoctorSchema);