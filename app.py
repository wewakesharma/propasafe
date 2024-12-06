from flask import Flask, request, jsonify
from newspaper import Article
from flask_cors import CORS
import re
import traceback #to debug
import requests #send sentence to server.py

app = Flask(__name__)
CORS(app)

INFERENCE_SERVER_URL = 'http://127.0.0.1:5001/run_inference'

@app.route('/fetch_news', methods=['POST'])
def fetch_news():
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({'error': 'URL not provided'}), 400

    try:
        article = Article(url) # fetch news article using Newspaper3k
        article.download()
        article.parse()

        # Extract the details from the article
        title = article.title
        author = article.authors
        content = article.text

        
        sentences = re.split(r'(?<=[.!?])\s+', content) # split the content into sentences and format each on a new line
        #print(len(sentences))
        total_sentence = len(sentences)
        #formatted_content = '\n'.join(sentences)

        # send sentences to server.py
        response = requests.post(INFERENCE_SERVER_URL, json={'sentences': sentences})
        #print("Response Status Code:", response.status_code)
        #print("Response Content:", response.text)
        if response.status_code != 200:
            return jsonify({'error': 'Failed to get inference results'}), 500

        # get the probability
        inference_results = response.json()
        probabilities = inference_results.get('probabilities', [])
        #print(probabilities)
        for i, sentence in enumerate(sentences):
            # Find text inside double quotes
            double_quote = re.findall(r'"([^"]*)"', sentence)
            # Check if any quote has more than two words
            if any(len(quote.split()) > 2 for quote in double_quote):
                probabilities[i] = 0.0  # Set probability to zero
        
        #get count of propaganda statements:
        non_prop = sum(1 for x in probabilities if x < 0.50)
        mild_prop = sum(1 for x in probabilities if 0.50 <= x <= 0.75)
        severe_prop = sum(1 for x in probabilities if x > 0.75)
        print(non_prop)
        print(mild_prop)
        print(severe_prop)

        return jsonify({
            'title': title,
            'author': ', '.join(author) if author else 'Unknown',
            'body': content,
            'inference': {
                'probabilities': probabilities
            },
            'total_sentence':total_sentence,
            'mild_prop':mild_prop,
            'severe_prop':severe_prop
        })
    except Exception as e:
        print("Error occurred:", str(e))
        traceback.print_exc() 
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)