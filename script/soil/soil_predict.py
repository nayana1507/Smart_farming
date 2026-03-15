import os
import cv2
import numpy as np
import joblib
from skimage.feature import hog

import torch
import torch.nn as nn
from torchvision import models, transforms


# =====================================================
# PATH SETUP
# =====================================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
IMAGE_SIZE = (256, 256)


# =====================================================
# LOAD TRAINED MODELS (LOAD ONCE)
# =====================================================

stack = joblib.load(os.path.join(MODEL_DIR, "stack_model.pkl"))
scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
selector = joblib.load(os.path.join(MODEL_DIR, "selector.pkl"))
label_map = joblib.load(os.path.join(MODEL_DIR, "label_map.pkl"))

# reverse mapping
inv_label = {v: k for k, v in label_map.items()}


# =====================================================
# LOAD RESNET FEATURE EXTRACTOR
# =====================================================
resnet = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
resnet = nn.Sequential(*list(resnet.children())[:-1])
resnet.to(DEVICE)
resnet.eval()

transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Resize((224, 224)),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])


# =====================================================
# IMAGE SEGMENTATION
# =====================================================
def segment_image(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)

    mask = cv2.adaptiveThreshold(
        blur,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        51,
        2
    )

    kernel = np.ones((3, 3), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)

    return cv2.bitwise_and(img, img, mask=mask)


# =====================================================
# PREPROCESS
# =====================================================
def preprocess(path):
    img = cv2.imread(path)

    if img is None:
        raise ValueError("Invalid image path")

    img = segment_image(img)
    img = cv2.resize(img, IMAGE_SIZE)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    return gray


# =====================================================
# CPU FEATURES
# =====================================================
def extract_cpu_features(gray):

    hist = cv2.calcHist([gray], [0], None, [256], [0, 256]).flatten()
    hist = hist / (np.sum(hist) + 1e-6)

    hog_feat = hog(
        gray,
        orientations=9,
        pixels_per_cell=(16, 16),
        cells_per_block=(2, 2),
        block_norm="L2-Hys",
        feature_vector=True
    )

    return np.concatenate([hist, hog_feat])


# =====================================================
# CNN FEATURES
# =====================================================
def extract_cnn_features(gray):

    rgb = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
    tensor = transform(rgb).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        feat = resnet(tensor).cpu().numpy().flatten()

    return feat


# =====================================================
# FINAL PREDICTION FUNCTION (USED BY FASTAPI)
# =====================================================
def predict_soil_from_image(image_path):

    gray = preprocess(image_path)

    features = np.concatenate([
        extract_cpu_features(gray),
        extract_cnn_features(gray)
    ])

    features = scaler.transform([features])
    features = selector.transform(features)

    prediction = stack.predict(features)[0]

    soil_label = inv_label.get(prediction, "Unknown")

    return soil_label