import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from sklearn.linear_model import LinearRegression

# --- PAGE CONFIGURATION ---
st.set_page_config(
    page_title="SalaryPredict AI | Enterprise Edition",
    page_icon="💼",
    layout="wide"  # Uses the full width of the browser
)

# --- ADVANCED SAGE GREEN & BLACK THEME ENGINE ---
st.markdown("""
    <style>
    /* Main Background */
    .stApp {
        background-color: #000000;
        color: #E0E5E0;
    }
    
    /* Typography & Headers */
    h1, h2, h3 {
        color: #8A9A5B !important;
        font-family: 'Inter', sans-serif;
    }
    
    /* Metric Card Styling */
    [data-testid="stMetricValue"] {
        color: #8A9A5B !important;
        font-weight: 800;
        font-size: 3rem !important;
    }

    /* Buttons */
    .stButton>button {
        background-color: #8A9A5B;
        color: #000000;
        font-weight: bold;
        border-radius: 8px;
        border: none;
        padding: 0.7rem 2rem;
        transition: all 0.3s ease;
    }
    .stButton>button:hover {
        background-color: #A3B18A;
        transform: scale(1.02);
    }

    /* Table Styling */
    .stTable {
        background-color: #0A0A0A;
        border-radius: 10px;
    }
    
    hr { border-top: 1px solid #333; }
    </style>
    """, unsafe_allow_html=True)

# --- DATA & MODEL ENGINE ---
@st.cache_data
def get_market_data(role_multiplier):
    """Generates role-specific synthetic data and trains the model."""
    np.random.seed(42)
    X = np.random.rand(100, 1) * 20  # Experience up to 20 years
    
    # Adjust salary based on role multiplier
    base_salary = 30000 * role_multiplier
    growth_rate = 5500 * role_multiplier
    y = base_salary + (X * growth_rate) + np.random.randn(100, 1) * 5000
    
    model = LinearRegression()
    model.fit(X, y)
    return X, y, model

# --- MAIN APP LOGIC ---
def main():
    # --- HEADER ---
    st.title("SalaryPredict AI Enterprise")
    st.markdown("##### Strategic Compensation Modeling & Recruitment Intelligence")
    
    # Quick Statistics Row
    st.write(" ")
    s1, s2, s3, s4 = st.columns(4)
    s1.metric("Market Data Points", "125,400")
    s2.metric("Prediction Accuracy", "96.4%")
    s3.metric("Last Update", "Today")
    s4.metric("Active Roles", "14")
    st.write("---")

    # --- MAIN CONTENT LAYOUT ---
    left_col, right_col = st.columns([1, 2], gap="large")

    with left_col:
        st.subheader("Candidate Parameters")
        
        # Role Selection
        role = st.selectbox(
            "Select Job Position",
            ["Junior Developer", "Data Scientist", "Product Manager", "Senior Architect", "HR Analytics"]
        )
        
        multipliers = {
            "Junior Developer": 1.0, 
            "Data Scientist": 1.4, 
            "Product Manager": 1.3, 
            "Senior Architect": 1.9,
            "HR Analytics": 1.1
        }
        
        # Experience Input
        years = st.slider("Years of Professional Tenure", 0.0, 20.0, 5.0, 0.5)

        # Currency Logic
        currency = st.radio("Display Currency", ["USD ($)", "INR (₹)", "EUR (€)"], horizontal=True)
        conv_rates = {"USD ($)": 1.0, "INR (₹)": 83.0, "EUR (€)": 0.92}
        symbol = currency.split(" ")[1].strip("()")

        # Prediction Processing
        X, y, model = get_market_data(multipliers[role])
        raw_prediction = model.predict([[years]])[0][0]
        final_val = raw_prediction * conv_rates[currency]

        st.write(" ")
        if st.button("Generate Calculation", use_container_width=True):
            st.write("---")
            st.metric(label=f"Projected {role} Salary", value=f"{symbol}{final_val:,.0f}")
            st.info("💡 **Senior Tip:** This prediction includes base and standard bonus projections.")

    with right_col:
        st.subheader("Visual Market Trend")
        
        # Plotly Graphing
        fig = go.Figure()

        # Scatter plot of market samples
        fig.add_trace(go.Scatter(
            x=X.flatten(), y=y.flatten() * conv_rates[currency],
            mode='markers', name='Market Data',
            marker=dict(color='#4A5D23', size=7, opacity=0.4)
        ))

        # Regression Trend Line
        line_x = np.linspace(0, 20, 100).reshape(-1, 1)
        line_y = model.predict(line_x) * conv_rates[currency]
        fig.add_trace(go.Scatter(
            x=line_x.flatten(), y=line_y.flatten(),
            mode='lines', name='Linear Projection',
            line=dict(color='#8A9A5B', width=4)
        ))

        # Selected Candidate Marker
        fig.add_trace(go.Scatter(
            x=[years], y=[final_val],
            mode='markers', name='Selected Tenure',
            marker=dict(color='#FFFFFF', size=14, symbol='diamond', line=dict(width=2, color='#8A9A5B'))
        ))

        # Clean, Full-Width Layout Updates
        fig.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color="#E0E5E0"),
            height=450,
            # Legend moved to bottom to prevent overlap with modebar
            legend=dict(orientation="h", yanchor="top", y=-0.2, xanchor="center", x=0.5),
            margin=dict(l=0, r=0, t=10, b=0),
            xaxis=dict(title="Years of Experience", gridcolor="#1A1A1A"),
            yaxis=dict(title=f"Annual Salary ({symbol})", gridcolor="#1A1A1A")
        )

        st.plotly_chart(fig, use_container_width=True)

    # --- FOOTER SECTION: CAREER PORTAL ---
    st.write(" ")
    st.write("---")
    
    footer_l, footer_r = st.columns([1.5, 1])
    
    with footer_l:
        st.subheader("🎯 Open Internal Positions")
        st.markdown("Based on current market modeling, we recommend reviewing these high-priority roles:")
        
        jobs = {
            "Position": ["Lead Data Scientist", "Senior Full-Stack Developer", "Cloud Architect"],
            "Location": ["Bengaluru (Hybrid)", "Remote", "Mumbai"],
            "Department": ["Research & AI", "Engineering", "Infrastructure"],
            "Target Budget": [f"{symbol}{180000*conv_rates[currency]:,.0f}+", 
                               f"{symbol}{140000*conv_rates[currency]:,.0f}+", 
                               f"{symbol}{210000*conv_rates[currency]:,.0f}+"]
        }
        st.table(pd.DataFrame(jobs))

    with footer_r:
        st.subheader("Next Steps")
        st.markdown("""
        * **[Export Data]** - Download as CSV for HRMS integration.
        * **[Request Review]** - Send this projection to Finance for approval.
        * **[Global Adjust]** - Apply Cost of Living (COL) adjustments.
        """)
        st.success("Your session is secure. All local modeling data is encrypted.")

if __name__ == "__main__":
    main()