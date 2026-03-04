import sys
import joblib
import json
import os

# Load model
def get_recommendation(marks, attendance, skill_level):
    model_path = os.path.join(os.path.dirname(__file__), 'student_model.pkl')
    model = joblib.load(model_path)

    prediction = model.predict([[marks, attendance, skill_level]])
    return prediction[0]

if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            input_data = json.loads(sys.argv[1])
            marks = input_data.get('marks', 0)
            attendance = input_data.get('attendance', 0)
            skill_level = input_data.get('skill_level', 0)

            result = get_recommendation(marks, attendance, skill_level)
            print(json.dumps({"recommendation": result}))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        print(json.dumps({"error": "No input data provided"}))
