const mongoose = require('mongoose');

const fraudConfigSchema = new mongoose.Schema({
  threshold: {
    type: Number,
    default: 40,
    min: 0,
    max: 100
  },
  autoApproveLimit: {
    type: Number,
    default: 10000
  },
  highRiskAmountThreshold: {
    type: Number,
    default: 50000
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('FraudConfig', fraudConfigSchema);
