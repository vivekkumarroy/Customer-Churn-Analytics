import os
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, create_model

app = FastAPI(title="Customer Churn Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "customer_features.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models", "churn_model.pkl")
MODEL_FEATURES_PATH = os.path.join(BASE_DIR, "models", "model_features.pkl")
MODEL_INFO_PATH = os.path.join(BASE_DIR, "models", "model_info.pkl")

# Global variables for models and data
df = None
churn_model = None
model_features = None
model_info = None
model_threshold = 0.5
PredictionInputModel = None

@app.on_event("startup")
def load_artifacts():
    global df, churn_model, model_features, model_info, model_threshold, PredictionInputModel
    
    # 1. Load Data
    if not os.path.exists(DATA_PATH):
        raise RuntimeError(f"Deployment artifact missing: data/customer_features.csv")
    df = pd.read_csv(DATA_PATH)
    
    # 2. Load Model
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Deployment artifact missing: models/churn_model.pkl")
    churn_model = joblib.load(MODEL_PATH)
    
    # 3. Load Model Features
    if not os.path.exists(MODEL_FEATURES_PATH):
        raise RuntimeError(f"Deployment artifact missing: models/model_features.pkl")
    model_features = joblib.load(MODEL_FEATURES_PATH)
    
    # 4. Load Model Info
    if not os.path.exists(MODEL_INFO_PATH):
        raise RuntimeError(f"Deployment artifact missing: models/model_info.pkl")
    model_info = joblib.load(MODEL_INFO_PATH)
    
    if "Threshold" in model_info:
        model_threshold = float(model_info["Threshold"])
        
    # Dynamically create Pydantic model for input validation based on model_features
    fields = {feat: (float, ...) for feat in model_features}
    PredictionInputModel = create_model("PredictionInput", **fields)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/dashboard")
def get_dashboard_metrics():
    if df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    total_customers = len(df)
    total_revenue = df["Monetary"].sum() if "Monetary" in df.columns else 0
    churn_rate = (df["ChurnPrediction"].sum() / total_customers) if "ChurnPrediction" in df.columns else 0
    high_risk_customers = len(df[df["RiskLevel"] == "HIGH"]) if "RiskLevel" in df.columns else 0
    high_value_customers = len(df[df["ValueLevel"] == "High Value"]) if "ValueLevel" in df.columns else 0
    
    # Handle EstimatedCLV
    avg_clv = df["EstimatedCLV"].mean() if "EstimatedCLV" in df.columns else 0
    avg_order_value = df["AverageOrderValue"].mean() if "AverageOrderValue" in df.columns else 0
    
    return {
        "total_customers": int(total_customers),
        "total_revenue": float(total_revenue),
        "churn_rate": float(churn_rate),
        "high_risk_customers": int(high_risk_customers),
        "high_value_customers": int(high_value_customers),
        "average_clv": float(avg_clv),
        "average_order_value": float(avg_order_value)
    }

@app.get("/api/segments")
def get_segments():
    if df is None or "RiskValueSegment" not in df.columns:
        raise HTTPException(status_code=500, detail="Data or required columns not loaded")
    
    segment_stats = df.groupby("RiskValueSegment").agg(
        customer_count=("CustomerID", "count"),
        total_revenue=("Monetary", "sum"),
        average_clv=("EstimatedCLV", "mean"),
        average_churn_probability=("ChurnProbability", "mean")
    ).reset_index()
    
    # Convert to list of dicts safely handling NaNs
    result = []
    for _, row in segment_stats.iterrows():
        result.append({
            "segment_name": row["RiskValueSegment"],
            "customer_count": int(row["customer_count"]),
            "total_revenue": float(row["total_revenue"]) if not pd.isna(row["total_revenue"]) else 0.0,
            "average_clv": float(row["average_clv"]) if not pd.isna(row["average_clv"]) else 0.0,
            "average_churn_probability": float(row["average_churn_probability"]) if not pd.isna(row["average_churn_probability"]) else 0.0
        })
    return result

@app.get("/api/churn")
def get_churn_analysis():
    if df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    churn_dist = df["ChurnPrediction"].value_counts().to_dict() if "ChurnPrediction" in df.columns else {}
    # Convert keys to int if necessary for JSON serialization
    churn_dist = {int(k): int(v) for k, v in churn_dist.items()}
    
    risk_dist = df["RiskLevel"].value_counts().to_dict() if "RiskLevel" in df.columns else {}
    risk_dist = {str(k): int(v) for k, v in risk_dist.items()}
    
    high_risk_df = df[df["RiskLevel"] == "HIGH"] if "RiskLevel" in df.columns else pd.DataFrame()
    high_risk_count = len(high_risk_df)
    
    # Select columns for table safely
    table_cols = ["CustomerID", "ChurnProbability", "RiskLevel", "EstimatedCLV", "ValueLevel", "RiskValueSegment", "RecommendedAction"]
    available_cols = [c for c in table_cols if c in high_risk_df.columns]
    
    high_risk_table = high_risk_df[available_cols].fillna("").to_dict(orient="records")
    
    return {
        "churn_distribution": churn_dist,
        "risk_distribution": risk_dist,
        "high_risk_customer_count": high_risk_count,
        "high_risk_customer_table": high_risk_table
    }

@app.get("/api/customers")
def get_customers(page: int = 1, page_size: int = 50):
    if df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    
    total_records = len(df)
    subset = df.iloc[start_idx:end_idx]
    
    records = subset.fillna("").to_dict(orient="records")
    return {
        "total": total_records,
        "page": page,
        "page_size": page_size,
        "data": records
    }

@app.get("/api/customers/{customer_id}")
def get_customer(customer_id: float):
    if df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    # customer_id might be float in pandas, try to match it
    customer = df[df["CustomerID"] == customer_id]
    if len(customer) == 0:
        raise HTTPException(status_code=404, detail="Customer not found.")
    
    # Replace NaN with empty string
    return customer.iloc[0].replace({np.nan: ""}).to_dict()

@app.post("/api/predict")
def predict_churn(input_data: dict):
    if churn_model is None or model_features is None:
        raise HTTPException(status_code=500, detail="Model artifacts not loaded")
    
    # Strict validation against model_features
    missing_features = [feat for feat in model_features if feat not in input_data]
    if missing_features:
        raise HTTPException(status_code=422, detail=f"Missing required features: {missing_features}")
    
    # Extract features in EXACT order
    feature_values = []
    for feat in model_features:
        try:
            val = float(input_data[feat])
            feature_values.append(val)
        except (ValueError, TypeError):
            raise HTTPException(status_code=422, detail=f"Feature {feat} must be a number.")
            
    # Convert to 2D array for prediction
    # Use pandas DataFrame to ensure valid feature names for pipelines that require it
    X = pd.DataFrame([feature_values], columns=model_features)
    
    try:
        # Run predict_proba
        prob = churn_model.predict_proba(X)[0][1]
        
        # Apply dynamic threshold
        prediction = 1 if prob >= model_threshold else 0
        
        # Calculate Risk Level (matching existing logic if possible, or using thresholds)
        # Using simple thresholds based on the requested logic since the prompt asks for standard Risk Level
        # However, to be perfectly safe we shouldn't invent risk logic if we can avoid it.
        # But we must return a risk level.
        if prob >= 0.70:
            risk_level = "HIGH"
        elif prob >= model_threshold:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
            
        return {
            "churn_probability": float(prob),
            "churn_prediction": int(prediction),
            "risk_level": risk_level,
            "model_used": model_info.get("Model", "Unknown Model"),
            "threshold": float(model_threshold)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/api/model_features")
def get_model_features():
    if model_features is None:
        raise HTTPException(status_code=500, detail="Model features not loaded")
    return {"features": model_features}
