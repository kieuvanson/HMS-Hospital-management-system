import mongoose from "mongoose";
const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Updated to reference User schema
    required: true
  },
  
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Updated to reference User schema
    required: true
  },
  
  visitDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Lý do khám
  chiefComplaint: {
    type: String,
    required: true
  },
  
  // Triệu chứng
  symptoms: [{
    type: String
  }],
  
  // Dấu hiệu sinh tồn
  vitalSigns: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number
  },
  
  // Chẩn đoán
  diagnosis: {
    type: String,
    required: true
  },
  
  icdCode: {
    type: String
  },
  
  // Tiền sử bệnh
  medicalHistory: {
    type: String
  },
  
  // Dị ứng
  allergies: [{
    type: String
  }],
  
  // Đơn thuốc
  prescription: [{
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication'
    },
    medicationName: {
      type: String,
      required: true
    },
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
    ,
    unitType: {
      type: String,
      enum: ['dose', 'box', 'tablet', 'capsule', 'ml', 'tube', 'vial', 'other'],
      default: 'dose'
    },
    quantity: {
      type: Number,
      min: 1,
      default: 1
    },
    unitPrice: {
      type: Number,
      min: 0,
      default: 0
    },
    totalPrice: {
      type: Number,
      min: 0,
      default: 0
    }
  }],
  
  // Ghi chú của bác sĩ
  notes: {
    type: String
  },
  
  // Kết quả xét nghiệm
  labResults: [{
    testName: String,
    result: String,
    date: Date,
    fileUrl: String
  }],
  
  // Tệp đính kèm (hình ảnh y tế)
  attachments: [{
    fileName: String,
    fileType: String,
    fileUrl: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Ngày tái khám
  followUpDate: {
    type: Date
  },
  
  // Trạng thái
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
  
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

// Index để tìm kiếm nhanh
medicalRecordSchema.index({ patientId: 1, visitDate: -1 });
medicalRecordSchema.index({ doctorId: 1 });
const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
export default MedicalRecord;
