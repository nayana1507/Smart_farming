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
        "alluvial": ["rice","maize","banana","jute","papaya","watermelon","muskmelon"],
        "yellow": ["maize","mango","orange","pigeonpeas","mungbean","lentil"],
        "red": ["cotton","pigeonpeas","blackgram","mothbeans","chickpea"],
        "mountain": ["apple","grapes","orange","coffee"],
        "laterite": ["coconut","coffee","banana","mango"]
    }

    # ==============================
    # IRRIGATION + FERTILIZER DATA
    # ==============================
    CROP_RECOMMENDATIONS = {

    "rice": {
        "irrigation": "Flood irrigation or Alternate Wetting and Drying (AWD)",
        "fertilizer": "High Nitrogen, moderate Phosphorus and Potassium"
    },

    "maize": {
        "irrigation": "Furrow or sprinkler irrigation",
        "fertilizer": "Balanced NPK fertilizer"
    },

    "chickpea": {
        "irrigation": "Light irrigation, avoid waterlogging",
        "fertilizer": "Low Nitrogen, high Phosphorus"
    },

    "kidneybeans": {
        "irrigation": "Sprinkler irrigation",
        "fertilizer": "Moderate NPK fertilizer"
    },

    "pigeonpeas": {
        "irrigation": "Mostly rainfed, minimal irrigation",
        "fertilizer": "Low Nitrogen, adequate Phosphorus"
    },

    "mothbeans": {
        "irrigation": "Rainfed conditions preferred",
        "fertilizer": "Low Nitrogen fertilizer"
    },

    "mungbean": {
        "irrigation": "Light irrigation at flowering stage",
        "fertilizer": "Low Nitrogen, moderate Phosphorus"
    },

    "blackgram": {
        "irrigation": "Minimal irrigation",
        "fertilizer": "Low Nitrogen fertilizer"
    },

    "lentil": {
        "irrigation": "Light irrigation during flowering",
        "fertilizer": "Phosphorus-rich fertilizer"
    },

    "pomegranate": {
        "irrigation": "Drip irrigation recommended",
        "fertilizer": "Organic manure + balanced NPK"
    },

    "banana": {
        "irrigation": "Drip irrigation preferred",
        "fertilizer": "High Potassium fertilizer"
    },

    "mango": {
        "irrigation": "Drip irrigation during dry months",
        "fertilizer": "Organic manure + NPK fertilizer"
    },

    "grapes": {
        "irrigation": "Drip irrigation",
        "fertilizer": "Balanced NPK + micronutrients"
    },

    "watermelon": {
        "irrigation": "Drip irrigation",
        "fertilizer": "High Potassium fertilizer"
    },

    "muskmelon": {
        "irrigation": "Drip irrigation",
        "fertilizer": "Balanced NPK fertilizer"
    },

    "apple": {
        "irrigation": "Drip irrigation",
        "fertilizer": "Balanced NPK + organic compost"
    },

    "orange": {
        "irrigation": "Drip irrigation",
        "fertilizer": "Nitrogen and Potassium rich fertilizer"
    },

    "papaya": {
        "irrigation": "Drip irrigation",
        "fertilizer": "High Nitrogen fertilizer"
    },

    "coconut": {
        "irrigation": "Basin irrigation or drip irrigation",
        "fertilizer": "High Potassium fertilizer"
    },

    "cotton": {
        "irrigation": "Drip irrigation preferred",
        "fertilizer": "Nitrogen rich fertilizer"
    },

    "jute": {
        "irrigation": "Flood irrigation",
        "fertilizer": "Nitrogen and Phosphorus fertilizer"
    },

    "coffee": {
        "irrigation": "Sprinkler or drip irrigation",
        "fertilizer": "Compost + Nitrogen fertilizer"
    }
}

    # ==============================
    # SOIL PREDICTION (SAFE)
    # ==============================

    soil_output = predict_soil_from_image(image_path)

    if isinstance(soil_output, dict):
        soil_type = soil_output.get("soilType", "")
    else:
        soil_type = str(soil_output)

    soil_type = soil_type.lower().strip()

    # Normalize names like "Red Soil" → "red"
    if "alluvial" in soil_type:
        soil_type = "alluvial"
    elif "yellow" in soil_type:
        soil_type = "yellow"
    elif "red" in soil_type:
        soil_type = "red"
    elif "mountain" in soil_type:
        soil_type = "mountain"
    elif "laterite" in soil_type:
        soil_type = "laterite"
    # ==============================
    # LOAD CROP MODEL
    # ==============================

    model = joblib.load(crop_model_path)

    temperature = 25
    humidity = 60
    rainfall = 100

    features = [[N, P, K, temperature, humidity, ph, rainfall]]

    crop_prediction = model.predict(features)[0]

    # ==============================
    # FILTER BY SOIL SUITABILITY
    # ==============================

    soil_based_crops = soil_crop_map.get(soil_type, []).copy()

    # Always include ML prediction
    if crop_prediction in soil_based_crops:
        soil_based_crops.remove(crop_prediction)

    # Put ML prediction first
    alternative_crops = [crop_prediction] + soil_based_crops

    recommended_crop = crop_prediction
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
        "alternativeCrops": alternative_crops,
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