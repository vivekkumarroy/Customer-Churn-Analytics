import os
import pickle
import pandas as pd
import streamlit as st

@st.cache_data
def load_customer_data(filepath="data/customer_features.csv"):
    if not os.path.exists(filepath):
        return None
    try:
        return pd.read_csv(filepath)
    except Exception as e:
        st.error(f"Error loading customer data: {e}")
        return None

@st.cache_resource
def load_model_artifact(filepath):
    if not os.path.exists(filepath):
        return None
    try:
        with open(filepath, 'rb') as f:
            return pickle.load(f)
    except Exception as e:
        st.error(f"Error loading artifact from {filepath}: {e}")
        return None

def check_files_exist():
    missing = []
    if not os.path.exists("data/customer_features.csv"):
        missing.append("data/customer_features.csv")
    if not os.path.exists("models/final_model.pkl"):
        missing.append("models/final_model.pkl")
    if not os.path.exists("models/model_features.pkl"):
        missing.append("models/model_features.pkl")
    if not os.path.exists("models/model_info.pkl"):
        missing.append("models/model_info.pkl")
    return missing
