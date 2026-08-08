import os
import json
import numpy as np
import pandas as pd
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join('models', 'upi_fraud_model.pkl')
SCALER_PATH = os.path.join('models', 'scaler.pkl')
FEATURES_PATH = os.path.join('models', 'feature_names.json')

model = None
scaler = None
feature_names = []

def load_artifacts():
    global model, scaler, feature_names
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH) and os.path.exists(FEATURES_PATH):
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        with open(FEATURES_PATH, 'r') as f:
            feature_names = json.load(f)
        print("ML model and scaler loaded successfully.")
    else:
        print("Warning: Model files not found. Auto-training model...")
        from train_model import train_and_save
        train_and_save()
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        with open(FEATURES_PATH, 'r') as f:
            feature_names = json.load(f)

# Auto load artifacts when starting Flask
with app.app_context():
    load_artifacts()

def extract_xai_reasons(features):
    reasons = []
    
    amount = features.get('amount', 0)
    user_avg_diff_ratio = features.get('user_avg_diff_ratio', 1.0)
    location_discrepancy = features.get('location_discrepancy', 0)
    device_is_new = features.get('device_is_new', 0)
    hour_of_day = features.get('hour_of_day', 12)
    merchant_risk = features.get('merchant_risk', 0.1)
    txn_velocity_1h = features.get('txn_velocity_1h', 1)
    failed_attempts = features.get('failed_attempts', 0)

    if amount >= 30000:
        reasons.append({
            'code': 'HIGH_AMOUNT',
            'title': 'High Transaction Amount',
            'description': f'Transaction value (₹{amount:,.2f}) significantly exceeds standard UPI transfer limits.',
            'severity': 'HIGH'
        })
    elif user_avg_diff_ratio >= 3.0:
        reasons.append({
            'code': 'ABNORMAL_SPENDING_RATIO',
            'title': 'Abnormal Spending Spike',
            'description': f'Amount is {user_avg_diff_ratio:.1f}x higher than customer\'s average transaction history.',
            'severity': 'MEDIUM'
        })

    if location_discrepancy == 1:
        reasons.append({
            'code': 'LOCATION_DISCREPANCY',
            'title': 'Unusual Location',
            'description': 'Transaction initiated from an unexpected IP/geographical location.',
            'severity': 'HIGH'
        })

    if device_is_new == 1:
        reasons.append({
            'code': 'UNKNOWN_DEVICE',
            'title': 'New / Unregistered Device',
            'description': 'Transaction authorized from a device signature not previously linked to account.',
            'severity': 'HIGH'
        })

    if hour_of_day in [0, 1, 2, 3, 4]:
        reasons.append({
            'code': 'LATE_NIGHT_ACTIVITY',
            'title': 'Late Night Execution',
            'description': f'Transaction initiated at unusual hours ({hour_of_day:02d}:00 HRS).',
            'severity': 'MEDIUM'
        })

    if txn_velocity_1h >= 4:
        reasons.append({
            'code': 'HIGH_VELOCITY',
            'title': 'High Transaction Frequency',
            'description': f'{txn_velocity_1h} transactions attempted within the last 60 minutes.',
            'severity': 'HIGH'
        })

    if merchant_risk >= 0.6:
        reasons.append({
            'code': 'HIGH_RISK_MERCHANT',
            'title': 'High-Risk Recipient Category',
            'description': 'Recipient VPA associated with high-risk merchant or unverified peer wallet.',
            'severity': 'HIGH'
        })

    if failed_attempts >= 2:
        reasons.append({
            'code': 'FAILED_AUTH_ATTEMPTS',
            'title': 'Multiple Failed PIN Attempts',
            'description': f'{failed_attempts} recent failed PIN/authentication attempts recorded.',
            'severity': 'HIGH'
        })

    if not reasons:
        reasons.append({
            'code': 'ROUTINE_TRANSACTION',
            'title': 'Standard Transaction Profile',
            'description': 'Transaction matches routine spending behavior and verified device pattern.',
            'severity': 'LOW'
        })

    return reasons

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'UPIShield ML Engine',
        'model_loaded': model is not None
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True) or {}
        
        # Build feature vector in exact order
        amount = float(data.get('amount', 0))
        location_discrepancy = int(data.get('location_discrepancy', 0))
        device_is_new = int(data.get('device_is_new', 0))
        hour_of_day = int(data.get('hour_of_day', 12))
        merchant_risk = float(data.get('merchant_risk', 0.1))
        txn_velocity_1h = int(data.get('txn_velocity_1h', 1))
        user_avg_diff_ratio = float(data.get('user_avg_diff_ratio', 1.0))
        failed_attempts = int(data.get('failed_attempts', 0))
        
        input_dict = {
            'amount': amount,
            'location_discrepancy': location_discrepancy,
            'device_is_new': device_is_new,
            'hour_of_day': hour_of_day,
            'merchant_risk': merchant_risk,
            'txn_velocity_1h': txn_velocity_1h,
            'user_avg_diff_ratio': user_avg_diff_ratio,
            'failed_attempts': failed_attempts
        }
        
        input_df = pd.DataFrame([input_dict])[feature_names]
        scaled_features = scaler.transform(input_df)
        
        fraud_proba = float(model.predict_proba(scaled_features)[0][1])
        risk_score = round(fraud_proba * 100, 2)
        
        if risk_score < 25:
            risk_level = 'LOW'
        elif risk_score < 50:
            risk_level = 'MEDIUM'
        elif risk_score < 75:
            risk_level = 'HIGH'
        else:
            risk_level = 'CRITICAL'
            
        is_fraud = bool(risk_score >= 50)
        prediction_label = "FRAUD" if is_fraud else "GENUINE"
        reasons = extract_xai_reasons(input_dict)
        
        return jsonify({
            'success': True,
            'prediction': prediction_label,
            'is_fraud': is_fraud,
            'fraud_probability': round(fraud_proba, 4),
            'risk_score': risk_score,
            'risk_level': risk_level,
            'reasons': reasons
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"Starting UPIShield Flask ML Service on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
