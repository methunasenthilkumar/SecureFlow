const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

const predictFraud = async (transactionData) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, transactionData, {
      timeout: 5000
    });
    if (response.data && response.data.success) {
      return response.data;
    }
    throw new Error('ML API returned unsuccessful response');
  } catch (error) {
    console.error('ML Flask Service Call Warning:', error.message);
    
    // Heuristic fallback prediction engine if ML service is unreachable
    const amount = Number(transactionData.amount || 0);
    const isNewDevice = Number(transactionData.device_is_new || 0);
    const locationDiscrepancy = Number(transactionData.location_discrepancy || 0);
    const hourOfDay = Number(transactionData.hour_of_day || 12);
    
    let baseRisk = 15;
    const reasons = [];

    if (amount > 30000) {
      baseRisk += 35;
      reasons.append?.({
        code: 'HIGH_AMOUNT',
        title: 'High Transaction Amount',
        description: `Amount ₹${amount} exceeds safety limit.`,
        severity: 'HIGH'
      });
    }

    if (isNewDevice === 1) {
      baseRisk += 25;
      reasons.push({
        code: 'UNKNOWN_DEVICE',
        title: 'New Device Detected',
        description: 'Transaction requested from unverified device signature.',
        severity: 'HIGH'
      });
    }

    if (locationDiscrepancy === 1) {
      baseRisk += 20;
      reasons.push({
        code: 'LOCATION_DISCREPANCY',
        title: 'Unusual Geographical Location',
        description: 'Initiated from an unexpected location.',
        severity: 'HIGH'
      });
    }

    if (hourOfDay >= 0 && hourOfDay <= 4) {
      baseRisk += 15;
      reasons.push({
        code: 'LATE_NIGHT_ACTIVITY',
        title: 'Late Night Hours',
        description: 'Executed during off-peak night hours.',
        severity: 'MEDIUM'
      });
    }

    const riskScore = Math.min(Math.max(baseRisk, 5), 98);
    const isFraud = riskScore >= 50;

    if (reasons.length === 0) {
      reasons.push({
        code: 'ROUTINE_TRANSACTION',
        title: 'Standard Transaction Profile',
        description: 'Routine transfer pattern.',
        severity: 'LOW'
      });
    }

    return {
      success: true,
      prediction: isFraud ? 'FRAUD' : 'GENUINE',
      is_fraud: isFraud,
      fraud_probability: Number((riskScore / 100).toFixed(4)),
      risk_score: riskScore,
      risk_level: riskScore >= 75 ? 'CRITICAL' : riskScore >= 50 ? 'HIGH' : riskScore >= 25 ? 'MEDIUM' : 'LOW',
      reasons: reasons
    };
  }
};

module.exports = { predictFraud };
