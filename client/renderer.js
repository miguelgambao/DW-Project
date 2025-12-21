import { RegisterUI } from "./registerUI.js";
import { showDashboardTasks } from "./dashboard.js";
import { showCalendar } from "./calendar.js";

/* -----------------------------
   Backend abstraction layer
--------------------------------*/

// Detect if running inside Electron
const isElectron = window.api && window.api.isElectron;

// Login
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

// Register
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

/* -----------------------------
   UI logic
--------------------------------*/

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

        // REGISTER
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

        // LOGIN
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
                    <button class="calendar">Calendar</button>
                </aside>
                <div>
                    <h1 class="general-title">Dashboard</h1>
                </div>
                <section class="content"></section>
            </main>
        `;

        showDashboardTasks(username);

        dashboardSection
            .querySelector(".calendar")
            .addEventListener("click", () => {
                showCalendar(username, new Date());
            });
    }
});
