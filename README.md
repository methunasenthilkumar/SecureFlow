# SecureFlow: Intelligent UPI Transaction Risk Detection System

SecureFlow is an AI-powered transaction risk detection and real-time fraud triage platform designed for UPI transactions. It combines a **Random Forest Machine Learning classifier**, **risk scoring**, **role-based access control**, **JWT authentication**, **Socket.IO real-time notifications**, and a modern **React dashboard** to identify and manage potentially suspicious transactions.

The platform analyzes transaction behavior in real time, generates a risk score, and routes high-risk transactions to fraud analysts for verification through a secure role-based workflow.

---

## 🌟 Key Features

### 🤖 Machine Learning & Risk Detection

* **Random Forest Classifier**: Uses transaction-related features to identify potentially suspicious UPI transactions.
* **Real-Time Risk Scoring**: Each transaction is analyzed and assigned a risk score.
* **Risk-Based Routing**: Suspicious transactions are automatically routed to fraud analysts for verification.
* **Transaction Analysis**: Evaluates transaction characteristics to identify unusual or potentially fraudulent activity.
* **ML Microservice**: Machine learning predictions are served through a Python Flask service.

---

## 👥 Role-Based Access Control (RBAC)

SecureFlow provides separate workflows for three user roles:

### 👤 Customer

* Register and securely sign in.
* Submit UPI transactions.
* Receive real-time transaction risk analysis.
* View personal transaction history.
* View transaction risk scores and transaction status.
* Receive real-time notifications when transactions are approved, rejected, or resolved.

### 🕵️ Fraud Analyst

* View suspicious transactions requiring investigation.
* Monitor pending fraud cases.
* Review transaction details and risk scores.
* Analyze potentially fraudulent transactions.
* Verify suspicious transactions.
* Approve or reject transactions.
* Maintain investigation records and notes.

### 👨‍💼 Administrator

* Monitor overall transaction activity.
* Manage users and roles.
* Monitor fraud and risk statistics.
* Access analytics dashboards.
* Manage the transaction monitoring workflow.
* Monitor system activity and transaction trends.

---

## 🔐 Authentication & Security

SecureFlow implements multiple security mechanisms to protect users and transaction data.

* **JWT Authentication**
* **Role-Based Authorization**
* Protected API routes
* User-specific access control
* Secure authentication workflow
* Separation of frontend, backend, and ML services
* Environment-based configuration for sensitive credentials

> **Security Note:** Never commit `.env` files, database credentials, JWT secrets, API keys, or other sensitive information to GitHub.

---

## 🔔 Real-Time Notifications

SecureFlow uses **Socket.IO** to provide real-time communication between the frontend and backend.

Real-time events are used for:

* Transaction status updates
* Fraud analyst notifications
* Transaction approval/rejection notifications
* Risk detection alerts
* Case resolution updates

```text
Customer Transaction
        ↓
Risk Analysis
        ↓
┌───────────────────────┐
│   Risk Classification │
└───────────┬───────────┘
            ↓
     Suspicious?
       ↙       ↘
     YES        NO
      ↓          ↓
 Analyst       Normal
  Review       Workflow
      ↓
Approve / Reject
      ↓
Real-Time Notification
```

---

## 📊 Analytics Dashboard

The administrator dashboard provides an overview of transaction and fraud activity.

The dashboard can be used to monitor:

* Total transactions
* Suspicious transactions
* Risk distribution
* Transaction trends
* Fraud-related statistics
* User activity
* Transaction status

The analytics interface is designed to help administrators understand transaction patterns and monitor the overall fraud detection workflow.

---

## 🤖 Machine Learning Workflow

SecureFlow uses a **Random Forest classifier** to predict the risk associated with UPI transactions.

### ML Pipeline

```text
Transaction Data
       ↓
Data Preprocessing
       ↓
Feature Extraction
       ↓
Random Forest Model
       ↓
Risk Prediction
       ↓
Risk Score
       ↓
Backend Decision
       ↓
Customer / Fraud Analyst
```

