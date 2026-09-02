# Customer Churn Analytics Platform

## Project Overview
This project is a professional, full-stack Customer Churn Analytics and Retention Decision System. It transforms a machine learning pipeline into a business-facing dashboard that calculates churn probability, assesses risk, estimates Customer Lifetime Value (CLV), and provides recommended retention actions.

## Problem Statement
Customer churn directly impacts revenue and growth. Identifying at-risk customers early enables proactive retention strategies. This platform provides actionable intelligence by combining real-time machine learning predictions with comprehensive behavioral analysis.

## ML Pipeline
The core ML model uses **Logistic Regression**. The threshold for predicting a churn event is dynamically loaded from the saved model artifacts (`model_info.pkl`), ensuring perfect alignment between training evaluation and production predictions.

## Key Features
- **Customer Segmentation**: Analyzes customers across a Risk × Value matrix.
- **Churn Prediction**: Dynamic forms to run real-time inference using the trained ML model.
- **CLV**: Integration of Estimated Customer Lifetime Value to prioritize high-value retention efforts.
- **Retention Recommendation Engine**: Actionable suggestions based on a customer's specific Risk × Value quadrant.

## Technology Stack
- **Frontend**: React, Vite, Tailwind CSS, Recharts, Axios, React Router.
- **Backend**: Python, FastAPI, Pandas, NumPy, Scikit-learn, XGBoost, Joblib.

## Project Structure
```
Customer-Churn-Analytics/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── api.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── data/
│   │   └── customer_features.csv
│   └── models/
│       ├── churn_model.pkl
│       ├── model_features.pkl
│       └── model_info.pkl
│
└── README.md
```

## Model Artifacts
The application exclusively uses the provided real-world artifacts located in the `backend` directory. No dummy data or mock models are generated or utilized.

## API Endpoints
- `GET /api/health` - Health check.
- `GET /api/dashboard` - Global KPIs.
- `GET /api/segments` - Risk × Value segment distribution.
- `GET /api/churn` - Churn risk aggregations.
- `GET /api/customers` - Paginated customer list.
- `GET /api/customers/{customer_id}` - Detailed profile for a specific customer.
- `POST /api/predict` - Real-time inference using the provided ML model.

## How to Install and Run

### Backend
Navigate to the backend directory, install the dependencies, and start the FastAPI server:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`.

### Frontend
Navigate to the frontend directory, install the packages, and start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```
The Dashboard will be available at `http://localhost:5173`.

## Screenshots
*(Add screenshots of the dashboard, customer profile, and prediction forms here)*

## Future Improvements
- Implement user authentication.
- Add A/B testing frameworks for recommended actions.
- Incorporate time-series forecasting for CLV.
