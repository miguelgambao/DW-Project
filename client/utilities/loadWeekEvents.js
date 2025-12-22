export const loadWeekEvents = (username, weekStart, weekEnd) => {
    if (!username || !weekStart || !weekEnd) {
        return Promise.resolve([]);
    }

    // Use IPC if in Electron, otherwise fall back to fetch
    if (window.api && window.api.isElectron) {
        return window.api.getCalendarEvents(username, weekStart, weekEnd)
            .then(events => (Array.isArray(events) ? events : []))
            .catch(error => {
                console.error("Error loading events:", error);
                return [];
            });
    }

    const API_BASE = window.location.origin;

    return fetch(
        `${API_BASE}/calendar-events?${new URLSearchParams({
            user_email: username,
            week_start: new Date(weekStart).toISOString(),
            week_end: new Date(weekEnd).toISOString(),
        })}`
    )
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(events => (Array.isArray(events) ? events : []))
        .catch(error => {
            console.error("Error loading events:", error);
            return [];
        });
};
