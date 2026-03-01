from fastapi import FastAPI, UploadFile, File
import tempfile
import os

from soil.soil_predict import predict_soil_from_image
from crop.crop_predict import predict_crop

app = FastAPI()

@app.post("/predict-soil")
async def predict_soil(file: UploadFile = File(...)):

    temp = tempfile.NamedTemporaryFile(delete=False)
    temp.write(await file.read())
    temp.close()

    soil_type = predict_soil_from_image(temp.name)

    os.remove(temp.name)

    return {"soil_type": soil_type}

@app.post("/predict-crop")
async def crop(data: dict):

    crop_name = predict_crop(data)

    return {"crop": crop_name}