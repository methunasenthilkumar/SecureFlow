const mongoose = require('mongoose');

const analystReviewSchema = new mongoose.Schema({
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  },
  analyst: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  decision: {
    type: String,
    enum: ['APPROVED', 'REJECTED'],
    required: true
  },
  notes: {
    type: String,
    required: [true, 'Investigation notes are required']
  },
  reviewedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('AnalystReview', analystReviewSchema);
