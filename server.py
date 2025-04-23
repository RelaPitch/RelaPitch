from flask import Flask, render_template, jsonify, request, session, redirect, url_for
import os
from datetime import datetime
import json
import random

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Required for session

# Lesson content (this would typically come from a database)
LESSONS = {
    1: {
        "title": "Introduction to Musical Notes",
        "content": """
        <h2>Diatonic Scale</h2>
        <p>In music theory, the diatonic scale consists of 7 notes (in one octave): C, D, E, F, G, A, B. These are the white keys shown on the piano.</p>
        
        <h2>What is an Octave?</h2>
        <p>An octave is the distance from one pitch to another that has double its frequency. In other words, the two pitches sound the same but one is simply higher/lower in pitch than the other.</p>
        <p>Examples: C to C, E to E, A to A, etc.</p>
        
        <h2>Chromatic Scale</h2>
        <p>The black keys combine with the white keys to form the chromatic scale, which consists of all 12 pitches:</p>
        <p>C, C# or Db, D, D# or Eb, E, F, F# or Gb, G, G# or Ab, A, A# or Bb, B</p>
        """,
        "keyboard": True
    },
    2: {
        "title": "Understanding Steps in Music",
        "content": """
        <h2>Half Steps</h2>
        <p>A half step is the distance between two adjacent keys on a keyboard.</p>
        <ul>
            <li>Notes can either be sharp (#) meaning the note is raised one half step, or flat (b) meaning the note is lowered one half step.</li>
            <li>Sharp (#) example: If you started on D and you wanted D#, you would move up one half step.</li>
            <li>Flat (b) example: If you started on A and you wanted Ab, you would move down one half step.</li>
            <li>Examples of half steps: C to C#, E to F, A# to A, B to C</li>
        </ul>
        
        <h2>Whole Steps</h2>
        <p>A whole step is made of two half steps.</p>
        <p>Examples of whole steps: C to D, E to F, A# to A, B to C</p>
        """,
        "keyboard": True
    },
    3: {
        "title": "Introduction to Relative Pitch",
        "content": """
        <h2>What is Relative Pitch?</h2>
        <p>This app will help you to learn relative pitch or develop it further if you have some background.</p>
        <p>Relative pitch refers to the ability to identify or reproduce the pitch of a note in relation to another note.</p>
        <p>You will be given a reference note, and then keeping the pitch of this reference note in mind, will either identify a second note by hearing it or will reproduce it by using your mic.</p>
        
        <h2>Practicing Relative Pitch</h2>
        <p>After hearing the reference pitch, try to establish the connection between the pitch and the note name. You could try playing the note on the piano and humming along to the note to reinforce the pitch. It will be important to keep this in mind for the future.</p>
        <p>For exercise, try first playing any of the white keys, keeping in mind the note name, and hum along with the piano until you match in pitch. After some time, see if you can recreate the same pitch without using the piano for reference.</p>
        
        <h2>Identifying Higher Notes</h2>
        <p>If you are hearing the guess note, try to determine if it is higher or lower in pitch relative to the reference pitch.</p>
        <p>If it is higher, try to identify the notes that are higher than your reference note (before you reach the octave). For now, just focus on the white keys.</p>
        <p>Example: say the reference note is E and the guess note (A) sounded higher. What notes would you focus on? F, G, A, B, C, and D.</p>
        <p>Try humming the reference note by playing the audio and tuning yourself, and then hum each of the notes in the subset above until you think the note matches the guess note.</p>
        
        <h2>Identifying Lower Notes</h2>
        <p>If it is lower, try the same approach: identify the notes that are lower than your reference note (before you reach the octave).</p>
        <p>Example: say the reference note is G and the guess note (C) sounds lower. What notes would you focus on? F, E, D, C, B, and A.</p>
        <p>Using the same method, try humming the reference note by playing the audio and tuning yourself, and then hum each of the notes in the subset above until you think the note matches the guess note.</p>
        
        <h2>Recreating Notes</h2>
        <p>If you are recreating the guess note, it is up to you whether you want to go higher or lower.</p>
        <p>Based on your decision, try to think of the notes in between your reference note and the guess note.</p>
        <p>Starting from the reference note, try humming in the direction of the guess note (either going higher or lower) until you think you have matched the pitch of the guess note. Use the piano for guidance when first starting.</p>
        """,
        "keyboard": True
    }
}

# Quiz questions
QUIZ_QUESTIONS = {
    1: {
        "type": "listen",
        "reference_note": "C4",
        "target_note": "E4",
        "options": ["C", "D", "E", "F", "G", "A", "B"]
    },
    2: {
        "type": "listen",
        "reference_note": "G4",
        "target_note": "B4",
        "options": ["C", "D", "E", "F", "G", "A", "B"]
    },
    3: {
        "type": "sing",
        "reference_note": "C4",
        "target_note": "G4",
        "options": []  # Empty list for sing mode
    }
}

