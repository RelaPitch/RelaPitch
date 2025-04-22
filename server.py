from flask import Flask, render_template, jsonify
import os

app = Flask(__name__)

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

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/lesson/<int:lesson_id>')
def lesson(lesson_id):
    if lesson_id in LESSONS:
        return render_template('lesson.html', lesson=LESSONS[lesson_id], lesson_id=lesson_id)
    return "Lesson not found", 404

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True) 