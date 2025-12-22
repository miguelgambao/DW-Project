const API_BASE_URL = 'http://localhost:3000'

const isElectron = () => typeof window !== 'undefined' && window.api !== undefined

export const api = {
    async createUser(email, password) {
        return isElectron()
            ? await window.api.createUser(email, password)
            : await fetch(`${API_BASE_URL}/api/register`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, password }),
              })
                  .then(res => res.json())
                  .then(data => data.userId || null)
    },

    async loginUser(email, password) {
        return isElectron()
            ? await window.api.loginUser(email, password)
            : await fetch(`${API_BASE_URL}/api/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, password }),
              })
                  .then(res => res.json())
                  .then(data => data.userId || null)
    },
}
