import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./StudentDetailPage.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StudentDetailPage = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [displayRisk, setDisplayRisk] = useState(0);

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch student data
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/students/${id}`)
      .then((res) => setStudent(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  // -------- SAFE RISK CALCULATION --------
  let riskScore = 0;
  let riskLevel = "";
  let riskColor = "";

  if (student) {
    const avgMarks =
      student.subjects.reduce((acc, sub) => acc + sub.marks, 0) /
      student.subjects.length;

    const avgAttendance =
      student.subjects.reduce((acc, sub) => acc + sub.attendance, 0) /
      student.subjects.length;

    riskScore = 100 - (avgMarks * 0.6 + avgAttendance * 0.4);
    riskScore = Math.max(0, Math.min(100, riskScore));

    if (riskScore < 35) {
      riskLevel = "LOW RISK";
      riskColor = "green";
    } else if (riskScore < 65) {
      riskLevel = "MEDIUM RISK";
      riskColor = "orange";
    } else {
      riskLevel = "HIGH RISK";
      riskColor = "red";
    }
  }

  // -------- ANIMATED COUNTER --------
  useEffect(() => {
    if (!student) return;

    let start = 0;
    const end = Math.floor(riskScore);
    const duration = 1000;
    const incrementTime = 20;
    const step = end / (duration / incrementTime);

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setDisplayRisk(Math.floor(start));
    }, incrementTime);

    return () => clearInterval(timer);
  }, [student, riskScore]);

  // Loading state AFTER all hooks
  if (!student) return <h2 className="loading">Loading...</h2>;

  // -------- BAR CHART DATA --------
  const barData = {
    labels: student.subjects.map((sub) => sub.name),
    datasets: [
      {
        label: "Marks",
        data: student.subjects.map((sub) => sub.marks),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Marks Performance" },
    },
  };

  return (
    <>
      <Navbar />
      <div className="student-detail-container">

        {/* PROFILE CARD */}
        <motion.div
          className="profile-card"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>{student.name}</h2>
          <div className="profile-info">
            <p><strong>Roll No:</strong> {student.rollNo}</p>
            <p><strong>Department:</strong> {student.department}</p>
            <p><strong>Semester:</strong> {student.semester}</p>
          </div>
        </motion.div>

        {/* AI RISK CARD */}
        <motion.div
          className="risk-card"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3>AI Risk Analysis</h3>
          <div className="risk-content">
            <div className="risk-score">
              {displayRisk}%
            </div>
            <div className={`risk-badge ${riskColor}`}>
              {riskLevel}
            </div>
          </div>
        </motion.div>

        {/* MARKS CHART */}
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="chart-wrapper">
            <Bar data={barData} options={barOptions} />
          </div>
        </motion.div>

        {/* ATTENDANCE SECTION */}
        <motion.div
          className="attendance-card"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3>Attendance Overview</h3>
          {student.subjects.map((sub, index) => (
            <div key={index} className="attendance-item">
              <div className="attendance-label">
                {sub.name} — {sub.attendance}%
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${
                    sub.attendance >= 75 ? "good" : "risk"
                  }`}
                  style={{ width: `${sub.attendance}%` }}
                ></div>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </>
  );
};

export default StudentDetailPage;
