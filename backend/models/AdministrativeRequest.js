import mongoose from 'mongoose';

const administrativeRequestSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  templateKey: {
    type: String,
    required: true,
    trim: true
  },
  templateTitle: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'rejected'],
    default: 'draft',
    index: true
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  submittedAt: {
    type: Date,
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewNote: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

administrativeRequestSchema.index({ doctorId: 1, createdAt: -1 });

export default mongoose.model('AdministrativeRequest', administrativeRequestSchema);
