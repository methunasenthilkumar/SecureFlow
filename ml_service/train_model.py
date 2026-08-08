import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, roc_auc_score
import joblib

def generate_synthetic_data(num_samples=5000, random_seed=42):
    np.random.seed(random_seed)
    
    # Feature 1: Amount in INR (skewed distribution)
    normal_amounts = np.random.exponential(scale=1500, size=int(num_samples * 0.85)) + 50
    fraud_amounts = np.random.uniform(15000, 100000, size=int(num_samples * 0.15))
    amount = np.concatenate([normal_amounts, fraud_amounts])
    
    # Feature 2: Location discrepancy (0 = routine, 1 = unexpected/different city or country)
    location_discrepancy = np.random.choice([0, 1], size=num_samples, p=[0.88, 0.12])
    
    # Feature 3: Device signature (0 = recognized device, 1 = new unverified device)
    device_is_new = np.random.choice([0, 1], size=num_samples, p=[0.85, 0.15])
    
    # Feature 4: Hour of day (0-23)
    # Fraud higher during late night hours (0-4 AM)
    hour_of_day = np.random.randint(0, 24, size=num_samples)
    
    # Feature 5: Merchant Risk Score (0.0 to 1.0)
    merchant_risk = np.random.beta(a=2, b=5, size=num_samples)
    
    # Feature 6: Velocity (Transactions in last 1 hour)
    txn_velocity_1h = np.random.poisson(lam=1.2, size=num_samples)
    
    # Feature 7: Ratio of current amount vs user's historical average amount
    user_avg_diff_ratio = np.random.lognormal(mean=0.2, sigma=0.5, size=num_samples)
    
    # Feature 8: Recent failed auth attempts (0 to 5)
    failed_attempts = np.random.choice([0, 1, 2, 3, 4, 5], size=num_samples, p=[0.85, 0.08, 0.04, 0.015, 0.01, 0.005])

    df = pd.DataFrame({
        'amount': amount,
        'location_discrepancy': location_discrepancy,
        'device_is_new': device_is_new,
        'hour_of_day': hour_of_day,
        'merchant_risk': merchant_risk,
        'txn_velocity_1h': txn_velocity_1h,
        'user_avg_diff_ratio': user_avg_diff_ratio,
        'failed_attempts': failed_attempts
    })

    # Fraud probability simulation rules
    fraud_prob = (
        0.05 +
        (df['amount'] > 20000) * 0.25 +
        (df['location_discrepancy'] == 1) * 0.20 +
        (df['device_is_new'] == 1) * 0.20 +
        ((df['hour_of_day'] >= 0) & (df['hour_of_day'] <= 4)) * 0.15 +
        (df['merchant_risk'] > 0.6) * 0.15 +
        (df['txn_velocity_1h'] >= 4) * 0.20 +
        (df['user_avg_diff_ratio'] > 4.0) * 0.20 +
        (df['failed_attempts'] >= 2) * 0.25
    )
    
    # Normalize probability into [0, 1]
    fraud_prob = np.clip(fraud_prob, 0, 0.95)
    
    df['is_fraud'] = (np.random.rand(num_samples) < fraud_prob).astype(int)
    return df

def train_and_save():
    print("Generating synthetic UPI transaction dataset...")
    df = generate_synthetic_data(num_samples=6000)
    
    X = df.drop(columns=['is_fraud'])
    y = df['is_fraud']
    
    feature_names = list(X.columns)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("Training Random Forest Classifier model...")
    rf_model = RandomForestClassifier(
        n_estimators=120,
        max_depth=12,
        random_state=42,
        class_weight='balanced'
    )
    rf_model.fit(X_train_scaled, y_train)
    
    # Predictions
    y_pred = rf_model.predict(X_test_scaled)
    y_proba = rf_model.predict_proba(X_test_scaled)[:, 1]
    
    print("\n--- Model Evaluation Results ---")
    print(classification_report(y_test, y_pred))
    print(f"ROC-AUC Score: {roc_auc_score(y_test, y_proba):.4f}")
    
    # Save directory
    os.makedirs('models', exist_ok=True)
    
    joblib.dump(rf_model, 'models/upi_fraud_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    
    with open('models/feature_names.json', 'w') as f:
        json.dump(feature_names, f)
        
    print("\nModel artifact files successfully saved in ml_service/models/")

if __name__ == '__main__':
    train_and_save()
