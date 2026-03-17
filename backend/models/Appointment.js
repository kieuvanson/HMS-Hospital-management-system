import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorProfile',
    required: true
  },
  
  // ===== THỜI GIAN =====
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  
  // ===== TRẠNG THÁI =====
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  
  // ===== THÔNG TIN KHÁM =====
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  symptoms: [String],
  notes: {
    type: String,
    maxlength: 1000
  },
  attachments: [{
    type: String // URL file đính kèm
  }],
  
  // ===== DENORMALIZED DATA (để query nhanh) =====
  doctorInfo: {
    userId: mongoose.Schema.Types.ObjectId,
    name: String,
    specialty: String,
    phone: String,
    consultationFee: Number
  },
  patientInfo: {
    name: String,
    phone: String,
    dateOfBirth: Date,
    gender: String
  },
  
  // ===== HỦY LỊCH =====
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  cancelReason: String,
  
  // ===== THỜI GIAN KHÁM =====
  startedAt: Date,
  completedAt: Date,
  
  // ===== KẾT QUẢ KHÁM (sau khi completed) =====
  diagnosis: String,
  prescription: String,
  doctorNotes: String,
  followUpDate: Date,
  followUpInstructions: String,
  
  // ===== THANH TOÁN =====
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  paymentMethod: String,
  paidAt: Date,
  
  // ===== NHẮC NHỞ =====
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: Date
  
}, { 
  timestamps: true 
});

// Unique constraint: không được đặt trùng slot
appointmentSchema.index(
  { 
    doctorId: 1, 
    appointmentDate: 1, 
    appointmentTime: 1 
  },
  { 
    unique: true,
    partialFilterExpression: { 
      status: { $in: ['pending', 'confirmed', 'in_progress'] } 
    }
  }
);

// Index cho query
appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, status: 1 });
appointmentSchema.index({ doctorProfileId: 1, appointmentDate: 1, status: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
appointmentSchema.index({ createdAt: -1 });

export default mongoose.model('Appointment', appointmentSchema);