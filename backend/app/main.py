from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Example input schema
class TimetableRequest(BaseModel):
    batches: list[str]
    rooms_available: int
    slots: list[str]

@app.get("/")
def root():
    return {"message": "FastAPI backend is running 🚀"}

@app.post("/generate_timetable")
def generate_timetable(request: TimetableRequest):
    # logic of graph coloring
    timetable = {}
    for i, batch in enumerate(request.batches):
        timetable[batch] = request.slots[i % len(request.slots)]
    return {"timetable": timetable}