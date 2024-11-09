from flask import Flask, request, jsonify
from newspaper import Article
from flask_cors import CORS
import re
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
def run_inference(text):
    """Function to perform inference on given text using the BERT model."""
    # Preprocess and make predictions
    predictions = model.predict([text])  # Ensure the text is passed as a list
    probability = predictions[0][0]
    label = 'propaganda' if probability > 0.5 else 'non-propaganda'
    
    return label, probability

@app.route('/fetch_news', methods=['POST'])
def fetch_news():
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({'error': 'URL not provided'}), 400

    # Fetch news article using Newspaper3k
    try:
        article = Article(url)
        article.download()
        article.parse()

        # Extract details from the article
        title = article.title
        author = article.authors
        content = article.text

        # Perform BERT inference on the content
        label, probability = run_inference(content)

        return jsonify({
            'title': title,
            'author': ', '.join(author) if author else 'Unknown',
            'body': content,
            'inference': {
                'label': label,
                'probability': round(probability, 2)
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)