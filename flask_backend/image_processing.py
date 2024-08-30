# image_processing.py
import tensorflow as tf
import tensorflow_hub as hub
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np
import cv2
import inflect
import easyocr
from spellchecker import SpellChecker

# Load the pre-trained SSD MobileNetV2 model from TensorFlow Hub
model = hub.KerasLayer("https://tfhub.dev/tensorflow/ssd_mobilenet_v2/fpnlite_320x320/1", trainable=False)

OPEN_IMAGES_CLASSES = {
    1: "Man",
    2: "Woman",
    3: "Boy",
    4: "Girl",
    5: "Dog",
    6: "Cat",
    7: "Car",
    8: "Bus",
    9: "Bicycle",
    10: "Tree",
    11: "Traffic Light",
    12: "Stop Sign",
    13: "Bird",
    14: "Boat",
    15: "Airplane",
}

# Initialize the inflect engine for pluralization
inflect_engine = inflect.engine()

# Initialize the spell checker
spell = SpellChecker()

def detect_and_count_objects(image):
    # Ensure the image is in RGB format
    if image.mode != 'RGB':
        image = image.convert('RGB')

    # Convert the image into a tensor
    image_np = np.array(image)
    input_tensor = tf.convert_to_tensor(image_np)
    input_tensor = input_tensor[tf.newaxis, ...]

    # Run the object detection model
    outputs = model(input_tensor)

    # Extract detection classes and scores
    detection_classes = outputs['detection_classes'][0].numpy().astype(int)
    detection_scores = outputs['detection_scores'][0].numpy()

    # Filter results by confidence threshold
    threshold = 0.5
    detected_classes = [
        detection_classes[i]
        for i in range(len(detection_classes)) if detection_scores[i] > threshold
    ]

    # Count the number of occurrences for each class
    class_counts = {}
    for class_id in detected_classes:
        if class_id in OPEN_IMAGES_CLASSES:
            class_name = OPEN_IMAGES_CLASSES[class_id]
            if class_name in class_counts:
                class_counts[class_name] += 1
            else:
                class_counts[class_name] = 1

    return class_counts

def generate_user_friendly_response(class_counts):
    # Replace specific gendered classes with neutral terms
    for key in list(class_counts.keys()):
        if key in ["Man", "Woman", "Boy", "Girl"]:
            class_counts["Person"] = class_counts.pop(key) + class_counts.get("Person", 0)

    # Handle edge case: no objects detected
    if not class_counts:
        return "No recognizable objects were found in the image."

    # Check if the number of people detected is more than 3
    if "Person" in class_counts and class_counts["Person"] > 3:
        return "There is a gathering of people in the image."

    # Create a list of phrases for each detected class
    phrases = []
    for class_name, count in class_counts.items():
        pluralized_class_name = inflect_engine.plural("person" if class_name == "Person" else class_name.lower(), count)
        phrases.append(f"{count} {pluralized_class_name}")

    # Handle grammar for singular vs. plural cases
    if len(phrases) == 1:
        if phrases[0].startswith("1 "):
            response = f"There is {phrases[0]} in the image."
        else:
            response = f"There are {phrases[0]} in the image."
    elif len(phrases) == 2:
        response = f"There are {phrases[0]} and {phrases[1]} in the image."
    else:
        response = f"There are {', '.join(phrases[:-1])}, and {phrases[-1]} in the image."

    return response

def preprocess_image(image):
    # Ensure the image is in RGB format
    if image.mode != 'RGB':
        image = image.convert('RGB')

    # Convert the image to grayscale
    gray_image = image.convert('L')

    # Enhance the contrast
    enhanced_image = ImageEnhance.Contrast(gray_image).enhance(2)

    # Apply some blurring to reduce noise
    blurred_image = enhanced_image.filter(ImageFilter.MedianFilter())

    # Convert the PIL image to a NumPy array
    open_cv_image = np.array(blurred_image)

    # Ensure the image is single-channel (grayscale)
    if len(open_cv_image.shape) == 3:
        open_cv_image = cv2.cvtColor(open_cv_image, cv2.COLOR_BGR2GRAY)

    # Apply thresholding to binarize the image
    _, thresholded_image = cv2.threshold(open_cv_image, 150, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    return thresholded_image

def clean_text(text):
    # Split text into words
    words = text.split()

    # Correct misspelled words
    corrected_words = [spell.correction(word) for word in words]

    # Filter out nonsense words or phrases
    meaningful_words = [word for word in corrected_words if len(word) > 1]  # Keep words longer than 1 character

    # Join the words back into a sentence
    cleaned_text = ' '.join(meaningful_words)

    return cleaned_text.lower()  # Convert the cleaned text to lowercase

def extract_text_from_image(image):
    # Preprocess the image before OCR
    processed_image = preprocess_image(image)

    # Initialize the EasyOCR reader
    reader = easyocr.Reader(['en'])

    # Perform OCR on the preprocessed image
    result = reader.readtext(processed_image, detail=0)

    # Combine the results into a single string
    raw_text = ' '.join(result).strip()

    # Clean up the detected text
    cleaned_text = clean_text(raw_text)

    return cleaned_text
