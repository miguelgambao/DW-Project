window.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("login-section");

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  document.getElementById("registerButton").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const userId = await window.api.createUser(email, password);

    if (userId) {
      showDashboard(email);
    } else {
      alert("User already exists or failed to create.");
    }
  });

  document.getElementById("loginButton").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

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
        <div class="titleBar">Podoro</div>
        <main>
            <aside>
                <img src="media/logoHorizontal.svg" alt="">
            </aside>
        </main>
    `;

    dashboardSection.style.display = "block";
  }
});