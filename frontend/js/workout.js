document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let workoutName = 'Custom Workout';
    let exerciseList = [];

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
    const templateSelect = document.getElementById('workout-template');
    const addExerciseInput = document.getElementById('add-exercise-input');
    const addExerciseBtn = document.getElementById('add-exercise-btn');
    const exerciseListEl = document.getElementById('exercise-list');
    const startWorkoutBtn = document.getElementById('start-workout-btn');
    const autocompleteSuggestions = document.getElementById('autocomplete-suggestions');
    const loggingWorkoutTitle = document.getElementById('logging-workout-title');
    const logAllExercisesContainer = document.getElementById('log-all-exercises-container');
    const finishWorkoutBtn = document.getElementById('finish-workout-btn');

    // --- FUNCTIONS ---
    function showView(viewName) {
        setupView.classList.add('hidden');
        loggingView.classList.add('hidden');
        if (viewName === 'setup') setupView.classList.remove('hidden');
        if (viewName === 'logging') loggingView.classList.remove('hidden');
    }

    // --- SETUP VIEW LOGIC ---
    function renderSetupExerciseList() {
        exerciseListEl.innerHTML = '';
        exerciseList.forEach((exercise, index) => {
            const li = document.createElement('li');
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
            renderSetupExerciseList();
            addExerciseInput.value = '';
            autocompleteSuggestions.innerHTML = '';
        }
    }

    function handleTemplateChange() {
        const templateKey = templateSelect.value;
        workoutName = templateSelect.options[templateSelect.selectedIndex].text;
        exerciseList = templateKey === 'custom' ? [] : [...templates[templateKey]];
        renderSetupExerciseList();
    }

    // --- NEW LOGGING VIEW LOGIC ---
    function renderLoggingView() {
        logAllExercisesContainer.innerHTML = '';
        loggingWorkoutTitle.textContent = workoutName;

        exerciseList.forEach((exerciseName, index) => {
            const exerciseCard = document.createElement('div');
            exerciseCard.className = 'exercise-log-card';
            exerciseCard.dataset.exerciseIndex = index;
            
            let setBarsHTML = '';
            for (let i = 1; i <= 3; i++) { // Default to 3 sets
                setBarsHTML += createSetBarHTML(i);
            }

            exerciseCard.innerHTML = `
                <div class="exercise-log-header">
                    <h3>${exerciseName}</h3>
                    <div class="set-controls">
                        <button class="remove-set-btn" data-exercise-index="${index}">-</button>
                        <button class="add-set-btn" data-exercise-index="${index}">+</button>
                    </div>
                </div>
                <div class="set-log-container">${setBarsHTML}</div>
            `;
            logAllExercisesContainer.appendChild(exerciseCard);
        });
    }
    
    function createSetBarHTML(setNumber) {
        return `
            <div class="set-input-bar">
                <span class="set-number">${setNumber}</span>
                <input type="number" placeholder="Weight" class="metric1-value">
                <div class="unit-selector" data-metric="1">
                    <button class="unit-btn active" data-value="lbs">lbs</button>
                    <button class="unit-btn" data-value="kg">kg</button>
                    <button class="unit-btn" data-value="in">in</button>
                </div>
                <input type="number" placeholder="Reps" class="metric2-value">
                <div class="unit-selector" data-metric="2">
                    <button class="unit-btn active" data-value="reps">reps</button>
                    <button class="unit-btn" data-value="sec">sec</button>
                    <button class="unit-btn" data-value="min">min</button>
                </div>
            </div>
        `;
    }

    function handleSetModification(e) {
        const target = e.target;
        
        // Handle Add/Remove Set Buttons
        if (target.matches('.add-set-btn, .remove-set-btn')) {
            const exerciseIndex = target.dataset.exerciseIndex;
            const card = document.querySelector(`.exercise-log-card[data-exercise-index='${exerciseIndex}']`);
            const setContainer = card.querySelector('.set-log-container');
            
            if (target.matches('.add-set-btn')) {
                const newSetNumber = setContainer.children.length + 1;
                setContainer.insertAdjacentHTML('beforeend', createSetBarHTML(newSetNumber));
            } else if (target.matches('.remove-set-btn')) {
                if (setContainer.children.length > 1) {
                    setContainer.lastElementChild.remove();
                }
            }
        }

        // Handle Unit Button Clicks
        if (target.matches('.unit-btn')) {
            // Remove 'active' class from siblings
            const siblings = target.parentElement.querySelectorAll('.unit-btn');
            siblings.forEach(btn => btn.classList.remove('active'));
            // Add 'active' class to the clicked button
            target.classList.add('active');
        }
    }

    function saveWorkoutData() {
        const allSetDataForAPI = [];
        const exerciseCards = document.querySelectorAll('.exercise-log-card');

        exerciseCards.forEach((card, index) => {
            const exerciseName = exerciseList[index];
            const setBars = card.querySelectorAll('.set-input-bar');
            setBars.forEach((bar, setIndex) => {
                const metric1Value = parseFloat(bar.querySelector('.metric1-value').value) || 0;
                const metric1Unit = bar.querySelector('.unit-selector[data-metric="1"] .active').dataset.value;
                const metric2Value = parseFloat(bar.querySelector('.metric2-value').value) || 0;
                const metric2Unit = bar.querySelector('.unit-selector[data-metric="2"] .active').dataset.value;

                if (metric1Value > 0 && metric2Value > 0) {
                    allSetDataForAPI.push({
                        workout_name: workoutName,
                        exercise_name: exerciseName,
                        set_number: setIndex + 1,
                        metric1_value: metric1Value,
                        metric1_unit: metric1Unit,
                        metric2_value: metric2Value,
                        metric2_unit: metric2Unit,
                    });
                }
            });
        });
        
        console.log("SENDING TO API:", allSetDataForAPI);
        // allSetDataForAPI.forEach(log => postWorkoutLog(log));

        alert('Workout Finished! (Data logged to console)');
        showView('setup');
    }

    // --- EVENT LISTENERS ---
    addExerciseInput.addEventListener('input', handleAutocomplete);
    addExerciseBtn.addEventListener('click', handleAddExercise);
    templateSelect.addEventListener('change', handleTemplateChange);
    exerciseListEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-exercise-btn')) {
            exerciseList.splice(parseInt(e.target.dataset.index), 1);
            renderSetupExerciseList();
        }
    });
    
    startWorkoutBtn.addEventListener('click', () => {
        if (exerciseList.length > 0) {
            renderLoggingView();
            showView('logging');
        } else {
            alert('Please add at least one exercise to your workout.');
        }
    });

    logAllExercisesContainer.addEventListener('click', handleSetModification);
    finishWorkoutBtn.addEventListener('click', saveWorkoutData);

    // --- INITIALIZATION ---
    showView('setup');
    handleTemplateChange();
});