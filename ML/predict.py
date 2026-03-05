import sys
import joblib
import json
import os

# Load model
def get_recommendations(name, subjects, marks, attendance, skill_level):
    critical_insights = []
    action_insights = []
    other_insights = []
    
    # 1. Subject-wise Analysis
    for sub in subjects:
        sub_name = sub.get('name', 'Subject')
        sub_marks = sub.get('marks', 0)
        sub_att = sub.get('attendance', 0)
        
        if sub_att < 75:
            penalty_warning = " (5% penalty risk)" if sub_att < 65 else ""
            critical_insights.append(f"Critical: Attendance for {sub_name} is only {sub_att}%. Attend the next 3 classes to cross the 75% threshold{penalty_warning}.")
        
        if sub_marks < 50:
            action_insights.append(f"Action Required: Your score in {sub_name} is {sub_marks}%. Schedule a peer-mentoring session or review the last 2 week's topics.")
        elif sub_marks > 85:
            other_insights.append(f"Excellence: You are top-performing in {sub_name}. Lead a study group to further solidify your expertise.")

    # 2. Skill & Overall Analysis
    if skill_level < 40:
        action_insights.append("Skill Development: Enroll in a hands-on workshop to improve your practical application skills.")
    
    # 3. Combine and Limit (Prioritize Critical > Action > Other)
    total_insights = critical_insights + action_insights + other_insights
    
    # Slice to top 3 insights
    insights = total_insights[:3]

    # If no specific insights, provide general maintenance
    if not insights:
        insights.append(f"Keep it up, {name}! Your current trajectory is excellent. Focus on maintaining consistency.")

    return insights

if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            input_data = json.loads(sys.argv[1])
            name = input_data.get('name', 'Student')
            subjects = input_data.get('subjects', [])
            marks = input_data.get('marks', 0)
            attendance = input_data.get('attendance', 0)
            skill_level = input_data.get('skill_level', 0)

            results = get_recommendations(name, subjects, marks, attendance, skill_level)
            print(json.dumps({"recommendation": results}))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        print(json.dumps({"error": "No input data provided"}))
