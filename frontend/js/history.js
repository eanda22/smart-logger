document.addEventListener('DOMContentLoaded', () => {
    const historyContainer = document.getElementById('history-container');

    async function loadHistory() {
        // Fetch all the workout sessions from the API
        const sessions = await fetchWorkoutSessions();

        if (!sessions || sessions.length === 0) {
            historyContainer.innerHTML = '<p>You have no workout history yet. Go log a session!</p>';
            return;
        }

        // Clear the "Loading..." message
        historyContainer.innerHTML = '';

        // Loop through each session and create a card for it
        sessions.forEach(session => {
            const sessionCard = document.createElement('div');
            sessionCard.className = 'session-card';

            // Group sets by exercise name for cleaner display
            const exercises = {};
            session.sets.forEach(set => {
                if (!exercises[set.exercise_name]) {
                    exercises[set.exercise_name] = [];
                }
                exercises[set.exercise_name].push(set);
            });

            let exerciseGroupsHTML = '';
            for (const exerciseName in exercises) {
                const sets = exercises[exerciseName];
                const setsRows = sets.map(set => `
                    <tr>
                        <td>${set.set_number}</td>
                        <td>${set.metric1_value} ${set.metric1_unit}</td>
                        <td>${set.metric2_value} ${set.metric2_unit}</td>
                    </tr>
                `).join('');

                exerciseGroupsHTML += `
                    <div class="exercise-group">
                        <h3>${exerciseName}</h3>
                        <table class="sets-table">
                            <thead>
                                <tr>
                                    <th>Set</th>
                                    <th>Metric 1</th>
                                    <th>Metric 2</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${setsRows}
                            </tbody>
                        </table>
                    </div>
                `;
            }
            
            // Format the date for display
            const sessionDate = new Date(session.date).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
            });

            sessionCard.innerHTML = `
                <div class="session-header">
                    <h2>${session.name}</h2>
                    <p>${sessionDate}</p>
                </div>
                <div class="session-content">
                    ${exerciseGroupsHTML}
                </div>
            `;
            historyContainer.appendChild(sessionCard);
        });
    }

    // Load the history when the page is opened
    loadHistory();
});
