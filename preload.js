const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    createUser: (email, password) => ipcRenderer.invoke('create-user', email, password),
    loginUser: (email, password) => ipcRenderer.invoke('login-user', email, password),
    updatePassword: (username, password) => ipcRenderer.invoke('update-password', username, password),
    getCalendarEvents: async (userEmail, weekStart, weekEnd) => {
        try {
            const params = new URLSearchParams({
                user_email: userEmail,
                week_start: weekStart,
                week_end: weekEnd
            });
            const res = await fetch(`http://localhost:8080/calendar-events?${params}`);
            if (!res.ok) throw new Error("Failed to fetch calendar events");
            return await res.json();
        } catch (err) {
            throw new Error(err.message);
        }
    },
    createCalendarEvent: async (eventData) => {
        try {
            const res = await fetch(`http://localhost:8080/calendar-events`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(eventData)
            });
            if (!res.ok) throw new Error("Failed to create calendar event");
            return await res.json();
        } catch (err) {
            throw new Error(err.message);
        }
    },
    isElectron: true
});
