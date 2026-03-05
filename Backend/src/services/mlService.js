/**
 * Ported from ML/predict.py
 * Calculates student risk scores and generates insights based on heuristics.
 */

const getRecommendations = (name, subjects, marks, attendance, skillLevel) => {
    const criticalInsights = [];
    const actionInsights = [];
    const otherInsights = [];

    // Calculate Risk Score (0-100, where 100 is stable and 0 is high risk)
    // Weights: Marks (50%), Attendance (30%), Skills (20%)
    let riskScore = (marks * 0.5) + (attendance * 0.3) + (skillLevel * 0.2);
    riskScore = Math.round(Math.max(0, Math.min(100, riskScore)) * 100) / 100;

    let riskLevel = "Stable";
    if (riskScore < 40) {
        riskLevel = "High Risk";
    } else if (riskScore < 70) {
        riskLevel = "Caution";
    }

    // 1. Subject-wise Analysis
    subjects.forEach(sub => {
        const subName = sub.name || 'Subject';
        const subMarks = sub.marks || 0;
        const subAtt = sub.attendance || 0;

        if (subAtt < 75) {
            const penaltyWarning = subAtt < 65 ? " (5% penalty risk)" : "";
            criticalInsights.push(`Critical: Attendance for ${subName} is only ${subAtt}%. Attend the next 3 classes to cross the 75% threshold${penaltyWarning}.`);
        }

        if (subMarks < 50) {
            actionInsights.push(`Action Required: Your score in ${subName} is ${subMarks}%. Schedule a peer-mentoring session or review the last 2 week's topics.`);
        } else if (subMarks > 85) {
            otherInsights.push(`Excellence: You are top-performing in ${subName}. Lead a study group to further solidify your expertise.`);
        }
    });

    // 2. Skill & Overall Analysis
    if (skillLevel < 40) {
        actionInsights.push("Skill Development: Enroll in a hands-on workshop to improve your practical application skills.");
    }

    // 3. Combine and Limit (Prioritize Critical > Action > Other)
    const totalInsights = [...criticalInsights, ...actionInsights, ...otherInsights];

    // Slice to top 3 insights
    let insights = totalInsights.slice(0, 3);

    // If no specific insights, provide general maintenance
    if (insights.length === 0) {
        insights.push(`Keep it up, ${name || 'Student'}! Your current trajectory is excellent. Focus on maintaining consistency.`);
    }

    return {
        insights,
        risk_score: riskScore,
        risk_level: riskLevel
    };
};

module.exports = {
    getRecommendations
};
