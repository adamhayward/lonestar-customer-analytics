import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from xgboost import XGBClassifier

from features import engineer_features

# Train ml model using XGBoost
def train_model():
    # Retrieve data source
    df = pd.read_csv("../data/IBM_Telco_Customer_Churn.csv")
    
    # Preprocess data
    df["PaymentMethod"] = df["PaymentMethod"].str.replace(" (automatic)", "", regex=False)

    df["TotalCharges"] = pd.to_numeric(
        df["TotalCharges"],
        errors="coerce"
    )
    
    df.dropna(inplace=True)
    
    df = df.drop(columns=["customerID", "gender"])
    
    df = engineer_features(df)
    
    # Define independent and dependant variables
    X = df.drop(columns="Churn")
    y = df["Churn"].map({
        "Yes": 1,
        "No": 0
    })
    # Partition data sets for training (80%) and testing (20%)
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )
    # Identify categorical features
    categorical_features = X_train.select_dtypes(
        include=["object", "category"]
    ).columns

    numerical_features = X_train.select_dtypes(
        include=["int64", "float64"]
    ).columns
    # Apply One-Hot Encoding strictly to categorical features
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(
                    handle_unknown="ignore"
                ),
                categorical_features
            )
        ],
        # Leave numerical featues untouched
        remainder="passthrough"
    )
    # Initiate XGBoost with hyperparamaters
    xgb_model = XGBClassifier(
        n_estimators=100,
        max_depth=3,
        learning_rate=0.05,
        random_state=42
    )

    # Create a pipeline to combine preprocess data steps with the model
    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model", xgb_model)
    ])

    # Perform transformations and train the model
    pipeline.fit(
        X_train,
        y_train
    )
    # Save the final model
    joblib.dump(
        pipeline,
        "../models/churn_model.pkl"
    )
    

# Execute model training only if this file is ran as the main script
if __name__ == "__main__":
    train_model()