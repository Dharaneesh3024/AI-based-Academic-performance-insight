import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
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
  const [mlRecommendation, setMlRecommendation] = useState([]);
  const [mlInsights, setMlInsights] = useState([]);
  const [riskData, setRiskData] = useState({ score: 0, level: "Loading..." });
  const [classStats, setClassStats] = useState(null);
  const [submittingTest, setSubmittingTest] = useState(null); // ID of assessment object being taken
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState("academic");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [studyRoadmap, setStudyRoadmap] = useState(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [peerRankings, setPeerRankings] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    // Fetch Profile
    axios
      .get("/api/students/profile", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setStudent(res.data);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    // Fetch Class Analytics
    axios
      .get("/api/students/analytics/class-stats", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setClassStats(res.data);
      })
      .catch((err) => console.error("Class Stats Error:", err));

    // Fetch Peer Comparison
    axios
      .get("/api/students/analytics/peer-comparison", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setPeerRankings(res.data);
      })
      .catch((err) => console.error("Peer Comparison Error:", err));
  }, []);

  useEffect(() => {
    if (student) {
      const avgMarks = student.subjects.reduce((acc, s) => acc + s.marks, 0) / student.subjects.length;
      const avgAttendance = student.subjects.reduce((acc, s) => acc + s.attendance, 0) / student.subjects.length;
      const avgSkills = student.skills?.length
        ? student.skills.reduce((acc, s) => acc + s.level, 0) / student.skills.length
        : 0;

      axios
        .post("/api/ml/recommendation", {
          name: student.name,
          subjects: student.subjects,
          marks: avgMarks,
          attendance: avgAttendance,
          skillLevel: avgSkills,
        })
        .then((res) => {
          setMlInsights(res.data.insights || []);
          setRiskData({ score: res.data.risk_score, level: res.data.risk_level });
          setLoading(false);
        })
        .catch((err) => {
          console.error("ML Fetch Error:", err);
          setLoading(false);
        });
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
    { label: "AI Risk Level", value: riskData.level, color: riskData.level === "Stable" ? "green" : riskData.level === "Caution" ? "orange" : "red" }
  ];

  const fetchQuiz = async (test) => {
    setIsGeneratingQuiz(true);
    setShowQuizModal(true);
    setSubmittingTest(test); // Store full test object
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/ai/generate-quiz",
        { topic: test.topic },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuizQuestions(res.data.quiz);
      setCurrentQuestionIndex(0);
      setQuizScore(0);
      setSelectedAnswer(null);
    } catch (err) {
      console.error(err);
      alert("Failed to generate quiz. Please try again.");
      setShowQuizModal(false);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleAnswerSelect = (option) => {
    setSelectedAnswer(option);
  };

  const handleQuizNext = () => {
    // Check if correct
    if (selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz Finished
      const finalScore = ((quizScore + (selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer ? 1 : 0)) / quizQuestions.length) * 100;
      handleCompleteAssessment(submittingTest._id, finalScore);
      setShowQuizModal(false);
    }
  };

  const handleCompleteAssessment = async (assessmentId, score) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/students/profile/complete-assessment",
        { assessmentId, score },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh student data
      const res = await axios.get("/api/students/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudent(res.data);
      setSubmittingTest(null);
      alert(score >= 50 ? "Assesment Passed!" : "Assessment Failed. Attendance decreased by 5%.");
    } catch (err) {
      alert("Error submitting assessment");
    }
  };

  const handleGenerateRoadmap = async () => {
    setIsGeneratingRoadmap(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/ai/study-roadmap", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudyRoadmap(res.data.roadmap);
    } catch (err) {
      console.error(err);
      alert("Failed to generate study roadmap");
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const barData = {
    labels: student.subjects.map((s) => s.name),
    datasets: [{
      label: "Your Marks",
      data: student.subjects.map((s) => s.marks),
      backgroundColor: "rgba(99, 102, 241, 0.6)",
      borderColor: "#6366f1",
      borderWidth: 1,
      borderRadius: 5,
    }]
  };

  const bestSubject = [...student.subjects].sort((a, b) => b.marks - a.marks)[0];
  const lowSubject = [...student.subjects].sort((a, b) => a.marks - b.marks)[0];
  const summaryAvgMarks = (student.subjects.reduce((acc, s) => acc + s.marks, 0) / student.subjects.length).toFixed(1);

  const radarData = {
    labels: student.subjects.map((s) => s.name),
    datasets: [
      {
        label: "Your Marks",
        data: student.subjects.map((s) => s.marks),
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "#6366f1",
        borderWidth: 2,
      },
      {
        label: "Class Average",
        data: student.subjects.map((s) => {
          const stats = classStats?.averages.find(a => a.name === s.name);
          return stats ? stats.avgMarks : 0;
        }),
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderColor: "#ef4444",
        borderWidth: 2,
        borderDash: [5, 5],
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
                <h3><span className="sparkle">✨</span> AI Performance Analysis</h3>
                <div className="risk-indicator">
                  <div className={`risk-score-circle ${riskData.level.toLowerCase().replace(" ", "-")}`}>
                    <span className="score-val">{riskData.score}%</span>
                    <span className="score-label">Risk Score</span>
                  </div>
                  <p className="risk-statement">Status: <strong>{riskData.level}</strong></p>
                </div>

                {/* PEER COMPARISON INSIGHTS */}
                {peerRankings.length > 0 && (
                  <div className="peer-insights-ribbon">
                    {peerRankings.filter(r => r.topPercentage <= 40).length > 0 ? (
                      peerRankings.filter(r => r.topPercentage <= 40).map((rank, idx) => (
                        <motion.div
                          key={idx}
                          className="peer-insight-tag"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + idx * 0.1 }}
                        >
                          <span className="trophy">🏆</span> {rank.text}
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        className="peer-insight-tag motivation"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <span className="sparkle">🚀</span> You're closer than you think! A bit more focus this week could land you in the top 40%.
                      </motion.div>
                    )}
                  </div>
                )}

                <ul className="insight-list">
                  {mlInsights.length > 0 ? (
                    mlInsights.map((rec, i) => (
                      <li key={i} className="ml-item">{rec}</li>
                    ))
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

                <div className="performance-highlights">
                  <div className="highlight-mini-card">
                    <span className="mini-label">Best Subject</span>
                    <span className="mini-value text-green">{bestSubject.name}</span>
                    <span className="mini-subtext">{bestSubject.marks}% score</span>
                  </div>
                  <div className="highlight-mini-card">
                    <span className="mini-label">Focus Needed</span>
                    <span className="mini-value text-orange">{lowSubject.name}</span>
                    <span className="mini-subtext">{lowSubject.marks}% score</span>
                  </div>
                  <div className="highlight-mini-card">
                    <span className="mini-label">GPA Estimate</span>
                    <span className="mini-value text-purple">{(summaryAvgMarks / 10).toFixed(2)}</span>
                    <span className="mini-subtext">Based on {summaryAvgMarks}% avg</span>
                  </div>
                </div>
              </motion.section>

              {/* AI STUDY ROADMAP */}
              <motion.section
                className="grid-card roadmap-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="roadmap-header">
                  <h3><span className="sparkle">📚</span> AI Study Roadmap</h3>
                  <button
                    className={`generate-roadmap-btn ${isGeneratingRoadmap ? 'loading' : ''}`}
                    onClick={handleGenerateRoadmap}
                    disabled={isGeneratingRoadmap}
                  >
                    {isGeneratingRoadmap ? "Generating..." : (studyRoadmap ? "Regenerate Plan" : "Generate Plan")}
                  </button>
                </div>

                <div className="roadmap-content">
                  {isGeneratingRoadmap ? (
                    <div className="roadmap-loading">
                      <div className="roadmap-loader"></div>
                      <p>Creating your personalized 4-week success path...</p>
                    </div>
                  ) : studyRoadmap ? (
                    <div className="roadmap-timeline">
                      {studyRoadmap.map((week, idx) => (
                        <div key={idx} className="roadmap-week">
                          <div className="week-number">Week {week.week}</div>
                          <div className="week-details">
                            <h4>{week.focus}</h4>
                            <ul className="week-goals">
                              {week.goals.map((goal, gi) => <li key={gi}>{goal}</li>)}
                            </ul>
                            <div className="week-tips">
                              {week.tips.map((tip, ti) => <span key={ti} className="tip-tag">{tip}</span>)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="roadmap-placeholder">
                      <p>Need a clear path to improvement? Generate a personalized week-by-week plan based on your academic data.</p>
                    </div>
                  )}
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
                    {false ? (
                      <div className="test-actions">
                        <button onClick={() => handleCompleteAssessment(test._id, 80)} className="pass-btn">Submit (Simulate Pass)</button>
                        <button onClick={() => handleCompleteAssessment(test._id, 30)} className="fail-btn">Submit (Simulate Fail)</button>
                      </div>
                    ) : (
                      <button onClick={() => fetchQuiz(test)} className="start-btn">Take AI Quiz</button>
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
      {/* QUIZ MODAL */}
      <AnimatePresence>
        {showQuizModal && (
          <motion.div
            className="quiz-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="quiz-modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              {isGeneratingQuiz ? (
                <div className="quiz-loading">
                  <div className="loader"></div>
                  <p>AI is generating your custom quiz for <strong>{submittingTest?.topic}</strong>...</p>
                </div>
              ) : (
                <>
                  <div className="quiz-header">
                    <h3>{submittingTest?.subject}: {submittingTest?.topic}</h3>
                    <div className="quiz-progress">
                      Question {currentQuestionIndex + 1} of {quizQuestions.length}
                    </div>
                  </div>

                  <div className="quiz-body">
                    <p className="question-text">{quizQuestions[currentQuestionIndex]?.question}</p>
                    <div className="options-grid">
                      {quizQuestions[currentQuestionIndex]?.options.map((opt, i) => (
                        <button
                          key={i}
                          className={`option-btn ${selectedAnswer === opt ? "selected" : ""}`}
                          onClick={() => handleAnswerSelect(opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="quiz-footer">
                    <button
                      className="next-btn"
                      disabled={!selectedAnswer}
                      onClick={handleQuizNext}
                    >
                      {currentQuestionIndex === quizQuestions.length - 1 ? "Finish Quiz" : "Next Question"}
                    </button>
                    <button className="cancel-btn" onClick={() => setShowQuizModal(false)}>Cancel</button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardPage;
