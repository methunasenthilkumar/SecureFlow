const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const FraudPrediction = require('../models/FraudPrediction');
const AuditLog = require('../models/AuditLog');
const FraudConfig = require('../models/FraudConfig');
const { protect, authorize } = require('../middleware/authMiddleware');
const { logAudit } = require('../utils/logger');

// Protect admin routes
router.use(protect);
router.use(authorize('admin'));

// @route GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const approvedCount = await Transaction.countDocuments({ status: 'APPROVED' });
    const pendingCount = await Transaction.countDocuments({ status: 'PENDING_REVIEW' });
    const rejectedCount = await Transaction.countDocuments({ status: 'REJECTED' });
    
    // Fraud count = Rejected + High Risk Score (>70)
    const fraudCount = await Transaction.countDocuments({
      $or: [{ status: 'REJECTED' }, { riskScore: { $gte: 70 } }]
    });

    const fraudPercentage = totalTransactions > 0 
      ? Number(((fraudCount / totalTransactions) * 100).toFixed(2)) 
      : 0;

    // Aggregations for Recharts
    // 1. Status Breakdown
    const statusBreakdown = [
      { name: 'Approved', value: approvedCount, color: '#10b981' },
      { name: 'Pending Review', value: pendingCount, color: '#f59e0b' },
      { name: 'Rejected / Fraud', value: rejectedCount, color: '#ef4444' }
    ];

    // 2. Risk Level Breakdown from FraudPredictions
    const riskLevelAgg = await FraudPrediction.aggregate([
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ]);

    const riskLevelsMap = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    riskLevelAgg.forEach(item => {
      if (item._id) riskLevelsMap[item._id] = item.count;
    });

    const riskDistribution = [
      { level: 'Low (0-24)', count: riskLevelsMap.LOW, color: '#10b981' },
      { level: 'Medium (25-49)', count: riskLevelsMap.MEDIUM, color: '#3b82f6' },
      { level: 'High (50-74)', count: riskLevelsMap.HIGH, color: '#f59e0b' },
      { level: 'Critical (75-100)', count: riskLevelsMap.CRITICAL, color: '#ef4444' }
    ];

    // 3. Daily Transactions for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyTxnsAgg = await Transaction.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING_REVIEW'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Build last 7 days array ensuring no missing dates
    const dailyTransactions = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const found = dailyTxnsAgg.find(item => item._id === dateStr);
      
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      dailyTransactions.push({
        date: dayName,
        fullDate: dateStr,
        total: found ? found.total : 0,
        approved: found ? found.approved : 0,
        pending: found ? found.pending : 0,
        rejected: found ? found.rejected : 0
      });
    }

    // 4. Monthly Fraud Trend (mock historical + actual)
    const monthlyFraudTrend = [
      { month: 'Jan', total: 420, fraud: 18, fraudRate: 4.2 },
      { month: 'Feb', total: 510, fraud: 22, fraudRate: 4.3 },
      { month: 'Mar', total: 680, fraud: 35, fraudRate: 5.1 },
      { month: 'Apr', total: 820, fraud: 41, fraudRate: 5.0 },
      { month: 'May', total: 950, fraud: 38, fraudRate: 4.0 },
      { month: 'Jun', total: Math.max(totalTransactions, 100), fraud: Math.max(fraudCount, 8), fraudRate: fraudPercentage }
    ];

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalTransactions,
        fraudCount,
        approvedCount,
        pendingCount,
        rejectedCount,
        fraudPercentage
      },
      charts: {
        statusBreakdown,
        riskDistribution,
        dailyTransactions,
        monthlyFraudTrend
      }
    });

  } catch (error) {
    console.error('Admin Dashboard Stats Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const query = {};

    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { upiId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/admin/users/:id/status
router.put('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be active or suspended' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.status = status;
    await user.save();

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      role: req.user.role,
      action: `USER_STATUS_UPDATED_${status.toUpperCase()}`,
      details: { targetUserId: user._id, targetUserEmail: user.email, newStatus: status }
    });

    return res.json({
      success: true,
      message: `User ${user.name} is now ${status}`,
      user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'analyst', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be customer, analyst, or admin' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.role = role;
    await user.save();

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      role: req.user.role,
      action: `USER_ROLE_UPDATED_${role.toUpperCase()}`,
      details: { targetUserId: user._id, targetUserEmail: user.email, newRole: role }
    });

    return res.json({
      success: true,
      message: `User ${user.name} role updated to ${role}`,
      user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/admin/audit-logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/admin/threshold
router.get('/threshold', async (req, res) => {
  try {
    let config = await FraudConfig.findOne();
    if (!config) {
      config = await FraudConfig.create({ threshold: 40 });
    }
    return res.json({ success: true, config });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/admin/threshold
router.put('/threshold', async (req, res) => {
  try {
    const { threshold, autoApproveLimit, highRiskAmountThreshold } = req.body;

    let config = await FraudConfig.findOne();
    if (!config) {
      config = new FraudConfig();
    }

    if (threshold !== undefined) config.threshold = Number(threshold);
    if (autoApproveLimit !== undefined) config.autoApproveLimit = Number(autoApproveLimit);
    if (highRiskAmountThreshold !== undefined) config.highRiskAmountThreshold = Number(highRiskAmountThreshold);

    config.updatedBy = req.user._id;
    await config.save();

    await logAudit({
      user: req.user._id,
      userName: req.user.name,
      role: req.user.role,
      action: 'FRAUD_THRESHOLD_CONFIG_UPDATED',
      details: { newThreshold: config.threshold, autoApproveLimit: config.autoApproveLimit }
    });

    return res.json({
      success: true,
      message: 'Fraud configuration updated successfully',
      config
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/admin/reports
router.get('/reports', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'name email upiId')
      .sort({ createdAt: -1 });

    const reportSummary = {
      generatedAt: new Date(),
      totalCount: transactions.length,
      approvedCount: transactions.filter(t => t.status === 'APPROVED').length,
      pendingCount: transactions.filter(t => t.status === 'PENDING_REVIEW').length,
      rejectedCount: transactions.filter(t => t.status === 'REJECTED').length,
      totalVolumeINR: transactions.reduce((acc, t) => acc + t.amount, 0),
      avgRiskScore: transactions.length > 0 
        ? Number((transactions.reduce((acc, t) => acc + t.riskScore, 0) / transactions.length).toFixed(1))
        : 0
    };

    return res.json({
      success: true,
      summary: reportSummary,
      transactions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
