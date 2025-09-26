const API_URL = 'http://127.0.0.1:8000/api';

// Renamed for clarity
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

// This function will post the entire session object
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

