const express = require("express");
const router = express.Router();
const { generateQuiz, validateTopic, generateStudyRoadmap } = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes protected by auth
router.post("/generate-quiz", authMiddleware, generateQuiz);
router.post("/validate-topic", authMiddleware, validateTopic);
router.post("/study-roadmap", authMiddleware, generateStudyRoadmap);

module.exports = router;
