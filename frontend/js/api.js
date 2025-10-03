const API_URL = 'http://127.0.0.1:8000/api';

// Renamed for clarity to fetch all defined exercises
async function fetchExercises() {
    try {
        const response = await fetch(`${API_URL}/exercises/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch exercises:', error);
        return [];
    }
}

// Function to fetch all workout sessions for the history page
async function fetchWorkoutSessions() {
    try {
        const response = await fetch(`${API_URL}/workout-sessions/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch workout sessions:', error);
        return [];
    }
}

// This function fetches the most recent set data for a specific exercise
async function fetchLatestSets(exerciseName) {
    try {
        const response = await fetch(`${API_URL}/exercises/latest_sets_by_name/?name=${encodeURIComponent(exerciseName)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch latest sets for ${exerciseName}:`, error);
        return []; // Return an empty array on error
    }
}

async function fetchLatestSessionExercises(templateName) {
    try {
        const response = await fetch(`${API_URL}/workout-sessions/latest_exercises_by_name/?name=${encodeURIComponent(templateName)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch latest session exercises for ${templateName}:`, error);
        return []; // Return empty array on failure
    }
}


// This function posts the entire session object, including all its sets
async function postWorkoutSession(sessionData) {
    try {
        const response = await fetch(`${API_URL}/workout-sessions/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sessionData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(`Server responded with ${response.status}`);
        }

        const result = await response.json();
        console.log('Successfully posted session:', result);
        return result;

    } catch (error) {
        console.error('Failed to post session:', error);
        // Re-throw the error so the calling function knows something went wrong
        throw error; 
    }
}