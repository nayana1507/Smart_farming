import os
import joblib
import numpy as np

# ======================
# LOAD MODEL
# ======================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "crop_model.pkl")

print("Loading crop model...")
crop_model = joblib.load(MODEL_PATH)

# ======================
# PREDICTION FUNCTION
# ======================
def predict_crop(data):
    """
    data: dict with keys N, P, K, temperature, humidity, pH, rainfall
    returns: predicted crop name
    """
    try:
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

    except KeyError as e:
        print(f"Missing feature: {e}")
        return None

    except Exception as e:
        print(f"Prediction error: {e}")
        return None


# ======================
# TEST SCRIPT (optional)
# ======================
if __name__ == "__main__":
    test_data = {
        "N": 90,
        "P": 42,
        "K": 43,
        "temperature": 25.0,
        "humidity": 80.0,
        "pH": 6.5,
        "rainfall": 200
    }

    print("Predicted crop:", predict_crop(test_data))