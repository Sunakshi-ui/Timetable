import React, { useState } from "react";
import api from "./api";

function App() {
  const [courseLoads, setCourseLoads] = useState([
    { batch: "", course: "", prof: "", credit: 0 }
  ]);
  const [days, setDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [slots, setSlots] = useState(["9AM", "10AM", "11AM", "1PM", "2PM"]);
  const [roomsAvailable, setRoomsAvailable] = useState(2);
  const [timetable, setTimetable] = useState(null);

  // Handle course load input
  const handleCourseChange = (index, field, value) => {
    const updated = [...courseLoads];
    updated[index][field] = value;
    setCourseLoads(updated);
  };

  // Add another course row
  const addCourseRow = () => {
    setCourseLoads([...courseLoads, { batch: "", course: "", prof: "", credit: 0 }]);
  };

  const generateTimetable = async () => {
    try {
      const response = await api.post("/generate_timetable", {
        course_loads: courseLoads,
        days,
        slots,
        rooms_available: roomsAvailable,
      });
      setTimetable(response.data.timetable);
    } catch (error) {
      console.error("Error generating timetable:", error);
    }
  };

  return (
    <div>
      <h1>Timetable Scheduler</h1>

      {/*  Form */}
      <h2>Course Loads</h2>
      {courseLoads.map((cl, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="Batch"
            value={cl.batch}
            onChange={(e) => handleCourseChange(index, "batch", e.target.value)}
          />
          <input
            type="text"
            placeholder="Course"
            value={cl.course}
            onChange={(e) => handleCourseChange(index, "course", e.target.value)}
          />
          <input
            type="text"
            placeholder="Professor"
            value={cl.prof}
            onChange={(e) => handleCourseChange(index, "prof", e.target.value)}
          />
          <input
            type="number"
            placeholder="credit"
            value={cl.credit}
            onChange={(e) => handleCourseChange(index, "credit", e.target.value)}
          />
        </div>
      ))}
      <button onClick={addCourseRow}>+ Add Course</button>

      <h2>Rooms Available</h2>
      <input
        type="number"
        value={roomsAvailable}
        onChange={(e) => setRoomsAvailable(parseInt(e.target.value))}
      />

      <h2>Days</h2>
      <input
        type="text"
        value={days.join(",")}
        onChange={(e) => setDays(e.target.value.split(","))}
      />

      <h2>Slots</h2>
      <input
        type="text"
        value={slots.join(",")}
        onChange={(e) => setSlots(e.target.value.split(","))}
      />

      <button onClick={generateTimetable}>Generate Timetable</button>

      {/* Output */}
      {timetable && Object.keys(timetable).map((batch) => (
  <div className="timetable" key={batch}>
    <h2>Weekly Timetable - {batch}</h2>
    <table border="1" cellPadding="8">
      <thead>
        <tr>
          <th>Day</th>
          {Object.keys(timetable[batch]["Mon"]).map((slot) => (
            <th key={slot}>{slot}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.keys(timetable[batch]).map((day) => (
          <tr key={day}>
            <td>{day}</td>
            {Object.keys(timetable[batch][day]).map((slot) => (
              <td key={slot}>
                {timetable[batch][day][slot].length > 0
                  ? timetable[batch][day][slot].join(", ")
                  : "-"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
))}


    </div>
  );
}

export default App;