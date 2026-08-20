import json
import time
import numpy as np
import onnxruntime as ort
from fastapi import FastAPI, UploadFile, File, HTTPException , Response
from PIL import Image
import io

MODEL_VERSION = "citypulse-cls-v1"
CONFIDENCE_THRESHOLD = 0.55  # FR-013: below this -> UNKNOWN, route to manual review
IMG_SIZE = 224

with open("class_names.json") as f:
    CLASS_NAMES = json.load(f)

session = ort.InferenceSession("citypulse_cls_v1.onnx", providers=["CPUExecutionProvider"])
input_name = session.get_inputs()[0].name

MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)

BASE_SEVERITY = {
    "POTHOLE": 6.0, "GARBAGE_DUMPING": 4.0, "WATERLOGGING": 7.5,
    "DAMAGED_SIDEWALK": 5.0, "FALLEN_TREE": 8.5, "BROKEN_STREETLIGHT": 3.5,
}
DETECTED_FEATURES = {
    "POTHOLE": ["road_surface_damage", "possible_traffic_hazard"],
    "GARBAGE_DUMPING": ["waste_accumulation", "sanitation_risk"],
    "WATERLOGGING": ["standing_water", "possible_road_obstruction"],
    "DAMAGED_SIDEWALK": ["pavement_cracking", "pedestrian_hazard"],
    "FALLEN_TREE": ["large_obstruction", "possible_power_line_risk"],
    "BROKEN_STREETLIGHT": ["reduced_visibility", "night_safety_risk"],
}

def severity_label(score):
    if score >= 8.0: return "CRITICAL"
    if score >= 6.0: return "HIGH"
    if score >= 3.5: return "MEDIUM"
    return "LOW"

def preprocess(img: Image.Image) -> np.ndarray:
    img = img.convert("RGB")
    resize_to = int(IMG_SIZE * 1.15)
    w, h = img.size
    if w < h:
        new_w, new_h = resize_to, round(h * resize_to / w)
    else:
        new_h, new_w = resize_to, round(w * resize_to / h)
    img = img.resize((new_w, new_h), Image.BILINEAR)
    left, top = (new_w - IMG_SIZE) // 2, (new_h - IMG_SIZE) // 2
    img = img.crop((left, top, left + IMG_SIZE, top + IMG_SIZE))
    arr = np.asarray(img).astype(np.float32) / 255.0
    arr = (arr - MEAN) / STD
    arr = arr.transpose(2, 0, 1)[None, ...].astype(np.float32)
    return arr

def softmax(x):
    e = np.exp(x - x.max())
    return e / e.sum()

app = FastAPI(title="CityPulse AI Service")

@app.head("/")
def head_root():
    return Response(status_code=200)

@app.get("/health")
def health():
    return {"status": "ok", "model_version": MODEL_VERSION}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    try:
        raw = await file.read()
        img = Image.open(io.BytesIO(raw))
    except Exception:
        raise HTTPException(status_code=400, detail="invalid image")

    try:
        x = preprocess(img)
        logits = session.run(None, {input_name: x})[0][0]
    except Exception:
        raise HTTPException(status_code=500, detail="inference failed")
    probs = softmax(logits)
    top_idx = int(np.argmax(probs))
    confidence = float(probs[top_idx])
    category = CLASS_NAMES[top_idx]

    if confidence < CONFIDENCE_THRESHOLD:
        return {
            "category": "UNKNOWN",
            "confidence": round(confidence, 3),
            "severity": None,
            "severity_label": None,
            "detected_features": [],
            "model_version": MODEL_VERSION,
            "note": "Below confidence threshold - manual classification required (FR-013)",
        }

    base = BASE_SEVERITY.get(category, 3.0)
    severity = round(min(10.0, base * (0.5 + 0.5 * confidence)), 1)

    return {
        "category": category,
        "confidence": round(confidence, 3),
        "severity": severity,
        "severity_label": severity_label(severity),
        "detected_features": DETECTED_FEATURES.get(category, []),
        "model_version": MODEL_VERSION,
    }
