import sys
import os
import json
import joblib

try:
    # ==============================
    # PATH SETUP
    # ==============================

    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_ROOT = os.path.dirname(CURRENT_DIR)

    sys.path.append(PROJECT_ROOT)

    from soil.soil_predict import predict_soil_from_image
    from crop.crop_predict import predict_crop

    BASE_DIR = os.path.dirname(os.path.dirname(__file__))
    crop_model_path = os.path.join(BASE_DIR, "crop", "crop_model.pkl")

    # ==============================
    # INPUT FROM NODE BACKEND
    # ==============================

    image_path = sys.argv[1]
    N = float(sys.argv[2])
    P = float(sys.argv[3])
    K = float(sys.argv[4])
    ph = float(sys.argv[5])
    location = sys.argv[6]

    # ==============================
    # SOIL TYPE RULES
    # ==============================

    soil_crop_map = {
    "alluvial_soil": ["rice", "wheat", "sugarcane", "maize"],
    "red_soil": ["groundnut", "millets", "cotton", "pulses"],
    "laterite_soil": ["tea", "coffee", "cashew", "rubber"],
    "mountain_soil": ["tea", "spices", "apple"],
    "yellow_soil": ["maize", "groundnut", "pulses"]
    }

    # ==============================
    # SOIL PREDICTION
    # ==============================

    soil_type = predict_soil_from_image(image_path).lower().strip()

    # ==============================
    # LOAD CROP MODEL
    # ==============================

    model = joblib.load(crop_model_path)

    # Dummy climate values
    temperature = 25
    humidity = 60
    rainfall = 100

    features = [[
        N,
        P,
        K,
        temperature,
        humidity,
        ph,
        rainfall
    ]]

    crop_prediction = model.predict(features)[0]

    # ==============================
    # FILTER BY SOIL SUITABILITY
    # ==============================

    recommended = soil_crop_map.get(soil_type, [])

    if crop_prediction not in recommended:
        recommended.insert(0, crop_prediction)

    # ==============================
    # FINAL RESPONSE (ONLY JSON OUTPUT)
    # ==============================

    result = {
        "soilType": soil_type,
        "recommendedCrop": recommended[0],
        "alternativeCrops": recommended,
        "location": location
    }

    print(json.dumps(result))


# ==============================
# ERROR HANDLING (CRITICAL)
# ==============================

except Exception as e:
    print(json.dumps({
        "error": str(e)
    }))