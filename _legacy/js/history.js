document.addEventListener('DOMContentLoaded', () => {
    const monthYearHeader = document.getElementById('month-year-header');
    const calendarGrid = document.getElementById('calendar-grid');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const detailsContainer = document.getElementById('workout-details-container');

    let currentDate = new Date();
    let workoutData = {}; // To store sessions mapped by date YYYY-MM-DD

    // --- Calendar Rendering ---
    async function renderCalendar(year, month) {
        // Fetch data if it hasn't been fetched yet
        if (Object.keys(workoutData).length === 0) {
            await loadHistoryData();
        }

        calendarGrid.innerHTML = '';
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        monthYearHeader.textContent = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        // Add blank days for the start of the month
        for (let i = 0; i < firstDay.getDay(); i++) {
            calendarGrid.innerHTML += '<div class="calendar-day empty"></div>';
        }

        // Add days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().slice(0, 10);
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            dayElement.dataset.date = dateString;

            // Add classes for styling
            if (dateString === new Date().toISOString().slice(0, 10)) {
                dayElement.classList.add('today');
            }
            if (workoutData[dateString]) {
                dayElement.classList.add('has-workout');
            }
            
            calendarGrid.appendChild(dayElement);
        }
    }

    // --- Data Fetching and Processing ---
    async function loadHistoryData() {
        const sessions = await fetchWorkoutSessions();
        workoutData = {}; // Reset data
        sessions.forEach(session => {
            const date = session.date;
            if (!workoutData[date]) {
                workoutData[date] = [];
            }
            workoutData[date].push(session);
        });
    }

    // --- Displaying Workout Details ---
    function displayDetailsForDate(dateString) {
        // Remove 'selected' class from all days
        document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
        // Add 'selected' to the clicked day
        const selectedDay = document.querySelector(`.calendar-day[data-date='${dateString}']`);
        if (selectedDay) {
            selectedDay.classList.add('selected');
        }

        detailsContainer.innerHTML = '';
        const sessions = workoutData[dateString];

        if (sessions) {
            sessions.forEach(session => {
                const sessionCard = createSessionCard(session);
                detailsContainer.appendChild(sessionCard);
            });
        } else {
            detailsContainer.innerHTML = `
                <div class="session-card no-workout-card">
                    <p>No workout logged for this day.</p>
                    <a href="workout.html" class="btn btn-primary">Log a Workout</a>
                </div>
            `;
        }
    }
    
    function createSessionCard(session) {
        const card = document.createElement('div');
        card.className = 'session-card';

        const exercises = {};
        session.sets.forEach(set => {
            // The API now returns 'exercise' with the name as a string
            if (!exercises[set.exercise]) exercises[set.exercise] = [];
            exercises[set.exercise].push(set);
        });

        let exerciseGroupsHTML = '';
        for (const exerciseName in exercises) {
            const sets = exercises[exerciseName];
            const setsRows = sets.map(set => `
                <tr><td>${set.set_number}</td><td>${set.metric1_value} ${set.metric1_unit}</td><td>${set.metric2_value} ${set.metric2_unit}</td></tr>`
            ).join('');

            exerciseGroupsHTML += `
                <div class="exercise-group">
                    <h3>${exerciseName}</h3>
                    <table class="sets-table">
                        <thead><tr><th>Set</th><th>Metric 1</th><th>Metric 2</th></tr></thead>
                        <tbody>${setsRows}</tbody>
                    </table>
                </div>`;
        }

        card.innerHTML = `
            <div class="session-header"><h2>${session.name}</h2></div>
            <div class="session-content">${exerciseGroupsHTML}</div>`;
        return card;
    }


    // --- Event Listeners ---
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
    });
    
    calendarGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('calendar-day') && !e.target.classList.contains('empty')) {
            const dateString = e.target.dataset.date;
            displayDetailsForDate(dateString);
        }
    });

    // --- Initial Load ---
    renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
});