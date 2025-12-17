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

                <button class="button-secondary M">+</button>
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
}
