import { loadWeekEvents } from "./utilities/loadWeekEvents.js";
import { Modal } from "./utilities/modal.js";

/* ===== CONFIG ===== */
const API_BASE = "http://10.17.0.28:8080";

export function showCalendar(username, referenceDate = new Date()) {
    const contentSection = document.querySelector("section.content");
    const title = document.querySelector(".general-title");

    if (title) title.textContent = "Calendar";
    if (!contentSection) return;

    const { weekStart, weekEnd } = getWeekRange(referenceDate);

    const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const startOfWeek = new Date(weekStart);
    const endOfWeek = new Date(weekEnd);

    const weekHeader =
        startOfWeek.getMonth() === endOfWeek.getMonth()
            ? `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()} – ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`
            : `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()} – ${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`;

    contentSection.innerHTML = `
        <div class="calendar-container">
            <div class="calendar-options">
                <button class="button-secondary M" id="today-btn">Today</button>

                <div class="week-navigation">
                    <button class="button-secondary M" id="prev-week">&lt;</button>
                    <p class="gray">${weekHeader}</p>
                    <button class="button-secondary M" id="next-week">&gt;</button>
                </div>

                <button class="button-secondary M" id="add-event">+</button>
            </div>

            <div class="calendar-grid weekly-grid">
                <div class="time-column header"></div>

                ${dayNames.map((day, i) => {
                    const d = new Date(startOfWeek);
                    d.setDate(startOfWeek.getDate() + i);
                    return `
                        <div class="calendar-header">
                            <div>${day}</div>
                            <div class="day-number">${d.getDate()}</div>
                        </div>`;
                }).join("")}

                ${Array.from({ length: 24 }).map((_, hour) => `
                    <div class="calendar-header">${hour}:00</div>
                    ${Array.from({ length: 7 }).map(() => `<div class="day-cell"></div>`).join("")}
                `).join("")}
            </div>
        </div>
    `;

    document.getElementById("prev-week").onclick = () => {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() - 7);
        showCalendar(username, d);
    };

    document.getElementById("next-week").onclick = () => {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + 7);
        showCalendar(username, d);
    };

    document.getElementById("today-btn").onclick = () =>
        showCalendar(username, new Date());

    document.getElementById("add-event").onclick = () => {
        Modal({
            title: "New Event",
            content: `
                <input id="event-title" placeholder="Title" class="input-primary fill-container"/>
                <input id="event-description" placeholder="Description" class="input-primary fill-container"/>
                <input type="datetime-local" id="event-start" class="input-secondary"/>
                <input type="datetime-local" id="event-end" class="input-secondary"/>
                <label><input type="checkbox" id="event-all-day"/> All day</label>
                <button class="button-primary Smaller" id="save-event">Save</button>
            `
        });

        setTimeout(() => {
            document.getElementById("save-event").onclick = async () => {
                const eventData = {
                    title: document.getElementById("event-title").value,
                    description: document.getElementById("event-description").value,
                    start_time: document.getElementById("event-start").value,
                    end_time: document.getElementById("event-end").value,
                    all_day: document.getElementById("event-all-day").checked,
                    user_email: username
                };

                const res = await fetch(`${API_BASE}/calendar-events`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(eventData)
                });

                if (res.ok) {
                    showCalendar(username, referenceDate);
                } else {
                    alert("Failed to create event");
                }
            };
        }, 0);
    };

    loadWeekEvents(username, weekStart, weekEnd).then(events => {
        renderWeekEvents(events, startOfWeek, document.querySelector(".weekly-grid"));
    });
}

function getWeekRange(date) {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return {
        weekStart: start.toISOString(),
        weekEnd: end.toISOString()
    };
}

function renderWeekEvents(events, weekStart, calendarGrid) {
    const cells = calendarGrid.querySelectorAll(".day-cell");

    events.forEach(event => {
        const start = new Date(event.start_time);

        const dayIndex = start.getDay();   // 0–6
        const hour = start.getHours();     // 0–23
        const index = hour * 7 + dayIndex;

        const cell = cells[index];
        if (!cell) return;

        const el = document.createElement("div");
        el.className = "calendar-event";
        el.textContent = event.title;

        el.style.position = "absolute";
        el.style.top = "2px";
        el.style.left = "2px";
        el.style.right = "2px";

        cell.style.position = "relative";
        cell.appendChild(el);
    });
}
