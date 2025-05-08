document.addEventListener('DOMContentLoaded', () => {
    // Dropdown functionality
    const dropdownBtn = document.querySelector('.progress-text-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const lessonDropdown = document.querySelector('.progress-dropdown');

    if (dropdownBtn && dropdownContent && lessonDropdown) {
        // Toggle dropdown on button click
        dropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent click from reaching document
            const isExpanded = dropdownContent.classList.contains('show');
            dropdownContent.classList.toggle('show');
            dropdownBtn.setAttribute('aria-expanded', !isExpanded);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!lessonDropdown.contains(e.target)) {
                dropdownContent.classList.remove('show');
                dropdownBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Close dropdown when a lesson link is clicked
        dropdownContent.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                dropdownContent.classList.remove('show');
                dropdownBtn.setAttribute('aria-expanded', 'false');
            }
            else {
                e.stopPropagation();
            }
        });
    }

    let sampler;
    const noteTimers = {}; // Track when each note was played
    let isAudioInitialized = false;

    // Initialize Tone.js and the sampler
    const initTone = async () => {
        if (isAudioInitialized) return;
        
        try {
            // Create and start the audio context immediately
            const context = new AudioContext();
            await context.resume();
            
            // Initialize Tone.js with the existing context
            Tone.setContext(context);
            await Tone.start();
            console.log("Tone.js started successfully");
            
            sampler = new Tone.Sampler({
                urls: {
                    "C4": "C4.mp3",
                    "D#4": "Ds4.mp3",
                    "F#4": "Fs4.mp3",
                    "A4": "A4.mp3",
                },
                baseUrl: "https://tonejs.github.io/audio/salamander/",
                onload: () => {
                    console.log("Sampler loaded");
                    isAudioInitialized = true;
                }
            }).toDestination();
        } catch (error) {
            console.error("Error initializing audio:", error);
        }
    };

    // Initialize immediately
    initTone();

    // Listen for the first click on the page
    document.addEventListener("click", async function onFirstClick() {
        await initTone();
        document.removeEventListener("click", onFirstClick); // remove to avoid redundant calls
    });

    // Play a note
    const playNote = async (note) => {
        if (!isAudioInitialized) {
            console.log("Audio not initialized yet");
            return;
        }
        noteTimers[note] = Date.now();
        sampler.triggerAttack(note);
        
        // Release the note after a delay
        setTimeout(() => {
            sampler.triggerRelease(note);
            delete noteTimers[note];
        }, 700);
    };

    // Play a scale
    const playScale = async () => {
        const scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
        for (let i = 0; i < scale.length; i++) {
            const note = scale[i];
            const key = document.querySelector(`[data-note="${note}"]`);
            if (key) {
                // Add active class before playing the note
                key.classList.add('active');
                // Play the note
                await playNote(note);
                // Wait for the note to finish
                await new Promise(resolve => setTimeout(resolve, 500));
                // Remove active class after the note is done
                key.classList.remove('active');
            }
        }
    };

    const playOctave = async () => {
        const octave = ['C4', 'C5'];
        for (let i = 0; i < octave.length; i++) {
            const note = octave[i];
            const key = document.querySelector(`[data-note="${note}"]`);
            if (key) {
                // Add active class before playing the note
                key.classList.add('active');
                // Play the note
                await playNote(note);
                // Wait for the note to finish
                await new Promise(resolve => setTimeout(resolve, 750));
                // Remove active class after the note is done
                key.classList.remove('active');
            }
        }
    };

    const playChromaticScale = async () => {
        const scale = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5'];
        for (let i = 0; i < scale.length; i++) {
            const note = scale[i];
            const key = document.querySelector(`[data-note="${note}"]`);
            if (key) {
                // Add active class before playing the note
                key.classList.add('active');
                // Play the note
                await playNote(note);
                // Wait for the note to finish
                await new Promise(resolve => setTimeout(resolve, 500));
                // Remove active class after the note is done
                key.classList.remove('active');
            }
        }
    };

    const playHS1 = async () => {
        const hs = ['C4', 'C#4'];
        for (let i = 0; i < hs.length; i++) {
            const note = hs[i];
            const key = document.querySelector(`[data-note="${note}"]`);
            if (key) {
                // Add active class before playing the note
                key.classList.add('active');
                // Play the note
                await playNote(note);
                // Wait for the note to finish
                await new Promise(resolve => setTimeout(resolve, 750));
                // Remove active class after the note is done
                key.classList.remove('active');
            }
        }
    }

    const playHS2 = async () => {
        const hs = ['E4', 'F4'];
        for (let i = 0; i < hs.length; i++) {
            const note = hs[i];
            const key = document.querySelector(`[data-note="${note}"]`);
            if (key) {
                // Add active class before playing the note
                key.classList.add('active');
                // Play the note
                await playNote(note);
                // Wait for the note to finish
                await new Promise(resolve => setTimeout(resolve, 750));
                // Remove active class after the note is done
                key.classList.remove('active');
            }
        }
    }

    const playHS3 = async () => {
        const hs = ['A#4', 'A4'];
        for (let i = 0; i < hs.length; i++) {
            const note = hs[i];
            const key = document.querySelector(`[data-note="${note}"]`);
            if (key) {
                // Add active class before playing the note
                key.classList.add('active');
                // Play the note
                await playNote(note);
                // Wait for the note to finish
                await new Promise(resolve => setTimeout(resolve, 750));
                // Remove active class after the note is done
                key.classList.remove('active');
            }
        }
    }

    const playWS1 = async () => {
        const ws = ['C4', 'D4'];
        for (let i = 0; i < ws.length; i++) {
            const note = ws[i];
            const key = $(`[data-note="${note}"]`);
            if (key.length) {
                key.addClass('active');
                await playNote(note);
                await new Promise(resolve => setTimeout(resolve, 750));
                key.removeClass('active');
            }
        }
    };

    const playWS2 = async () => {
        const ws = ['A4', 'G4'];
        for (let i = 0; i < ws.length; i++) {
            const note = ws[i];
            const key = $(`[data-note="${note}"]`);
            if (key.length) {
                key.addClass('active');
                await playNote(note);
                await new Promise(resolve => setTimeout(resolve, 750));
                key.removeClass('active');
            }
        }
    };

    const playWS3 = async () => {
        const ws = ['F#4', 'E4'];
        for (let i = 0; i < ws.length; i++) {
            const note = ws[i];
            const key = $(`[data-note="${note}"]`);
            if (key.length) {
                key.addClass('active');
                await playNote(note);
                await new Promise(resolve => setTimeout(resolve, 750));
                key.removeClass('active');
            }
        }
    };

    // Add click event listeners to keys
    document.querySelectorAll('.white, .black').forEach(key => {
        const note = key.dataset.note;

        const triggerReleaseWithDelay = () => {
            if (!noteTimers[note]) return;

            const now = Date.now();
            const elapsed = now - noteTimers[note];

            const delay = Math.max(600 - elapsed, 0);
            setTimeout(() => {
                sampler.triggerRelease(note);
                delete noteTimers[note];
            }, delay);
        };

        key.addEventListener('mousedown', () => {
            if (sampler) {
                noteTimers[note] = Date.now();
                sampler.triggerAttack(note);
                key.classList.add('active');
            }
        });

        key.addEventListener('mouseup', () => {
            triggerReleaseWithDelay();
            key.classList.remove('active');
        });

        key.addEventListener('mouseleave', () => {
            triggerReleaseWithDelay();
            key.classList.remove('active');
        });

        // Touch support
        key.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (sampler) {
                noteTimers[note] = Date.now();
                sampler.triggerAttack(note);
                key.classList.add('active');
            }
        });

        key.addEventListener('touchend', () => {
            triggerReleaseWithDelay();
            key.classList.remove('active');
        });
    });

    // Add event listeners to control buttons
    let playScaleOn = false;

    if (document.getElementById('playScale')) {
        document.getElementById('playScale').addEventListener('click', function() {
            const keyboardContainer = document.querySelector('.keyboard-container');
            if (keyboardContainer) {
                keyboardContainer.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            if (playScaleOn) {
                return;
            }
            playScaleOn = true;

            setTimeout(async function() {
                await playScale();
                playScaleOn = false;
            }, 1000);
        });
    }
    let playOctaveOn = false;
    if (document.getElementById('playOctave')) {
        document.getElementById('playOctave').addEventListener('click', function() {
            const keyboardContainer = document.querySelector('.keyboard-container');
            if (keyboardContainer) {
                keyboardContainer.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            if (playOctaveOn) {
                return;
            }
            playOctaveOn = true;
            setTimeout(async function() {
                await playOctave();
                playOctaveOn = false;
            }, 1000);
        });
    }
    let playCScaleOn = false;
    if (document.getElementById('playChromaticScale')) {
        document.getElementById('playChromaticScale').addEventListener('click', function() {
            const keyboardContainer = document.querySelector('.keyboard-container');
            if (keyboardContainer) {
                keyboardContainer.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            if (playCScaleOn) {
                return;
            }
            playCScaleOn = true;
            setTimeout(async function() {
                await playChromaticScale();
                playCScaleOn = false;        
            }, 1000);
        });
    }

    let playHS1On = false;
    $('#playHalfStep1').on('click', function() {
        const keyboardContainer = $('.keyboard-container');
        if (keyboardContainer.length) {
            keyboardContainer[0].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        if (playHS1On) {
            return;
        }
        playHS1On = true;
        setTimeout(async function() {
            await playHS1();
            playHS1On = false;
        }, 1000);
    });

    let playHS2On = false;
    $('#playHalfStep2').on('click', function() {
        const keyboardContainer = $('.keyboard-container');
        if (keyboardContainer.length) {
            keyboardContainer[0].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        if (playHS2On) {
            return;
        }
        playHS2On = true;
        setTimeout(async function() {
            await playHS2();
            playHS2On = false;
        }, 1000);
    });

    let playHS3On = false;
    $('#playHalfStep3').on('click', function() {
        const keyboardContainer = $('.keyboard-container');
        if (keyboardContainer.length) {
            keyboardContainer[0].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        if (playHS3On) {
            return;
        }
        playHS3On = true;
        setTimeout(async function() {
            await playHS3();
            playHS3On = false;
        }, 1000);
    });

    let playWS1On = false;
    $('#playWholeStep1').on('click', function() {
        const keyboardContainer = $('.keyboard-container');
        if (keyboardContainer.length) {
            keyboardContainer[0].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        if (playWS1On) {
            return;
        }
        playWS1On = true;
        setTimeout(async function() {
            await playWS1();
            playWS1On = false;
        }, 1000);
    });

    let playWS2On = false;
    $('#playWholeStep2').on('click', function() {
        const keyboardContainer = $('.keyboard-container');
        if (keyboardContainer.length) {
            keyboardContainer[0].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        if (playWS2On) {
            return;
        }
        playWS2On = true;
        setTimeout(async function() {
            await playWS2();
            playWS2On = false;
        }, 1000);
    });

    let playWS3On = false;
    $('#playWholeStep3').on('click', function() {
        const keyboardContainer = $('.keyboard-container');
        if (keyboardContainer.length) {
            keyboardContainer[0].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        if (playWS3On) {
            return;
        }
        playWS3On = true;
        setTimeout(async function() {
            await playWS3();
            playWS3On = false;
        }, 1000);
    });

    // Add keyboard event listeners
    document.addEventListener('keydown', (e) => {
        const keyMap = {
            'a': 'C4', 's': 'D4', 'd': 'E4', 'f': 'F4', 'g': 'G4', 'h': 'A4', 'j': 'B4',
            'w': 'C#4', 'e': 'D#4', 't': 'F#4', 'y': 'G#4', 'u': 'A#4', 'k': 'C5'
        };

        if (keyMap[e.key]) {
            const key = document.querySelector(`[data-note="${keyMap[e.key]}"]`);
            if (key) {
                playNote(keyMap[e.key]);
                key.classList.add('active');
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        const keyMap = {
            'a': 'C4', 's': 'D4', 'd': 'E4', 'f': 'F4', 'g': 'G4', 'h': 'A4', 'j': 'B4',
            'w': 'C#4', 'e': 'D#4', 't': 'F#4', 'y': 'G#4', 'u': 'A#4', 'k': 'C5'
        };

        if (keyMap[e.key]) {
            const key = document.querySelector(`[data-note="${keyMap[e.key]}"]`);
            if (key) {
                key.classList.remove('active');
            }
        }
    });

    // Set up event listeners for sing mode
    const startTunerBtn = document.getElementById('startTuner');
    let tuner = null;
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
                    startTunerBtn.textContent = 'Stop Recording';
                    startTunerBtn.classList.remove('btn-primary');
                    startTunerBtn.classList.add('btn-danger');
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

                    const currentNote = extractNoteLetter(tuner.currentNote);
                    const targetNote = 'G'
                    
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

    // Helper function to extract note letter from full note name
    function extractNoteLetter(note) {
        // Remove any octave number and return just the note letter
        return note.replace(/[0-9]/g, '');
    }
    
}); 