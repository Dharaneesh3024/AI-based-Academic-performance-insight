import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# Load dataset
def train_model():
    file_path = os.path.join(os.path.dirname(__file__), 'dataset.csv')
    data = pd.read_csv(file_path)

    X = data[['Marks', 'Attendance', 'SkillLevel']]
    y = data['Recommendation']

    # Initialize and train model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)

    # Save model
    model_path = os.path.join(os.path.dirname(__file__), 'student_model.pkl')
    joblib.dump(model, model_path)
    print(f"Model trained and saved to {model_path}")

if __name__ == "__main__":
    train_model()
