import numpy as np

def calculate_clv(average_order_value, frequency, customer_lifetime, expected_lifetime_years=1):
    if customer_lifetime > 0:
        purchase_freq_per_year = frequency / (customer_lifetime / 365)
    else:
        purchase_freq_per_year = frequency
        
    purchase_freq_per_year = min(purchase_freq_per_year, 365) # Clip upper
    
    clv = average_order_value * purchase_freq_per_year * expected_lifetime_years
    return clv

def get_risk_level(probability):
    if probability >= 0.70:
        return 'HIGH'
    elif probability >= 0.40:
        return 'MEDIUM'
    else:
        return 'LOW'

def assign_risk_value_segment(value_level, risk_level):
    if value_level == 'High Value' and risk_level in ['HIGH', 'MEDIUM']:
        return 'Priority Retain'
    elif value_level == 'High Value' and risk_level == 'LOW':
        return 'VIP Loyal'
    elif value_level == 'Low Value' and risk_level in ['HIGH', 'MEDIUM']:
        return 'Automated Campaign'
    else:
        return 'Normal Marketing'

def retention_recommendation(segment):
    if segment == 'Priority Retain':
        return 'Priority retention offer'
    elif segment == 'VIP Loyal':
        return 'Loyalty program'
    elif segment == 'Automated Campaign':
        return 'Low-cost automated campaign'
    else:
        return 'Normal marketing'
