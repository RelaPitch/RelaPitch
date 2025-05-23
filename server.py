from flask import Flask, render_template, jsonify, request, session, redirect, url_for
import os
from datetime import datetime, date
import json
import random

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Required for session

# Available daily quests
AVAILABLE_DAILY_QUESTS = [
    {
        "quest_id": "sharp_ear",
        "description": "Get 3 correct answers in 'listen' mode.",
        "type": "listen_correct_count",
        "goal_value": 3,
        "reward_points": 50
    },
    {
        "quest_id": "pitch_tuner",
        "description": "Get 2 successful matches in 'sing' mode.",
        "type": "sing_correct_count",
        "goal_value": 2,
        "reward_points": 50
    },
    {
        "quest_id": "daily_discovery",
        "description": "Complete 3 lesson interactions.",
        "type": "lesson_interaction_count",
        "goal_value": 3,
        "reward_points": 30
    },
    {
        "quest_id": "perfect_listener",
        "description": "Achieve a streak of 4 correct answers in 'listen' mode.",
        "type": "listen_streak",
        "goal_value": 4,
        "reward_points": 75
    },
    {
        "quest_id": "well_rounded_musician",
        "description": "Get 1 correct 'listen' answer AND 1 successful 'sing' match.",
        "type": "combined_practice",
        "goal_value": 2,  # Not directly used, but good for consistency
        "reward_points": 60
    }
]

