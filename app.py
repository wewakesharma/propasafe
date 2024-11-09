from flask import Flask, request, jsonify
from newspaper import Article
from flask_cors import CORS
import re
import traceback

app = Flask(__name__)
CORS(app)


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

        # Extract the details from the article
        title = article.title
        author = article.authors
        content = article.text

        # Split the content into sentences and format each on a new line
        sentences = re.split(r'(?<=[.!?]) +', content)
        formatted_content = '\n'.join(sentences)
        
        return jsonify({
            'title': title,
            'author': ', '.join(author) if author else 'Unknown',
            'body': content
        })
    except Exception as e:
        print("Error occurred:", str(e))
        traceback.print_exc()  # Print the full traceback for more details
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)