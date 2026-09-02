import pandas as pd
import numpy as np

def generate_explanation(model_name, final_model, customer_input, feature_names):
    explanations = []
    
    if model_name == 'Logistic Regression':
        try:
            scaler = final_model.named_steps['scaler']
            lr_model = final_model.named_steps['model']
            customer_scaled = scaler.transform(customer_input)[0]
            coefficients = lr_model.coef_[0]
            contributions = customer_scaled * coefficients
            
            for feature, value, contribution in zip(feature_names, customer_input.iloc[0], contributions):
                effect = "Increases churn" if contribution > 0 else "Decreases churn"
                explanations.append({
                    'Feature': feature,
                    'Value': value,
                    'Effect': effect,
                    'Importance': abs(contribution)
                })
        except Exception as e:
            print(f"Error explaining Logistic Regression: {e}")
            
    elif model_name == 'Random Forest':
        try:
            import shap
            explainer = shap.TreeExplainer(final_model)
            shap_values = explainer.shap_values(customer_input)
            
            if isinstance(shap_values, list):
                customer_shap = shap_values[1][0]
            else:
                customer_shap = shap_values[0]
                
            for feature, value, contribution in zip(feature_names, customer_input.iloc[0], customer_shap):
                effect = "Increases churn" if contribution > 0 else "Decreases churn"
                explanations.append({
                    'Feature': feature,
                    'Value': value,
                    'Effect': effect,
                    'Importance': abs(contribution)
                })
        except Exception as e:
             # Fallback to feature importances if SHAP fails or takes too long
             try:
                 importance_values = final_model.feature_importances_
                 for feature, value, imp in zip(feature_names, customer_input.iloc[0], importance_values):
                     explanations.append({
                         'Feature': feature,
                         'Value': value,
                         'Effect': "Model Feature Importance",
                         'Importance': imp
                     })
             except:
                 pass
                
    elif model_name == 'XGBoost':
        try:
            import shap
            explainer = shap.TreeExplainer(final_model)
            shap_values = explainer(customer_input)
            customer_shap = shap_values.values[0]
            
            for feature, value, contribution in zip(feature_names, customer_input.iloc[0], customer_shap):
                effect = "Increases churn" if contribution > 0 else "Decreases churn"
                explanations.append({
                    'Feature': feature,
                    'Value': value,
                    'Effect': effect,
                    'Importance': abs(contribution)
                })
        except Exception as e:
             try:
                 importance_values = final_model.feature_importances_
                 for feature, value, imp in zip(feature_names, customer_input.iloc[0], importance_values):
                     explanations.append({
                         'Feature': feature,
                         'Value': value,
                         'Effect': "Model Feature Importance",
                         'Importance': imp
                     })
             except:
                 pass

    explanation_df = pd.DataFrame(explanations)
    if not explanation_df.empty:
        explanation_df = explanation_df.sort_values('Importance', ascending=False)
    return explanation_df
