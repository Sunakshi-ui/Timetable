from fastapi import FastAPI
from pydantic import BaseModel
import networkx as nx

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow requests from your React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or ["*"] for all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema
class CourseLoad(BaseModel):
    batch: str
    course: str
    prof: str
    count: int

class TimetableRequest(BaseModel):
    course_loads: list[CourseLoad]
    days: list[str]
    slots: list[str]
    rooms_available: int

# Build conflict graph
def build_conflict_graph(sessions):
    G = nx.Graph()
    # add nodes
    for node_id, batch, course, prof in sessions:
        G.add_node(node_id, batch=batch, course=course, prof=prof)
    # add edges for conflicts
    for i in range(len(sessions)):
        for j in range(i+1, len(sessions)):
            n1, b1, c1, p1 = sessions[i]
            n2, b2, c2, p2 = sessions[j]
            if b1 == b2 or p1 == p2:   # same batch OR same professor
                if n1 != n2:           # avoid self-loops
                    G.add_edge(n1, n2)
    return G

@app.post("/generate_timetable")
def generate_timetable(req: TimetableRequest):
    # expand into sessions (each lecture = one node)
    sessions = []
    for cl in req.course_loads:
        for i in range(cl.count):
            node_id = f"{cl.course}_{cl.batch}_L{i+1}"
            sessions.append((node_id, cl.batch, cl.course, cl.prof))

    # build conflict graph
    G = build_conflict_graph(sessions)

    # weekly slots
    week_slots = [(d, s) for d in req.days for s in req.slots]

    # greedy assignment
    assignments = {}
    slot_counts = {}
    for node in G.nodes():
        neighbor_slots = set()
        for neigh in G.neighbors(node):
            if neigh in assignments:
                neighbor_slots.add(assignments[neigh])
        for day, slot in week_slots:
            key = f"{day}_{slot}"
            if key not in neighbor_slots and slot_counts.get(key, 0) < req.rooms_available:
                assignments[node] = key
                slot_counts[key] = slot_counts.get(key, 0) + 1
                break

    # group timetable by day
    timetable = {day: {slot: [] for slot in req.slots} for day in req.days}
    for node, key in assignments.items():
        day, slot = key.split("_")
        timetable[day][slot].append(node)

    return {"timetable": timetable}