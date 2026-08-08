const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const FraudPrediction = require('../models/FraudPrediction');
const AnalystReview = require('../models/AnalystReview');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAudit } = require('../utils/logger');
const sendEmail = require('../config/nodemailer');

// Protect all analyst endpoints
router.use(protect);
router.use(authorize('analyst', 'admin'));

// @route GET /api/analyst/pending
router.get('/pending', async (req, res) => {
  try {
    const pendingTxns = await Transaction.find({ status: 'PENDING_REVIEW' })
      .populate('user', 'name email upiId phone')
      .sort({ riskScore: -1, createdAt: -1 });

    // Fetch predictions for all pending transactions
    const txnIds = pendingTxns.map(t => t._id);
    const predictions = await FraudPrediction.find({ transaction: { $in: txnIds } });

    const predictionMap = {};
    predictions.forEach(p => {
      predictionMap[p.transaction.toString()] = p;
    });

    const results = pendingTxns.map(txn => ({
      transaction: txn,
      prediction: predictionMap[txn._id.toString()] || null
    }));

    return res.json({
      success: true,
      count: results.length,
      pending: results
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/analyst/history
router.get('/history', async (req, res) => {
  try {
    const reviews = await AnalystReview.find()
      .populate({
        path: 'transaction',
        populate: { path: 'user', select: 'name email upiId' }
      })
      .populate('analyst', 'name email')
      .sort({ reviewedAt: -1 });

    return res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/analyst/review/:id
router.post('/review/:id', async (req, res) => {
  try {
    const { decision, notes } = req.body;

    if (!decision || !['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Invalid decision. Must be APPROVED or REJECTED' });
    }

    if (!notes || notes.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Please provide detailed investigation notes (min 5 characters)' });
    }

    const transaction = await Transaction.findById(req.params.id).populate('user', 'name email upiId');
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status !== 'PENDING_REVIEW') {
      return res.status(400).json({ success: false, message: `Transaction has already been processed with status '${transaction.status}'` });
    }

    // Update status
    transaction.status = decision;
    await transaction.save();

    // Create Analyst Review record
    const reviewRecord = await AnalystReview.create({
      transaction: transaction._id,
      analyst: req.user._id,
      decision,
      notes: notes.trim()
    });

    // Notify Customer
    const notificationType = decision === 'APPROVED' ? 'TXN_APPROVED' : 'TXN_REJECTED';
    const notificationTitle = decision === 'APPROVED' ? 'Transaction Approved by Analyst' : 'Transaction Declined by Security';
    const notificationMsg = decision === 'APPROVED'
      ? `Your held transaction of ₹${transaction.amount} (${transaction.transactionId}) has been verified and APPROVED.`
      : `Your held transaction of ₹${transaction.amount} (${transaction.transactionId}) was REJECTED following risk investigation. Reason: ${notes}`;

    await Notification.create({
      user: transaction.user._id,
      title: notificationTitle,
      message: notificationMsg,
      type: notificationType,
      metadata: { transactionId: transaction.transactionId, notes }
    });

    // Socket IO real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${transaction.user._id}`).emit('transaction_status_changed', {
        transactionId: transaction.transactionId,
        status: decision,
        notes
      });
      io.to('admin_room').emit('analyst_decision_made', {
        transactionId: transaction.transactionId,
        decision,
        analystName: req.user.name
      });
    }

    // Email notification
    sendEmail({
      to: transaction.user.email,
      subject: `UPIShield Update: Transaction ${decision}`,
      html: `<h3>Transaction ${decision}</h3><p>Dear ${transaction.user.name},</p><p>Your transaction <strong>${transaction.transactionId}</strong> of ₹${transaction.amount} has been <strong>${decision}</strong> by our fraud investigation team.</p><p><strong>Analyst Note:</strong> ${notes}</p>`
    });

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      role: req.user.role,
      action: `ANALYST_${decision}_TRANSACTION`,
      details: {
        transactionId: transaction.transactionId,
        decision,
        notes
      }
    });

    return res.json({
      success: true,
      message: `Transaction ${transaction.transactionId} successfully marked as ${decision}`,
      review: reviewRecord,
      transaction
    });

  } catch (error) {
    console.error('Analyst Review Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/analyst/stats
router.get('/stats', async (req, res) => {
  try {
    const pendingCount = await Transaction.countDocuments({ status: 'PENDING_REVIEW' });
    const approvedCount = await Transaction.countDocuments({ status: 'APPROVED' });
    const rejectedCount = await Transaction.countDocuments({ status: 'REJECTED' });
    const totalReviewedByMe = await AnalystReview.countDocuments({ analyst: req.user._id });

    const avgRisk = await Transaction.aggregate([
      { $match: { status: 'PENDING_REVIEW' } },
      { $group: { _id: null, avgRisk: { $avg: '$riskScore' } } }
    ]);

    return res.json({
      success: true,
      stats: {
        pendingCount,
        approvedCount,
        rejectedCount,
        totalReviewedByMe,
        avgRiskScorePending: avgRisk.length > 0 ? Math.round(avgRisk[0].avgRisk) : 0
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
