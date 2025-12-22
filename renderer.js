import {RegisterUI} from "./client/registerUI.js";
import { showDashboardTasks } from './client/dashboard.js';
import { showCalendar } from "./client/calendar.js";
import { showTasks } from "./client/tasks.js";
import { showProfile } from "./client/profile.js";
import { api } from "./client/api.js";

window.addEventListener("DOMContentLoaded", () => {
    const loginSection = document.querySelector(".login-section");
    const registerUI = RegisterUI();
    const savedUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (savedUser) {
        showDashboard(savedUser.email);
        return;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    document.getElementById("loginButton").addEventListener("click", async () => {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!isValidEmail(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (registerUI.isRegisterMode()) {
            const userId = await api.createUser(email, password);
            if (userId) {
                alert("Account created!");
                registerUI.setLoginMode();
            } else {
                alert("User already exists.");
            }
            return;
        }

        const userId = await api.loginUser(email, password);
        if (userId) {
            localStorage.setItem("loggedInUser", JSON.stringify({ email, userId }));
            showDashboard(email);
        } else {
            alert("Invalid email or password.");
        }
    });

    function showDashboard(username) {
        loginSection.style.display = "none";

        let dashboardSection = document.getElementById("dashboard-section");
        if (!dashboardSection) {
            dashboardSection = document.createElement("div");
            dashboardSection.id = "dashboard-section";
            document.body.appendChild(dashboardSection);
        }

        dashboardSection.innerHTML = `
      <main>
        <aside>
          <img src="assets/media/logoHorizontal.svg" alt="">
          <button class="calendar">Calendar</button>
          <button class="tasks">Tasks</button>
          <button class="profile">Profile</button>
        </aside>
        <div>
        <h1 class="general-title">Dashboard</h1>
        </div>
        <section class="content"></section>
      </main>
    `;
        showDashboardTasks(username);

            const calendarButton = dashboardSection.querySelector(".calendar");
            calendarButton.addEventListener("click", () => {
            showCalendar(username,new Date());
    });

            const tasksButton = dashboardSection.querySelector(".tasks");
            tasksButton.addEventListener("click", () => {
            showTasks(username);
    });

            const profileButton = dashboardSection.querySelector(".profile");
            profileButton.addEventListener("click", () => {
            showProfile(username);
    });
    }
});
