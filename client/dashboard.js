export async function showDashboardTasks(userEmail) {
    const contentSection = document.querySelector(".content");

    if (!contentSection) {
        console.error("Content section not found");
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/tasks?user_email=${encodeURIComponent(userEmail)}`);
        if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.statusText}`);
        const tasks = await res.json();

        console.log(`Tasks received for ${userEmail}:`, tasks);

        contentSection.innerHTML = `
            <div>
            <h3>Next tasks</h3>
            <ul id="task-list" class="tasks-container"></ul>
            <div>
        `;

        const taskList = document.getElementById("task-list");

        tasks.forEach((task) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <h4>${task.title}</h4> 
                <small> ${task.description} </small>
                <div class="task-goal">
                <div>
                <small class="dark-text">${task.due_date}</small>
                </div>
                <div>
                <small class="dark-text">${task.due_time}</small>
                </div>
                </div>
            `;
            taskList.appendChild(li);
        });
    } catch (err) {
        dashboardSection.innerHTML = `<p>Error loading tasks: ${err.message}</p>`;
    }
}
