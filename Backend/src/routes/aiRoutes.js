const express = require("express");
const router = express.Router();
const { generateQuiz, validateTopic } = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

// Both routes protected by auth
router.post("/generate-quiz", authMiddleware, generateQuiz);
router.post("/validate-topic", authMiddleware, validateTopic);

module.exports = router;
