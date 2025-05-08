/**
 * RelaPitchScoring.js
 * Handles scoring system and daily quest UI for RelaPitch application
 */

// Main function to log user progress and update UI
function logUserProgress(itemId, points, itemType) {
    // Create request data
    const requestData = {
        itemId: itemId,
        points: points,
        itemType: itemType
    };

    // Send request to server
    fetch('/log_progress', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        // Always update the score display with the current score
        updateScoreDisplayOnPage(data.new_score);
        
        // Different feedback based on whether this was a new completion or not
        if (data.status === "success_new_item") {
            // Show points feedback for new item completions
            showTemporaryFeedbackOnPage('#points-feedback', `+${data.awarded_item_points} points!`);
        } else if (data.status === "success_item_already_completed") {
            // Show a more subtle confirmation for already completed items
            // Optional: You can enable this for subtle feedback or comment it out for no feedback
            // showTemporaryFeedbackOnPage('#points-feedback', 'Already completed', 1000);
        }
        
        // Update daily quest display regardless of item completion status
        updateDailyQuestDisplay(data.daily_quest_update);
    })
    .catch(error => {
        console.error('Error logging progress:', error);
    });
}

// Update score display on the page
function updateScoreDisplayOnPage(newScore) {
    // Update all elements with the score-display class
    const scoreDisplayElements = document.querySelectorAll('.total-score-display');
    scoreDisplayElements.forEach(element => {
        element.textContent = `Total Score: ${newScore}`;
    });
}

// Show temporary feedback message
function showTemporaryFeedbackOnPage(elementSelector, message) {
    const feedbackElement = document.querySelector(elementSelector);
    if (feedbackElement) {
        // Set message and show element
        feedbackElement.textContent = message;
        feedbackElement.classList.add('active');
        
        // Hide after 3 seconds
        setTimeout(() => {
            feedbackElement.classList.remove('active');
        }, 3000);
    }
}

// Update daily quest display
function updateDailyQuestDisplay(questData) {
    const questWidget = document.querySelector('#daily-quest-widget');
    if (!questWidget) return;
    
    // Get quest elements
    const questTitle = questWidget.querySelector('.quest-title');
    const questProgress = questWidget.querySelector('.quest-progress');
    const questStatus = questWidget.querySelector('.quest-status');
    
    // Update quest title
    if (questTitle) {
        questTitle.textContent = questData.quest_description;
    }
    
    // Update quest progress
    if (questProgress) {
        questProgress.textContent = `Progress: ${questData.quest_progress} / ${questData.quest_goal}`;
        
        // Calculate progress percentage for progress bar if it exists
        const progressBar = questWidget.querySelector('.progress-bar');
        if (progressBar) {
            const progressPercent = (questData.quest_progress / questData.quest_goal) * 100;
            progressBar.style.width = `${Math.min(progressPercent, 100)}%`;
        }
    }
    
    // Update quest status
    if (questStatus) {
        if (questData.quest_completed) {
            questStatus.textContent = `Completed! +${questData.quest_reward_points || ''} points!`;
            questStatus.classList.add('completed');
        } else {
            questStatus.textContent = 'In Progress';
            questStatus.classList.remove('completed');
        }
    }
}

// Handle quiz answer submissions and update score/quest UI
function handleQuizSubmit(questionId, answer, mode) {
    // Create request data
    const requestData = {
        question_id: questionId,
        answer: answer
    };

    // Send request to server
    fetch('/quiz/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response, show correct/incorrect feedback
        if (data.is_correct) {
            showTemporaryFeedbackOnPage('#answer-feedback', 'Correct!');
            
            // If points were awarded, show points feedback
            if (data.points_awarded > 0) {
                showTemporaryFeedbackOnPage('#points-feedback', `+${data.points_awarded} points!`);
                
                // Update score display
                updateScoreDisplayOnPage(data.total_score);
            }
        } else {
            showTemporaryFeedbackOnPage('#answer-feedback', `Incorrect. The correct answer was ${data.correct_answer}.`);
        }
        
        // Update daily quest display
        updateDailyQuestDisplay(data.daily_quest_update);
        
        // Additional logic for continuing to next question or showing results
        // would go here depending on your application flow
    })
    .catch(error => {
        console.error('Error submitting answer:', error);
    });
}

// Document ready function to initialize scoring UI
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for lesson interactions
    const lessonButtons = document.querySelectorAll('.btn[id^="play"]');
    lessonButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the current lesson ID from URL or data attribute if available
            let lessonId = 'generic';
            const lessonIdElement = document.querySelector('[data-lesson-id]');
            if (lessonIdElement) {
                lessonId = lessonIdElement.dataset.lessonId;
            } else {
                // Try to extract from URL if we're on a lesson page
                const urlMatch = window.location.pathname.match(/\/lesson\/(\d+)/);
                if (urlMatch && urlMatch[1]) {
                    lessonId = urlMatch[1];
                }
            }
            
            // Generate a static, unique ID for this interaction
            const interactionId = `lesson_${lessonId}_${this.id}`;
            
            // Log the interaction with points and type
            logUserProgress(interactionId, 5, 'lesson_interaction');
        });
    });
    
    // Initialize daily quest display if quest data is available
    const questDataElement = document.querySelector('#quest-data');
    if (questDataElement) {
        try {
            const questData = JSON.parse(questDataElement.dataset.questInfo);
            updateDailyQuestDisplay(questData);
        } catch (e) {
            console.error('Error initializing quest display:', e);
        }
    }
});
