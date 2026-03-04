import mongoose from "mongoose";

const doctorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialtyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialty',
    required: false
  },
  
  // ===== THÔNG TIN CHUYÊN MÔN =====
  licenseNumber: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    trim: true
  },
  experienceYears: {
    type: Number,
    min: 0,
    default: 0
  },
  education: [{
    degree: {
      type: String,
      enum: ['Bachelor', 'Master', 'PhD', 'Specialist']
    },
    university: String,
    major: String,
    graduationYear: Number
  }],
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date
  }],
  languages: [{
    type: String,
    default: ['Tiếng Việt']
  }],
  
  // ===== THÔNG TIN KHÁM =====
  consultationFee: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  
  // ===== LỊCH LÀM VIỆC =====
  workingSchedule: [{
    dayOfWeek: {
      type: Number,
      min: 1,
      max: 7,
      required: true
    },
    timeSlots: [{
      startTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      endTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    }]
  }],
  
  slotDuration: {
    type: Number,
    default: 30,
    min: 15,
    max: 120
  },
  
  // ===== NGÀY NGHỈ =====
  leaves: [{
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    reason: String,
    isApproved: {
      type: Boolean,
      default: true
    }
  }],
  
  // ===== ĐÁNH GIÁ =====
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  
  // ===== TRẠNG THÁI =====
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  isAcceptingPatients: {
    type: Boolean,
    default: true
  },
  
  // ===== THỐNG KÊ =====
  totalAppointments: {
    type: Number,
    default: 0
  },
  completedAppointments: {
    type: Number,
    default: 0
  }
  
}, { 
  timestamps: true 
});

// Index quan trọng
doctorProfileSchema.index({ userId: 1 });
doctorProfileSchema.index({ specialtyId: 1, isVerified: 1 });
doctorProfileSchema.index({ rating: -1 });
doctorProfileSchema.index({ 'workingSchedule.dayOfWeek': 1 });

// Virtual field: completionRate
doctorProfileSchema.virtual('completionRate').get(function() {
  if (this.totalAppointments === 0) return 0;
  return (this.completedAppointments / this.totalAppointments * 100).toFixed(2);
});

export default mongoose.model('DoctorProfile', doctorProfileSchema);