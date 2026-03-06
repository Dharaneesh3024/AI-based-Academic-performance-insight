const express = require("express");
const Student = require("../models/Student");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Get class analytics for comparison (department & semester)
router.get("/analytics/class-stats", authMiddleware, async (req, res) => {
  try {
    const { rollNo } = req.user;
    const currentStudent = await Student.findOne({ rollNo });

    if (!currentStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    const { department, semester } = currentStudent;

    // Find all students in the same department and semester
    const peers = await Student.find({ department, semester });

    if (peers.length === 0) {
      return res.json({ averages: [] });
    }

    // Calculate subject-wise averages
    const subjectStats = {};

    peers.forEach(p => {
      p.subjects.forEach(s => {
        if (!subjectStats[s.name]) {
          subjectStats[s.name] = { totalMarks: 0, totalAttendance: 0, count: 0 };
        }
        subjectStats[s.name].totalMarks += s.marks;
        subjectStats[s.name].totalAttendance += s.attendance;
        subjectStats[s.name].count += 1;
      });
    });

    const averages = Object.keys(subjectStats).map(name => ({
      name,
      avgMarks: parseFloat((subjectStats[name].totalMarks / subjectStats[name].count).toFixed(2)),
      avgAttendance: parseFloat((subjectStats[name].totalAttendance / subjectStats[name].count).toFixed(2))
    }));

    res.json({
      department,
      semester,
      peerCount: peers.length,
      averages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/analytics/peer-comparison", authMiddleware, async (req, res) => {
  try {
    const { rollNo } = req.user;
    const currentStudent = await Student.findOne({ rollNo });

    if (!currentStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    const { department, semester } = currentStudent;
    const peers = await Student.find({ department, semester });

    const comparisonItems = currentStudent.subjects.map(subject => {
      // Extract all marks for this subject from peers
      const peerMarks = peers.map(p => {
        const s = p.subjects.find(sub => sub.name === subject.name);
        return s ? s.marks : 0;
      }).sort((a, b) => b - a); // descending

      const totalPeers = peerMarks.length;
      if (totalPeers === 0) return { subject: subject.name, percentile: 100, rank: 1 };

      // Find rank (1-indexed)
      const rank = peerMarks.indexOf(subject.marks) + 1;

      // Calculate "Top X%"
      // If student is rank 1 out of 10, they are in top 10%
      const topPercentage = Math.ceil((rank / totalPeers) * 100);

      let motivationalText = `You're in the top ${topPercentage}% in ${subject.name}`;
      if (topPercentage <= 10) motivationalText = `Exceptional! You're in the elite top 10% in ${subject.name}`;
      else if (topPercentage <= 25) motivationalText = `Outstanding! You're in the top 25% in ${subject.name}`;

      return {
        subject: subject.name,
        percentile: 100 - ((rank - 1) / totalPeers) * 100, // standard percentile
        topPercentage,
        rank,
        totalPeers,
        text: motivationalText
      };
    });

    res.json(comparisonItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const { rollNo } = req.user;

    if (!rollNo) {
      return res.status(400).json({ message: "Student roll number not found in token" });
    }

    const student = await Student.findOne({ rollNo });

    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/:id/assign-class", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.specialSupport.classes.push(req.body);
    await student.save();
    res.json({ message: "Special class assigned successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/assign-assessment", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.specialSupport.assessments.push({ ...req.body, status: "pending" });
    await student.save();
    res.json({ message: "Special assessment assigned successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/profile/complete-assessment", authMiddleware, async (req, res) => {
  try {
    const { rollNo } = req.user;
    const { assessmentId, score } = req.body;

    const student = await Student.findOne({ rollNo });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const assessment = student.specialSupport.assessments.id(assessmentId);
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });

    assessment.score = score;
    assessment.status = score >= 50 ? "passed" : "failed";

    if (assessment.status === "failed") {
      const subject = student.subjects.find(s => s.name.toLowerCase() === assessment.subject.toLowerCase());
      if (subject) {
        subject.attendance = Math.max(0, subject.attendance - 5);
        student.markModified("subjects");
      }
    }

    await student.save();
    res.json({ message: "Special assessment processed", status: assessment.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/special-class/:classId", async (req, res) => {
  try {
    const { attendance } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const specialClass = student.specialSupport.classes.id(req.params.classId);
    if (!specialClass) return res.status(404).json({ message: "Special class not found" });

    // Immutable check: If already marked present/absent, don't allow change
    if (specialClass.attendance === "present" || specialClass.attendance === "absent") {
      return res.status(400).json({ message: "Attendance status is already finalized and cannot be changed." });
    }

    specialClass.attendance = attendance;

    // Penalty logic: if absent, reduce corresponding subject attendance by 5%
    if (attendance === "absent") {
      const subject = student.subjects.find(s => s.name.toLowerCase() === specialClass.subject.toLowerCase());
      if (subject) {
        subject.attendance = Math.max(0, subject.attendance - 5);
        student.markModified("subjects");
      }
    }

    await student.save();
    res.json({ message: "Attendance marked successfully", attendance: specialClass.attendance, student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
