import pandas as pd

def predict_customer(final_model, customer_input, feature_names):
    """
    Given a customer_input DataFrame (1 row), predict churn probability.
    """
    customer_input = customer_input[feature_names] # Ensure order matches
    
    churn_probability = final_model.predict_proba(customer_input)[0, 1]
    
    return churn_probability
