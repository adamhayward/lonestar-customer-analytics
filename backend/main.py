import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path

from backend.src.predict import predict_churn, explain_customer

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5500"
)

app = FastAPI()

# Configure Cross-Origin Resource Sharing to accept requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    FRONTEND_URL,
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5501",
    ],
    allow_credentials=True,
    # Only allow get and post HTTP requests 
    allow_methods=["GET", "POST"],
    allow_headers=["*"]
)

class Customer(BaseModel):
    SeniorCitizen: int
    Partner: str
    Dependents: str
    tenure: int
    PhoneService: str
    MultipleLines: str
    InternetService: str
    OnlineSecurity: str    
    OnlineBackup: str    
    DeviceProtection: str    
    TechSupport: str    
    StreamingTV: str    
    StreamingMovies: str
    Contract: str
    PaperlessBilling: str  
    PaymentMethod: str  
    MonthlyCharges: float
    TotalCharges: float
    

# Route for index
@app.get("/")
def root():
    return {"message": "Customer Churn Prediction Engine Initalized Successfully!"}

# Endpoint to generate churn predictions
@app.post("/predict")
def predict(customer: Customer):
    customer_data = customer.model_dump()
    # Generate prediction using the final model using the customer data sent from the front end 
    prediction, probability = predict_churn(customer_data)
    # Generate SHAP results 
    explanation = explain_customer(customer_data)
    # Return request in JSON format to the frontend
    return {
        "prediction": int(prediction),
        "probability": float(probability),
        # Provide only the top 4 high-impact features
        "features": explanation[:4]
    }
    
BASE_DIR = Path(__file__).resolve().parents[1]
NOTEBOOK_PATH = BASE_DIR / "notebooks" / "methodology.ipynb"
# Endpoint to download Juptyer Notebook
@app.get("/download-methodology")
async def download_methodology():
    return FileResponse(
        path=NOTEBOOK_PATH,
        media_type="application/x-ipynb+json",
        filename="methodology.ipynb"
    )