const express = require("express");
const router = express.Router();
const { getRecommendations } = require("../services/mlService");

router.post("/recommendation", async (req, res) => {
    try {
        const { name, subjects, marks, attendance, skillLevel } = req.body;

        const result = getRecommendations(name, subjects, marks, attendance, skillLevel);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
