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
            <h3>Next tasks</h3>
            <ul id="task-list"></ul>
        `;

        const taskList = document.getElementById("task-list");

        tasks.forEach((task) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${task.title}</strong> 
                <p> ${task.description} </p>
                <div class="task-goal">
                <div>
                (Due: ${task.due_date}) 
                </div>
                <div>
                (Due: ${task.due_time}) 
                </div>
                </div>
            `;
            taskList.appendChild(li);
        });
    } catch (err) {
        dashboardSection.innerHTML = `<p>Error loading tasks: ${err.message}</p>`;
    }
}
