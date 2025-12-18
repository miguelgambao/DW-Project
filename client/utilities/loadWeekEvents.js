export async function loadWeekEvents(userEmail, weekStart, weekEnd) {
    try {
        const res = await fetch(
            `http://localhost:3000/calendar-events?user_email=${encodeURIComponent(userEmail)}&week_start=${weekStart}&week_end=${weekEnd}`
        );
        if (!res.ok) {
            throw new Error("Failed to fetch calendar events");
        }
        const events = await res.json();
        return events;
    } catch (err) {
        console.error("Erro ao carregar eventos do calendário:", err);
    }
}
