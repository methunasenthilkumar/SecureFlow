const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const FraudPrediction = require('../models/FraudPrediction');
const FraudConfig = require('../models/FraudConfig');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const { predictFraud } = require('../utils/mlClient');
const { logAudit } = require('../utils/logger');
const sendEmail = require('../config/nodemailer');

// Helper to generate transaction ID
const generateTxnId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `UPI-${timestamp}-${randomStr}`;
};

// @route POST /api/transactions
router.post('/', protect, authorize('customer'), async (req, res) => {
  try {
    const {
      amount,
      receiverUpi,
      receiverName,
      merchantCategory,
      location,
      locationDiscrepancy,
      deviceId,
      isNewDevice,
      hourOfDay,
      paymentType
    } = req.body;

    if (!amount || !receiverUpi) {
      return res.status(400).json({ success: false, message: 'Amount and Receiver UPI ID are required' });
    }

    const currentHour = (hourOfDay !== undefined && hourOfDay !== null) ? Number(hourOfDay) : new Date().getHours();
    const locDisc = locationDiscrepancy ? 1 : 0;
    const newDev = isNewDevice ? 1 : 0;

    // Check user transaction history to calculate velocity and avg amount ratio
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTxnCount = await Transaction.countDocuments({
      user: req.user._id,
      createdAt: { $gte: oneHourAgo }
    });

    const pastTxns = await Transaction.find({ user: req.user._id }).select('amount');
    let avgAmount = 1000;
    if (pastTxns.length > 0) {
      const sum = pastTxns.reduce((acc, t) => acc + t.amount, 0);
      avgAmount = sum / pastTxns.length;
    }
    const userAvgDiffRatio = avgAmount > 0 ? Number((amount / avgAmount).toFixed(2)) : 1.0;

    // Merchant risk score estimation
    let merchantRisk = 0.15;
    if (merchantCategory === 'Gaming & Crypto') merchantRisk = 0.85;
    else if (merchantCategory === 'Peer-to-Peer') merchantRisk = 0.35;
    else if (merchantCategory === 'Financial Services') merchantRisk = 0.45;
    else if (merchantCategory === 'Retail Stores') merchantRisk = 0.10;

    // Build payload for ML Model
    const mlPayload = {
      amount: Number(amount),
      location_discrepancy: locDisc,
      device_is_new: newDev,
      hour_of_day: currentHour,
      merchant_risk: merchantRisk,
      txn_velocity_1h: recentTxnCount + 1,
      user_avg_diff_ratio: userAvgDiffRatio,
      failed_attempts: 0
    };

    // Call ML Flask Engine
    const mlResult = await predictFraud(mlPayload);

    // Fetch dynamic fraud threshold (default 40)
    let config = await FraudConfig.findOne();
    if (!config) {
      config = await FraudConfig.create({ threshold: 40 });
    }
    const threshold = config.threshold || 40;

    const riskScore = mlResult.risk_score;
    const fraudProbability = mlResult.fraud_probability;
    const isFraudFlag = riskScore >= threshold;

    let initialStatus = 'APPROVED';
    if (isFraudFlag) {
      initialStatus = 'PENDING_REVIEW';
    }

    const transactionId = generateTxnId();

    const transaction = await Transaction.create({
      transactionId,
      user: req.user._id,
      amount: Number(amount),
      senderUpi: req.user.upiId || `${req.user.email.split('@')[0]}@upishield`,
      receiverUpi,
      receiverName: receiverName || 'UPI Recipient',
      merchantCategory: merchantCategory || 'Peer-to-Peer',
      location: location || 'Mumbai, India',
      locationDiscrepancy: locDisc,
      deviceId: deviceId || 'DEV-DESKTOP-WEB',
      isNewDevice: newDev,
      hourOfDay: currentHour,
      paymentType: paymentType || 'GPay',
      status: initialStatus,
      riskScore,
      fraudProbability,
      isFraud: isFraudFlag
    });

    // Store FraudPrediction details
    const predictionRecord = await FraudPrediction.create({
      transaction: transaction._id,
      user: req.user._id,
      riskScore,
      fraudProbability,
      riskLevel: mlResult.risk_level,
      prediction: mlResult.prediction,
      reasons: mlResult.reasons || [],
      rawFeatures: mlPayload
    });

    // Handle real-time notifications & sockets
    const io = req.app.get('io');

    if (initialStatus === 'APPROVED') {
      await Notification.create({
        user: req.user._id,
        title: 'Transaction Successful',
        message: `₹${amount} transferred to ${receiverUpi}. (Risk Score: ${riskScore}/100)`,
        type: 'TXN_APPROVED',
        metadata: { transactionId: transaction.transactionId }
      });
      if (io) {
        io.to(`user_${req.user._id}`).emit('transaction_status_changed', {
          transactionId: transaction.transactionId,
          status: 'APPROVED',
          riskScore
        });
      }
    } else {
      // PENDING_REVIEW due to high risk score
      await Notification.create({
        user: req.user._id,
        title: 'Security Hold: Analyst Review Required',
        message: `Your transfer of ₹${amount} has been held for security verification. Risk score: ${riskScore}/100.`,
        type: 'FRAUD_ALERT',
        metadata: { transactionId: transaction.transactionId }
      });

      // Notify Fraud Analysts
      const analysts = await User.find({ role: 'analyst' }).select('_id email');
      for (const analyst of analysts) {
        await Notification.create({
          user: analyst._id,
          title: 'High Risk UPI Transaction Flagged',
          message: `Transaction ${transaction.transactionId} (₹${amount}) flagged with Risk Score ${riskScore}/100. Review required.`,
          type: 'FRAUD_ALERT',
          metadata: { transactionId: transaction.transactionId }
        });
      }

      if (io) {
        io.to(`user_${req.user._id}`).emit('transaction_status_changed', {
          transactionId: transaction.transactionId,
          status: 'PENDING_REVIEW',
          riskScore
        });
        io.to('analysts_room').emit('new_fraud_alert', {
          transactionId: transaction.transactionId,
          amount,
          riskScore,
          senderUpi: transaction.senderUpi
        });
      }

      sendEmail({
        to: req.user.email,
        subject: 'UPIShield Alert: Transaction Verification in Progress',
        html: `<h3>Transaction Security Verification</h3><p>Your UPI transaction (ID: <strong>${transaction.transactionId}</strong>) of ₹${amount} was flagged for risk review (Risk Score: ${riskScore}/100).</p><p>Our Fraud Analysts are verifying the transaction details.</p>`
      });
    }

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      role: req.user.role,
      action: 'TRANSACTION_SUBMITTED',
      details: {
        transactionId: transaction.transactionId,
        amount,
        riskScore,
        status: initialStatus
      }
    });

    return res.status(201).json({
      success: true,
      message: initialStatus === 'APPROVED' ? 'Transaction processed successfully' : 'Transaction held for security analyst review',
      transaction,
      prediction: predictionRecord
    });

  } catch (error) {
    console.error('Submit Transaction Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/transactions/my
router.get('/my', protect, authorize('customer'), async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/transactions/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('user', 'name email upiId phone');
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Role security check
    if (req.user.role === 'customer' && transaction.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const prediction = await FraudPrediction.findOne({ transaction: transaction._id });

    return res.json({
      success: true,
      transaction,
      prediction
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
