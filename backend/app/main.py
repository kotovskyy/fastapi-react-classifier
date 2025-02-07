from fastapi import FastAPI
from app.routes.detection import router as detection_router

app = FastAPI(title="YOLO Image Detection API")
app.include_router(detection_router)

@app.get("/")
async def root():
    return {"message": "Welcome to the YOLO Image Detection API!"}
