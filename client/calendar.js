export function showCalendar(username, referenceDate = new Date()) {
    const contentSection = document.querySelector("section.content");

    if (!contentSection) {
        console.error("Content section not found");
        return;
    }

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
                <button class="button-secondary M">Today</button>
                <div>
                    <button class="button-secondary M" id="prev-week">&lt;</button>
                    <p class="gray">${weekHeader}</p>
                    <button class="button-secondary M" id="next-week">&gt;</button>
                </div>
                <button class="button-secondary M">+</button>
            </div>

            <div class="calendar-grid weekly-grid" style="position: relative;">
                <div class="time-column header"></div>
                ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                .map((day) => `<div class="calendar-header">${day}</div>`)
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
        const hourHeaders = calendarGrid.querySelectorAll(".calendar-header");
        const hourColumnHeaders = Array.from(hourHeaders).slice(7);

        const hour = now.getHours();
        const minutes = now.getMinutes();

        const hourCell = hourColumnHeaders[hour];
        if (!hourCell) return;

        const y = hourCell.offsetTop + (minutes / 60) * hourCell.offsetHeight;
        currentHourLine.style.top = `${y}px`;
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
    });
}
