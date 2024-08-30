# routes.py
from flask import Blueprint, request, jsonify
from models import text_files, generate_answer
from image_processing import detect_and_count_objects, generate_user_friendly_response, extract_text_from_image
from PIL import Image, UnidentifiedImageError

app = Blueprint('app', __name__)

# Endpoint to get the list of available text files
@app.route('/available-files', methods=['GET'])
def available_files():
    try:
        return jsonify({"files": list(text_files.keys())})
    except Exception as e:
        print(f"Error fetching available files: {e}")
        return jsonify({"error": "Failed to retrieve available files."}), 500

# Endpoint to ask a question based on a selected text file
@app.route('/ask-question', methods=['POST'])
def ask_question():
    try:
        data = request.get_json()

        question = data.get('question')
        file_name = data.get('file_name')

        if not question or not file_name:
            return jsonify({"error": "Please provide both 'question' and 'file_name'."}), 400

        if file_name not in text_files:
            return jsonify({"error": "Text file not found."}), 404

        passage = text_files[file_name]
        answer = generate_answer(question, passage)

        if answer:
            return jsonify({"answer": answer}), 200
        else:
            return jsonify({"error": "Could not generate an answer."}), 500
    except Exception as e:
        print(f"Error processing question: {e}")
        return jsonify({"error": "Failed to process the question."}), 500

# Endpoint to process an uploaded image for object detection and text extraction
@app.route('/process-image', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']

    try:
        # Open the image using PIL
        try:
            image = Image.open(file.stream)
        except UnidentifiedImageError:
            return jsonify({"error": "Unsupported image format or corrupted image."}), 400

        # Ensure the image is in a supported format
        if image.format not in ['JPEG', 'PNG', 'BMP', 'GIF']:
            return jsonify({"error": f"Unsupported image format: {image.format}. Supported formats are JPEG, PNG, BMP, and GIF."}), 400

        # Perform object detection and generate a user-friendly response
        class_counts = detect_and_count_objects(image)
        response_message = generate_user_friendly_response(class_counts)

        # Extract text from the image
        extracted_text = extract_text_from_image(image)

        return jsonify({
            "response": response_message,
            "extracted_text": extracted_text
        }), 200
    except Exception as e:
        print(f"Error processing image: {e}")
        return jsonify({"error": f"Failed to process image: {str(e)}"}), 500
