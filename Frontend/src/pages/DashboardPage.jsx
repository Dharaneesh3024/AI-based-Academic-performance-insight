import { useEffect, useState } from "react";
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
import "./Dashboard.css";

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

const DashboardPage = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:5000/api/students/profile", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setStudent(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading-screen">Loading your insights...</div>;
  if (!student) return <div className="error-screen">Student data not found.</div>;

  const avgMarks = (student.subjects.reduce((acc, s) => acc + s.marks, 0) / student.subjects.length).toFixed(1);
  const avgAttendance = (student.subjects.reduce((acc, s) => acc + s.attendance, 0) / student.subjects.length).toFixed(1);

  const getAIRecommendation = () => {
    const insights = [];
    if (avgMarks < 60) insights.push("Priority: Schedule revision sessions for low-scoring subjects.");
    if (avgAttendance < 75) insights.push("Alert: Attendance is below threshold. Regular attendance is key.");
    if (avgMarks > 85) insights.push("Excellent work! Consider mentoring peers or taking advanced modules.");
    return insights.length > 0 ? insights : ["You're on the right track! Keep maintaining your current study habits."];
  };

  const dashboardStats = [
    { label: "Academic Average", value: `${avgMarks}%`, color: "blue" },
    { label: "Overall Attendance", value: `${avgAttendance}%`, color: "green" },
    { label: "AI Performance Status", value: avgMarks > 75 ? "Excellent" : "Needs Review", color: "purple" }
  ];

  const barData = {
    labels: student.subjects.map((s) => s.name),
    datasets: [{
      label: "Marks",
      data: student.subjects.map((s) => s.marks),
      backgroundColor: "rgba(99, 102, 241, 0.6)",
      borderColor: "#6366f1",
      borderWidth: 1,
      borderRadius: 5,
    }]
  };

  const radarData = {
    labels: student.subjects.map((s) => s.name),
    datasets: [
      {
        label: "Marks",
        data: student.subjects.map((s) => s.marks),
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "#6366f1",
        borderWidth: 2,
      },
      {
        label: "Attendance",
        data: student.subjects.map((s) => s.attendance),
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        borderColor: "#10b981",
        borderWidth: 2,
      }
    ]
  };

  return (
    <>
      <Navbar />
      <div className="student-dashboard">
        <header className="dashboard-welcome">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Welcome back, <span className="highlight">{student.name}</span>
          </motion.h1>
          <p>Here's a quick look at your academic journey</p>
        </header>

        <div className="stats-strip">
          {dashboardStats.map((stat, idx) => (
            <motion.div
              key={idx}
              className={`stat-pill ${stat.color}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </motion.div>
          ))}
        </div>

        <div className="dashboard-grid">
          {/* AI INSIGHTS */}
          <motion.section
            className="grid-card ai-insights"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3><span className="sparkle">✨</span> AI Personalized Insights</h3>
            <ul>
              {getAIRecommendation().map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </motion.section>

          {/* BAR CHART */}
          <motion.section
            className="grid-card chart-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3>Subject-wise Marks</h3>
            <div className="chart-container">
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </motion.section>

          {/* ATTENDANCE PROGRESS */}
          <motion.section
            className="grid-card attendance-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3>Subject Attendance</h3>
            <div className="attendance-list">
              {student.subjects.map((sub, i) => (
                <div key={i} className="attendance-row">
                  <div className="att-info">
                    <span>{sub.name}</span>
                    <span>{sub.attendance}%</span>
                  </div>
                  <div className="att-bar-bg">
                    <motion.div
                      className={`att-bar-fill ${sub.attendance < 75 ? "warning" : "good"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${sub.attendance}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* RADAR CHART */}
          <motion.section
            className="grid-card radar-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3>Holistic Performance</h3>
            <div className="radar-container">
              <Radar data={radarData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
