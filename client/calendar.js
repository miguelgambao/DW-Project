export function showCalendar(username) {
    const contentSection = document.querySelector("section.content");

    if (!contentSection) {
        console.error("Content section not found");
        return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    contentSection.innerHTML = `
        <div class="calendar-container">
            <h2>${monthNames[month]} ${year}</h2>
            <p class="calendar-user">User: ${username}</p>

            <div class="calendar-grid">
                <div class="day-name">Sun</div>
                <div class="day-name">Mon</div>
                <div class="day-name">Tue</div>
                <div class="day-name">Wed</div>
                <div class="day-name">Thu</div>
                <div class="day-name">Fri</div>
                <div class="day-name">Sat</div>
            </div>
        </div>
    `;

    const grid = contentSection.querySelector(".calendar-grid");

    for (let i = 0; i < firstDayOfMonth; i++) {
        const empty = document.createElement("div");
        empty.className = "day empty";
        grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement("div");
        dayCell.className = "day";
        dayCell.textContent = day;

        if (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {
            dayCell.classList.add("today");
        }

        grid.appendChild(dayCell);
    }
}
