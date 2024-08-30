# models.py
from pathlib import Path
from transformers import BertTokenizer, TFBertForQuestionAnswering
import tensorflow as tf
import re

# Load the BERT model and tokenizer
print("Loading the BERT large model...")
model_name = "bert-large-uncased-whole-word-masking-finetuned-squad"
model = TFBertForQuestionAnswering.from_pretrained(model_name)
tokenizer = BertTokenizer.from_pretrained(model_name)
print("BERT model and tokenizer successfully loaded.")

# Directory where the text files are located
# Use an absolute path
text_files_dir = Path(__file__).parent / 'text_files'

print(f"Looking for files in: {text_files_dir.resolve()}")
for file_path in text_files_dir.glob('*.txt'):
    print(f"Found file: {file_path.name}")

# Load the text files into a dictionary
text_files = {}
for file_path in text_files_dir.glob('*.txt'):
    with open(file_path, 'r') as file:
        text_files[file_path.name] = file.read()
print("Text files loaded.")

# Function to generate answers for each question
def generate_answer(question, passage):
    try:
        inputs = tokenizer(
            question,
            passage,
            return_tensors='tf',
            truncation=True,
            padding=True,
            max_length=512
        )

        outputs = model(inputs)
        start_logits = outputs.start_logits
        end_logits = outputs.end_logits

        start_position = tf.argmax(start_logits, axis=-1).numpy()[0]
        end_position = tf.argmax(end_logits, axis=-1).numpy()[0] + 1

        answer_tokens = inputs['input_ids'][0][start_position:end_position]
        answer = tokenizer.decode(answer_tokens)

        # Enhanced logic: Split by two commas (,,) or a single comma, else split by a period.
        if ',,' in answer:
            # Split at the first occurrence of two commas
            response = answer.split(',,')[0].strip() + ','
        elif ',' in answer:
            # Split at the first single comma
            response = answer.split(',')[0].strip() + ','
        else:
            # Fallback to period split
            response = answer.split('.')[0].strip() + '.'

        return response

    except Exception as e:
        print(f"Error: {e}")
        return None
