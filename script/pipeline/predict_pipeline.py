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
    # SOIL → SUITABLE CROPS
    # ==============================

    soil_crop_map = {
        "alluvial_soil": ["rice", "wheat", "sugarcane", "maize"],
        "red_soil": ["groundnut", "millets", "cotton", "pulses"],
        "laterite_soil": ["tea", "coffee", "cashew", "rubber"],
        "mountain_soil": ["tea", "spices", "apple"],
        "yellow_soil": ["maize", "groundnut", "pulses"]
    }

    # ==============================
    # IRRIGATION + FERTILIZER DATA
    # ==============================

    CROP_RECOMMENDATIONS = {

        "rice": {
            "irrigation": "Flood irrigation or Alternate Wetting and Drying",
            "fertilizer": "N:120-150 kg/ha, P:40-60 kg/ha, K:40-60 kg/ha"
        },

        "wheat": {
            "irrigation": "Sprinkler irrigation",
            "fertilizer": "N:90-120 kg/ha, P:40-50 kg/ha, K:30-40 kg/ha"
        },

        "sugarcane": {
            "irrigation": "Drip or Furrow irrigation",
            "fertilizer": "N:150-180 kg/ha, P:60-80 kg/ha, K:100-120 kg/ha"
        },

        "maize": {
            "irrigation": "Furrow or Sprinkler irrigation",
            "fertilizer": "N:100-120 kg/ha, P:40-60 kg/ha, K:40-60 kg/ha"
        },

        "groundnut": {
            "irrigation": "Drip irrigation",
            "fertilizer": "N:20-30 kg/ha, P:40-50 kg/ha, K:40-50 kg/ha"
        },

        "millets": {
            "irrigation": "Rainfed or Light irrigation",
            "fertilizer": "N:30-40 kg/ha, P:20-30 kg/ha, K:20-30 kg/ha"
        },

        "cotton": {
            "irrigation": "Drip irrigation preferred",
            "fertilizer": "N:60-80 kg/ha, P:30-40 kg/ha, K:40-60 kg/ha"
        },

        "pulses": {
            "irrigation": "Minimal irrigation",
            "fertilizer": "N:20 kg/ha, P:40-50 kg/ha, K:20-30 kg/ha"
        },

        "tea": {
            "irrigation": "Sprinkler irrigation",
            "fertilizer": "N:50-60 kg/ha, P:30-40 kg/ha, K:40-50 kg/ha"
        },

        "coffee": {
            "irrigation": "Drip irrigation",
            "fertilizer": "N:60-80 kg/ha, P:40-60 kg/ha, K:80-100 kg/ha"
        },

        "cashew": {
            "irrigation": "Drip irrigation",
            "fertilizer": "N:25-35 kg/ha, P:20-30 kg/ha, K:40-50 kg/ha"
        },

        "rubber": {
            "irrigation": "Rainfed with supplemental irrigation",
            "fertilizer": "NPK 12:12:12 annually"
        },

        "spices": {
            "irrigation": "Drip irrigation",
            "fertilizer": "Organic manure + balanced NPK"
        },

        "apple": {
            "irrigation": "Drip irrigation",
            "fertilizer": "N:70-100 kg/ha, P:35-50 kg/ha, K:70-100 kg/ha"
        }
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

    recommended_crop = recommended[0]

    # ==============================
    # GET IRRIGATION + FERTILIZER
    # ==============================

    crop_info = CROP_RECOMMENDATIONS.get(
        recommended_crop,
        {
            "irrigation": "Not available",
            "fertilizer": "Not available"
        }
    )

    # ==============================
    # FINAL RESPONSE
    # ==============================

    result = {
        "soilType": soil_type,
        "recommendedCrop": recommended_crop,
        "alternativeCrops": recommended,
        "irrigationMethod": crop_info["irrigation"],
        "fertilizerRecommendation": crop_info["fertilizer"],
        "location": location
    }

    print(json.dumps(result))


# ==============================
# ERROR HANDLING
# ==============================

except Exception as e:
    print(json.dumps({
        "error": str(e)
    }))