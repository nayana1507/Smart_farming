import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import confusion_matrix
import joblib

# =========================
# LOAD DATASET
# =========================
data = pd.read_csv("Crop_recommendation.csv")

# remove unwanted columns if present
data = data.loc[:, ~data.columns.str.contains("^Unnamed")]

# =========================
# FEATURES & LABEL
# =========================
X = data.drop("label", axis=1)
y = data["label"]

# =========================
# TRAIN TEST SPLIT
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)

# =========================
# MODEL
# =========================
model = RandomForestClassifier(
    n_estimators=150,
    random_state=42
)

model.fit(X_train, y_train)

accuracy = model.score(X_test, y_test)
print("Accuracy:", accuracy)
y_pred = model.predict(X_test)

print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# =========================
# SAVE MODEL
# =========================
joblib.dump(model, "crop_model.pkl")

print("Model saved!")
