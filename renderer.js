import { RegisterUI } from "./client/registerUI.js";

window.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.querySelector(".login-section");
  const registerUI = RegisterUI(); // controla só layout do register

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // O loginButton é quem decide o que fazer
  document.getElementById("loginButton").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (registerUI.isRegisterMode()) {
      // Criar conta
      const userId = await window.api.createUser(email, password);
      if (userId) {
        alert("Account created!");
        registerUI.setLoginMode(); // volta ao login
      } else {
        alert("User already exists.");
      }
      return;
    }

    // LOGIN normal
    const userId = await window.api.loginUser(email, password);
    if (userId) {
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
      <h2>Welcome!</h2>
      <div id="user-info">Logged in as: ${username}</div>
      <main>
        <aside>
          <img src="media/logoHorizontal.svg" alt="">
        </aside>
      </main>
    `;

    dashboardSection.style.display = "block";
  }
});
