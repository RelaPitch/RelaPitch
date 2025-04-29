document.addEventListener('DOMContentLoaded', async () => {
    let sampler;
    let isSamplerReady = false;
    let tuner = null;
    let currentQuestion = {
        id: null,
        type: '',
        referenceNote: '',
        targetNote: '',
        options: []
    };
    let hasAnswered = false;

    // Initialize Tone.js sampler
    async function initSampler() {
        try {
            await Tone.start();
            sampler = new Tone.Sampler({
                urls: {
                    "C4": "C4.mp3",
                    "D#4": "Ds4.mp3",
                    "F#4": "Fs4.mp3",
                    "A4": "A4.mp3",
                },
                baseUrl: "https://tonejs.github.io/audio/salamander/",
                onload: () => {
                    console.log("Sampler loaded successfully");
                    isSamplerReady = true;
                    // Enable all play buttons
                    document.querySelectorAll('.btn-primary').forEach(btn => {
                        if (btn.id.includes('play')) {
                            btn.disabled = false;
                        }
                    });
                }
            }).toDestination();
            console.log("Sampler initialized successfully");
        } catch (error) {
            console.error("Error initializing sampler:", error);
        }
    }

    // Play a note
    function playNote(note) {
        if (!isSamplerReady) {
            console.log("Sampler not ready yet, waiting...");
            return;
        }
        try {
            console.log("Playing note:", note);
            sampler.triggerAttackRelease(note, "1s");
        } catch (error) {
            console.error("Error playing note:", error);
        }
    }

    // Show feedback
    function showFeedback(isCorrect, message) {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = `alert ${isCorrect ? 'alert-success' : 'alert-danger'} mt-3`;
        feedbackDiv.textContent = message;
        
        const container = document.querySelector('.card-body');
        container.appendChild(feedbackDiv);
        
        // Remove feedback after 3 seconds
        setTimeout(() => {
            feedbackDiv.remove();
        }, 3000);
    }

    // Enable navigation buttons
    function enableNavigation() {
        const nextButton = document.getElementById('nextButton');
        const finishButton = document.getElementById('finishButton');
        
        if (nextButton) {
            nextButton.disabled = false;
        }
        if (finishButton) {
            finishButton.disabled = false;
        }
    }

    // Handle navigation
    function setupNavigation() {
        const nextButton = document.getElementById('nextButton');
        const finishButton = document.getElementById('finishButton');

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (!hasAnswered) return; // Prevent navigation if not answered
                window.location.href = nextButton.dataset.nextUrl;
            });
        }

        if (finishButton) {
            finishButton.addEventListener('click', () => {
                if (!hasAnswered) return; // Prevent navigation if not answered
                window.location.href = finishButton.dataset.finishUrl;
            });
        }
    }

    // Submit answer to server
    async function submitAnswer(answer) {
        try {
            console.log("Submitting answer:", answer, "for question:", currentQuestion.id);
            const response = await fetch('/quiz/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question_id: currentQuestion.id,
                    answer: answer
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit answer');
            }
            
            const result = await response.json();
            console.log("Answer submitted successfully:", result);
            
            // Show feedback
            if (result.is_correct) {
                showFeedback(true, "Correct! Well done!");
            } else {
                showFeedback(false, `Incorrect. The correct answer was ${result.correct_answer}`);
            }
            
            // Enable navigation buttons
            hasAnswered = true;
            enableNavigation();
            
            return result;
        } catch (error) {
            console.error('Error submitting answer:', error);
            return null;
        }
    }

    // Helper function to extract note letter from full note name
    function extractNoteLetter(note) {
        // Remove any octave number and return just the note letter
        return note.replace(/[0-9]/g, '');
    }

    // Helper function to validate note
    function isValidNote(note) {
        const validNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C#', 'D#', 'F#', 'G#', 'A#'];
        return validNotes.includes(note);
    }

    // Initialize the quiz
    await initSampler();
    
    // Get question data from the page
    const questionDataElement = document.getElementById('questionData');
    if (questionDataElement) {
        currentQuestion = JSON.parse(questionDataElement.textContent);
        console.log("Loaded question data:", currentQuestion);
    }
    
    // Set up navigation
    setupNavigation();
    
    // Set up event listeners for listen mode
    const playReferenceBtn = document.getElementById('playReference');
    const playTargetBtn = document.getElementById('playTarget');
    const noteButtons = document.querySelectorAll('.note-btn');
    
    if (playReferenceBtn) {
        playReferenceBtn.addEventListener('click', () => {
            console.log("Playing reference note:", currentQuestion.reference_note);
            playNote(currentQuestion.reference_note);
        });
    }
    
    if (playTargetBtn) {
        playTargetBtn.addEventListener('click', () => {
            console.log("Playing target note:", currentQuestion.target_note);
            playNote(currentQuestion.target_note);
        });
    }
    
    noteButtons.forEach(button => {
        button.addEventListener('click', async () => {
            if (hasAnswered) return; // Prevent multiple submissions
            
            const selectedNote = button.dataset.note;
            console.log("Selected note:", selectedNote);
            
            // Submit answer first
            const result = await submitAnswer(selectedNote);
            
            // Visual feedback based on correctness
            if (result.is_correct) {
                button.classList.add('btn-success');
                button.classList.remove('btn-outline-primary');
            } else {
                button.classList.add('btn-danger');
                button.classList.remove('btn-outline-primary');
                
                // Find and highlight the correct button
                noteButtons.forEach(btn => {
                    if (btn.dataset.note === result.correct_answer) {
                        btn.classList.add('btn-success');
                        btn.classList.remove('btn-outline-primary');
                    }
                });
            }
            
            // Disable all buttons
            noteButtons.forEach(btn => btn.disabled = true);
        });
    });
    
    // Set up event listeners for sing mode
    const startTunerBtn = document.getElementById('startTuner');
    const submitRecordingBtn = document.getElementById('submitRecording');
    const playReferenceSingBtn = document.getElementById('playReferenceSing');
    
    if (playReferenceSingBtn) {
        playReferenceSingBtn.addEventListener('click', () => {
            console.log("Playing reference note for singing:", currentQuestion.reference_note);
            playNote(currentQuestion.reference_note);
        });
    }
    
    if (startTunerBtn) {
        startTunerBtn.addEventListener('click', async () => {
            console.log("Starting tuner");
            try {
                if (!tuner) {
                    tuner = new Tuner();
                    tuner.onNoteDetected = ({ note, frequency }) => {
                        document.getElementById('note').textContent = note;
                        
                        const canvas = document.getElementById('tunerCanvas');
                        const ctx = canvas.getContext('2d');
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        
                        ctx.fillStyle = '#3498db';
                        const barHeight = 20;
                        const barWidth = (frequency / 1000) * canvas.width;
                        ctx.fillRect(0, canvas.height/2 - barHeight/2, barWidth, barHeight);
                    };
                }
                
                await tuner.start();
                startTunerBtn.disabled = true;
                submitRecordingBtn.disabled = false;
            } catch (error) {
                console.error("Error starting tuner:", error);
                alert("Error accessing microphone. Please ensure you have granted microphone permissions.");
            }
        });
    }
    
    if (submitRecordingBtn) {
        submitRecordingBtn.addEventListener('click', async () => {
            if (hasAnswered) return; // Prevent multiple submissions
            
            // Get the current note from the tuner and extract just the note letter
            const fullNote = document.getElementById('note').textContent;
            const noteLetter = extractNoteLetter(fullNote);
            
            // Validate the note
            if (!isValidNote(noteLetter)) {
                showFeedback(false, "Please sing a valid musical note");
                return;
            }
            
            console.log("Submitting recorded note:", noteLetter);
            
            // Submit answer
            const result = await submitAnswer(noteLetter);
            
            // Visual feedback for sing mode
            const noteDisplay = document.getElementById('note');
            if (result.is_correct) {
                noteDisplay.style.color = 'green';
                noteDisplay.textContent = `${noteLetter}`;
            } else {
                noteDisplay.style.color = 'red';
                noteDisplay.textContent = `${noteLetter}`;
                // Show the correct note
                const correctNoteDiv = document.createElement('div');
                correctNoteDiv.className = 'alert alert-info mt-2';
                correctNoteDiv.textContent = `Correct note: ${result.correct_answer}`;
                noteDisplay.parentNode.appendChild(correctNoteDiv);
            }
            
            // Stop the tuner
            if (tuner) {
                tuner.stop();
            }
            startTunerBtn.disabled = false;
            submitRecordingBtn.disabled = true;
        });
    }
}); 