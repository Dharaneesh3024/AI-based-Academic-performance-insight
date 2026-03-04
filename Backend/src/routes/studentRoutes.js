const express = require("express");
const Student = require("../models/Student");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});
const authMiddleware = require("../middleware/authMiddleware");

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
