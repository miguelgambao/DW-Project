import { loadWeekEvents } from "./utilities/loadWeekEvents.js";
import { Modal } from "./utilities/modal.js";


export function showCalendar(username, referenceDate = new Date()) {
    const contentSection = document.querySelector("section.content");
    const title = document.querySelector(".general-title");

    if (title) {
        title.textContent = "Calendar";
    }

    if (!contentSection) {
        console.error("Content section not found");
        return;
    }

    const { weekStart, weekEnd } = getWeekRange(referenceDate);
    console.log("Calendar load:", {
        user: username,
        weekStart,
        weekEnd
    });
        console.log("referenceDate:", referenceDate);

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const startOfWeek = new Date(referenceDate);
    startOfWeek.setDate(referenceDate.getDate() - referenceDate.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    let weekHeader;
    if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        weekHeader = `${
            monthNames[startOfWeek.getMonth()]
        } ${startOfWeek.getDate()} – ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`;
    } else {
        weekHeader = `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()} – ${
            monthNames[endOfWeek.getMonth()]
        } ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`;
    }

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

            <div class="calendar-grid weekly-grid" style="position: relative;">
                <div class="time-column header"></div>

                ${dayNames
                .map((day, index) => {
                    const date = new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate() + index);
                    return `
                        <div class="calendar-header">
                            <div>${day}</div>
                            <div class="day-number">${date.getDate()}</div>
                        </div>
                    `;
                })
                .join("")}

                ${Array.from({length: 24})
                .map(
                    (_, hour) => `
                    <div class="calendar-header">${hour}:00</div>
                    ${Array.from({length: 7})
                    .map(() => `<div class="day-cell"></div>`)
                    .join("")}
                `
                )
                .join("")}
            </div>
        </div>
    `;

    const calendarGrid = contentSection.querySelector(".weekly-grid");

    const currentHourLine = document.createElement("div");
    currentHourLine.className = "current-hour-line";
    calendarGrid.appendChild(currentHourLine);

    function updateCurrentHourLine() {
        const now = new Date();

        document.querySelectorAll(".current-hour-line").forEach((el) => el.remove());

        if (now < startOfWeek || now > endOfWeek) return;

        const currentDayIndex = now.getDay();
        const hour = now.getHours();
        const minutes = now.getMinutes();

        const dayCells = Array.from(calendarGrid.querySelectorAll(".day-cell")).filter(
            (_, index) => index % 7 === currentDayIndex
        );

        const hourCell = dayCells[hour];
        if (!hourCell) return;

        hourCell.style.position = "relative";

        const line = document.createElement("div");
        line.className = "current-hour-line";
        line.style.top = `${(minutes / 60) * hourCell.offsetHeight}px`;

        hourCell.appendChild(line);
    }

    updateCurrentHourLine();
    setInterval(updateCurrentHourLine, 60000);

    document.getElementById("prev-week").addEventListener("click", () => {
        const prevWeek = new Date(startOfWeek);
        prevWeek.setDate(startOfWeek.getDate() - 7);
        showCalendar(username, prevWeek);
    });

    document.getElementById("next-week").addEventListener("click", () => {
        const nextWeek = new Date(startOfWeek);
        nextWeek.setDate(startOfWeek.getDate() + 7);
        showCalendar(username, nextWeek);

        document.getElementById("today-btn").addEventListener("click", () => {
            showCalendar(username, new Date());
        });
    });


    document.getElementById("add-event").addEventListener("click", () => {
    Modal({
        title: "New Event",
        content: `
        <div class="modal-form-group">
            <div>
                <label>Title</label>
                <input type="text" id="event-title" class="input-primary fill-container" />
            </div>

            <div>
                <label>Description</label>
                <input type="text" id="event-description" class="input-primary fill-container" />
            </div>

            <div class="datetime-container">
                <div class="datetime-input">
                    <label>Start</label>
                    <input type="datetime-local" id="event-start" class="input-secondary" />
                </div>

                <div class="datetime-input">
                    <label>End</label>
                    <input type="datetime-local" id="event-end" class="input-secondary" />
                </div>
            </div>
            
                 <div class="all-day-container">
                <label>
                    <input type="checkbox" id="event-all-day" class="checkbox" />
                    All day
                </label>
                </div>
            <button type="button" class="button-primary Smaller" id="save-event">
                Save
            </button>
            </div>
        `,
        
    });

    setTimeout(() => {
    const saveBtn = document.getElementById("save-event");
    const allDayCheckbox = document.getElementById("event-all-day");
    const startInput = document.getElementById("event-start");
    const endInput = document.getElementById("event-end");

    allDayCheckbox.addEventListener("change", () => {
        if (allDayCheckbox.checked) {
            let startDate = startInput.value ? new Date(startInput.value) : new Date();
            let endDate = endInput.value ? new Date(endInput.value) : new Date();

            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 0, 0);

            const formatDateTime = (date) => {
                const pad = (n) => n.toString().padStart(2, "0");
                return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
            }

            startInput.value = formatDateTime(startDate);
            endInput.value = formatDateTime(endDate);

            startInput.disabled = true;
            endInput.disabled = true;
        } else {
            startInput.disabled = false;
            endInput.disabled = false;
        }
    });

    saveBtn.addEventListener("click", async () => {
        const eventData = {
            title: document.getElementById("event-title").value,
            description: document.getElementById("event-description").value,
            start_time: startInput.value,
            end_time: endInput.value,
            all_day: allDayCheckbox.checked,
            user_email: username
        };

        const response = await fetch("http://localhost:3000/calendar-events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventData)
        });

        if (response.ok) {
            alert("Event created!");
            showCalendar(username, referenceDate);
        } else {
            alert("Failed to create event");
        }
    });
}, 0);


});

    loadWeekEvents(username, weekStart, weekEnd)
    .then(events => {
        console.log("📅 Eventos recebidos do backend:", events);
        renderWeekEvents(events, new Date(weekStart), calendarGrid);
    });

}

function getWeekRange(referenceDate) {
    const start = new Date(referenceDate);
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

const renderWeekEvents = (events, weekStart, calendarGrid) => {
    const cells = calendarGrid.querySelectorAll(".day-cell");

   events.forEach(event => {
    const { title, description, start_time, end_time } = event;

    const eventStart = new Date(start_time);
    const eventEnd = new Date(end_time);

    const parts = splitEventByDay(eventStart, eventEnd);

    parts.forEach((part, index) => {
        const dayIndex = part.start.getDay();
        const hour = part.start.getHours();
        const minutes = part.start.getMinutes();

        const cellIndex = hour * 7 + dayIndex;
        const cell = cells[cellIndex];
        if (!cell) return;

        const durationHours = (part.end - part.start) / 36e5;

        const eventEl = document.createElement("div");
        eventEl.className = "calendar-event";

        // Classes para eventos continuados
        if (parts.length > 1) {
            if (index === 0) eventEl.classList.add("event-start");
            else if (index === parts.length - 1) eventEl.classList.add("event-end");
            else eventEl.classList.add("event-middle");
        }

        eventEl.innerHTML = `
        <div>
            <small class="dark-text event-text">${title}</small>
            <div>
            <div>
            <small>
                ${part.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –
                ${part.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </small>
            </div>
        `;

        Object.assign(eventEl.style, {
            position: "absolute",
            top: `${(minutes / 60) * 100}%`,
            height: `${durationHours * 100}%`,
        });

        cell.style.position = "relative";
        cell.appendChild(eventEl);
    });
});

};

const splitEventByDay = (start, end) => {
    const parts = [];
    let current = new Date(start);

    while (current < end) {
        const dayStart = new Date(current);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const partStart = new Date(Math.max(current, dayStart));
        const partEnd = new Date(Math.min(end, dayEnd));

        parts.push({ start: partStart, end: partEnd });

        current = dayEnd;
    }

    return parts;
};
