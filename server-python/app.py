from flask import Flask, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/proxy-text', methods=['GET'])
def proxy_text():
    try:
        response = requests.get('https://random-text-api.vercel.app/generate?length=5&type=sentence')
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'Error fetching text'}), 500

if __name__ == '__main__':
    PORT = 5000
    app.run(host='localhost', port=PORT)
    print(f"Server is running on http://localhost:{PORT}")
