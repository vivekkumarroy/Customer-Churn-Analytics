import streamlit as st
import pandas as pd
import numpy as np
import os
from src.data_loader import load_customer_data, load_model_artifact, check_files_exist
from src.business_logic import calculate_clv, get_risk_level, assign_risk_value_segment, retention_recommendation
from src.prediction import predict_customer
from src.explanation import generate_explanation
from src.visualization import plot_churn_distribution, plot_risk_distribution, plot_value_distribution, plot_segment_distribution

# Configure Page
st.set_page_config(page_title="CustomerIQ | Churn & Retention", page_icon="📈", layout="wide")

# Custom CSS for styling
st.markdown("""
<style>
    /* Styling */
    .metric-card {
        background-color: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        text-align: center;
    }
    .metric-value {
        font-size: 2rem;
        font-weight: bold;
        color: #0F172A;
    }
    .metric-label {
        font-size: 1rem;
        color: #64748B;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .priority-card {
        background-color: #FEF2F2;
        border-left: 5px solid #EF4444;
        padding: 15px;
        margin-bottom: 10px;
        border-radius: 4px;
    }
</style>
""", unsafe_allow_html=True)

# Missing Files Handling
missing_files = check_files_exist()
if missing_files:
    st.error("🚨 **Missing Artifacts Detected!**")
    st.warning("Please ensure the following files are placed in their respective directories before running the application:")
    for f in missing_files:
        st.markdown(f"- `{f}`")
    st.info("The application requires these files from your Colab Phase 15 execution to run correctly.")
    st.stop()

# Load Data & Models
df = load_customer_data()
final_model = load_model_artifact("models/final_model.pkl")
model_features = load_model_artifact("models/model_features.pkl")
model_info = load_model_artifact("models/model_info.pkl")

# Extract Model Info
winning_model = model_info.get("Winning Model", "Unknown Model")
threshold = model_info.get("Threshold", 0.5)

# Sidebar
st.sidebar.title("CustomerIQ")
st.sidebar.markdown("### Customer Churn & Retention Intelligence")
st.sidebar.markdown("---")
page = st.sidebar.radio("Navigation", [
    "🏠 Dashboard", 
    "👥 Segmentation", 
    "⚠️ Churn Analysis", 
    "🔎 Customer Lookup", 
    "🤖 Prediction"
])
st.sidebar.markdown("---")
st.sidebar.markdown("### MODEL INFO")
st.sidebar.info(f"**Model:** {winning_model}")
st.sidebar.warning(f"**Threshold:** {threshold}")

# Format helpers
def format_currency(val):
    return f"₹{val:,.2f}"

def format_pct(val):
    return f"{val*100:.2f}%"

