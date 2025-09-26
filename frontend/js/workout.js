document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let workoutName = 'Custom Workout';
    let exerciseList = [];
    let exercises = {}; // Stores full exercise definitions {name: definition}
    let allKnownExerciseNames = []; // Stores just the names for quick lookups

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
    const workoutDateInput = document.getElementById('workout-date');

    // --- INITIAL DATA LOADING ---
    async function loadInitialData() {
        try {
            const definitions = await fetchExercises();
            if (!definitions || definitions.length === 0) throw new Error("API returned no exercises.");

            exercises = {};
            allKnownExerciseNames = [];

            definitions.forEach(def => {
                exercises[def.name] = def;
            });
            allKnownExerciseNames = Object.keys(exercises).sort();
            console.log("Successfully loaded exercises from backend.");

        } catch (error) {
            console.error("CRITICAL: Failed to load exercises from backend. App may not function correctly.", error);
            alert("Could not connect to the server to load exercises. Please make sure the backend server is running and refresh the page.");
        }
    }

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
            li.innerHTML = `<span>${exercise}</span><button class="remove-exercise-btn" data-index="${index}">&times;</button>`;
            exerciseListEl.appendChild(li);
        });
    }

    function handleAutocomplete() {
        const query = addExerciseInput.value.toLowerCase();
        autocompleteSuggestions.innerHTML = '';
        if (!query) return;

        const filtered = allKnownExerciseNames.filter(exName => 
            exName.toLowerCase().includes(query) && !exerciseList.includes(exName)
        );

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
            if (allKnownExerciseNames.includes(exerciseName)) {
                exerciseList.push(exerciseName);
                renderSetupExerciseList();
                addExerciseInput.value = '';
                autocompleteSuggestions.innerHTML = '';
            } else {
                alert(`'${exerciseName}' is not a recognized exercise. Please choose one from the list.`);
            }
        }
    }
    
    function handleTemplateChange() {
        const category = templateSelect.value;
        workoutName = templateSelect.options[templateSelect.selectedIndex].text;
        
        if (category === 'custom') {
            exerciseList = [];
        } else {
            exerciseList = allKnownExerciseNames.filter(exName => exercises[exName]?.category === category);
        }
        renderSetupExerciseList();
    }

    // --- LOGGING VIEW LOGIC ---
    function renderLoggingView() {
        workoutDateInput.value = new Date().toISOString().slice(0, 10);
        logAllExercisesContainer.innerHTML = '';
        loggingWorkoutTitle.textContent = workoutName;
        for (const [index, exerciseName] of exerciseList.entries()) {
            const definition = exercises[exerciseName];
            if (!definition) continue;
            let setBarsHTML = '';
            for (let i = 1; i <= 3; i++) {
                setBarsHTML += createSetBarHTML(i, definition);
            }
            const exerciseCardHTML = `
                <div class="exercise-log-card" data-exercise-index="${index}">
                    <div class="exercise-log-header">
                        <h3>${exerciseName}</h3>
                        <div class="set-controls">
                            <button class="remove-set-btn" data-exercise-index="${index}">-</button>
                            <button class="add-set-btn" data-exercise-index="${index}" data-exercise-name="${exerciseName}">+</button>
                        </div>
                    </div>
                    <div class="set-log-container">${setBarsHTML}</div>
                </div>`;
            logAllExercisesContainer.insertAdjacentHTML('beforeend', exerciseCardHTML);
        }
    }
    
    function createSetBarHTML(setNumber, definition) {
        const createUnitButtons = (units) => {
            if (!units || units.length === 0) return '';
            return units.map((unit, index) => 
                `<button class="unit-btn ${index === 0 ? 'active' : ''}" data-value="${unit}">${unit}</button>`
            ).join('');
        }
        return `
            <div class="set-input-bar">
                <span class="set-number">${setNumber}</span>
                <input type="number" placeholder="${definition.metric1_name}" class="metric1-value">
                <div class="unit-selector" data-metric="1">${createUnitButtons(definition.metric1_units)}</div>
                <input type="number" placeholder="${definition.metric2_name}" class="metric2-value">
                <div class="unit-selector" data-metric="2">${createUnitButtons(definition.metric2_units)}</div>
            </div>
        `;
    }

    function handleSetModification(e) {
        const target = e.target;
        if (target.matches('.add-set-btn, .remove-set-btn')) {
            const exerciseIndex = target.dataset.exerciseIndex;
            const card = document.querySelector(`.exercise-log-card[data-exercise-index='${exerciseIndex}']`);
            const setContainer = card.querySelector('.set-log-container');
            if (target.matches('.add-set-btn')) {
                const exerciseName = target.dataset.exerciseName;
                const definition = exercises[exerciseName];
                const newSetNumber = setContainer.children.length + 1;
                setContainer.insertAdjacentHTML('beforeend', createSetBarHTML(newSetNumber, definition));
            } else if (target.matches('.remove-set-btn') && setContainer.children.length > 1) {
                setContainer.lastElementChild.remove();
            }
        }
        if (target.matches('.unit-btn')) {
            target.parentElement.querySelectorAll('.unit-btn').forEach(btn => btn.classList.remove('active'));
            target.classList.add('active');
        }
    }

    async function saveWorkoutData() {
        finishWorkoutBtn.disabled = true;
        finishWorkoutBtn.textContent = 'Saving...';

        const setsData = [];
        document.querySelectorAll('.exercise-log-card').forEach((card) => {
            const exerciseName = card.querySelector('h3').textContent;
            card.querySelectorAll('.set-input-bar').forEach((bar, setIndex) => {
                const metric1Value = parseFloat(bar.querySelector('.metric1-value').value) || 0;
                const activeM1Btn = bar.querySelector('.unit-selector[data-metric="1"] .active');
                const metric1Unit = activeM1Btn ? activeM1Btn.dataset.value : '';
                const metric2Value = parseFloat(bar.querySelector('.metric2-value').value) || 0;
                const activeM2Btn = bar.querySelector('.unit-selector[data-metric="2"] .active');
                const metric2Unit = activeM2Btn ? activeM2Btn.dataset.value : '';
                if (metric1Value > 0 || metric2Value > 0) {
                    setsData.push({
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

        if (setsData.length === 0) {
            alert("Please enter some data before finishing.");
            finishWorkoutBtn.disabled = false;
            finishWorkoutBtn.textContent = 'Finish Workout';
            return;
        }

        const sessionData = {
            name: workoutName,
            date: workoutDateInput.value,
            sets: setsData
        };

        try {
            await postWorkoutSession(sessionData);
            alert('Workout Finished and Saved Successfully!');
            // Reset the view for the next workout
            templateSelect.value = 'custom';
            handleTemplateChange();
            showView('setup');
        } catch (error) {
            alert('Failed to save workout. Please check the console for errors and try again.');
        } finally {
            // Re-enable the button whether it succeeded or failed
            finishWorkoutBtn.disabled = false;
            finishWorkoutBtn.textContent = 'Finish Workout';
        }
    }

    // --- EVENT LISTENERS ---
    addExerciseBtn.addEventListener('click', handleAddExercise);
    addExerciseInput.addEventListener('input', handleAutocomplete);
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
    loadInitialData().then(() => {
        showView('setup');
        handleTemplateChange(); 
    });
});