The Python ML service exposes the trained model through Flask, allowing the Node.js backend to request predictions during transaction processing.

---

## 🏗️ System Architecture

```text
                     ┌──────────────────────┐
                     │    React Frontend    │
                     │       Vite           │
                     └──────────┬───────────┘
                                │
                         REST API / Socket.IO
                                │
                                ▼
                     ┌──────────────────────┐
                     │   Node.js Backend    │
                     │      Express.js      │
                     └───────┬───────┬──────┘
                             │       │
                    ┌────────┘       └─────────┐
                    ▼                          ▼
             ┌──────────────┐          ┌──────────────┐
             │   MongoDB    │          │ Python Flask │
             │   Database   │          │ ML Service   │
             └──────────────┘          └──────┬───────┘
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │ Random Forest   │
                                      │ ML Model        │
                                      └─────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* Socket.io-client
* Dashboard UI components

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Socket.IO

### Machine Learning

* Python
* Flask
* Scikit-learn
* Random Forest
* Pandas
* NumPy

---

## 📂 Project Structure

```text
SecureFlow/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── ml_service/
│   ├── train_model.py
│   ├── app.py
│   ├── model/
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

---

## 🚀 How It Works

1. A customer submits a UPI transaction.
2. The React frontend sends the transaction to the Node.js backend.
3. The backend validates the authenticated user's request.
4. Transaction data is sent to the Python Flask ML service.
5. The Random Forest model analyzes the transaction.
6. The ML service returns a risk prediction and score.
7. The backend determines the transaction workflow based on the risk level.
8. Suspicious transactions are routed to the Fraud Analyst queue.
9. The analyst reviews the transaction and takes appropriate action.
10. The transaction status is updated in MongoDB.
11. Socket.IO sends real-time status notifications to the relevant user.
12. Transaction information contributes to the analytics dashboard.

---

## 🔄 Transaction Workflow

```text
Customer
   │
   ▼
Submit UPI Transaction
   │
   ▼
Node.js / Express API
   │
   ▼
Python Flask ML Service
   │
   ▼
Random Forest Prediction
   │
   ▼
Risk Score Generated
   │
   ├───────────────┐
   │               │
 Low Risk       High Risk
   │               │
   ▼               ▼
Normal Flow    Analyst Queue
                   │
                   ▼
             Fraud Investigation
                   │
             ┌─────┴─────┐
             ▼           ▼
          Approve       Reject
             │           │
             └─────┬─────┘
                   ▼
          Real-Time Notification
```

---

## 🎯 Project Objective

The primary objective of SecureFlow is to demonstrate how **Artificial Intelligence, Machine Learning, and Full-Stack Development** can be combined to build a practical transaction fraud detection platform.

The system aims to:

* Detect potentially suspicious UPI transactions.
* Generate transaction risk scores.
* Reduce manual fraud screening effort.
* Provide analysts with a structured investigation workflow.
* Enable real-time transaction status communication.
* Provide administrators with transaction and risk analytics.

---

## 💡 Key Highlights

* Full-stack MERN application
* AI-powered transaction risk detection
* Random Forest Machine Learning model
* Python Flask ML microservice
* JWT authentication
* Role-based access control
* Real-time Socket.IO communication
* MongoDB transaction storage
* Fraud analyst investigation workflow
* Risk analytics dashboard

---

## 🔮 Future Enhancements

* Advanced anomaly detection models
* Explainable AI using SHAP/LIME
* Real-time transaction streaming
* Cloud deployment
* Automated model retraining
* Advanced fraud pattern detection
* Model performance monitoring
* Integration with additional fraud detection algorithms

---

## 📜 License

Developed as an academic and portfolio project for demonstrating **AI-powered fraud detection, machine learning integration, and full-stack web application development**.
