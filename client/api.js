const API_BASE_URL = 'http://localhost:3000';

const isElectron = () => {
    return typeof window !== 'undefined' && window.api !== undefined;
};

export const api = {
    async createUser(email, password) {
        if (isElectron()) {
            return await window.api.createUser(email, password);
        } else {
            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            return data.userId || null;
        }
    },

    async loginUser(email, password) {
        if (isElectron()) {
            return await window.api.loginUser(email, password);
        } else {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            return data.userId || null;
        }
    }
};
