const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateQuiz = async (req, res) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ message: "Groq API Key is missing in Backend .env" });
    }

    try {
        const { topic } = req.body;
        if (!topic) {
            return res.status(400).json({ message: "Topic is required" });
        }

        const prompt = `Generate a quiz with exactly 10 multiple-choice questions on the topic: "${topic}". 
        Return ONLY a JSON object with the following structure:
        {
          "quiz": [
            {
              "question": "Question text here",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctAnswer": "The exact correct option string"
            }
          ]
        }
        Do not include any other text or explanation before or after the JSON.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const quizData = JSON.parse(chatCompletion.choices[0].message.content);
        res.json(quizData);
    } catch (error) {
        console.error("Quiz Generation Error:", error);
        res.status(500).json({ message: "Failed to generate quiz", error: error.message });
    }
};

const validateTopic = async (req, res) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ message: "Groq API Key is missing in Backend .env" });
    }
    try {
        const { subject, topic } = req.body;
        if (!subject || !topic) {
            return res.status(400).json({ message: "Subject and topic are required" });
        }

        const prompt = `Does the academic topic "${topic}" logically belong to the student subject "${subject}"? 
        Answer ONLY with a JSON object in this format: {"valid": true} or {"valid": false}.
        If it's a sub-topic or highly related, answer true. 
        Example: Math and Algebra is true. Math and Photosynthesis is false.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(chatCompletion.choices[0].message.content);
        res.json({ valid: result.valid });
    } catch (error) {
        console.error("Topic Validation Error:", error);
        res.status(500).json({ message: "Failed to validate topic", error: error.message });
    }
};

module.exports = {
    generateQuiz,
    validateTopic
};
