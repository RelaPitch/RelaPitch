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

    // Listen for the first click on the page
    document.addEventListener("click", async function onFirstClick() {
        await initSampler();
        document.removeEventListener("click", onFirstClick); // remove to avoid redundant calls
    });

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
            if (startTunerBtn.textContent === 'Start Recording') {
                console.log("Starting tuner");
                try {
                    if (!tuner) {
                        tuner = new Tuner();
                        tuner.currentNote = ''; // Add property to store current note
                        tuner.currentFrequency = 0; // Add property to store current frequency
                        
                        tuner.onNoteDetected = ({ note, frequency }) => {
                            tuner.currentNote = note;
                            tuner.currentFrequency = frequency;
                            document.getElementById('pitch').textContent = `${Math.round(frequency)} Hz`;
                            
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
                    startTunerBtn.textContent = 'Stop Recording';
                    startTunerBtn.classList.remove('btn-primary');
                    startTunerBtn.classList.add('btn-danger');
                    submitRecordingBtn.disabled = false;
                    helpButton.disabled = false;
                } catch (error) {
                    console.error("Error starting tuner:", error);
                    alert("Error accessing microphone. Please ensure you have granted microphone permissions.");
                }
            } else {
                // Stop recording
                console.log("Stopping tuner");
                if (tuner) {
                    tuner.stop();
                }
                startTunerBtn.textContent = 'Start Recording';
                startTunerBtn.classList.remove('btn-danger');
                startTunerBtn.classList.add('btn-primary');
                helpButton.disabled = true;
                
                // Clear the feedback if help was enabled
                if (isHelpEnabled) {
                    const feedbackElement = document.getElementById('singingFeedback');
                    if (feedbackElement) {
                        feedbackElement.remove();
                    }
                    isHelpEnabled = false;
                    helpButton.textContent = 'Enable Hint';
                    helpButton.classList.remove('btn-danger');
                    helpButton.classList.add('btn-outline-primary');
                    if (helpInterval) {
                        clearInterval(helpInterval);
                        helpInterval = null;
                    }
                }
            }
        });
    }

    // Add help button functionality
    const helpButton = document.getElementById('helpButton');
    let isHelpEnabled = false;
    let helpInterval = null;

    if (helpButton) {
        helpButton.addEventListener('click', () => {
            isHelpEnabled = !isHelpEnabled;
            
            if (isHelpEnabled) {
                helpButton.textContent = 'Disable Hint';
                helpButton.classList.add('btn-danger');
                helpButton.classList.remove('btn-outline-primary');
                
                // Create feedback element if it doesn't exist
                let feedbackElement = document.getElementById('singingFeedback');
                if (!feedbackElement) {
                    feedbackElement = document.createElement('div');
                    feedbackElement.id = 'singingFeedback';
                    feedbackElement.className = 'mt-2 text-center';
                    document.getElementById('pitch').parentNode.appendChild(feedbackElement);
                }
                
                // Start updating feedback continuously
                helpInterval = setInterval(() => {
                    if (!tuner || !tuner.currentNote) {
                        feedbackElement.textContent = "Please start recording first";
                        feedbackElement.style.color = '#dc3545'; // Red
                        return;
                    }

                    const referenceNote = currentQuestion.reference_note[0];
                    const currentNote = extractNoteLetter(tuner.currentNote);
                    const targetNote = currentQuestion.target_note[0];
                    
                    const noteOrder = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
                    const currentIndex = noteOrder.indexOf(currentNote);
                    const targetIndex = noteOrder.indexOf(targetNote);
                    
                    if (currentIndex < targetIndex) {
                        feedbackElement.textContent = "Sing higher";
                        feedbackElement.style.color = '#dc3545'; // Red
                    } else if (currentIndex > targetIndex) {
                        feedbackElement.textContent = "Sing lower";
                        feedbackElement.style.color = '#dc3545'; // Red
                    } else {
                        feedbackElement.textContent = "Correct note!";
                        feedbackElement.style.color = '#28a745'; // Green
                    }
                }, 100); // Update every 100ms
            } else {
                helpButton.textContent = 'Enable Hint';
                helpButton.classList.remove('btn-danger');
                helpButton.classList.add('btn-outline-primary');
                
                // Clear the interval and remove feedback
                if (helpInterval) {
                    clearInterval(helpInterval);
                    helpInterval = null;
                }
                
                const feedbackElement = document.getElementById('singingFeedback');
                if (feedbackElement) {
                    feedbackElement.remove();
                }
            }
        });
    }

    // Helper function to get frequency of a note
    function getNoteFrequency(note) {
        // This is a simplified version - in a real app, you'd want a more accurate conversion
        const notes = {
            'C4': 261.63,
            'C#4': 277.18,
            'D4': 293.66,
            'D#4': 311.13,
            'E4': 329.63,
            'F4': 349.23,
            'F#4': 369.99,
            'G4': 392.00,
            'G#4': 415.30,
            'A4': 440.00,
            'A#4': 466.16,
            'B4': 493.88
        };
        return notes[note] || 440; // Default to A4 if note not found
    }

    if (submitRecordingBtn) {
        submitRecordingBtn.addEventListener('click', async () => {
            if (hasAnswered) return; // Prevent multiple submissions
            
            // Get the current note from the tuner and extract just the note letter
            const fullNote = tuner.currentNote;
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
            const noteDisplay = document.createElement('div');
            noteDisplay.id = 'noteDisplay';
            noteDisplay.className = 'mt-3';
            if (result.is_correct) {
                noteDisplay.style.color = 'green';
                noteDisplay.textContent = `Correct! You sang ${noteLetter}`;
            } else {
                noteDisplay.style.color = 'red';
                noteDisplay.textContent = `Incorrect. You sang ${noteLetter}, but the correct note was ${result.correct_answer}`;
            }
            
            // Add the feedback to the page
            const tunerDisplay = document.getElementById('tunerDisplay');
            tunerDisplay.appendChild(noteDisplay);
            
            // Stop the tuner
            if (tuner) {
                tuner.stop();
            }
            startTunerBtn.disabled = false;
            submitRecordingBtn.disabled = true;
            helpButton.disabled = true;
        });
    }
}); 