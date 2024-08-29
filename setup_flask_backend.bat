@echo off
REM This batch script creates the flask_backend directory and the necessary files.

REM Create flask_backend directory and navigate into it
mkdir flask_backend
cd flask_backend

REM Create subdirectories
mkdir static templates

REM Create initial app.py file
echo from flask import Flask > app.py
echo app = Flask(__name__) >> app.py
echo. >> app.py
echo @app.route('/') >> app.py
echo def home(): >> app.py
echo ^    return "Hello, Flask!" >> app.py
echo. >> app.py
echo if __name__ == '__main__': >> app.py
echo ^    app.run(debug=True) >> app.py

REM Create routes.py placeholder file
echo # Define your Flask routes here > routes.py

REM Create models.py placeholder file
echo # Load and manage the BERT model here > models.py

REM Create README.md file
echo # Flask Backend > README.md
echo This directory contains the Flask backend for the project. >> README.md
echo. >> README.md
echo - **app.py**: Main Flask application. >> README.md
echo - **routes.py**: Define the API routes and endpoints. >> README.md
echo - **models.py**: Load and manage machine learning models (like BERT). >> README.md

echo Flask backend structure and files created successfully!
pause
