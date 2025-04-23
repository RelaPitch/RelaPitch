from flask import Flask, render_template, jsonify, request, session
import os
from datetime import datetime
import json

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Required for session

# Lesson content (this would typically come from a database)
LESSONS = {
    1: {
        "title": "Introduction to Pitch Recognition",
        "content": """
        <h2>What is Relative Pitch?</h2>
        <p>Relative pitch is the ability to identify or recreate a musical note by comparing it to a reference note. Unlike perfect pitch, which allows you to identify notes without a reference, relative pitch is a skill that can be developed through practice.</p>
        
        <h2>Why Learn Relative Pitch?</h2>
        <ul>
            <li>Improves musical ear training</li>
            <li>Helps with music composition and improvisation</li>
            <li>Makes learning new songs easier</li>
            <li>Enhances overall musical understanding</li>
        </ul>
        
        <h2>Getting Started</h2>
        <p>In this course, we'll start with the basic notes (C, D, E, F, G, A, B) and gradually build your ability to recognize and reproduce them. We'll use both listening exercises and singing practice to develop your relative pitch.</p>
        """,
        "keyboard": True
    },
    2: {
        "title": "Basic Note Recognition",
        "content": """
        <h2>Understanding Musical Notes</h2>
        <p>In Western music, we use seven basic notes: C, D, E, F, G, A, and B. These notes repeat in higher and lower octaves, creating the musical scale we're familiar with.</p>
        
        <h2>The Musical Alphabet</h2>
        <p>The musical alphabet is similar to the regular alphabet but only uses the first seven letters (A through G). After G, it starts over at A in the next octave.</p>
        
        <h2>Practice Exercise</h2>
        <p>Use the interactive keyboard below to familiarize yourself with the sound of each note. Start with C and work your way up the scale, listening carefully to the differences between each note.</p>
        """,
        "keyboard": True
    },
    3: {
        "title": "Interval Training",
        "content": """
        <h2>What are Intervals?</h2>
        <p>An interval is the distance between two notes. Understanding intervals is crucial for developing relative pitch. Common intervals include:</p>
        <ul>
            <li>Unison (same note)</li>
            <li>Major Second (two notes apart)</li>
            <li>Major Third (four notes apart)</li>
            <li>Perfect Fourth (five notes apart)</li>
            <li>Perfect Fifth (seven notes apart)</li>
        </ul>
        
        <h2>Practice Exercise</h2>
        <p>Use the interactive keyboard to play different intervals. Start with simple intervals and gradually move to more complex ones. Try to recognize the unique sound of each interval.</p>
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
    if question_id in QUIZ_QUESTIONS:
        question = QUIZ_QUESTIONS[question_id]
        # Ensure options is always a list
        if 'options' not in question:
            question['options'] = []
        return render_template('quiz.html', 
                             question=question,
                             question_id=question_id,
                             total_questions=len(QUIZ_QUESTIONS))
    return "Question not found", 404

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
        
        # Get the question
        question = QUIZ_QUESTIONS[int(question_id)]
        
        # Check if the answer is correct
        is_correct = False
        if question['type'] == 'listen':
            # For listen mode, check if the answer matches the target note
            is_correct = answer == question['target_note'][0]
        else:
            # For sing mode, check if the answer matches the target note
            # Remove any octave number from the answer (e.g., "C4" -> "C")
            answer_note = answer[0] if answer else ''
            is_correct = answer_note == question['target_note'][0]
        
        # Store the answer with correctness
        session['user_data']['quiz_answers'][str(question_id)] = {
            'answer': answer,
            'timestamp': datetime.now().isoformat(),
            'is_correct': is_correct
        }
        session.modified = True
        
        print(f"Stored answer for question {question_id}: {answer} (Correct: {is_correct})")
        return jsonify({
            'success': True,
            'is_correct': is_correct,
            'correct_answer': question['target_note'][0]
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