const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 1
  },
  senderUpi: {
    type: String,
    required: true
  },
  receiverUpi: {
    type: String,
    required: [true, 'Receiver UPI ID is required']
  },
  receiverName: {
    type: String,
    default: 'UPI Merchant / Contact'
  },
  merchantCategory: {
    type: String,
    enum: ['Peer-to-Peer', 'Retail Stores', 'Utility Bills', 'Gaming & Crypto', 'E-Commerce', 'Financial Services', 'Food & Dining'],
    default: 'Peer-to-Peer'
  },
  location: {
    type: String,
    default: 'Mumbai, India'
  },
  locationDiscrepancy: {
    type: Number,
    default: 0
  },
  deviceId: {
    type: String,
    default: 'DEV-STANDARD-01'
  },
  isNewDevice: {
    type: Number,
    default: 0
  },
  hourOfDay: {
    type: Number,
    default: 14
  },
  paymentType: {
    type: String,
    enum: ['GPay', 'PhonePe', 'Paytm', 'BHIM', 'NetBanking'],
    default: 'GPay'
  },
  status: {
    type: String,
    enum: ['APPROVED', 'PENDING_REVIEW', 'REJECTED', 'PENDING_ANALYSIS'],
    default: 'PENDING_ANALYSIS'
  },
  riskScore: {
    type: Number,
    default: 0
  },
  fraudProbability: {
    type: Number,
    default: 0
  },
  isFraud: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
