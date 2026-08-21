import io

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO

app = FastAPI(title="YOLO Food Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO("yolov8n.pt")


@app.get("/")
async def root():
    return {"status": "YOLO API Online"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    results = model(image)
    predictions = []

    for result in results:
        names = result.names if hasattr(result, "names") else {}
        boxes = result.boxes

        if boxes is None:
            continue

        for box in boxes:
            cls_id = int(box.cls.item())
            confidence = float(box.conf.item())
            food_name = names.get(cls_id, str(cls_id)).lower()

            predictions.append({
                "food": food_name,
                "confidence": round(confidence, 4),
            })

    return {
        "success": True,
        "predictions": predictions,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
