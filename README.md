# UPIShield: AI-Powered UPI Fraud Detection Platform

UPIShield is an enterprise-grade AI fraud detection and real-time risk triage system built specifically for Unified Payments Interface (UPI) transactions. It combines a Random Forest Machine Learning classifier, Explainable AI (XAI) feature attribution, Node.js REST API with Socket.IO real-time alerts, and a modern glassmorphic React Vite dashboard.

---

## 🌟 Key Features

### 🤖 Machine Learning & Explainable AI (XAI)
- **Random Forest Classifier**: Trained on transactional telemetry (amount, recipient merchant risk, hour of day, device signature, geographical location discrepancy, velocity per hour, spending ratio).
- **Explainable Risk Reasoning**: Every transaction prediction returns human-readable risk factors (e.g., "Amount is 5.5x higher than historical average", "Transaction requested from unverified device signature", "Late night hour transaction").
- **Dynamic Threshold Routing**: Transactions with a Risk Score below the configured threshold (default **40/100**) are automatically approved. Transactions $\ge 40$ are put on hold and routed to Fraud Analyst triage.

### 👥 Role-Based Access Control (RBAC)
1. **Customer**:
   - Register & Sign in with custom UPI handles.
   - Submit new UPI transfers with real-time ML risk scoring.
   - View personal transaction history, risk scores, and XAI reason cards.
   - Real-time Socket.IO alerts when transfers are approved or resolved by analysts.
2. **Fraud Analyst**:
   - Real-time pending triage queue sorted by risk score descending.
   - Interactive Fraud Inspector Modal with risk radial meter, XAI reason breakdown, and device telemetry.
   - Submit mandatory investigation notes and click **Approve** or **Reject**.
   - Review history and performance audit logs.
3. **Administrator**:
   - Master Executive Dashboard featuring Recharts visualizers (Daily volume trend, Risk level pie distribution, Multi-month fraud comparison).
   - User & Role Management (Role promotion, account activation/suspension).
   - Dynamic Fraud Cutoff Threshold Configuration editor.
   - Immutable security audit logs.
   - One-click CSV report exporter.

---

## 🛠️ Tech Stack

- **Machine Learning Microservice**: Python 3.x, Flask, Scikit-learn, Joblib, Pandas, NumPy (Port 5001)
- **Backend Service**: Node.js, Express.js, MongoDB / Mongoose, JWT, Socket.IO, Nodemailer (Port 5000)
- **Frontend Service**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, Socket.io-client (Port 5173)

---

## 🔑 Demo Evaluation Credentials

The included database seeder populates preset accounts so you can evaluate all 3 roles immediately:

| Role | Email | Password | UPI Handle |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@upishield.com` | `password123` | `rahul@upishield` |
| **Fraud Analyst** | `analyst@upishield.com` | `password123` | `priya.analyst@upishield` |
| **Administrator** | `admin@upishield.com` | `password123` | `admin@upishield` |

---

## 🚀 Quick Start Guide

### 1. Machine Learning Service (Python Flask)
```bash
cd ml_service
pip install -r requirements.txt
python train_model.py
python app.py
```
*(Runs on `http://localhost:5001`)*

### 2. Backend Service (Node.js & MongoDB)
```bash
cd backend
npm install
npm run seed      # Seeds database with demo accounts & sample transactions
npm run dev       # Starts Express & Socket.IO server
```
*(Runs on `http://localhost:5000`)*

### 3. Frontend Application (React Vite)
```bash
cd frontend
npm install
npm run dev
```
*(Runs on `http://localhost:5173`)*

---

## 📜 License
Developed for enterprise UPI Fraud Detection benchmarking.
