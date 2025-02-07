from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.detection import router as detection_router

app = FastAPI(title="YOLO Image Detection API")

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins. You can restrict this later to specific origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

app.include_router(detection_router)

@app.get("/")
async def root():
    return {"message": "Welcome to the YOLO Image Detection API!"}
