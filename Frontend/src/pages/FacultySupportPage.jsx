import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import "./FacultySupportPage.css";

const FacultySupportPage = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [supportData, setSupportData] = useState({
        classSubject: "",
        classDate: "",
        classTopic: "",
        assessmentSubject: "",
        assessmentDeadline: ""
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/students");
            setStudents(res.data);
        } catch (err) {
            console.error("Error fetching students:", err);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAssignClass = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:5000/api/students/${selectedStudent._id}/assign-class`, {
                subject: supportData.classSubject,
                dateTime: supportData.classDate,
                topic: supportData.classTopic
            });
            alert("Special class assigned!");
            setSupportData({ ...supportData, classSubject: "", classDate: "", classTopic: "" });
            refreshSelectedStudent();
        } catch (err) {
            alert("Failed to assign class");
        }
    };

    const handleAssignAssessment = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:5000/api/students/${selectedStudent._id}/assign-assessment`, {
                subject: supportData.assessmentSubject,
                deadline: supportData.assessmentDeadline
            });
            alert("Special assessment assigned!");
            setSupportData({ ...supportData, assessmentSubject: "", assessmentDeadline: "" });
            refreshSelectedStudent();
        } catch (err) {
            alert("Failed to assign assessment");
        }
    };

    const handleMarkAttendance = async (classId, attendance) => {
        try {
            await axios.patch(`http://localhost:5000/api/students/${selectedStudent._id}/special-class/${classId}`, { attendance });
            refreshSelectedStudent();
        } catch (err) {
            alert("Failed to mark attendance");
        }
    };

    const refreshSelectedStudent = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/students/${selectedStudent._id}`);
            setSelectedStudent(res.data);
            // Also update in main list
            setStudents(prev => prev.map(s => s._id === res.data._id ? res.data : s));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="faculty-support-page">
            <Navbar />
            <div className="support-container">
                <aside className="student-sidebar">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="student-list-mini">
                        {filteredStudents.map(student => (
                            <div
                                key={student._id}
                                className={`student-item-mini ${selectedStudent?._id === student._id ? 'active' : ''}`}
                                onClick={() => setSelectedStudent(student)}
                            >
                                <div className="mini-info">
                                    <span className="mini-name">{student.name}</span>
                                    <span className="mini-roll">{student.rollNo}</span>
                                </div>
                                {student.specialSupport?.assessments?.some(a => a.status === 'pending') && <span className="indicator warn">●</span>}
                            </div>
                        ))}
                    </div>
                </aside>

                <main className="support-main">
                    <AnimatePresence mode="wait">
                        {selectedStudent ? (
                            <motion.div
                                key={selectedStudent._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="support-details"
                            >
                                <header className="support-header">
                                    <h2>Manage Support for {selectedStudent.name}</h2>
                                    <p>{selectedStudent.rollNo} • {selectedStudent.department} • Semester {selectedStudent.semester}</p>
                                </header>

                                <div className="assignment-grid">
                                    {/* Class Assignment */}
                                    <div className="assignment-card">
                                        <h3>Schedule Special Class</h3>
                                        <form onSubmit={handleAssignClass}>
                                            <select
                                                value={supportData.classSubject}
                                                onChange={e => setSupportData({ ...supportData, classSubject: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Subject</option>
                                                {selectedStudent.subjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                            </select>
                                            <input
                                                type="datetime-local"
                                                value={supportData.classDate}
                                                onChange={e => setSupportData({ ...supportData, classDate: e.target.value })}
                                                required
                                            />
                                            <input
                                                type="text"
                                                placeholder="Topic (e.g., Data Structures)"
                                                value={supportData.classTopic}
                                                onChange={e => setSupportData({ ...supportData, classTopic: e.target.value })}
                                                required
                                            />
                                            <button type="submit" className="btn-primary">Assign Class</button>
                                        </form>
                                    </div>

                                    {/* Assessment Assignment */}
                                    <div className="assignment-card">
                                        <h3>Assign Special Assessment</h3>
                                        <form onSubmit={handleAssignAssessment}>
                                            <select
                                                value={supportData.assessmentSubject}
                                                onChange={e => setSupportData({ ...supportData, assessmentSubject: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Subject</option>
                                                {selectedStudent.subjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                            </select>
                                            <input
                                                type="datetime-local"
                                                value={supportData.assessmentDeadline}
                                                onChange={e => setSupportData({ ...supportData, assessmentDeadline: e.target.value })}
                                                required
                                            />
                                            <button type="submit" className="btn-primary btn-alt">Assign Test</button>
                                        </form>
                                    </div>
                                </div>

                                <section className="current-support">
                                    <h3>Existing Interventions</h3>
                                    <div className="support-tracking-grid">
                                        <div className="tracking-column">
                                            <h4>Special Classes</h4>
                                            {selectedStudent.specialSupport?.classes.map(cls => (
                                                <div key={cls._id} className="tracking-item">
                                                    <div className="item-info">
                                                        <strong>{cls.subject}</strong>
                                                        <span>{cls.topic}</span>
                                                        <small>{new Date(cls.dateTime).toLocaleString()}</small>
                                                    </div>
                                                    <div className="attendance-btns">
                                                        <span className={`pill ${cls.attendance}`}>{cls.attendance.toUpperCase()}</span>
                                                        <div className="btn-group">
                                                            <button
                                                                onClick={() => handleMarkAttendance(cls._id, 'present')}
                                                                className="p-btn"
                                                                disabled={cls.attendance === 'present' || cls.attendance === 'absent'}
                                                                title={cls.attendance !== 'pending' ? "Attendance is finalized" : "Mark Present"}
                                                            >
                                                                P
                                                            </button>
                                                            <button
                                                                onClick={() => handleMarkAttendance(cls._id, 'absent')}
                                                                className="a-btn"
                                                                disabled={cls.attendance === 'present' || cls.attendance === 'absent'}
                                                                title={cls.attendance !== 'pending' ? "Attendance is finalized" : "Mark Absent"}
                                                            >
                                                                A
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="tracking-column">
                                            <h4>Assessments</h4>
                                            {selectedStudent.specialSupport?.assessments.map(ass => (
                                                <div key={ass._id} className="tracking-item">
                                                    <div className="item-info">
                                                        <strong>{ass.subject}</strong>
                                                        <small>Deadline: {new Date(ass.deadline).toLocaleDateString()}</small>
                                                    </div>
                                                    <div className="item-status">
                                                        <span className={`pill ${ass.status}`}>{ass.status.toUpperCase()}</span>
                                                        {ass.score !== undefined && <span className="score">{ass.score}%</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            </motion.div>
                        ) : (
                            <div className="empty-state">
                                <div className="icon">👤</div>
                                <h3>Select a student to manage support</h3>
                                <p>Use the sidebar to search and select students needing special interventions.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default FacultySupportPage;
