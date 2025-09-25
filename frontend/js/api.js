const API_URL = '[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)';

async function fetchWorkoutLogs() {
    try {
        const response = await fetch(`${API_URL}/logs/`);
        const logs = await response.json();
        
        const container = document.getElementById('data-container');
        container.textContent = JSON.stringify(logs, null, 2);
    } catch (error) {
        console.error('Failed to fetch logs:', error);
    }
}

fetchWorkoutLogs();