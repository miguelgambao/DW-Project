export async function showDashboardTasks(userEmail) {
    const dashboardSection = document.getElementById("dashboard-section");

    if (!dashboardSection) {
        console.error("Dashboard section not found");
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/tasks?user_email=${encodeURIComponent(userEmail)}`);
        if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.statusText}`);
        const tasks = await res.json();

        console.log(`Tasks received for ${userEmail}:`, tasks);

        dashboardSection.innerHTML = `
            <h2>Tasks for ${userEmail}</h2>
            <ul id="task-list"></ul>
        `;

        const taskList = document.getElementById("task-list");

        tasks.forEach(task => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${task.title}</strong> - ${task.description} 
                (Due: ${task.due_date}) 
                [${task.completed ? "✅ Completed" : "❌ Not completed"}]
            `;
            taskList.appendChild(li);
        });

    } catch (err) {
        dashboardSection.innerHTML = `<p>Error loading tasks: ${err.message}</p>`;
    }
}
