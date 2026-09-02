import plotly.express as px

# Professional color system
COLORS = {
    'Deep Navy': '#0F172A',
    'Blue': '#2563EB',
    'Cyan': '#06B6D4',
    'Green': '#10B981',
    'Amber': '#F59E0B',
    'Red': '#EF4444',
    'Background': '#F8FAFC'
}

def plot_churn_distribution(df):
    churn_counts = df['ChurnPrediction'].value_counts().reset_index()
    churn_counts.columns = ['ChurnPrediction', 'Count']
    churn_counts['Churn Status'] = churn_counts['ChurnPrediction'].map({1: 'Churn', 0: 'Not Churn'})
    
    fig = px.pie(churn_counts, values='Count', names='Churn Status', 
                 title='Churn Prediction Distribution',
                 color='Churn Status',
                 color_discrete_map={'Churn': COLORS['Red'], 'Not Churn': COLORS['Green']},
                 hole=0.4)
    fig.update_layout(paper_bgcolor=COLORS['Background'], plot_bgcolor=COLORS['Background'])
    return fig

def plot_risk_distribution(df):
    risk_counts = df['RiskLevel'].value_counts().reset_index()
    risk_counts.columns = ['RiskLevel', 'Count']
    
    fig = px.bar(risk_counts, x='RiskLevel', y='Count',
                 title='Customer Risk Level Distribution',
                 color='RiskLevel',
                 color_discrete_map={'LOW': COLORS['Green'], 'MEDIUM': COLORS['Amber'], 'HIGH': COLORS['Red']})
    fig.update_layout(paper_bgcolor=COLORS['Background'], plot_bgcolor=COLORS['Background'])
    return fig

def plot_value_distribution(df):
    val_counts = df['ValueLevel'].value_counts().reset_index()
    val_counts.columns = ['ValueLevel', 'Count']
    
    fig = px.bar(val_counts, x='ValueLevel', y='Count',
                 title='Customer Value Level Distribution',
                 color='ValueLevel',
                 color_discrete_map={'High Value': COLORS['Blue'], 'Low Value': COLORS['Cyan']})
    fig.update_layout(paper_bgcolor=COLORS['Background'], plot_bgcolor=COLORS['Background'])
    return fig

def plot_segment_distribution(df):
    seg_counts = df['RiskValueSegment'].value_counts().reset_index()
    seg_counts.columns = ['RiskValueSegment', 'Count']
    
    fig = px.treemap(seg_counts, path=['RiskValueSegment'], values='Count',
                     title='Risk × Value Segmentation',
                     color='RiskValueSegment',
                     color_discrete_map={
                         'Priority Retain': COLORS['Red'], 
                         'VIP Loyal': COLORS['Green'],
                         'Automated Campaign': COLORS['Amber'],
                         'Normal Marketing': COLORS['Blue']
                     })
    fig.update_layout(paper_bgcolor=COLORS['Background'], plot_bgcolor=COLORS['Background'])
    return fig
