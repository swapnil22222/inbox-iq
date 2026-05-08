import joblib

model = joblib.load("models/model.pkl")
vectorizer = joblib.load("models/vectorizer.pkl")


def predict_category(subject, body):
    text = subject + " " + body

    vector = vectorizer.transform([text])

    prediction = model.predict(vector)[0]
    confidence = max(model.predict_proba(vector)[0])

    return prediction, round(float(confidence), 2)