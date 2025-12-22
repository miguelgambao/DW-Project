const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080'

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

    async getUser(username) {
        const res = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(username)}`)
        if (!res.ok) throw new Error('Failed to load profile')
        return await res.json()
    },

    async updateUserPassword(username, password) {
        const res = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(username)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        })
        return res.ok
    },
}
