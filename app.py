from flask import Flask, render_template, jsonify, send_from_directory
import json
import os

app = Flask(__name__)

# Load data
DATA_PATH = os.path.join('data', 'salary_data.json')

def load_data():
    if os.path.exists(DATA_PATH):
        with open(DATA_PATH, 'r') as f:
            return json.load(f)
    return []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data')
def get_data():
    data = load_data()
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
