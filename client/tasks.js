import { Modal } from "./utilities/modal.js";

export function showTasks(username) {
    const contentSection = document.querySelector("section.content");
    const title = document.querySelector(".general-title");

    let currentPage = 1;
    let loading = false;
    let showCompletedOnly = false;

    title.textContent = "Tasks";

    contentSection.innerHTML = `
        <div class="tasks-container">
            <div class="tasks-header">
                <h3>All tasks</h3> 
                <button class="button-secondary M" id="add-task">+</button>
            </div>

            <div class="tasks-filters">
                <label>
                    <input type="checkbox" id="completed-filter" class="checkbox"/>
                    Show completed only
                </label>
            </div>

            <table class="tasks-table">
                <thead>
                    <tr>
                        <th>Task title</th>
                        <th>State</th>
                        <th>Description</th>
                        <th>Due date</th>
                    </tr>
                </thead>
                <tbody id="tasks-body"></tbody>
            </table>

            <button class="button-secondary" id="load-more">
                Load more
            </button>
        </div>
    `;

    const tbody = document.getElementById("tasks-body");
    const loadMoreBtn = document.getElementById("load-more");
    const completedCheckbox = document.getElementById("completed-filter");

    async function loadTasks(reset = false) {
        if (loading) return;
        loading = true;

        if (reset) {
            currentPage = 1;
            tbody.innerHTML = "";
            loadMoreBtn.style.display = "block";
        }

        const API_BASE = window.location.origin;
        const url = new URL(`${API_BASE}/tasks`);
        url.searchParams.set("user_email", username);
        url.searchParams.set("page", currentPage);

        if (showCompletedOnly) {
            url.searchParams.set("completed", "true");
        }

        const res = await fetch(url);
        const tasks = await res.json();

        if (!tasks.length) {
            loadMoreBtn.style.display = "none";
            loading = false;
            return;
        }

        tasks.forEach((task) => {
            const tr = document.createElement("tr");

            const stateLabel = task.completed ? "Completed" : "Pending";
            const dueDateTime = task.due_date ? `${task.due_date} ${task.due_time || ""}` : "";

            tr.innerHTML = `
        <td><span class="task-title" title="${task.title || ""}">${task.title || ""}</span></td>
        <td>
            <label style="display:flex; align-items:center; gap:6px;">
                <input
                    type="checkbox"
                    class="task-completed-checkbox checkbox" 
                    data-id="${task._id}"
                    ${task.completed ? "checked" : ""}
                />
                <span class="${task.completed ? "state-done" : "state-pending"}">
                    ${stateLabel}
                </span>
            </label>
        </td>
        <td><span class="task-description" title="${task.description || ""}">${task.description || ""}</span></td>
        <td>${dueDateTime}</td>
    `;

            tbody.appendChild(tr);
        });
        tbody.querySelectorAll(".task-completed-checkbox").forEach((checkbox) => {
            checkbox.addEventListener("change", async (e) => {
                const taskId = e.target.dataset.id;
                const completed = e.target.checked;

                const API_BASE = window.location.origin;
                await fetch(`${API_BASE}/tasks/toggle`, {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({taskId, completed}),
                });

                const span = e.target.nextElementSibling;
                span.textContent = completed ? "Completed" : "Pending";
                span.className = completed ? "state-done" : "state-pending";
            });
        });

        currentPage++;
        loading = false;
    }

    loadMoreBtn.addEventListener("click", () => loadTasks());

    completedCheckbox.addEventListener("change", () => {
        showCompletedOnly = completedCheckbox.checked;
        loadTasks(true);
    });

    loadTasks();

    document.getElementById("add-task").addEventListener("click", () => {
        Modal({
            title: "New Task",
            content: `
    <div class="modal-form-group">
      <div>
        <label>Title</label>
        <input type="text" id="task-title" class="input-primary fill-container" />
      </div>

      <div>
        <label>Description</label>
        <input type="text" id="task-description" class="input-primary fill-container" />
      </div>

      <div class="datetime-container">
        <div class="datetime-input">
          <label>Due date</label>
          <input type="date" id="task-due-date" class="input-secondary" />
        </div>

        <div class="datetime-input">
          <label>Due time</label>
          <input type="time" id="task-due-time" class="input-secondary" />
        </div>
      </div>

      <button type="button" class="button-primary Smaller" id="save-task">
        Save
      </button>
    </div>
  `,
        });

        setTimeout(() => {
            const saveBtn = document.getElementById("save-task");

            saveBtn.addEventListener("click", async () => {
                const taskData = {
                    title: document.getElementById("task-title").value,
                    description: document.getElementById("task-description").value,
                    due_date: document.getElementById("task-due-date").value,
                    due_time: document.getElementById("task-due-time").value,
                    user_email: username,
                };

                const API_BASE = window.location.origin;
                const response = await fetch(`${API_BASE}/tasks`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(taskData),
                });

                if (response.ok) {
                    alert("Task created!");

                    currentPage = 1;
                    tbody.innerHTML = "";
                    loadTasks(true);
                } else {
                    alert("Failed to create task");
                }
            });
        }, 0);
    });
}
