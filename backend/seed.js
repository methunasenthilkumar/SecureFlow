const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const FraudPrediction = require('./models/FraudPrediction');
const AnalystReview = require('./models/AnalystReview');
const Notification = require('./models/Notification');
const AuditLog = require('./models/AuditLog');
const FraudConfig = require('./models/FraudConfig');

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/upishield';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await FraudPrediction.deleteMany({});
    await AnalystReview.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    await FraudConfig.deleteMany({});

    console.log('Creating system default fraud threshold configuration...');
    const adminConfig = await FraudConfig.create({
      threshold: 40,
      autoApproveLimit: 15000,
      highRiskAmountThreshold: 50000
    });

    console.log('Creating demo users (Customer, Analyst, Admin)...');
    
    // 1. Customer
    const customer = await User.create({
      name: 'Rahul Sharma',
      email: 'customer@upishield.com',
      password: 'password123',
      upiId: 'rahul@upishield',
      phone: '+91 9876543210',
      role: 'customer'
    });

    // 2. Fraud Analyst
    const analyst = await User.create({
      name: 'Priya Verma',
      email: 'analyst@upishield.com',
      password: 'password123',
      upiId: 'priya.analyst@upishield',
      phone: '+91 9812345678',
      role: 'analyst'
    });

    // 3. Administrator
    const admin = await User.create({
      name: 'Vikramaditya Roy',
      email: 'admin@upishield.com',
      password: 'password123',
      upiId: 'admin@upishield',
      phone: '+91 9999988888',
      role: 'admin'
    });

    console.log('Generating realistic sample UPI transactions & predictions...');

    const sampleTransactionsData = [
      {
        transactionId: 'UPI-884129-1001',
        user: customer._id,
        amount: 350,
        senderUpi: customer.upiId,
        receiverUpi: 'starbucks@merchant',
        receiverName: 'Starbucks Coffee India',
        merchantCategory: 'Food & Dining',
        location: 'Mumbai, India',
        locationDiscrepancy: 0,
        deviceId: 'DEV-IPHONE-15',
        isNewDevice: 0,
        hourOfDay: 14,
        paymentType: 'GPay',
        status: 'APPROVED',
        riskScore: 12,
        fraudProbability: 0.12,
        isFraud: false,
        prediction: {
          riskLevel: 'LOW',
          prediction: 'GENUINE',
          reasons: [
            { code: 'ROUTINE_TRANSACTION', title: 'Standard Routine Transaction', description: 'Regular spending at verified dining merchant.', severity: 'LOW' }
          ]
        }
      },
      {
        transactionId: 'UPI-884130-1002',
        user: customer._id,
        amount: 85000,
        senderUpi: customer.upiId,
        receiverUpi: 'crypto.wallet.vault@okicici',
        receiverName: 'Peer Crypto Escrow Wallet',
        merchantCategory: 'Gaming & Crypto',
        location: 'Moscow, Russia',
        locationDiscrepancy: 1,
        deviceId: 'DEV-UNKNOWN-ANDROID',
        isNewDevice: 1,
        hourOfDay: 2,
        paymentType: 'PhonePe',
        status: 'PENDING_REVIEW',
        riskScore: 88,
        fraudProbability: 0.88,
        isFraud: true,
        prediction: {
          riskLevel: 'CRITICAL',
          prediction: 'FRAUD',
          reasons: [
            { code: 'HIGH_AMOUNT', title: 'High Transaction Amount', description: 'Transaction ₹85,000 exceeds routine profile.', severity: 'HIGH' },
            { code: 'LOCATION_DISCREPANCY', title: 'Unusual International Location', description: 'Transaction attempted from Moscow, Russia.', severity: 'HIGH' },
            { code: 'UNKNOWN_DEVICE', title: 'Unregistered Device Signature', description: 'Device signature not previously verified.', severity: 'HIGH' },
            { code: 'LATE_NIGHT_ACTIVITY', title: 'Late Night Execution', description: 'Transaction requested at 02:00 AM.', severity: 'MEDIUM' }
          ]
        }
      },
      {
        transactionId: 'UPI-884131-1003',
        user: customer._id,
        amount: 14200,
        senderUpi: customer.upiId,
        receiverUpi: 'croma.retail@icici',
        receiverName: 'Croma Electronics Retail',
        merchantCategory: 'Retail Stores',
        location: 'Delhi, India',
        locationDiscrepancy: 1,
        deviceId: 'DEV-IPHONE-15',
        isNewDevice: 0,
        hourOfDay: 19,
        paymentType: 'BHIM',
        status: 'PENDING_REVIEW',
        riskScore: 54,
        fraudProbability: 0.54,
        isFraud: true,
        prediction: {
          riskLevel: 'HIGH',
          prediction: 'FRAUD',
          reasons: [
            { code: 'LOCATION_DISCREPANCY', title: 'Unusual Geographical Location', description: 'Location discrepancy detected (Delhi vs Mumbai base).', severity: 'HIGH' },
            { code: 'ABNORMAL_SPENDING_RATIO', title: 'Spending Spike', description: 'Transaction is 4.5x customer average.', severity: 'MEDIUM' }
          ]
        }
      },
      {
        transactionId: 'UPI-884132-1004',
        user: customer._id,
        amount: 2500,
        senderUpi: customer.upiId,
        receiverUpi: 'zomato@paytm',
        receiverName: 'Zomato Food Delivery',
        merchantCategory: 'Food & Dining',
        location: 'Mumbai, India',
        locationDiscrepancy: 0,
        deviceId: 'DEV-IPHONE-15',
        isNewDevice: 0,
        hourOfDay: 21,
        paymentType: 'Paytm',
        status: 'APPROVED',
        riskScore: 18,
        fraudProbability: 0.18,
        isFraud: false,
        prediction: {
          riskLevel: 'LOW',
          prediction: 'GENUINE',
          reasons: [
            { code: 'ROUTINE_TRANSACTION', title: 'Standard Routine Transaction', description: 'Routine dining transfer.', severity: 'LOW' }
          ]
        }
      },
      {
        transactionId: 'UPI-884133-1005',
        user: customer._id,
        amount: 45000,
        senderUpi: customer.upiId,
        receiverUpi: 'unknown.peer99@ybl',
        receiverName: 'Unverified Peer Account',
        merchantCategory: 'Peer-to-Peer',
        location: 'Bengaluru, India',
        locationDiscrepancy: 1,
        deviceId: 'DEV-IPHONE-15',
        isNewDevice: 0,
        hourOfDay: 3,
        paymentType: 'GPay',
        status: 'REJECTED',
        riskScore: 78,
        fraudProbability: 0.78,
        isFraud: true,
        prediction: {
          riskLevel: 'CRITICAL',
          prediction: 'FRAUD',
          reasons: [
            { code: 'HIGH_AMOUNT', title: 'High Transaction Amount', description: 'Unusually large peer transfer.', severity: 'HIGH' },
            { code: 'LATE_NIGHT_ACTIVITY', title: 'Late Night Execution', description: 'Transaction requested at 03:00 AM.', severity: 'MEDIUM' }
          ]
        }
      }
    ];

    for (const item of sampleTransactionsData) {
      const predInfo = item.prediction;
      delete item.prediction;

      const txn = await Transaction.create(item);

      await FraudPrediction.create({
        transaction: txn._id,
        user: customer._id,
        riskScore: txn.riskScore,
        fraudProbability: txn.fraudProbability,
        riskLevel: predInfo.riskLevel,
        prediction: predInfo.prediction,
        reasons: predInfo.reasons,
        rawFeatures: { amount: txn.amount, location_discrepancy: txn.locationDiscrepancy }
      });

      if (txn.status === 'REJECTED') {
        await AnalystReview.create({
          transaction: txn._id,
          analyst: analyst._id,
          decision: 'REJECTED',
          notes: 'High risk peer transfer requested at 3:00 AM from unusual location. Customer confirmed unauthorized attempt.'
        });
      }
    }

    console.log('Creating sample notifications & audit logs...');
    await Notification.create({
      user: customer._id,
      title: 'Welcome to UPIShield Security',
      message: 'Your UPI ID rahul@upishield is protected by Random Forest AI.',
      type: 'SYSTEM'
    });

    await AuditLog.create({
      user: admin._id,
      userName: admin.name,
      role: admin.role,
      action: 'SYSTEM_INITIALIZED',
      details: { threshold: 40 }
    });

    console.log('\n==========================================');
    console.log('DATABASE SEEDED SUCCESSFULLY!');
    console.log('==========================================');
    console.log('Demo Credentials for Evaluation:');
    console.log('1. Customer Role:');
    console.log('   Email: customer@upishield.com');
    console.log('   Password: password123');
    console.log('2. Fraud Analyst Role:');
    console.log('   Email: analyst@upishield.com');
    console.log('   Password: password123');
    console.log('3. Administrator Role:');
    console.log('   Email: admin@upishield.com');
    console.log('   Password: password123');
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Database Seed Error:', error);
    process.exit(1);
  }
};

seedData();
