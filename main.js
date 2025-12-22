const { app, ipcMain, BrowserWindow } = require("electron");
const path = require("path");
const { createUser, loginUser } = require("./client/login");

async function createWindow() {
  await app.whenReady();

  const isMac = process.platform === "darwin";
  const windowOptions = {
    width: 1000,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarOverlay: {
      symbolColor: "#F8FAF2",
      color: "#3B623F",
      height: isMac ? 100 : 30,
    },
    titleBarStyle: isMac ? "hiddenInset" : "hidden",
  };

  const window = new BrowserWindow(windowOptions);
  // use for testing locally on electron 
  window.loadURL("http://localhost:8080");
  // window.loadURL("http://10.17.0.28:8080");
  window.on("closed", () => app.quit());

  ipcMain.handle("create-user", async (event, email, password) => {
    return await createUser(email, password);
  });

  ipcMain.handle("login-user", async (event, email, password) => {
    return await loginUser(email, password);
  });

  ipcMain.handle("update-password", async (event, username, newPassword) => {
    try {
      const res = await fetch(`http://localhost:8080/users/${encodeURIComponent(username)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword })
      });
      if (!res.ok) throw new Error("Failed to update password");
      return { success: true };
    } catch (err) {
      throw new Error(err.message);
    }
  });
}

if (typeof app !== "undefined") {
  createWindow();
}
