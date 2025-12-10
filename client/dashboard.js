import { PieChart } from "./utilities/pie_chart.js";

export async function showDashboardTasks(userEmail) {
  const contentSection = document.querySelector(".content");

  if (!contentSection) {
    console.error("Content section not found");
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:3000/tasks?user_email=${encodeURIComponent(userEmail)}`
    );
    if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.statusText}`);
    const tasks = await res.json();

    console.log(`Tasks received for ${userEmail}:`, tasks);

    contentSection.innerHTML = `
        <div>
            <h3>Next tasks</h3>
            <ul id="task-list" class="tasks-container"></ul>
        </div>

        <div class="complete-tasks-section">
            <h3>Completed tasks</h3>
            <canvas id="tasksPieChart" class="pie-chart"></canvas>
            <table class="tasks-table">
                <tr>
                    <th>All tasks</th>
                </tr>
            </table>
        </div>
    <div class = "your-pomodoro-container">
    <h3>Your Pomodoro</h3>
        <div class="pomodoro-card">
            <h1 class="font-alert">30:00</h1>
            <button id="start-pomodoro-btn">Start</button>
        </div>
        </div>
    `;

    const taskList = document.getElementById("task-list");
    const table = document.querySelector(".tasks-table");

    tasks.forEach((task) => {
      const li = document.createElement("li");

      li.innerHTML = `
        <h4>${task.title}</h4> 
        <small>${task.description}</small>
        <div class="task-goal">
            <div><small class="dark-text">${task.due_date}</small></div>
            <div><small class="dark-text">${task.due_time}</small></div>
        </div>
      `;

      taskList.appendChild(li);
    });

    tasks.forEach((task) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${task.title}</td>`;
        table.appendChild(row);
    });

    const completedCount = tasks.filter((task) => task.completed).length;
    const totalCount = tasks.length;
    PieChart("tasksPieChart", completedCount, totalCount);

  } catch (err) {
    dashboardSection.innerHTML = `<p>Error loading tasks: ${err.message}</p>`;
  }
}
