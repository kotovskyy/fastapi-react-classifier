from fastapi import FastAPI

app = FastAPI(title="YOLO Image Detection API")


@app.get("/")
async def root():
    return {"message": "Welcome to the YOLO Image Detection API!"}
