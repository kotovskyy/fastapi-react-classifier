import cv2
import numpy as np
from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse

from app.models.model import run_inference, preprocess_image
from app.models.labels import LABELS

router = APIRouter(prefix="/api", tags=["Object Detection"])

@router.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    """Endpoint to upload an image for object detection."""
    image_bytes = await file.read()
    image_bytes_array = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(image_bytes_array, cv2.IMREAD_COLOR)
    
    processed_image = preprocess_image(image)
    boxes, class_ids, confidences = run_inference(processed_image, image)
    
    # Format the results
    results = []
    for i in range(len(boxes)):
        results.append({
            "label": LABELS[int(class_ids[i])],
            "confidence": float(confidences[i]),
            "bbox": [float(coord) for coord in boxes[i]]
        })

    # Return the results
    return JSONResponse(content={"results": results})
