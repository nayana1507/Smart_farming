import sys
import os
import json
import torch
import joblib
import warnings
import numpy as np
from PIL import Image
from torchvision import models, transforms

warnings.filterwarnings("ignore")

try:
    # ==============================
    # CHECK ARGUMENT
    # ==============================
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Image path not provided"}))
        sys.exit()

    image_path = sys.argv[1]

    # ==============================
    # PATH SETUP
    # ==============================
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_ROOT = os.path.dirname(CURRENT_DIR)

    MODEL_PATH = os.path.join(PROJECT_ROOT, "plant", "plant_stack_model.pkl")
    CLASS_PATH = os.path.join(PROJECT_ROOT, "plant", "class_names.pkl")

    # ==============================
    # LOAD MODEL
    # ==============================
    model = joblib.load(MODEL_PATH)
    class_names = joblib.load(CLASS_PATH)

    # ==============================
    # DEVICE
    # ==============================
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # ==============================
    # RESNET FEATURE EXTRACTOR
    # ==============================
    resnet = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
    resnet = torch.nn.Sequential(*list(resnet.children())[:-1])
    resnet.to(device)
    resnet.eval()

    # ==============================
    # TRANSFORM
    # ==============================
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

    # ==============================
    # FEATURE EXTRACTION
    # ==============================
    img = Image.open(image_path).convert("RGB")
    img = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        features = resnet(img).view(1, -1)

    features = features.cpu().numpy()

    # ==============================
    # PREDICTION
    # ==============================
    pred = model.predict(features)[0]
    full_label = class_names[pred]

    plant, condition = full_label.split("___")

    if condition.lower() == "healthy":
        status = "Healthy"
        disease = None
    else:
        status = "Diseased"
        disease = condition.replace("_", " ")

    # ==============================
    # RETURN JSON
    # ==============================
    result = {
        "plant": plant,
        "status": status,
        "disease": disease
    }

    print(json.dumps(result))

except Exception as e:
    print(json.dumps({
        "error": str(e)
    }))