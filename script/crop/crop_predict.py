import os
import joblib
import numpy as np

# ======================
# LOAD MODEL
# ======================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(BASE_DIR, "crop", "crop_model.pkl")

print("Loading crop model...")
crop_model = joblib.load(MODEL_PATH)


# ======================
# PREDICTION FUNCTION
# ======================
def predict_crop(data):

    features = np.array([[ 
        data["N"],
        data["P"],
        data["K"],
        data["temperature"],
        data["humidity"],
        data["pH"],
        data["rainfall"]
    ]])

    prediction = crop_model.predict(features)[0]

    return prediction