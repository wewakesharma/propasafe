from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
import tensorflow_text as text  # Needed for BERT preprocessing

app = Flask(__name__)
CORS(app)

# Load the BERT model once
custom_objects = {'KerasLayer': hub.KerasLayer}
model = tf.keras.models.load_model("best_model.keras", custom_objects=custom_objects)

# Function to run inference using BERT model
def run_inference(sentences):
    # Preprocess and make predictions
    probabilities = []
    predictions = model.predict(sentences)
    for prediction in predictions:
        probabilities.append(round(float(prediction[0]),2)) #need to convert to float as jsonify doesn't support numpy.float32
    print("Inference completed!")
    return probabilities

@app.route('/run_inference', methods=['POST'])
def run_inference_endpoint():
    data = request.get_json()
    sentences = data.get('sentences', [])

    if not sentences:
        return jsonify({'error': 'No sentences extracted'}), 400

    # Run inference
    try:
        probabilities = run_inference(sentences)
        #print(probabilities)
        return jsonify({'probabilities': probabilities})
    except Exception as e:
        print("Error during inference:", str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001) 