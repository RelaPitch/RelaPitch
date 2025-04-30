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
        }, 1000);
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
                await new Promise(resolve => setTimeout(resolve, 500));
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
    if (document.getElementById('playScale')) {
        document.getElementById('playScale').addEventListener('click', function() {
            playScale(); // Your playScale function call
            const keyboardContainer = document.querySelector('.keyboard-container');
            if (keyboardContainer) {
                keyboardContainer.scrollIntoView({
                    behavior: 'smooth', // For smooth scrolling
                    block: 'start'      // Scrolls to the top of the element
                });
            }
        });
    }
    if (document.getElementById('playOctave')) {
        document.getElementById('playOctave').addEventListener('click', function() {
            playOctave(); // Your playOctave function call
            const keyboardContainer = document.querySelector('.keyboard-container');
            if (keyboardContainer) {
                keyboardContainer.scrollIntoView({
                    behavior: 'smooth', // For smooth scrolling
                    block: 'start'      // Scrolls to the top of the element
                });
            }
        });
    }
    if (document.getElementById('playChromaticScale')) {
        document.getElementById('playChromaticScale').addEventListener('click', function() {
            playChromaticScale(); // Your playChromaticScale function call
            const keyboardContainer = document.querySelector('.keyboard-container');
            if (keyboardContainer) {
                keyboardContainer.scrollIntoView({
                    behavior: 'smooth', // For smooth scrolling
                    block: 'start'      // Scrolls to the top of the element
                });
            }
        });
    }

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
}); 