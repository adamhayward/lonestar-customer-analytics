import numpy as np
# Function used generate engineered features using customer class values
def engineer_features(df):
    df = df.copy()
    
    df["PartnerWithDependents"] = np.where(
        (df["Partner"] == "Yes") &
        (df["Dependents"] == "Yes"),
        "Yes",
        "No"
        )
        
    df["AutoPay"] = np.where(
    df["PaymentMethod"].isin([
        "Bank transfer",
        "Credit card"
    ]),
    "Yes",
    "No"
    )
    
    df["HighMonthlyCharges"] = np.where(
    (df["MonthlyCharges"] > 70),
    "Yes",
    "No"
)
    
    df["PhoneAndInternetBundle"] = (
    df["InternetService"].map({"DSL": "Internet", "Fiber optic": "Internet", "No": "No Internet"})
    + df["PhoneService"].map({"Yes": " Phone", "No": " No Phone"})
    )
    
    df["ServiceType"] = np.select(
    [
        (df["InternetService"] == "DSL") &
        (df["PhoneService"] == "No"),

        (df["InternetService"] == "Fiber optic") &
        (df["PhoneService"] == "No"),

        (df["InternetService"] == "DSL") &
        (df["PhoneService"] == "Yes"),

        (df["InternetService"] == "Fiber optic") &
        (df["PhoneService"] == "Yes")
    ],
    [
        "DSL Only",
        "Fiber Only",
        "DSL & Phone",
        "Fiber & Phone"
    ],
    default="Phone Only"
    )
    
    df["FiberNoSecurity"] = np.select(
        [
            df["InternetService"] != "Fiber optic",
            df["OnlineSecurity"] == "No"
        ],
        [
            "No fiber subscription",
            "Yes"
        ],
        default="No"
    )

    df["FiberNoBackup"] = np.select(
        [
            df["InternetService"] != "Fiber optic",
            df["OnlineBackup"] == "No"
        ],
        [
            "No fiber subscription",
            "Yes"
        ],
        default="No"
    )

    df["FiberNoDeviceProtection"] = np.select(
        [
            df["InternetService"] != "Fiber optic",
            df["DeviceProtection"] == "No"
        ],
        [
            "No fiber subscription",
            "Yes"
        ],
        default="No"
    )

    df["FiberNoTechSupport"] = np.select(
        [
            df["InternetService"] != "Fiber optic",
            df["TechSupport"] == "No"
        ],
        [
            "No fiber subscription",
            "Yes"
        ],
        default="No"
    )

    df["NewM2M"] = np.where(
    (df["Contract"] == "Month-to-month") &
    (df["tenure"] <= 12),
    "Yes",
    "No"
    )
    
    df["M2MHighCharge"] = np.where(
    (df["Contract"] == "Month-to-month") &
    (df["HighMonthlyCharges"] == "Yes"),
    "Yes",
    "No"
    )
    
    service_columns = [
        "OnlineSecurity",
        "OnlineBackup",
        "DeviceProtection",
        "TechSupport",
        "StreamingTV",
        "StreamingMovies"
    ]

    df["NumServices"] = (
        df[service_columns] == "Yes"
    ).sum(axis=1)
    
    return df