export const loadWeekEvents = (username, weekStart, weekEnd) =>
    !username || !weekStart || !weekEnd
        ? Promise.resolve([])
        : fetch(
              `http://localhost:3000/calendar-events?${new URLSearchParams({
                  user_email: username,
                  week_start: weekStart,
                  week_end: weekEnd,
              })}`
          )
              .then(res => (res.ok ? res.json() : Promise.reject(res)))
              .then(events => (Array.isArray(events) ? events : []))
              .catch(error => {
                  console.error("❌ Error loading events:", error);
                  return [];
              });
