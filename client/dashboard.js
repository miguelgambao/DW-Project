import { PieChart } from "./utilities/pie_chart.js";
import { getTimerState, toggleTimer, resetTimerFromDashboard } from "./pomodoro.js";

export async function showDashboardTasks(userEmail) {
  const contentSection = document.querySelector(".content");
  const API_BASE = window.location.origin;

  if (!contentSection) {
    console.error("Content section not found");
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/tasks?user_email=${encodeURIComponent(userEmail)}`
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch tasks: ${res.statusText}`);
    }

    const tasks = await res.json();
    console.log(`Tasks received for ${userEmail}:`, tasks);

    contentSection.innerHTML = `
      <div class="upcoming-tasks-section">
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

      <div class="your-pomodoro-container">
        <h3>Your Pomodoro</h3>
        <div class="pomodoro-card">
            <h4 id="dashboardModeLabel">Work Session</h4>
            <h1 class="font-alert" id="dashboardTimerDisplay">25:00</h1>
            <div class="pomodoro-controls">
              <button class="button-primary M dashboard-timer-btn" id="dashboardTimerBtn">Start</button>
              <button class="button-secondary M" id="dashboardResetBtn">Reset</button>
            </div>
        </div>
        </div>
      </div>
    `;
    
    // Update dashboard widget with current timer state
    const timerState = getTimerState();
    const dashboardTimer = document.getElementById('dashboardTimerDisplay');
    const dashboardBtn = document.getElementById('dashboardTimerBtn');
    const dashboardMode = document.getElementById('dashboardModeLabel');
    
    if (dashboardTimer) {
      dashboardTimer.textContent = timerState.formattedTime;
    }
    
    if (dashboardMode) {
      dashboardMode.textContent = timerState.modeLabel;
    }
    
    if (dashboardBtn) {
      dashboardBtn.textContent = timerState.isRunning ? 'Pause' : 'Start';
      // Add paused class when stopped
      if (timerState.isRunning) {
        dashboardBtn.classList.remove('paused');
      } else {
        dashboardBtn.classList.add('paused');
      }
      dashboardBtn.addEventListener('click', () => {
        toggleTimer();
      });
    }
    
    const dashboardResetBtn = document.getElementById('dashboardResetBtn');
    if (dashboardResetBtn) {
      dashboardResetBtn.addEventListener('click', () => {
        resetTimerFromDashboard();
      });
    }

    const taskList = document.getElementById("task-list");
    const table = document.querySelector(".tasks-table");

    tasks.forEach(task => {
      const li = document.createElement("li");

      li.innerHTML = `
        <h4>${task.title}</h4>
        <small>${task.description || ""}</small>

        <div class="task-goal">
          <div>
            <img class="icon" src="assets/icons/calendar.svg" alt="calendar icon">
            <small class="dark-text">${task.due_date}</small>
          </div>
          <div>
            <img class="icon" src="assets/icons/alarm-clock.svg" alt="clock icon">
            <small class="dark-text">${task.due_time || "--:--"}</small>
          </div>
        </div>
      `;

      taskList.appendChild(li);
    });

    tasks.forEach(task => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${task.title}</td>`;
      table.appendChild(row);
    });

    const completedCount = tasks.filter(task => task.completed).length;
    const totalCount = tasks.length;

    PieChart("tasksPieChart", completedCount, totalCount);

  } catch (err) {
    console.error(err);
    contentSection.innerHTML = `<p>Error loading tasks: ${err.message}</p>`;
  }
}