# Lesson content (this would typically come from a database)
LESSONS = {
    1: {
        "title": "Introduction to Relative Pitch",
        "content": """
        <h2>What is Relative Pitch?</h2>
        <p>This app will help you to learn relative pitch or develop it further if you have some background.</p>
        <p>Relative pitch refers to the ability to <span class='bold'>identify or reproduce the pitch</span> of a note <span class='bold'>in relation to another note.</span></p>
        <p>You will be given a <span class='bold'>reference note</span>, and then keeping the pitch of this reference note in mind, will either identify a second note by hearing it or will reproduce it by using your mic.</p>""",
        "keyboard": False
    },
    2: {
        "title": "Introduction to Notes",
        "content": """
        <h2>Diatonic Scale</h2>
        <p>In music theory, the <span class='bold'>diatonic scale</span> consists of 7 notes (in one octave): <span class='bold'>C, D, E, F, G, A, B.</span> These are the white keys shown on the piano.</p>
        <p>For simplicity, let's just focus on the <span class='bold'>C major scale</span>, which consists of the notes in the order: C, D, E, F, G, A, B, C. Click on the<span class='bold'> Play Scale button</span> to hear each note.</p>
        <button id="playScale" class="btn">Play Scale</button>""",
        "keyboard": True
    },
    3: {
        "title": "What is an Octave?",
        "content": """
        <h2>What is an Octave?</h2>
        <p>An <span class='bold'>octave</span> is the distance from one note to another that has double its frequency. In other words, the two notes sound the same but one is simply higher/lower in pitch than the other.</p>
        <p>Examples: C to C, E to E, A to A, etc.</p>
        <p>Click on the <span class='bold'>Play Octave button</span> to hear an example of an octave, C to C.</p>
        <button id="playOctave" class="btn">Play Octave</button>""",
        "keyboard": True
    },
    4: {
        "title": "What is a Chromatic Scale?",
        "content": """
        <h2>Chromatic Scale</h2>
        <p>The black keys combine with the white keys to form the <span class='bold'>chromatic scale</span>, which consists of 12 notes:</p>
        <p>C, C# or D♭, D, D# or E♭, E, F, F# or G♭, G, G# or A♭, A, A# or B♭, B</p>
        <p>Notice how some of these notes have 2 different names (such as C# and D♭). These notes are called <span class='bold'>enharmonic equivalents</span>.</p>
        <p><span class='bold'>Enharmonic equivalents</span> are two notes that sound the same but have different spellings.
        <p>Click on the <span class='bold'>Play Chromatic Scale button</span> to hear each note.</p>
        <button id="playChromaticScale" class="btn">Play Chromatic Scale</button>""",
        "keyboard": True
    },
    5: {
        "title": "Understanding Steps in Music",
        "content": """
        <h2>Half Steps</h2>
        <p>A <span class='bold'>half step</span> is the distance between two adjacent keys on a keyboard.</p>
        <ul>
            <li>Notes can either be <span class='bold'>sharp (#)</span> meaning the note is raised one half step, or <span class='bold'>flat (♭)</span> meaning the note is lowered one half step.</li>
            <li>Sharp (#) example: If you started on D and you wanted D#, you would move up one half step.</li>
            <li>Flat (♭) example: If you started on A and you wanted A♭, you would move down one half step.</li>
        </ul>
        <p>Examples of half steps:</p>
        <div class="halfstep-examples">
            <div class="halfstep-item">C to C#<button id="playHalfStep1" class="btn">Play Example</button></div>
            <div class="halfstep-item">E to F<button id="playHalfStep2" class="btn">Play Example</button></div>
            <div class="halfstep-item">A# to A<button id="playHalfStep3" class="btn">Play Example</button></div>
        </div>
        """,
        "keyboard": True
    },
    6: {
        "title": "Understanding Whole Steps",
        "content": """
        <h2>Whole Steps</h2>
        <p>A <span class='bold'>whole step</span> is made of two half steps.</p>
        <p>Examples of whole steps:</p>
        <div class="halfstep-examples">
            <div class="halfstep-item">C to D<button id="playWholeStep1" class="btn">Play Example</button></div>
            <div class="halfstep-item">A to G<button id="playWholeStep2" class="btn">Play Example</button></div>
            <div class="halfstep-item">F# to E<button id="playWholeStep3" class="btn">Play Example</button></div>
        </div>
        """,
        "keyboard": True
    },
    7: {
        "title": "Identifying Higher Notes",
        "content": """
        <p>If you are <span class='bold'>hearing</span> the target note, try to determine if it is <span class='bold'>higher or lower</span> in pitch relative to the reference pitch.</p>
        <p>If it is higher, try to <span class='bold'>identify</span> the notes that are higher than your reference note (before you reach the octave). For now, just focus on the white keys.</p>
        <p>Example: say the reference note is E and the target note (A) sounded higher. What notes would you focus on? <span class='bold'>F, G, A, B, C, and D</span>.</p>
        <p>Try <span class='bold'>singing/humming</span> the reference note by playing the audio and tuning yourself, and then sing/hum each of the notes in the subset above until you think the note matches the target note.</p>
        """,
        "keyboard": True
    },
    8: {
        "title": "Identifying Lower Notes",
        "content": """
        <p>If it is lower, try the same approach: <span class='bold'>identify</span> the notes that are lower than your reference note (before you reach the octave).</p>
        <p>Example: say the reference note is G and the target note (C) sounds lower. What notes would you focus on? <span class='bold'>F, E, D, C, B, and A</span>.</p>
        <p>Using the same method, try <span class='bold'>singing/humming</span> the reference note by playing the audio and tuning yourself, and then sing/hum each of the notes in the subset above until you think the note matches the target note.</p>
        """,
        "keyboard": True
    },
    9: {
        "title": "Practicing Singing/Humming",
        "content": """      
        <p>After hearing the reference note, try to establish the connection between the <span class='bold'>pitch</span> and the <span class='bold'>note name</span> of the reference note. </p>
        <p>You could try playing the note on the piano and <span class='bold'>singing/humming</span> along to the note to reinforce the pitch. It will be important to keep this in mind for the future.</p>
        <p>For exercise, try first playing <span class='bold'>any of the white keys</span>, keeping in mind the note name, and sing/hum along with the piano until you match in pitch.</p>
        <p>After some time, see if you can recreate the same pitch <span class='bold'>without</span> using the piano for reference.</p>
        <h3>Exercise: Target note G</h3>
        <div class="target-note mb-4">
            <button id="startTuner" class="btn btn-primary">Start Recording</button>
            <div id="tunerDisplay" class="mt-3">
                <div id="pitch"></div>
                <div id="note"></div>
                <canvas id="tunerCanvas"></canvas>
                <button id="helpButton" class="btn btn-info mt-3" disabled>Show hint</button>
            </div>
        </div>
        """,
        "keyboard": True
    },
    10: {
        "title": "More Tips on Recreating Notes",
        "content": """
        <p>If you are recreating the target note, it is <span class='bold'>up to you</span> whether you want to go higher or lower.</p>
        <p><span class='bold'>Strategy:</span> starting from the reference note, try singing/humming in the direction of the target note (either going higher or lower) until you think you have <span class='bold'>matched the pitch</span> of the target note. Use the piano for guidance when first starting.</p>
        <p>Another strategy is to figure out the <span class='bold'>number of whole/half steps</span> between your reference note and target note, and adjust your pitch accordingly starting from the reference note.</p>

        <div class="target-note mb-4">
            <button id="startTuner" class="btn btn-primary">Start Recording</button>
            <div id="tunerDisplay" class="mt-3">
                <div id="pitch"></div>
                <div id="note"></div>
                <canvas id="tunerCanvas"></canvas>
                <button id="helpButton" class="btn btn-info mt-3 hidden" disabled>Show hint</button>
            </div>
        </div>
        <div class="quiz-ask">
            <h3>Ready to take the quiz?</h3>
            <a href="/quiz/mode" class="btn quiz-btn">Take Quiz</a>
            <a href="/lesson/1" class="btn review-btn">Review Lessons</a>
        </div>
        """,
        "keyboard": True
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
    
    # Initialize score if not exists
    if 'score' not in session:
        session['score'] = 0
    
    # Initialize completed items tracking if not exists
    if 'completed_items' not in session:
        session['completed_items'] = {}
    
    # Daily Quest initialization and reset
    current_date = date.today().isoformat()
    if session.get('daily_quest_assigned_date') != current_date or 'current_daily_quest' not in session:
        # Reset or initialize daily quest
        selected_quest = random.choice(AVAILABLE_DAILY_QUESTS)
        session['daily_quest_assigned_date'] = current_date
        session['current_daily_quest'] = selected_quest
        
        # Initialize progress based on quest type
        if selected_quest['type'] == 'combined_practice':
            session['daily_quest_progress'] = {'listen_done': False, 'sing_done': False}
        else:
            session['daily_quest_progress'] = {'count': 0}
        
        # Reset streak count for streak quests
        session['listen_streak_count'] = 0
        
        # Reset completion status
        session['daily_quest_completed_today'] = False

# Helper functions for scoring and completion tracking
def award_points_to_session(points_to_award):
    """Award points to the user's session score"""
    # Initialize if not exists
    if 'score' not in session:
        session['score'] = 0
    
    # Add points
    session['score'] += points_to_award
    session.modified = True
    
    return session['score']

def mark_item_as_completed_in_session(item_id):
    """Mark an item as completed in the user's session"""
    # Initialize if not exists
    if 'completed_items' not in session:
        session['completed_items'] = {}
    
    # Mark item as completed
    session['completed_items'][item_id] = True
    session.modified = True

def has_item_been_completed_in_session(item_id):
    """Check if an item has been completed in the user's session"""
    # Initialize if not exists
    if 'completed_items' not in session:
        session['completed_items'] = {}
    
    # Check if item is completed
    return item_id in session['completed_items']

@app.route('/')
def home():
    init_user_data()
    return render_template('home.html',
                         score=session.get('score', 0),
                         current_daily_quest=session.get('current_daily_quest'),
                         daily_quest_progress=session.get('daily_quest_progress'),
                         daily_quest_completed=session.get('daily_quest_completed_today', False),
                         listen_streak_count=session.get('listen_streak_count', 0))

@app.route('/lesson/<int:lesson_id>')
def lesson(lesson_id):
    init_user_data()
    if lesson_id not in LESSONS:
        return redirect(url_for('home'))
    
    lesson_data = LESSONS[lesson_id]
    return render_template('lesson.html', 
                         lesson=lesson_data, 
                         lesson_id=lesson_id,
                         score=session.get('score', 0),
                         current_daily_quest=session.get('current_daily_quest'),
                         daily_quest_progress=session.get('daily_quest_progress'),
                         daily_quest_completed=session.get('daily_quest_completed_today', False),
                         listen_streak_count=session.get('listen_streak_count', 0))

@app.route('/search')
def search():
    init_user_data()
    query = request.args.get('q', '').strip()
    results = []
    if query:
        for lesson_id, lesson_data in LESSONS.items():
            if query.lower() in lesson_data['title'].lower() or query.lower() in lesson_data['content'].lower():
                results.append({'id': lesson_id, 'title': lesson_data['title']})
    return render_template('search_results.html', 
                         query=query, 
                         results=results,
                         score=session.get('score', 0),
                         current_daily_quest=session.get('current_daily_quest'),
                         daily_quest_progress=session.get('daily_quest_progress'),
                         daily_quest_completed=session.get('daily_quest_completed_today', False),
                         listen_streak_count=session.get('listen_streak_count', 0))

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
                         total_questions=5,  # Always 3 questions
                         score=session.get('score', 0),
                         current_daily_quest=session.get('current_daily_quest'),
                         daily_quest_progress=session.get('daily_quest_progress'),
                         daily_quest_completed=session.get('daily_quest_completed_today', False),
                         listen_streak_count=session.get('listen_streak_count', 0))

@app.route('/quiz/mode')
def quiz_mode():
    init_user_data()
    return render_template('quiz_mode.html',
                         score=session.get('score', 0),
                         current_daily_quest=session.get('current_daily_quest'),
                         daily_quest_progress=session.get('daily_quest_progress'),
                         daily_quest_completed=session.get('daily_quest_completed_today', False),
                         listen_streak_count=session.get('listen_streak_count', 0))

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

@app.route('/log_progress', methods=['POST'])
def log_progress():
    try:
        # Ensure user data is initialized
        init_user_data()
        
        # Get data from request
        data = request.get_json()
        item_id = data.get('itemId')
        points_for_this_item = data.get('points', 0)
        item_type = data.get('itemType', 'generic')
        
        if not item_id:
            return jsonify({'success': False, 'error': 'Missing itemId'}), 400
        
        # Check if this item has already been completed
        is_already_completed = has_item_been_completed_in_session(item_id)
        
        # Current score before any updates
        new_score = session.get('score', 0)
        awarded_item_points = 0
        
        # Conditional Point Awarding for the Item Itself
        if not is_already_completed:
            # Award points for this specific item interaction
            new_score = award_points_to_session(points_for_this_item)
            # Mark as completed to prevent future awards
            mark_item_as_completed_in_session(item_id)
            # Set status and awarded points
            status_message = "success_new_item"
            awarded_item_points = points_for_this_item
        else:
            # Do NOT award points again for this item
            status_message = "success_item_already_completed"
        
        # Daily Quest Progress Update (Happens regardless of item completion status)
        # This allows interactions to still count toward quest progress even if points
        # aren't awarded for the specific item again
        quest_update = update_daily_quest_progress(item_type)
        
        # Return detailed JSON response
        return jsonify({
            'status': status_message,
            'new_score': new_score,
            'awarded_item_points': awarded_item_points,
            'message': "Points awarded!" if not is_already_completed else "Item already completed, no new points",
            'daily_quest_update': quest_update
        })
    except Exception as e:
        print(f"Error logging progress: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Helper function to update daily quest progress
def update_daily_quest_progress(item_type, is_correct=True):
    """Update daily quest progress based on action type"""
    # Initialize user data if needed
    init_user_data()
    
    # Return early if quest is already completed today
    if session.get('daily_quest_completed_today', False):
        return get_daily_quest_data()
    
    # Get current quest
    current_quest = session.get('current_daily_quest')
    if not current_quest:
        return get_daily_quest_data()
    
    quest_type = current_quest['type']
    quest_updated = False
    
    # Update progress based on quest type and action
    if quest_type == 'listen_correct_count' and item_type == 'listen_correct' and is_correct:
        # Increment count for listen correct count quests
        session['daily_quest_progress']['count'] = session['daily_quest_progress'].get('count', 0) + 1
        quest_updated = True
    
    elif quest_type == 'sing_correct_count' and item_type == 'sing_correct' and is_correct:
        # Increment count for sing correct count quests
        session['daily_quest_progress']['count'] = session['daily_quest_progress'].get('count', 0) + 1
        quest_updated = True
    
    elif quest_type == 'lesson_interaction_count' and item_type == 'lesson_interaction':
        # Increment count for lesson interaction count quests
        session['daily_quest_progress']['count'] = session['daily_quest_progress'].get('count', 0) + 1
        quest_updated = True
    
    elif quest_type == 'listen_streak':
        if item_type == 'listen_correct' and is_correct:
            # Increment streak count for listen streak quests
            session['listen_streak_count'] = session.get('listen_streak_count', 0) + 1
            quest_updated = True
        elif item_type == 'listen_correct' and not is_correct:
            # Reset streak count if wrong answer
            session['listen_streak_count'] = 0
            quest_updated = True
    
    elif quest_type == 'combined_practice':
        if item_type == 'listen_correct' and is_correct:
            # Mark listen as done for combined practice quests
            session['daily_quest_progress']['listen_done'] = True
            quest_updated = True
        elif item_type == 'sing_correct' and is_correct:
            # Mark sing as done for combined practice quests
            session['daily_quest_progress']['sing_done'] = True
            quest_updated = True
    
    # Check if quest is completed
    quest_completed = False
    if quest_updated:
        if quest_type == 'listen_correct_count' or quest_type == 'sing_correct_count' or quest_type == 'lesson_interaction_count':
            # Check count against goal
            if session['daily_quest_progress'].get('count', 0) >= current_quest['goal_value']:
                quest_completed = True
        
        elif quest_type == 'listen_streak':
            # Check streak count against goal
            if session.get('listen_streak_count', 0) >= current_quest['goal_value']:
                quest_completed = True
        
        elif quest_type == 'combined_practice':
            # Check if both listen and sing are done
            if session['daily_quest_progress'].get('listen_done', False) and session['daily_quest_progress'].get('sing_done', False):
                quest_completed = True
    
    # If quest is completed, award points and mark as completed
    if quest_completed and not session.get('daily_quest_completed_today', False):
        session['daily_quest_completed_today'] = True
        award_points_to_session(current_quest['reward_points'])
        mark_item_as_completed_in_session(f"daily_quest_done_{current_quest['quest_id']}_{session['daily_quest_assigned_date']}")
    
    session.modified = True
    return get_daily_quest_data()

# Helper function to get daily quest data
def get_daily_quest_data():
    """Get current daily quest data in format suitable for JSON response"""
    # Get current quest
    current_quest = session.get('current_daily_quest', {})
    if not current_quest:
        return {
            'quest_description': "No quest available",
            'quest_progress': 0,
            'quest_goal': 0,
            'quest_completed': False
        }
    
    # Format progress based on quest type
    quest_type = current_quest['type']
    progress = 0
    goal = current_quest.get('goal_value', 1)
    
    if quest_type == 'listen_correct_count' or quest_type == 'sing_correct_count' or quest_type == 'lesson_interaction_count':
        progress = session.get('daily_quest_progress', {}).get('count', 0)
    
    elif quest_type == 'listen_streak':
        progress = session.get('listen_streak_count', 0)
    
    elif quest_type == 'combined_practice':
        # For combined practice, show completion of both parts
        listen_done = session.get('daily_quest_progress', {}).get('listen_done', False)
        sing_done = session.get('daily_quest_progress', {}).get('sing_done', False)
        progress = (1 if listen_done else 0) + (1 if sing_done else 0)
        goal = 2  # Both listen and sing need to be done
    
    return {
        'quest_description': current_quest.get('description', ""),
        'quest_progress': progress,
        'quest_goal': goal,
        'quest_completed': session.get('daily_quest_completed_today', False)
    }

@app.route('/quiz/submit', methods=['POST'])
def submit_quiz_answer():
    try:
        data = request.get_json()
        question_id = data.get('question_id')
        answer = data.get('answer')
        print('ANSWER',answer)
        
        if not question_id or not answer:
            return jsonify({'success': False, 'error': 'Missing question_id or answer'}), 400
        
        # Initialize user data if not exists
        init_user_data()
        
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
            answer_note = answer
            is_correct = answer_note == target_note[0]
        
        # Store the answer with correctness
        session['user_data']['quiz_answers'][str(question_id)] = {
            'answer': answer,
            'timestamp': datetime.now().isoformat(),
            'is_correct': is_correct,
            'target_note': target_note  # Store the target note for reference
        }
        session.modified = True
        
        # Generate static item ID for this question answer (no timestamp)
        # This ensures points are only awarded once for correctly answering each question
        item_id = f"quiz_{mode}_{question_id}_correct" if is_correct else f"quiz_{mode}_{question_id}_incorrect"
        
        # Award points if correct (only first time)
        points_awarded = 0
        if is_correct and not has_item_been_completed_in_session(item_id):
            points_to_award = 10  # Points for correct answer
            award_points_to_session(points_to_award)
            mark_item_as_completed_in_session(item_id)
            points_awarded = points_to_award
        
        # Update daily quest progress
        item_type = f"{mode}_correct" if is_correct else f"{mode}_incorrect"
        quest_update = update_daily_quest_progress(item_type, is_correct)
        
        print(f"Stored answer for question {question_id}: {answer} (Correct: {is_correct}, Target: {target_note})")
        return jsonify({
            'success': True,
            'is_correct': is_correct,
            'correct_answer': target_note[0],  # Return just the note letter
            'points_awarded': points_awarded,
            'total_score': session.get('score', 0),
            'daily_quest_update': quest_update
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
    
    total_questions = len(answers)
    score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
    
    session['user_data']['quiz_score'] = score
    session.modified = True
    
    return render_template('quiz_results.html', 
                         quiz_score=int(score),
                         total_questions=total_questions,
                         correct_answers=correct_answers,
                         score=session.get('score', 0),
                         current_daily_quest=session.get('current_daily_quest'),
                         daily_quest_progress=session.get('daily_quest_progress'),
                         daily_quest_completed=session.get('daily_quest_completed_today', False),
                         listen_streak_count=session.get('listen_streak_count', 0))

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True) 