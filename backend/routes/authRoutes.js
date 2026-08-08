const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTPVerification = require('../models/OTPVerification');
const sendEmail = require('../config/nodemailer');
const { protect } = require('../middleware/authMiddleware');
const { logAudit } = require('../utils/logger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'upishield_secret_key_2026', {
    expiresIn: '30d'
  });
};

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, upiId, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Default auto-generated UPI ID if not provided
    const userUpi = upiId || `${email.split('@')[0]}@upishield`;
    const userRole = (role && ['customer', 'analyst', 'admin'].includes(role)) ? role : 'customer';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      upiId: userUpi.toLowerCase(),
      phone: phone || '',
      role: userRole
    });

    await logAudit({
      user: user._id,
      userName: user.name,
      role: user.role,
      action: 'USER_REGISTERED',
      details: { email: user.email, upiId: user.upiId }
    });

    // Send Welcome Email
    sendEmail({
      to: user.email,
      subject: 'Welcome to UPIShield Security',
      html: `<h2>Welcome to UPIShield, ${user.name}!</h2><p>Your UPI account (${user.upiId}) is now protected by real-time AI Fraud Detection.</p>`
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        upiId: user.upiId,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Register Route Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account is suspended. Please contact administrator.' });
    }

    await logAudit({
      user: user._id,
      userName: user.name,
      role: user.role,
      action: 'USER_LOGIN',
      details: { email: user.email }
    });

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        upiId: user.upiId,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Login Route Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email ? email.toLowerCase() : '' });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this email does not exist' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await OTPVerification.deleteMany({ email: user.email });
    await OTPVerification.create({
      email: user.email,
      otp,
      purpose: 'PASSWORD_RESET',
      expiresAt
    });

    sendEmail({
      to: user.email,
      subject: 'UPIShield - Password Reset OTP Code',
      html: `<h3>Password Reset Verification Code</h3><p>Your OTP code is: <strong>${otp}</strong></p><p>This code expires in 15 minutes.</p>`
    });

    return res.json({
      success: true,
      message: 'Password reset OTP has been sent to your email',
      mockOtp: otp // Included for easy testing without SMTP setup
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = await OTPVerification.findOne({
      email: email ? email.toLowerCase() : '',
      otp,
      purpose: 'PASSWORD_RESET'
    });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    await OTPVerification.deleteMany({ email: user.email });

    await logAudit({
      user: user._id,
      userName: user.name,
      role: user.role,
      action: 'PASSWORD_RESET_COMPLETED',
      details: { email: user.email }
    });

    return res.json({ success: true, message: 'Password reset successful. You can now log in.' });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
});

// @route PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.upiId) user.upiId = req.body.upiId.toLowerCase();

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        upiId: user.upiId,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
