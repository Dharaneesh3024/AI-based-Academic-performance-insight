import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./FacultyDashboard.css";
import { useNavigate } from "react-router-dom";

const FacultyDashboard = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/students")
      .then((res) => setStudents(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Calculate statistics
  const stats = {
    totalStudents: students.length,
    departments: [...new Set(students.map(s => s.department))].length,
    highSemester: Math.max(...students.map(s => s.semester || 0), 0)
  };

  const filteredStudents = students.filter((student) =>
    (student.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (student.rollNo?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="faculty-container">
        <header className="dashboard-header">
          <h2>Faculty Dashboard</h2>
          <p>Monitor and analyze academic performance across your students.</p>
        </header>

        {/* Statistics Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="label">Total Students</div>
            <div className="value">{stats.totalStudents}</div>
          </div>
          <div className="stat-card">
            <div className="label">Active Departments</div>
            <div className="value">{stats.departments}</div>
          </div>
          <div className="stat-card">
            <div className="label">Subjects Tracked</div>
            <div className="value">
              {students.reduce((acc, curr) => acc + (curr.subjects?.length || 0), 0)}
            </div>
          </div>
        </div>

        <div className="dashboard-controls">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search by Roll No or Name..."
              className="search-bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="card-grid">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <div
                key={student._id}
                className="student-card"
                onClick={() => navigate(`/faculty/student/${student._id}`)}
              >
                <h3>{student.name}</h3>
                <div className="student-info-grid">
                  <div className="info-item">
                    <span>Roll No</span>
                    <span>{student.rollNo}</span>
                  </div>
                  <div className="info-item">
                    <span>Department</span>
                    <span>{student.department}</span>
                  </div>
                  <div className="info-item">
                    <span>Semester</span>
                    <span>{student.semester}</span>
                  </div>
                  <div className="info-item">
                    <span>Subjects</span>
                    <span>{student.subjects?.length || 0}</span>
                  </div>
                </div>
                <div className="card-footer">
                  <span className="badge">View Insights →</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">No students found matching your search.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default FacultyDashboard;