# 1. DASHBOARD
if page == "🏠 Dashboard":
    st.title("🏠 Dashboard")
    st.markdown("Monitor customer health, churn risk and business value.")
    
    # KPIs
    total_customers = len(df)
    total_revenue = df['CLV'].sum() if 'CLV' in df.columns else df['EstimatedCLV'].sum() if 'EstimatedCLV' in df.columns else 0
    high_risk = len(df[df['RiskLevel'] == 'HIGH'])
    high_value = len(df[df['ValueLevel'] == 'High Value'])
    churn_rate = df['ChurnPrediction'].mean()

    col1, col2, col3, col4, col5 = st.columns(5)
    with col1:
        st.markdown(f"<div class='metric-card'><div class='metric-label'>Total Customers</div><div class='metric-value'>{total_customers:,}</div></div>", unsafe_allow_html=True)
    with col2:
        st.markdown(f"<div class='metric-card'><div class='metric-label'>Total CLV</div><div class='metric-value'>{format_currency(total_revenue)}</div></div>", unsafe_allow_html=True)
    with col3:
        st.markdown(f"<div class='metric-card'><div class='metric-label'>High-Risk</div><div class='metric-value'>{high_risk:,}</div></div>", unsafe_allow_html=True)
    with col4:
        st.markdown(f"<div class='metric-card'><div class='metric-label'>High-Value</div><div class='metric-value'>{high_value:,}</div></div>", unsafe_allow_html=True)
    with col5:
        st.markdown(f"<div class='metric-card'><div class='metric-label'>Churn Rate</div><div class='metric-value'>{format_pct(churn_rate)}</div></div>", unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Charts
    r1c1, r1c2 = st.columns(2)
    with r1c1:
        st.plotly_chart(plot_churn_distribution(df), use_container_width=True)
    with r1c2:
        st.plotly_chart(plot_risk_distribution(df), use_container_width=True)
        
    r2c1, r2c2 = st.columns(2)
    with r2c1:
        st.plotly_chart(plot_value_distribution(df), use_container_width=True)
    with r2c2:
        st.plotly_chart(plot_segment_distribution(df), use_container_width=True)
        
    # Priority Customers
    st.subheader("🚨 Priority Customers")
    st.markdown("These are HIGH VALUE + HIGH CHURN RISK customers requiring immediate retention attention.")
    priority_df = df[(df['RiskValueSegment'] == 'Priority Retain')].sort_values(by='ChurnProbability', ascending=False)
    
    clv_col = 'CLV' if 'CLV' in df.columns else 'EstimatedCLV' if 'EstimatedCLV' in df.columns else None
    display_cols = ['CustomerID', clv_col, 'ChurnProbability', 'RiskLevel', 'RiskValueSegment', 'RecommendedAction']
    display_cols = [c for c in display_cols if c in priority_df.columns]
    
    if not priority_df.empty:
        st.dataframe(priority_df[display_cols].head(10), use_container_width=True)
    else:
        st.info("No priority customers found at this time.")

# 2. SEGMENTATION
elif page == "👥 Segmentation":
    st.title("👥 Customer Segmentation")
    
    segments = df['RiskValueSegment'].unique()
    selected_segment = st.selectbox("Select Segment:", options=segments)
    
    segment_df = df[df['RiskValueSegment'] == selected_segment]
    
    clv_col = 'CLV' if 'CLV' in df.columns else 'EstimatedCLV' if 'EstimatedCLV' in df.columns else None
    
    avg_clv = segment_df[clv_col].mean() if clv_col else 0
    avg_churn = segment_df['ChurnProbability'].mean()
    
    c1, c2, c3 = st.columns(3)
    c1.metric("Segment Size", len(segment_df))
    c2.metric("Average CLV", format_currency(avg_clv))
    c3.metric("Average Churn Probability", format_pct(avg_churn))
    
    st.dataframe(segment_df, use_container_width=True)

# 3. CHURN ANALYSIS
elif page == "⚠️ Churn Analysis":
    st.title("⚠️ Churn Analytics")
    
    c1, c2, c3 = st.columns(3)
    
    risk_filter = c1.multiselect("Risk Level", options=df['RiskLevel'].unique(), default=df['RiskLevel'].unique())
    value_filter = c2.multiselect("Value Level", options=df['ValueLevel'].unique(), default=df['ValueLevel'].unique())
    segment_filter = c3.multiselect("Segment", options=df['RiskValueSegment'].unique(), default=df['RiskValueSegment'].unique())
    
    filtered_df = df[
        (df['RiskLevel'].isin(risk_filter)) &
        (df['ValueLevel'].isin(value_filter)) &
        (df['RiskValueSegment'].isin(segment_filter))
    ]
    
    clv_col = 'CLV' if 'CLV' in df.columns else 'EstimatedCLV' if 'EstimatedCLV' in df.columns else None
    display_cols = ['CustomerID', 'Recency', 'Frequency', 'Monetary', clv_col, 'ChurnProbability', 'RiskLevel', 'RiskValueSegment', 'RecommendedAction']
    display_cols = [c for c in display_cols if c in filtered_df.columns]
    
    st.dataframe(filtered_df[display_cols].sort_values(by='ChurnProbability', ascending=False), use_container_width=True)

# 4. CUSTOMER LOOKUP
elif page == "🔎 Customer Lookup":
    st.title("🔎 Customer Lookup")
    
    customer_id_input = st.text_input("Enter Customer ID:")
    
    if st.button("Search Customer"):
        if customer_id_input:
            try:
                cust_id = float(customer_id_input)
                customer = df[df['CustomerID'] == cust_id]
                
                if not customer.empty:
                    cust = customer.iloc[0]
                    st.success(f"Customer Profile: {cust_id}")
                    
                    c1, c2, c3, c4 = st.columns(4)
                    c1.metric("Churn Probability", format_pct(cust['ChurnProbability']))
                    c2.metric("Risk Level", cust['RiskLevel'])
                    clv_col = 'CLV' if 'CLV' in df.columns else 'EstimatedCLV' if 'EstimatedCLV' in df.columns else None
                    if clv_col: c3.metric("CLV", format_currency(cust[clv_col]))
                    c4.metric("Recommended Action", cust['RecommendedAction'])
                    
                    st.subheader("Customer Behavior")
                    behaviors = ['Recency', 'Frequency', 'Monetary', 'TotalItems', 'UniqueProducts', 'AverageOrderValue', 'CustomerLifetime', 'AverageDaysBetweenPurchases']
                    behaviors = [b for b in behaviors if b in cust.index]
                    
                    b_cols = st.columns(len(behaviors)//2)
                    for i, b in enumerate(behaviors):
                        col = b_cols[i % len(b_cols)]
                        col.metric(b, round(cust[b], 2))
                    
                    st.subheader("Why does the model think this?")
                    explanation = generate_explanation(winning_model, final_model, customer, model_features)
                    if not explanation.empty:
                        st.dataframe(explanation, use_container_width=True)
                    else:
                        st.warning("Explanation not available for this model.")
                        
                else:
                    st.error("Customer not found.")
            except ValueError:
                st.error("Please enter a valid numeric Customer ID.")

# 5. PREDICTION
elif page == "🤖 Prediction":
    st.title("🤖 New Customer Prediction")
    
    st.markdown("Enter customer features to predict churn risk and get retention recommendations.")
    
    with st.form("prediction_form"):
        inputs = {}
        cols = st.columns(3)
        
        for i, feature in enumerate(model_features):
            col = cols[i % 3]
            inputs[feature] = col.number_input(f"{feature}", value=0.0)
            
        submit = st.form_submit_button("🔮 Predict Churn")
        
        if submit:
            input_df = pd.DataFrame([inputs])
            prob = predict_customer(final_model, input_df, model_features)
            
            risk_level = get_risk_level(prob)
            churn_pred = 1 if prob >= threshold else 0
            
            aov = inputs.get('AverageOrderValue', 0)
            freq = inputs.get('Frequency', 0)
            clt = inputs.get('CustomerLifetime', 0)
            
            clv = calculate_clv(aov, freq, clt)
            
            # Since we don't have median CLV here easily without whole dataset, we will calculate it
            clv_col = 'CLV' if 'CLV' in df.columns else 'EstimatedCLV' if 'EstimatedCLV' in df.columns else None
            median_clv = df[clv_col].median() if clv_col else 1000
            
            value_level = "High Value" if clv >= median_clv else "Low Value"
            segment = assign_risk_value_segment(value_level, risk_level)
            recommendation = retention_recommendation(segment)
            
            st.markdown("---")
            st.markdown("### PREDICTION RESULT")
            
            r1, r2 = st.columns(2)
            r1.metric("CHURN PROBABILITY", format_pct(prob))
            r2.metric("RISK LEVEL", f"{'🔴' if risk_level=='HIGH' else '🟠' if risk_level=='MEDIUM' else '🟢'} {risk_level}")
            
            c1, c2, c3, c4 = st.columns(4)
            c1.metric("Prediction", "CHURN" if churn_pred else "NOT CHURN")
            c2.metric("Estimated CLV", format_currency(clv))
            c3.metric("Segment", segment)
            c4.metric("Recommended Action", recommendation)
