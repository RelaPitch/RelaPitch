/**
 * RelaPitch Scoring System
 * Handles all scoring-related functionality including points, local storage, and display updates
 */

// Constants
const STORAGE_KEY = 'relapitch_total_score';
const DEFAULT_SCORE = 0;
const FEEDBACK_DURATION = 2000; // 2 seconds

// Initialize score from localStorage or default to 0
let totalScore = parseInt(localStorage.getItem(STORAGE_KEY)) || DEFAULT_SCORE;

/**
 * Awards points to the user's total score
 * @param {number} points - The number of points to award
 * @returns {number} The new total score
 */
function awardPoints(points) {
    if (typeof points !== 'number' || points < 0) {
        console.error('Invalid points value:', points);
        return totalScore;
    }
    
    totalScore += points;
    saveScore();
    updateScoreDisplay();
    return totalScore;
}

/**
 * Retrieves the current total score
 * @returns {number} The current total score
 */
function getTotalScore() {
    return totalScore;
}

/**
 * Saves the current score to localStorage
 */
function saveScore() {
    localStorage.setItem(STORAGE_KEY, totalScore.toString());
}

/**
 * Updates the score display in the UI
 */
function updateScoreDisplay() {
    const scoreElements = document.querySelectorAll('.total-score-display');
    scoreElements.forEach(element => {
        element.textContent = `Total Score: ${totalScore}`;
    });
}

/**
 * Shows temporary feedback message in a specified element
 * @param {string} elementSelector - CSS selector for the feedback element
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds (optional)
 */
function showTemporaryFeedback(elementSelector, message, duration = FEEDBACK_DURATION) {
    const element = document.querySelector(elementSelector);
    if (!element) {
        console.error('Feedback element not found:', elementSelector);
        return;
    }

    // Save original content
    const originalContent = element.textContent;
    
    // Show feedback
    element.textContent = message;
    element.classList.add('score-feedback-active');
    
    // Restore original content after duration
    setTimeout(() => {
        element.textContent = originalContent;
        element.classList.remove('score-feedback-active');
    }, duration);
}

/**
 * Resets the score to 0
 */
function resetScore() {
    totalScore = DEFAULT_SCORE;
    saveScore();
    updateScoreDisplay();
}

// Initialize score display when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateScoreDisplay();
});

// Example usage with quiz questions
function setupQuizScoring() {
    const quizQuestions = document.querySelectorAll('.quiz-question');
    
    quizQuestions.forEach(question => {
        const buttons = question.querySelectorAll('button[data-answer]');
        const feedbackSpan = question.querySelector('.score-feedback');
        
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const isCorrect = button.dataset.answer === 'correct';
                
                if (isCorrect) {
                    const points = 15;
                    awardPoints(points);
                    showTemporaryFeedback(
                        feedbackSpan,
                        `+${points} points!`,
                        FEEDBACK_DURATION
                    );
                } else {
                    showTemporaryFeedback(
                        feedbackSpan,
                        'Try again!',
                        FEEDBACK_DURATION
                    );
                }
            });
        });
    });
}

// Export functions for use in other modules
window.RelaPitchScoring = {
    awardPoints,
    getTotalScore,
    updateScoreDisplay,
    showTemporaryFeedback,
    resetScore,
    setupQuizScoring
}; 