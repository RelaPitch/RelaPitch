document.addEventListener('DOMContentLoaded', function() {
    // Define the musical notes
    const allNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    
    // Fisher-Yates shuffle algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Get DOM elements
    const availableNotesContainer = document.getElementById('availableNotes');
    const selectedNotesContainer = document.getElementById('selectedNotes');
    const checkAnswerButton = document.getElementById('checkAnswer');
    const resetButton = document.getElementById('resetExercise');
    const feedbackElement = document.getElementById('feedback');

    function getRandomNotes(allNotes) {
        const referenceIndex = Math.floor(Math.random() * allNotes.length);
        let guessIndex;
        do {
            guessIndex = Math.floor(Math.random() * allNotes.length);
        } while (guessIndex === referenceIndex);  // Ensure they are different
    
        return {
            referenceNote: allNotes[referenceIndex],
            guessNote: allNotes[guessIndex]
        };
    }
    const { referenceNote, guessNote } = getRandomNotes(allNotes);

    document.getElementById('referenceNote').textContent = referenceNote;
    document.getElementById('guessNote').textContent = guessNote;
    
    // Only initialize if all required elements exist
    if (availableNotesContainer && selectedNotesContainer && checkAnswerButton && resetButton && feedbackElement) {
        // Initialize the exercise
        function initializeExercise() {
            // Clear containers
            availableNotesContainer.innerHTML = '';
            selectedNotesContainer.innerHTML = '';
            feedbackElement.textContent = '';
            feedbackElement.className = 'feedback';
            
            // Create note elements with shuffled order
            const shuffledNotes = shuffleArray([...allNotes]);
            shuffledNotes.forEach(note => {
                const noteElement = document.createElement('div');
                noteElement.className = 'note-item';
                noteElement.textContent = note;
                noteElement.draggable = true;
                
                // Add drag event listeners
                noteElement.addEventListener('dragstart', handleDragStart);
                noteElement.addEventListener('dragend', handleDragEnd);
                
                availableNotesContainer.appendChild(noteElement);
            });
            
            // Add drop event listeners to containers
            availableNotesContainer.addEventListener('dragover', handleDragOver);
            availableNotesContainer.addEventListener('drop', handleDrop);
            selectedNotesContainer.addEventListener('dragover', handleDragOver);
            selectedNotesContainer.addEventListener('drop', handleDrop);
        }
        
        // Drag and drop event handlers
        function handleDragStart(e) {
            e.target.classList.add('dragging');
            e.dataTransfer.setData('text/plain', e.target.textContent);
        }
        
        function handleDragEnd(e) {
            e.target.classList.remove('dragging');
        }
        
        function handleDragOver(e) {
            e.preventDefault();
        }

        function handleDrop(e) {
            e.preventDefault();
            const note = e.dataTransfer.getData('text/plain');
            const draggedElement = document.querySelector('.dragging');
        
            if (draggedElement) {
                // Only append to the container itself, not a note inside
                if (e.currentTarget === availableNotesContainer || e.currentTarget === selectedNotesContainer) {
                    e.currentTarget.appendChild(draggedElement);
                }
            }
        }

        // Check answer
        function checkAnswer() {
            const referenceNote = document.getElementById('referenceNote').textContent;
            const selectedNotes = Array.from(selectedNotesContainer.children).map(el => el.textContent);
            // Determine the correct notes based on whether the guess note is higher or lower
            const referenceIndex = allNotes.indexOf(referenceNote);
            let correctNotes = [];
    
            let type_exercise = document.getElementById('guessText').textContent;

            if (type_exercise.includes("lower")) {
                let idx = (referenceIndex - 1);
                while (true) {
                    if (idx === referenceIndex) break;
                    correctNotes.push(allNotes[idx]);
                    if (idx === 0) {
                        idx = allNotes.length - 1;
                    }
                    else {
                        idx = idx - 1;
                    }
                }
            } else {
                let idx = (referenceIndex + 1);
                while (true) {
                    if (idx === allNotes.length) {
                        idx = 0;
                    }
                    if (idx === referenceIndex) break;

                    correctNotes.push(allNotes[idx]);
                    
                    idx = idx + 1;
                }
            }
            
            // Check if the selected notes match the correct notes
            const isCorrect = selectedNotes.length === correctNotes.length &&
                             selectedNotes.every((value, index) => value === correctNotes[index])
            
            // Show feedback
            feedbackElement.textContent = isCorrect ? 
                'Correct! These are the notes you should focus on.' : 
                'Not quite right. Try again!';
            feedbackElement.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        }
        
        // Event listeners
        checkAnswerButton.addEventListener('click', checkAnswer);
        resetButton.addEventListener('click', initializeExercise);
        
        // Initialize the exercise
        initializeExercise();
    }
}); 