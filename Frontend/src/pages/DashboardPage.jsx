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
  const [mlRecommendation, setMlRecommendation] = useState("");
  const [activeTab, setActiveTab] = useState("academic"); // academic or support
  const [submittingTest, setSubmittingTest] = useState(null); // ID of assessment being taken

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

  useEffect(() => {
    if (student) {
      const avgMarks = student.subjects.reduce((acc, s) => acc + s.marks, 0) / student.subjects.length;
      const avgAttendance = student.subjects.reduce((acc, s) => acc + s.attendance, 0) / student.subjects.length;
      const avgSkills = student.skills?.length
        ? student.skills.reduce((acc, s) => acc + s.level, 0) / student.skills.length
        : 0;

      axios
        .post("http://localhost:5000/api/ml/recommendation", {
          marks: avgMarks,
          attendance: avgAttendance,
          skillLevel: avgSkills,
        })
        .then((res) => {
          setMlRecommendation(res.data.recommendation);
        })
        .catch((err) => console.error("ML Fetch Error:", err));
    }
  }, [student]);

  if (loading) return <div className="loading-screen">Loading your insights...</div>;
  if (!student) return <div className="error-screen">Student data not found.</div>;

  const avgMarks = (student.subjects.reduce((acc, s) => acc + s.marks, 0) / student.subjects.length).toFixed(1);
  const avgAttendance = (student.subjects.reduce((acc, s) => acc + s.attendance, 0) / student.subjects.length).toFixed(1);
  const avgSkills = student.skills?.length
    ? (student.skills.reduce((acc, s) => acc + s.level, 0) / student.skills.length).toFixed(1)
    : 0;

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
    { label: "Skill average", value: `${avgSkills}%`, color: "orange" },
    { label: "AI Performance Status", value: avgMarks > 75 ? "Excellent" : "Needs Review", color: "purple" }
  ];

  const handleCompleteAssessment = async (assessmentId, score) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/students/profile/complete-assessment",
        { assessmentId, score },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh student data
      const res = await axios.get("http://localhost:5000/api/students/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudent(res.data);
      setSubmittingTest(null);
      alert(score >= 50 ? "Assesment Passed!" : "Assessment Failed. Attendance decreased by 5%.");
    } catch (err) {
      alert("Error submitting assessment");
    }
  };

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
          <div className="welcome-tabs">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Welcome back, <span className="highlight">{student.name}</span>
            </motion.h1>

            <div className="tab-switcher">
              <button
                className={`tab-btn ${activeTab === "academic" ? "active" : ""}`}
                onClick={() => setActiveTab("academic")}
              >
                Academic Overview
              </button>
              <button
                className={`tab-btn ${activeTab === "support" ? "active" : ""}`}
                onClick={() => setActiveTab("support")}
              >
                Special Support
                {student.specialSupport?.assessments.some(a => a.status === "pending") && <span className="tab-dot"></span>}
              </button>
            </div>
          </div>
          <p>{activeTab === "academic" ? "Here's a quick look at your academic journey" : "Assigned classes and assessments to boost your performance"}</p>
        </header>

        {activeTab === "academic" ? (
          <>
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
                  {mlRecommendation ? (
                    <li className="ml-item">{mlRecommendation}</li>
                  ) : (
                    getAIRecommendation().map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))
                  )}
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

              {/* SKILL PROGRESS */}
              <motion.section
                className="grid-card skills-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3>Skill-wise Progress</h3>
                <div className="skills-list">
                  {student.skills?.map((skill, i) => (
                    <div key={i} className="skill-row">
                      <div className="skill-info">
                        <span>{skill.name}</span>
                        <span>{skill.level}%</span>
                      </div>
                      <div className="skill-bar-bg">
                        <motion.div
                          className="skill-bar-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.level}%` }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
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
          </>
        ) : (
          <div className="special-support-tab">
            <div className="support-section">
              <h2>Scheduled Special Classes</h2>
              <div className="support-list">
                {student.specialSupport?.classes.map((cls, i) => (
                  <motion.div key={i} className="support-item-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="item-info">
                      <h4>{cls.subject}</h4>
                      <p className="topic">{cls.topic}</p>
                    </div>
                    <div className="item-meta">
                      <span className={`status-pill ${cls.attendance || "pending"}`}>
                        {(cls.attendance || "pending").toUpperCase()}
                      </span>
                      <div className="item-time">
                        <span>{new Date(cls.dateTime).toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {(!student.specialSupport?.classes || student.specialSupport.classes.length === 0) && <p className="empty-msg">No special classes scheduled.</p>}
              </div>
            </div>

            <div className="support-section">
              <h2>Pending Assessments</h2>
              <div className="support-list">
                {student.specialSupport?.assessments.filter(a => a.status === "pending").map((test, i) => (
                  <motion.div key={i} className="support-item-card test-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="item-info">
                      <h4>{test.subject} Assessment</h4>
                      <p className="deadline">Deadline: {new Date(test.deadline).toLocaleString()}</p>
                    </div>
                    {submittingTest === test._id ? (
                      <div className="test-actions">
                        <button onClick={() => handleCompleteAssessment(test._id, 80)} className="pass-btn">Submit (Simulate Pass)</button>
                        <button onClick={() => handleCompleteAssessment(test._id, 30)} className="fail-btn">Submit (Simulate Fail)</button>
                      </div>
                    ) : (
                      <button onClick={() => setSubmittingTest(test._id)} className="start-btn">Take Test</button>
                    )}
                  </motion.div>
                ))}
                {student.specialSupport?.assessments.filter(a => a.status === "pending").length === 0 && <p className="empty-msg">No pending assessments.</p>}
              </div>
            </div>

            <div className="support-section">
              <h2>Completed Assessments</h2>
              <div className="support-list">
                {student.specialSupport?.assessments.filter(a => a.status !== "pending").map((test, i) => (
                  <div key={i} className="support-item-card completed">
                    <div className="item-info">
                      <h4>{test.subject}</h4>
                      <p className="score">Score: {test.score}%</p>
                    </div>
                    <span className={`status-pill ${test.status}`}>{test.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardPage;
