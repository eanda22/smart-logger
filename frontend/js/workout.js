document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let currentView = 'setup'; // 'setup', 'logging', 'summary'
    let workoutName = 'Custom Workout';
    let exerciseList = [];
    let currentExerciseIndex = 0;
    let workoutData = {}; // Object to store all sets data for the current session

    // --- DATA ---
    const templates = {
        upper_body_day: ['Barbell Bench Press', 'Pull Ups', 'Overhead Press', 'Bent Over Rows', 'Tricep Dips', 'Bicep Curls'],
        lower_body_day: ['Barbell Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curls', 'Calf Raises', 'Lunges'],
        core_workout: ['Plank', 'Russian Twists', 'Leg Raises', 'Bicycle Crunches', 'Mountain Climbers'],
        kettlebell_workout: ['Kettlebell Swings', 'Goblet Squats', 'Kettlebell Deadlifts', 'Kettlebell Rows', 'Kettlebell Presses'],
        custom: []
    };
    const allKnownExercises = Array.from(new Set(Object.values(templates).flat())).sort();
    
    // --- DOM ELEMENTS ---
    const setupView = document.getElementById('setup-view');
    const loggingView = document.getElementById('logging-view');
    const summaryView = document.getElementById('summary-view');

    // Setup View Elements
    const templateSelect = document.getElementById('workout-template');
    const addExerciseInput = document.getElementById('add-exercise-input');
    const addExerciseBtn = document.getElementById('add-exercise-btn');
    const exerciseListEl = document.getElementById('exercise-list');
    const startWorkoutBtn = document.getElementById('start-workout-btn');
    const autocompleteSuggestions = document.getElementById('autocomplete-suggestions');

    // Logging View Elements
    const loggingWorkoutTitle = document.getElementById('logging-workout-title');
    const loggingExerciseName = document.getElementById('logging-exercise-name');
    const workoutProgressIndicator = document.getElementById('workout-progress-indicator');
    const exerciseContentContainer = document.getElementById('exercise-content-container');
    const prevExerciseBtn = document.getElementById('prev-exercise-btn');
    const nextExerciseBtn = document.getElementById('next-exercise-btn');

    // Summary View Elements
    const summaryTitle = document.getElementById('summary-title');
    const summaryContainer = document.getElementById('summary-container');
    const logAnotherBtn = document.getElementById('log-another-btn');

    // --- FUNCTIONS ---
    function showView(viewName) {
        currentView = viewName;
        setupView.classList.add('hidden');
        loggingView.classList.add('hidden');
        summaryView.classList.add('hidden');

        if (viewName === 'setup') setupView.classList.remove('hidden');
        if (viewName === 'logging') loggingView.classList.remove('hidden');
        if (viewName === 'summary') summaryView.classList.remove('hidden');
    }

    // --- SETUP VIEW LOGIC ---
    function renderExerciseList() {
        exerciseListEl.innerHTML = '';
        exerciseList.forEach((exercise, index) => {
            const li = document.createElement('li');
            li.setAttribute('draggable', true);
            li.dataset.index = index;
            li.innerHTML = `
                <div class="exercise-item-content">
                    <span class="drag-handle">⠿</span>
                    <span>${exercise}</span>
                </div>
                <button class="remove-exercise-btn" data-index="${index}">&times;</button>
            `;
            exerciseListEl.appendChild(li);
        });
    }

    function handleAutocomplete() {
        const query = addExerciseInput.value.toLowerCase();
        autocompleteSuggestions.innerHTML = '';
        if (!query) return;
        const filtered = allKnownExercises.filter(ex => ex.toLowerCase().includes(query) && !exerciseList.includes(ex));
        filtered.forEach(suggestion => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = suggestion;
            div.addEventListener('click', () => {
                addExerciseInput.value = suggestion;
                autocompleteSuggestions.innerHTML = '';
                handleAddExercise();
            });
            autocompleteSuggestions.appendChild(div);
        });
    }

    function handleAddExercise() {
        const exerciseName = addExerciseInput.value.trim();
        if (exerciseName && !exerciseList.includes(exerciseName)) {
            exerciseList.push(exerciseName);
            renderExerciseList();
            addExerciseInput.value = '';
            autocompleteSuggestions.innerHTML = '';
        }
    }

    function handleTemplateChange() {
        const templateKey = templateSelect.value;
        workoutName = templateSelect.options[templateSelect.selectedIndex].text;
        exerciseList = templateKey === 'custom' ? [] : [...templates[templateKey]];
        renderExerciseList();
    }

    // --- DRAG AND DROP LOGIC ---
    let draggedItem = null;
    function handleDragStart(e) {
        draggedItem = e.target;
        setTimeout(() => e.target.classList.add('dragging'), 0);
    }
    function handleDragEnd(e) { e.target.classList.remove('dragging'); }
    function handleDragOver(e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(exerciseListEl, e.clientY);
        const dragging = document.querySelector('.dragging');
        if (afterElement == null) {
            exerciseListEl.appendChild(dragging);
        } else {
            exerciseListEl.insertBefore(dragging, afterElement);
        }
    }
    function handleDrop() {
        const newOrder = [...exerciseListEl.children].map(li => li.querySelector('.exercise-item-content span:last-child').textContent);
        exerciseList = newOrder;
        renderExerciseList();
    }
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // --- LOGGING VIEW LOGIC ---
    function renderLoggingView() {
        if (currentExerciseIndex >= exerciseList.length) return;
        const exerciseName = exerciseList[currentExerciseIndex];
        loggingWorkoutTitle.textContent = workoutName;
        loggingExerciseName.textContent = exerciseName;
        workoutProgressIndicator.textContent = `Exercise ${currentExerciseIndex + 1} of ${exerciseList.length}`;
        promptForSets(exerciseName);
        prevExerciseBtn.disabled = currentExerciseIndex === 0;
        nextExerciseBtn.textContent = (currentExerciseIndex === exerciseList.length - 1) ? 'Finish & View Summary' : 'Next Exercise →';
    }

    function promptForSets(exerciseName) {
        exerciseContentContainer.innerHTML = `
            <div class="sets-prompt">
                <h3>How many sets of ${exerciseName}?</h3>
                <div class="form-group">
                    <input type="number" id="num-sets-input" min="1" value="3" class="form-control">
                </div>
                <button id="confirm-sets-btn" class="btn btn-primary">Confirm</button>
            </div>
        `;
        document.getElementById('confirm-sets-btn').addEventListener('click', () => {
            const numSets = parseInt(document.getElementById('num-sets-input').value);
            if (numSets > 0) {
                generateSetInputs(exerciseName, numSets);
            }
        });
    }

    function generateSetInputs(exerciseName, numSets) {
        let setRowsHTML = '';
        for (let i = 1; i <= numSets; i++) {
            setRowsHTML += `
                <div class="set-inputs-container">
                    <span class="set-number">${i}</span>
                    <div class="compound-input">
                        <input type="number" placeholder="Weight" class="metric1-value" aria-label="Weight for set ${i}">
                        <div class="select-wrapper"><select class="metric1-unit"><option value="lbs">lbs</option><option value="kg">kg</option><option value="BW">BW</option></select></div>
                    </div>
                    <div class="compound-input">
                        <input type="number" placeholder="Reps" class="metric2-value" aria-label="Reps for set ${i}">
                        <div class="select-wrapper"><select class="metric2-unit"><option value="reps">reps</option><option value="seconds">seconds</option></select></div>
                    </div>
                </div>
            `;
        }
        exerciseContentContainer.innerHTML = `
            <div class="sets-entry">
                <div class="set-inputs-header"><span>Set</span><span>Metric 1 (Weight/BW)</span><span>Metric 2 (Reps/Time)</span></div>
                ${setRowsHTML}
            </div>
        `;
    }

    function saveCurrentExerciseData() {
        const exerciseName = exerciseList[currentExerciseIndex];
        const sets = [];
        const setRows = document.querySelectorAll('#exercise-content-container .set-inputs-container');
        setRows.forEach((row, setIndex) => {
            const metric1Value = parseFloat(row.querySelector('.metric1-value').value);
            const metric1Unit = row.querySelector('.metric1-unit').value;
            const metric2Value = parseFloat(row.querySelector('.metric2-value').value);
            const metric2Unit = row.querySelector('.metric2-unit').value;
            if (!isNaN(metric1Value) && !isNaN(metric2Value)) {
                sets.push({ set_number: setIndex + 1, metric1_value: metric1Value, metric1_unit: metric1Unit, metric2_value: metric2Value, metric2_unit: metric2Unit });
            }
        });
        if (sets.length > 0) { workoutData[exerciseName] = sets; }
    }

    // --- SUMMARY VIEW LOGIC ---
    function generateSummary() {
        summaryTitle.textContent = `Summary: ${workoutName}`;
        summaryContainer.innerHTML = '';
        const allSetDataForAPI = [];
        for (const exerciseName in workoutData) {
            const sets = workoutData[exerciseName];
            if (sets.length > 0) {
                let tableRows = sets.map(s => `<tr><td>${s.set_number}</td><td>${s.metric1_value} ${s.metric1_unit}</td><td>${s.metric2_value} ${s.metric2_unit}</td></tr>`).join('');
                summaryContainer.innerHTML += `
                    <div class="summary-exercise">
                        <h3>${exerciseName}</h3>
                        <table><thead><tr><th>Set</th><th>Metric 1</th><th>Metric 2</th></tr></thead><tbody>${tableRows}</tbody></table>
                    </div>`;
                sets.forEach(set => { allSetDataForAPI.push({ workout_name: workoutName, exercise_name: exerciseName, ...set }); });
            }
        }
        console.log("SENDING TO API:", allSetDataForAPI);
        // allSetDataForAPI.forEach(log => postWorkoutLog(log));
    }

    // --- EVENT LISTENERS ---
    addExerciseInput.addEventListener('input', handleAutocomplete);
    addExerciseBtn.addEventListener('click', handleAddExercise);
    templateSelect.addEventListener('change', handleTemplateChange);
    exerciseListEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-exercise-btn')) {
            const index = parseInt(e.target.dataset.index);
            exerciseList.splice(index, 1);
            renderExerciseList();
        }
    });
    exerciseListEl.addEventListener('dragstart', handleDragStart);
    exerciseListEl.addEventListener('dragend', handleDragEnd);
    exerciseListEl.addEventListener('dragover', handleDragOver);
    exerciseListEl.addEventListener('drop', handleDrop);
    
    startWorkoutBtn.addEventListener('click', () => {
        if (exerciseList.length > 0) {
            currentExerciseIndex = 0;
            workoutData = {};
            renderLoggingView();
            showView('logging');
        } else {
            alert('Please add at least one exercise to your workout.');
        }
    });
    
    nextExerciseBtn.addEventListener('click', () => {
        saveCurrentExerciseData();
        if (currentExerciseIndex < exerciseList.length - 1) {
            currentExerciseIndex++;
            renderLoggingView();
        } else {
            generateSummary();
            showView('summary');
        }
    });
    
    prevExerciseBtn.addEventListener('click', () => {
        saveCurrentExerciseData();
        if (currentExerciseIndex > 0) {
            currentExerciseIndex--;
            renderLoggingView();
        }
    });
    
    logAnotherBtn.addEventListener('click', () => {
        exerciseList = [];
        handleTemplateChange();
        showView('setup');
    });

    // --- INITIALIZATION ---
    showView('setup');
    handleTemplateChange();
});