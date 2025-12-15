export function showCalendar(username, referenceDate = new Date()) {
    const contentSection = document.querySelector("section.content");

    if (!contentSection) {
        console.error("Content section not found");
        return;
    }

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const today = new Date();
    const startOfWeek = new Date(referenceDate);
    startOfWeek.setDate(referenceDate.getDate() - referenceDate.getDay()); // domingo da semana

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    let weekHeader;
    if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        weekHeader = `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()} – ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`;
    } else {
        weekHeader = `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()} – ${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`;
    }

    contentSection.innerHTML = `
        <div class="calendar-container">
            <div class="calendar-header">
                <button class="button-secondary M" id="prev-week">&lt;</button>
                <h2>${weekHeader}</h2>
                <button class="button-secondary M" id="next-week">&gt;</button>
            </div>

            <div class="calendar-grid weekly-grid">
                <div class="time-column header"></div>
                ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => `<div class="day-header">${day}</div>`).join("")}
                ${Array.from({length: 24}).map((_, hour) => `
                    <div class="time-column">${hour}:00</div>
                    ${Array.from({length: 7}).map(() => `<div class="day-cell"></div>`).join("")}
                `).join("")}
            </div>
        </div>
    `;

    const cells = contentSection.querySelectorAll(".day-cell");
    const nowDay = today.getDay();
    const nowHour = today.getHours();

    if (today >= startOfWeek && today <= endOfWeek) {
        const index = nowHour * 7 + nowDay;
        if (cells[index]) cells[index].classList.add("current-hour");
    }

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
