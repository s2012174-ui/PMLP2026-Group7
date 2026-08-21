import io

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO

app = FastAPI(title="Food Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO("yolov8n-seg.pt")

FOOD_NUTRITION = {
    "apple": {"calories": 52, "protein": 0.3, "carbs": 14.0, "fat": 0.2},
    "banana": {"calories": 89, "protein": 1.1, "carbs": 23.0, "fat": 0.3},
    "sandwich": {"calories": 250, "protein": 12.0, "carbs": 30.0, "fat": 10.0},
    "pizza": {"calories": 266, "protein": 11.0, "carbs": 33.0, "fat": 10.0},
    "bowl": {"calories": 180, "protein": 8.0, "carbs": 25.0, "fat": 6.0},
    "salad": {"calories": 120, "protein": 5.0, "carbs": 15.0, "fat": 5.0},
    "donut": {"calories": 452, "protein": 5.0, "carbs": 51.0, "fat": 23.0},
    "cake": {"calories": 250, "protein": 4.0, "carbs": 32.0, "fat": 11.0},
}

DEFAULT_NUTRITION = {"calories": 150, "protein": 5.0, "carbs": 18.0, "fat": 7.0}


def estimate_weight(mask_area: float, image_area: float) -> int:
    if mask_area <= 0 or image_area <= 0:
        return 150

    ratio = mask_area / image_area
    if ratio < 0.08:
        return 150
    if ratio < 0.18:
        return 250
    return 400


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {exc}") from exc

    results = model(image)
    items = []
    image_area = float(image.width * image.height)

    for result in results:
        if result.boxes is None:
            continue

        names = getattr(result, "names", {}) or {}
        class_ids = result.boxes.cls.tolist()
        confs = result.boxes.conf.tolist()
        boxes = result.boxes.xyxy.tolist() if hasattr(result.boxes, "xyxy") else []
        masks = result.masks

        for index, class_id in enumerate(class_ids):
            food_name = str(names.get(int(class_id), int(class_id))).lower()
            confidence = float(confs[index]) if index < len(confs) else 0.0

            mask_area = 0.0
            if masks is not None and index < len(masks.data):
                mask = masks.data[index]
                if hasattr(mask, "detach"):
                    mask = mask.detach().cpu().numpy()
                mask_area = float(mask.sum())

            if mask_area <= 0 and index < len(boxes):
                x1, y1, x2, y2 = boxes[index]
                mask_area = float((x2 - x1) * (y2 - y1))

            estimated_grams = estimate_weight(mask_area, image_area)
            nutrition = FOOD_NUTRITION.get(food_name, DEFAULT_NUTRITION)

            calories = (nutrition["calories"] / 100.0) * estimated_grams
            protein = (nutrition["protein"] / 100.0) * estimated_grams
            carbs = (nutrition["carbs"] / 100.0) * estimated_grams
            fat = (nutrition["fat"] / 100.0) * estimated_grams

            items.append(
                {
                    "food_name": food_name,
                    "confidence": round(confidence, 3),
                    "estimated_grams": estimated_grams,
                    "calories": round(calories, 1),
                    "protein": round(protein, 1),
                    "carbs": round(carbs, 1),
                    "fat": round(fat, 1),
                }
            )

    if not items:
        return {
            "success": False,
            "meal_name": "No food detected",
            "total_calories": 0,
            "items": [],
        }

    meal_name = ", ".join(sorted({item["food_name"] for item in items}))
    total_calories = round(sum(item["calories"] for item in items), 1)

    return {
        "success": True,
        "meal_name": meal_name if meal_name else "Detected Meal",
        "total_calories": total_calories,
        "items": items,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=7860)
