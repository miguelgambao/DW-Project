import { API_CONFIG } from "../config.js";

export const loadWeekEvents = (username, weekStart, weekEnd) => {
    if (!username || !weekStart || !weekEnd) {
        return Promise.resolve([]);
    }

    return fetch(
        `${API_CONFIG.BASE_URL}/calendar-events?${new URLSearchParams({
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
