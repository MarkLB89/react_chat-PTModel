from flask import Flask
from flask_cors import CORS
from routes import app as routes_blueprint
import os

# Force UTF-8 encoding
os.environ["PYTHONIOENCODING"] = "utf-8"

# Initialize the Flask application
app = Flask(__name__)

# Set any necessary configuration (e.g., file size limit)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit file uploads to 16MB

# Enable CORS to allow requests from the frontend (running on a different port)
CORS(app)

# Register the blueprint that contains your routes
app.register_blueprint(routes_blueprint)

if __name__ == '__main__':
    # Run the Flask app in debug mode and specify the host if needed
    app.run(debug=True, host='0.0.0.0', port=5000)
