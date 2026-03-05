const express = require("express");
const { spawn } = require("child_process");
const router = express.Router();
const path = require("path");

router.post("/recommendation", async (req, res) => {
    try {
        const { name, subjects, marks, attendance, skillLevel } = req.body;

        const pythonScript = path.join(__dirname, "../../../ML/predict.py");
        const inputData = JSON.stringify({ name, subjects, marks, attendance, skill_level: skillLevel });

        const pyProcess = spawn("python", [pythonScript, inputData]);

        let output = "";
        pyProcess.stdout.on("data", (data) => {
            output += data.toString();
        });

        pyProcess.stderr.on("data", (data) => {
            console.error(`Python Error: ${data.toString()}`);
        });

        pyProcess.on("close", (code) => {
            if (code !== 0) {
                return res.status(500).json({ message: "ML prediction failed" });
            }

            try {
                const result = JSON.parse(output);
                res.json(result);
            } catch (e) {
                res.status(500).json({ message: "Invalid ML output" });
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
