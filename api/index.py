import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
# import os  <-- No longer needed
import google.generativeai as genai 
from dotenv import load_dotenv 

load_dotenv() 

app = Flask(__name__)
CORS(app)

# --- UPLOAD_FOLDER logic removed ---
# We will process the file in memory

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found. Make sure it's set in your .env file.")
genai.configure(api_key=api_key)

try:
    model = genai.GenerativeModel('models/gemini-2.5-flash')
except Exception as e:
    raise ValueError(f"Could not initialize model: {e}. Check model name.")

@app.route("/")
def home():
    return {"message": "Hello, this is the Python backend!"}

def generate_quiz_from_text(text, num_questions=5):
    """
    Sends text to the Gemini API and asks for a quiz in JSON format.
    """
    
    prompt = f"""
    Based on the following text, generate a {num_questions}-question multiple-choice quiz.
    Provide the output as a JSON object in the following exact format:
    
    {{
      "questions": [
        {{
          "question": "The question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "The correct option text",
          "difficulty": "Easy" 
        }}
      ]
    }}

    Rules:
    - Difficulty must be "Easy", "Medium", or "Hard".
    - The 'answer' must be one of the strings from the 'options' list.
    - Ensure the JSON is perfectly formatted.
    
    Here is the text:
    ---
    {text}
    ---
    """
    
    try:
        generation_config = genai.GenerationConfig(response_mime_type="application/json")
        response = model.generate_content(prompt, generation_config=generation_config)
        return response.text
    
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return '{ "error": "Failed to generate quiz from AI" }'

def generate_recap_from_text(text):
    """
    Sends text to the Gemini API and asks for a short recap.
    """
    
    prompt = f"""
    Based on the following text, please provide a "short recap".
    This recap should:
    1. Summarize the main topics.
    2. Explain the key concepts in a few sentences each.
    
    Provide the output as a single JSON object in the following exact format:
    
    {{
      "recap": "Your summary text here, using paragraphs as needed."
    }}
    
    Here is the text:
    ---
    {text}
    ---
    """
    
    try:
        generation_config = genai.GenerationConfig(response_mime_type="application/json")
        response = model.generate_content(prompt, generation_config=generation_config)
        return response.text
    
    except Exception as e:
        print(f"Error calling Gemini API for recap: {e}")
        return '{ "error": "Failed to generate recap from AI" }'

@app.route("/upload", methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        # --- Removed file.save() and filepath logic ---
        
        try:
            full_text = ""
            # --- Process file directly in memory ---
            with pdfplumber.open(file) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n"
            
            # --- Removed os.remove() ---
            
            try:
                num_questions = int(request.form.get('num_questions', 5))
            except ValueError:
                num_questions = 5
            
            print(f"Sending {len(full_text)} characters to AI for {num_questions}-question quiz...")
            quiz_json_string = generate_quiz_from_text(full_text, num_questions)
            
            print("--- AI Response (string) ---")
            print(quiz_json_string)
            print("-----------------------------")
            
            return app.response_class(
                response=quiz_json_string,
                status=200,
                mimetype='application/json'
            )

        except Exception as e:
            # --- Removed os.path.exists() logic ---
            print(f"Error processing PDF: {e}")
            return jsonify({"error": f"Error processing PDF: {e}"}), 500

# --- /recap Endpoint ---
@app.route("/recap", methods=['POST'])
def recap_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        # --- Removed file.save() and filepath logic ---
        
        try:
            full_text = ""
            # --- Process file directly in memory ---
            with pdfplumber.open(file) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n"
            
            # --- Removed os.remove() ---
            
            print(f"Sending {len(full_text)} characters to AI for recap...")
            recap_json_string = generate_recap_from_text(full_text)
            
            print("--- AI Recap Response (string) ---")
            print(recap_json_string)
            print("----------------------------------")
            
            return app.response_class(
                response=recap_json_string,
                status=200,
                mimetype='application/json'
            )

        except Exception as e:
            # --- Removed os.path.exists() logic ---
            print(f"Error processing PDF for recap: {e}")
            return jsonify({"error": f"Error processing PDF: {e}"}), 500

# --- This part is important for Vercel ---
# Vercel will import 'app', so it shouldn't be run directly
if __name__ == "__main__":
    app.run(debug=True)
