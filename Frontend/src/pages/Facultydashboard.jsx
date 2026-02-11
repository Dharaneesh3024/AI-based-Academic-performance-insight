import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./FacultyDashboard.css";

const FacultyDashboard = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/students")
      .then((res) => setStudents(res.data))
      .catch((err) => console.error(err));
  }, []);

  // 🔎 Safe Filter logic
  const filteredStudents = students.filter((student) =>
    (student.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (student.rollNo?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="faculty-container">
        <h2>Students</h2>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by Roll No or Name..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Cards Grid */}
        <div className="card-grid">
          {filteredStudents.map((student) => (
            <div
              key={student._id}
              className="student-card"
              onClick={() => setSelectedStudent(student)}
            >
              <h3>{student.name}</h3>
              <p><strong>Roll No:</strong> {student.rollNo}</p>
              <p><strong>Department:</strong> {student.department}</p>
              <p><strong>Semester:</strong> {student.semester}</p>
              <p><strong>Subjects:</strong> {student.subjects?.length}</p>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedStudent && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedStudent(null)}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>{selectedStudent.name}</h2>
              <p><strong>Roll No:</strong> {selectedStudent.rollNo}</p>
              <p><strong>Department:</strong> {selectedStudent.department}</p>
              <p><strong>Semester:</strong> {selectedStudent.semester}</p>

              <h3>Subjects</h3>
              <ul>
                {selectedStudent.subjects?.map((sub, index) => (
                  <li key={index}>
                    {sub.name} — Marks: {sub.marks} | Attendance: {sub.attendance}%
                  </li>
                ))}
              </ul>

              <button
                className="close-btn"
                onClick={() => setSelectedStudent(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FacultyDashboard;