# Generate random target note for listen mode
def generate_random_target_note():
    notes = ["C", "D", "E", "F", "G", "A", "B"]
    random_note = random.choice(notes)
    return f"{random_note}4"  # Always use octave 4

# Initialize user data storage
def init_user_data():
    if 'user_data' not in session:
        session['user_data'] = {
            'start_time': datetime.now().isoformat(),
            'lesson_visits': {},
            'quiz_answers': {},
            'quiz_score': 0
        }

@app.route('/')
def home():
    init_user_data()
    return render_template('home.html')

@app.route('/lesson/<int:lesson_id>')
def lesson(lesson_id):
    init_user_data()
    if lesson_id in LESSONS:
        # Record lesson visit
        session['user_data']['lesson_visits'][str(lesson_id)] = datetime.now().isoformat()
        session.modified = True
        return render_template('lesson.html', lesson=LESSONS[lesson_id], lesson_id=lesson_id)
    return "Lesson not found", 404

@app.route('/quiz/<int:question_id>')
def quiz(question_id):
    init_user_data()
    
    # Get the mode and reference note from the session
    mode = session.get('quiz_mode', 'listen')
    reference_note = session.get('reference_note', 'C4')
    
    # Generate a new random target note for each question
    target_note = generate_random_target_note()
    print(f"Generated target note: {target_note}")
    
    # Store the target note in the session
    if 'quiz_questions' not in session:
        session['quiz_questions'] = {}
    session['quiz_questions'][str(question_id)] = {
        'target_note': target_note
    }
    session.modified = True
    
    if mode == 'listen':
        question = {
            "type": "listen",
            "reference_note": reference_note,  # Use the selected reference note
            "target_note": target_note,
            "options": ["C", "D", "E", "F", "G", "A", "B"]
        }
    else:  # sing mode
        question = {
            "type": "sing",
            "reference_note": reference_note,  # Use the selected reference note
            "target_note": target_note,
            "options": []  # Empty list for sing mode
        }
    
    return render_template('quiz.html', 
                         question=question,
                         question_id=question_id,
                         total_questions=3)  # Always 3 questions

@app.route('/quiz/mode')
def quiz_mode():
    init_user_data()
    return render_template('quiz_mode.html')

@app.route('/quiz/start/<mode>')
def start_quiz(mode):
    init_user_data()
    # Get the reference note from the query parameters
    reference_note = request.args.get('reference', 'C4')  # Default to C4 if not provided
    # Store the selected mode and reference note in the session
    session['quiz_mode'] = mode
    session['reference_note'] = reference_note
    session.modified = True
    # Redirect to the first question
    return redirect(url_for('quiz', question_id=1))

@app.route('/quiz/submit', methods=['POST'])
def submit_quiz_answer():
    try:
        data = request.get_json()
        question_id = data.get('question_id')
        answer = data.get('answer')
        
        if not question_id or not answer:
            return jsonify({'success': False, 'error': 'Missing question_id or answer'}), 400
        
        # Initialize user data if not exists
        if 'user_data' not in session:
            session['user_data'] = {
                'start_time': datetime.now().isoformat(),
                'lesson_visits': {},
                'quiz_answers': {},
                'quiz_score': 0
            }
        
        # Get the mode from the session
        mode = session.get('quiz_mode', 'listen')
        
        # Get the stored target note for this question
        target_note = session['quiz_questions'][str(question_id)]['target_note']
        
        # Check if the answer is correct
        is_correct = False
        if mode == 'listen':
            # For listen mode, check if the answer matches the target note
            is_correct = answer == target_note[0]  # Compare just the note letter
        else:  # sing mode
            # For sing mode, check if the answer matches the target note
            # Remove any octave number from the answer (e.g., "C4" -> "C")
            answer_note = answer[0] if answer else ''
            is_correct = answer_note == target_note[0]
        
        # Store the answer with correctness
        session['user_data']['quiz_answers'][str(question_id)] = {
            'answer': answer,
            'timestamp': datetime.now().isoformat(),
            'is_correct': is_correct,
            'target_note': target_note  # Store the target note for reference
        }
        session.modified = True
        
        print(f"Stored answer for question {question_id}: {answer} (Correct: {is_correct}, Target: {target_note})")
        return jsonify({
            'success': True,
            'is_correct': is_correct,
            'correct_answer': target_note[0]  # Return just the note letter
        })
    except Exception as e:
        print(f"Error submitting answer: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/quiz/results')
def quiz_results():
    init_user_data()
    answers = session['user_data']['quiz_answers']
    correct_answers = 0
    
    for question_id, answer_data in answers.items():
        if answer_data.get('is_correct', False):
            correct_answers += 1
    
    total_questions = len(QUIZ_QUESTIONS)
    score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
    
    session['user_data']['quiz_score'] = score
    session.modified = True
    
    return render_template('quiz_results.html', 
                         score=score,
                         total_questions=total_questions,
                         correct_answers=correct_answers)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True) 