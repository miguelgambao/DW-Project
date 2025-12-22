export const loadWeekEvents = (username, weekStart, weekEnd) => {
    if (!username || !weekStart || !weekEnd) {
        return Promise.resolve([]);
    }
    const API_BASE = "http://10.17.0.28:8080";

    const params = new URLSearchParams({
        user_email: username,
        week_start: new Date(weekStart).toISOString(),
        week_end: new Date(weekEnd).toISOString(),
    });

    return fetch(`${API_BASE}/calendar-events?${params.toString()}`)
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
