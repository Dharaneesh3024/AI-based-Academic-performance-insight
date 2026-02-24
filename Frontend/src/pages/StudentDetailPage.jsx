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
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Radar } from "react-chartjs-2";
import "./StudentDetailPage.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
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
    riskScore = 100 - (Math.max(0, Math.min(100, riskScore)));

    if (riskScore < 35) {
      riskLevel = "HIGH RISK";
      riskColor = "red";
    } else if (riskScore < 65) {
      riskLevel = "MEDIUM RISK";
      riskColor = "orange";
    } else {
      riskLevel = "LOW RISK";
      riskColor = "green";
    }
  }

  // -------- AI RECOMMENDATION LOGIC --------
  const getRecommendation = () => {
    if (!student) return null;
    const insights = [];
    const avgMarks = student.subjects.reduce((acc, s) => acc + s.marks, 0) / student.subjects.length;
    const avgAttendance = student.subjects.reduce((acc, s) => acc + s.attendance, 0) / student.subjects.length;

    if (avgMarks < 50) insights.push("Focus on core concepts through additional tutoring sessions.");
    if (avgAttendance < 75) insights.push("Attendance is below threshold; regular presence is critical for improvement.");
    if (avgMarks > 85 && avgAttendance > 85) insights.push("Exceptional performance; consider advanced research projects.");

    const lowSubjects = student.subjects.filter(s => s.marks < 40).map(s => s.name);
    if (lowSubjects.length > 0) insights.push(`Urgent attention needed in: ${lowSubjects.join(", ")}.`);

    return insights.length > 0 ? insights : ["Maintain current study patterns and monitor weekly progress."];
  };

  const recommendations = getRecommendation();

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
        backgroundColor: "rgba(99, 102, 241, 0.8)",
        borderColor: "#6366f1",
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: "rgba(99, 102, 241, 1)",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "#94a3b8" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8" },
      },
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Marks Performance",
        color: "#f8fafc",
        font: { size: 14, weight: '700' }
      },
    },
  };

  // -------- RADAR CHART DATA --------
  const radarData = {
    labels: student.subjects.map((sub) => sub.name),
    datasets: [
      {
        label: "Marks",
        data: student.subjects.map((sub) => sub.marks),
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "#6366f1",
        pointBackgroundColor: "#6366f1",
      },
      {
        label: "Attendance",
        data: student.subjects.map((sub) => sub.attendance),
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        borderColor: "#10b981",
        pointBackgroundColor: "#10b981",
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        angleLines: { color: "rgba(255, 255, 255, 0.1)" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        pointLabels: { color: "#94a3b8", font: { size: 11 } },
        ticks: { backdropColor: "transparent", color: "#64748b", z: 10 },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    plugins: {
      legend: { labels: { color: "#f8fafc" } },
    },
  };

  return (
    <>
      <Navbar />
      <div className="student-detail-container">

        {/* PROFILE CARD */}
        <motion.div
          className="profile-card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="profile-header">
            <h2>{student.name}</h2>
            <div className="profile-info">
              <p><strong>Roll Number</strong> {student.rollNo}</p>
              <p><strong>Department</strong> {student.department}</p>
              <p><strong>Current Semester</strong> {student.semester}</p>
            </div>
          </div>
        </motion.div>

        {/* AI RISK CARD */}
        <motion.div
          className="risk-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3>AI Academic Performance Analysis</h3>
          <div className="risk-content">
            <div className={`risk-score ${riskColor}`}>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {displayRisk}%
              </motion.span>
            </div>
            <div className={`risk-badge ${riskColor}`}>
              {riskLevel}
            </div>
          </div>
        </motion.div>

        {/* MARKS CHART */}
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="chart-wrapper">
            <Bar data={barData} options={barOptions} />
          </div>
        </motion.div>

        {/* AI RECOMMENDATION CARD */}
        <motion.div
          className="recommendation-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="card-header">
            <span className="ai-sparkle">✨</span>
            <h3>AI Recommendations</h3>
          </div>
          <div className="recommendation-list">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="rec-item">
                <p>{rec}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RADAR CHART CARD */}
        <motion.div
          className="radar-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3>Holistic Performance</h3>
          <div className="radar-wrapper">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </motion.div>

        {/* ATTENDANCE SECTION */}
        <motion.div
          className="attendance-card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3>Attendance Insights</h3>
          {student.subjects.map((sub, index) => (
            <div key={index} className="attendance-item">
              <div className="attendance-label">
                <span>{sub.name}</span>
                <span>{sub.attendance}%</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className={`progress-fill ${sub.attendance >= 75 ? "good" : "risk"
                    }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${sub.attendance}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                ></motion.div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* SUBJECT BREAKDOWN TABLE */}
        <motion.div
          className="table-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <h3>Detailed Subject Breakdown</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Attendance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {student.subjects.map((sub, idx) => {
                  let status = "Needs Attention";
                  let statusClass = "risk";
                  if (sub.marks > 75 && sub.attendance > 75) {
                    status = "Excellent";
                    statusClass = "good";
                  } else if (sub.marks > 50 && sub.attendance > 60) {
                    status = "Stable";
                    statusClass = "stable";
                  }
                  return (
                    <tr key={idx}>
                      <td>{sub.name}</td>
                      <td>{sub.marks}%</td>
                      <td>{sub.attendance}%</td>
                      <td>
                        <span className={`status-badge ${statusClass}`}>{status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </>
  );
};

export default StudentDetailPage;
