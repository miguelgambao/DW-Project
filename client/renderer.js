import {RegisterUI} from "./registerUI.js";
import { showDashboardTasks } from './dashboard.js';
import { showCalendar } from "./calendar.js";
import { showTasks } from "./tasks.js";
import { showProfile } from "./profile.js";
import { api } from "./api.js";
import { showPomodoroPage } from './pomodoro.js';

const isElectron = window.api && window.api.isElectron;

async function loginUser(email, password) {
    if (isElectron) {
        return await window.api.loginUser(email, password);
    } else {
        const res = await fetch("http://10.17.0.28:8080/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.userId;
    }
}

async function createUser(email, password) {
    if (isElectron) {
        return await window.api.createUser(email, password);
    } else {
        const res = await fetch("http://10.17.0.28:8080/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.userId;
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const loginSection = document.querySelector(".login-section");
    const registerUI = RegisterUI();
    const savedUser = JSON.parse(localStorage.getItem("loggedInUser"));

    // Hide title bar in browser version
    if (!isElectron) {
        const titleBar = document.querySelector(".titleBar");
        if (titleBar) {
            titleBar.style.display = "none";
        }
    }

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
            const userId = await createUser(email, password);
            if (userId) {
                alert("Account created!");
                registerUI.setLoginMode();
            } else {
                alert("User already exists.");
            }
            return;
        }

        const userId = await loginUser(email, password);
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
                    <nav class="aside-nav">
                        <button class="button-terciary M" id="dashboardBtn">
                            <img src="assets/icons/dashboard.svg" alt="">
                            Dashboard
                        </button>
                        <button class="button-terciary M" id="calendarBtn">
                            <img src="assets/icons/calendar.svg" alt="">
                            Calendar
                        </button>
                        <button class="button-terciary M" id="tasksBtn">
                            <img src="assets/icons/tasks.svg" alt="">
                            Tasks
                        </button>
                        <button class="button-terciary M" id="pomodoroBtn">
                            <img src="assets/icons/alarm-clock.svg" alt="">
                            Pomodoro
                        </button>
                        <button class="button-terciary M" id="profileBtn">
                            <img src="assets/icons/profile.svg" alt="">
                            Profile
                        </button>
                    </nav>
                </aside>
                <div>
                    <h1 id="page-title" class="general-title">Dashboard</h1>
                </div>
                <section class="content"></section>
            </main>
        `;

        showDashboardTasks(username);
        dashboardSection.querySelector("#dashboardBtn").classList.add("active");

        const setActiveNavButton = (buttonId) => {
            const navButtons = dashboardSection.querySelectorAll(".aside-nav .button-terciary");
            navButtons.forEach(btn => btn.classList.remove("active"));
            dashboardSection.querySelector(`#${buttonId}`).classList.add("active");
        };

        dashboardSection
            .querySelector("#dashboardBtn")
            .addEventListener("click", () => {
                setActiveNavButton("dashboardBtn");
                document.getElementById("page-title").textContent = "Dashboard";
                showDashboardTasks(username);
            });

        dashboardSection
            .querySelector("#calendarBtn")
            .addEventListener("click", () => {
                setActiveNavButton("calendarBtn");
                document.getElementById("page-title").textContent = "Calendar";
                showCalendar(username, new Date());
            });

        dashboardSection
            .querySelector("#tasksBtn")
            .addEventListener("click", () => {
                setActiveNavButton("tasksBtn");
                document.getElementById("page-title").textContent = "Tasks";
                showTasks(username);
            });

        dashboardSection
            .querySelector("#profileBtn")
            .addEventListener("click", () => {
                setActiveNavButton("profileBtn");
                showProfile(username);
            });

        dashboardSection
            .querySelector("#pomodoroBtn")
            .addEventListener("click", () => {
                setActiveNavButton("pomodoroBtn");
                document.getElementById("page-title").textContent = "Pomodoro";
                showPomodoroPage();
            });
    }
});
