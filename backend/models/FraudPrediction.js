const mongoose = require('mongoose');

const reasonSchema = new mongoose.Schema({
  code: String,
  title: String,
  description: String,
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  }
}, { _id: false });

const fraudPredictionSchema = new mongoose.Schema({
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  riskScore: {
    type: Number,
    required: true
  },
  fraudProbability: {
    type: Number,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    required: true
  },
  prediction: {
    type: String,
    enum: ['FRAUD', 'GENUINE'],
    required: true
  },
  reasons: [reasonSchema],
  rawFeatures: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('FraudPrediction', fraudPredictionSchema);
