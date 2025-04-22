document.addEventListener('DOMContentLoaded', () => {
    const startQuizBtn = document.getElementById('startQuiz');
    const startPage = document.getElementById('startPage');
    const quizControls = document.querySelector('.quiz-controls');
    const listenModeBtn = document.getElementById('listenMode');
    const singModeBtn = document.getElementById('singMode');
    const listenSection = document.getElementById('listenSection');
    const singSection = document.getElementById('singSection');
    const playReferenceBtn = document.getElementById('playReference');
    const playGuessBtn = document.getElementById('playGuess');
    const playReferenceSingBtn = document.getElementById('playReferenceSing');
    const startTunerBtn = document.getElementById('startTuner');
    const submitRecordingBtn = document.getElementById('submitRecording');
    const skipListenBtn = document.getElementById('skipListen');
    const skipSingBtn = document.getElementById('skipSing');
    const scoreDisplay = document.getElementById('score');
    const noteButtons = document.querySelectorAll('.note-btn');
    const noteSelectButtons = document.querySelectorAll('.note-select-btn');
    const referenceNoteDisplay = document.getElementById('referenceNoteDisplay');
    const referenceNoteDisplaySing = document.getElementById('referenceNoteDisplaySing');
    const targetNoteDisplay = document.getElementById('targetNoteDisplay');
    const feedbackDisplay = document.getElementById('feedbackDisplay');
    
    let currentReferenceNote = 'C4';
    let currentGuessNote = null;
    let currentTargetNote = null;
    let score = 0;
    let tuner = null;
    let recordedNote = null;
    let sampler;
    let isSamplerReady = false;
    let noteTimers = {}; // Track when each note was played
    let currentTimeout = null; // Track the current timeout

    // Create and preload the sampler
    sampler = new Tone.Sampler({
        urls: {
            "C4": "C4.mp3",
            "D#4": "Ds4.mp3",
            "F#4": "Fs4.mp3",
            "A4": "A4.mp3"
        },
        baseUrl: "https://tonejs.github.io/audio/salamander/",
        onload: () => {
            console.log("Sampler loaded successfully");
            isSamplerReady = true;
            // Enable all play buttons
            [playReferenceBtn, playGuessBtn, playReferenceSingBtn].forEach(btn => {
                if (btn) btn.disabled = false;
            });
        },
        onerror: (error) => {
            console.error("Error loading sampler:", error);
        }
    }).toDestination();

    // Initialize Tone.js and connect the sampler
    const initTone = async () => {
        try {
            console.log("Starting Tone.js initialization...");
            await Tone.start();
            console.log("Tone.js started successfully");
            
            // Connect to master output
            // Tone.Destination.volume.value = -6;
            console.log("Sampler connected to destination");
        } catch (error) {
            console.error("Error in initTone:", error);
        }
    };

    // Initialize audio on first interaction
    const initializeOnInteraction = () => {
        initTone();
        // Remove the event listeners after first interaction
        document.removeEventListener('click', initializeOnInteraction);
        document.removeEventListener('keydown', initializeOnInteraction);
        document.removeEventListener('touchstart', initializeOnInteraction);
    };

    // Add event listeners for initialization
    document.addEventListener('click', initializeOnInteraction, { once: true });
    document.addEventListener('keydown', initializeOnInteraction, { once: true });
    document.addEventListener('touchstart', initializeOnInteraction, { once: true });

    // Stop any currently playing note
    const stopCurrentNote = () => {
        if (currentTimeout) {
            clearTimeout(currentTimeout);
            currentTimeout = null;
        }
        // Release all notes
        Object.keys(noteTimers).forEach(note => {
            sampler.triggerRelease(note);
            delete noteTimers[note];
        });
    };

    // Play a note using the sampler
    const playNote = async (note) => {
        if (!isSamplerReady) {
            console.log("Sampler not ready yet, waiting...");
            return;
        }
        try {
            console.log("Attempting to play note:", note);
            // Stop any currently playing note
            stopCurrentNote();
            
            noteTimers[note] = Date.now();
            sampler.triggerAttack(note);
            
            // Release the note after 4 seconds
            currentTimeout = setTimeout(() => {
                sampler.triggerRelease(note);
                delete noteTimers[note];
            }, 4000);
            
            console.log("Note played successfully:", note);
        } catch (error) {
            console.error("Error playing note:", error);
        }
    };

    // Disable all play buttons until sampler is ready
    [playReferenceBtn, playGuessBtn, playReferenceSingBtn].forEach(btn => {
        if (btn) btn.disabled = true;
    });

    // Mode switching
    listenModeBtn.addEventListener('click', () => {
        listenModeBtn.classList.add('active');
        singModeBtn.classList.remove('active');
        listenSection.classList.add('active');
        singSection.classList.remove('active');
        if (tuner) tuner.stop();
    });

    singModeBtn.addEventListener('click', () => {
        singModeBtn.classList.add('active');
        listenModeBtn.classList.remove('active');
        singSection.classList.add('active');
        listenSection.classList.remove('active');
    });

    // Reference note selection
    noteSelectButtons.forEach(button => {
        button.addEventListener('click', () => {
            noteSelectButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const selectedNote = button.dataset.note;
            currentReferenceNote = selectedNote;
            referenceNoteDisplay.textContent = `Reference Note: ${selectedNote[0]}`;
            referenceNoteDisplaySing.textContent = `Reference Note: ${selectedNote[0]}`;
            feedbackDisplay.innerHTML = '';
        });
    });

    // Listen Mode
    const playRandomNotes = () => {
        const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
        currentGuessNote = notes[Math.floor(Math.random() * notes.length)];
        feedbackDisplay.innerHTML = '';
        // Automatically play the new guess note
        playNote(currentGuessNote);
    };

    // Skip question in listen mode
    skipListenBtn.addEventListener('click', () => {
        stopCurrentNote();
        playRandomNotes();
    });

    playReferenceBtn.addEventListener('click', async () => {
        await playNote(currentReferenceNote);
    });

    playGuessBtn.addEventListener('click', async () => {
        await playNote(currentGuessNote);
    });

    noteButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!currentGuessNote) return;

            const userNote = button.dataset.note;
            const actualNote = currentGuessNote[0];

            if (userNote === actualNote) {
                score++;
                scoreDisplay.textContent = score;
                showFeedback(true, `Correct! The note was ${actualNote}`);
            } else {
                showFeedback(false, `Incorrect. The note was ${actualNote}, but you guessed ${userNote}`);
            }
            playRandomNotes();
        });
    });

    // Sing Mode
    const setRandomTargetNote = () => {
        const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        currentTargetNote = notes[Math.floor(Math.random() * notes.length)];
        targetNoteDisplay.textContent = currentTargetNote;
        feedbackDisplay.innerHTML = '';
    };

    // Skip question in sing mode
    skipSingBtn.addEventListener('click', () => {
        stopCurrentNote();
        setRandomTargetNote();
    });

    playReferenceSingBtn.addEventListener('click', async () => {
        await playNote(currentReferenceNote);
    });

    startTunerBtn.addEventListener('click', async () => {
        if (!tuner) {
            tuner = new Tuner();
            tuner.onNoteDetected = ({ note, frequency }) => {
                document.getElementById('pitch').textContent = `${Math.round(frequency)} Hz`;
                document.getElementById('note').textContent = note;
                recordedNote = note[0];
                
                const canvas = document.getElementById('tunerCanvas');
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = '#3498db';
                const barHeight = 20;
                const barWidth = (frequency / 1000) * canvas.width;
                ctx.fillRect(0, canvas.height/2 - barHeight/2, barWidth, barHeight);
            };
        }

        if (tuner.isRunning) {
            tuner.stop();
            startTunerBtn.textContent = 'Start Recording';
            submitRecordingBtn.disabled = false;
        } else {
            try {
                await tuner.start();
                startTunerBtn.textContent = 'Stop Recording';
                submitRecordingBtn.disabled = true;
            } catch (error) {
                alert('Error accessing microphone. Please ensure you have granted microphone permissions.');
            }
        }
    });

    submitRecordingBtn.addEventListener('click', () => {
        if (!recordedNote || !currentTargetNote) return;

        if (recordedNote === currentTargetNote) {
            score++;
            scoreDisplay.textContent = score;
            showFeedback(true, `Correct! You sang the note ${recordedNote} perfectly`);
        } else {
            showFeedback(false, `Incorrect. You sang ${recordedNote}, but the target was ${currentTargetNote}`);
        }
        setRandomTargetNote();
        submitRecordingBtn.disabled = true;
    });

    // Show feedback popup
    const showFeedback = (isCorrect, message) => {
        const feedback = document.createElement('div');
        feedback.className = `feedback-popup ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.innerHTML = `
            <div class="feedback-content">
                <h3>${isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 3000);
    };

    // Start quiz button handler
    startQuizBtn.addEventListener('click', () => {
        startPage.style.display = 'none';
        quizControls.style.display = 'block';
        
        // Default to listen mode
        listenModeBtn.classList.add('active');
        singModeBtn.classList.remove('active');
        listenSection.classList.add('active');
        singSection.classList.remove('active');
        
        // Initialize the first question
        playRandomNotes();
        setRandomTargetNote();
    });

    // Initialize the quiz
    document.querySelector('.note-select-btn[data-note="C4"]').classList.add('active');
    referenceNoteDisplay.textContent = `Reference Note: C`;
    referenceNoteDisplaySing.textContent = `Reference Note: C`;
    playRandomNotes();
    setRandomTargetNote();
}); 