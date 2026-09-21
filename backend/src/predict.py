from pathlib import Path
import joblib
import shap
import pandas as pd

from src.features import engineer_features


BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "models" / "churn_model.pkl"
# Model
pipeline = joblib.load(MODEL_PATH)
preprocessor = pipeline.named_steps["preprocessor"]
# Define threshold for the model to predict a customer will churn
churn_threshold = 0.35

# Have the model generate a prediction
def predict_churn(customer):
    # Convert customer object to a DataFrame
    customer_df = pd.DataFrame([customer])
    # Generate engineered feaures
    customer_df = engineer_features(customer_df)
    # Save the model's prediction for the probabilty a customer will churn
    probability = pipeline.predict_proba(customer_df)[0][1]
    # Base the prediction using the threshold
    prediction = int(probability >= churn_threshold)

    return prediction, probability

# Provide prediction insights with SHAP results
def explain_customer(customer):
    model = pipeline.named_steps["model"]
    # Convert customer object to a DataFrame
    customer_df = pd.DataFrame([customer])
    # Generate engineered feaures
    customer_df = engineer_features(customer_df)

    # Use the pipeline's preprocessor to encode values to be used by the model
    customer_transformed = preprocessor.transform(customer_df)

    # Feature names after preprocessing
    feature_names = preprocessor.get_feature_names_out()

    # Generate explainability matrix for XGBoost
    explainer = shap.TreeExplainer(model)
    # Retrieve the local SHAP values to evaluate feature impact on churn risk
    shap_values = explainer.shap_values(customer_transformed)

    # When necessayr handle input formatting by converting sparse matrices to an array
    if hasattr(customer_transformed, "toarray"):
        customer_values = customer_transformed.toarray()[0]
    else:
        customer_values = customer_transformed[0]

    # Retrieve the categorical features used by encoder
    categorical_features = preprocessor.transformers_[0][2]

    results = []
    for feature, value, shap_value in zip(
        feature_names,
        customer_values,
        shap_values[0]
    ):
        # Remove transformer prefix created by the encoder
        clean_feature = feature.split("__", 1)[-1]

        # Retrieve the original feature name
        original_feature = clean_feature

        # Restore feature names 
        for feature in categorical_features:
            if clean_feature.startswith(feature + "_"):
                original_feature = feature
                break
        # Save each feature in a list that will be returned 
        results.append({
            "feature": original_feature,
            "encoded_feature": clean_feature,
            "value": float(value),
            "impact": float(shap_value)
        })

    # Aggregate individual feature impacts to combine one-hot encoded categorical features
    aggregated = {}

    for result in results:
        feature = result["feature"]
        if feature not in aggregated:
            aggregated[feature] = {
                "feature": feature,
                "impact": 0.0,
                "value": result["value"]
            }
        aggregated[feature]["impact"] += result["impact"]
    results = list(aggregated.values())

    # Rank feature metrics by impact on predicted churn risk
    results.sort(
        key=lambda x: abs(x["impact"]),
        reverse=True
    )

    return results

