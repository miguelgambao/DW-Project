const { app, ipcMain, BrowserWindow, Notification, screen } = require("electron");
const path = require("path");
const { createUser, loginUser } = require("./client/login");

let mainWindow = null;
let widgetWindow = null;
let widgetManuallyClosed = false;

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
      backgroundThrottling: false,
    },
    titleBarOverlay: {
      symbolColor: "#F8FAF2",
      color: "#3B623F",
      height: isMac ? 100 : 30,
    },
    titleBarStyle: isMac ? "hiddenInset" : "hidden",
  };

  mainWindow = new BrowserWindow(windowOptions);
  // use for testing locally on electron 
  mainWindow.loadURL("http://localhost:8080");
  //mainWindow.loadURL("http://10.17.0.28:8080");
  
  mainWindow.on("minimize", () => {
    widgetManuallyClosed = false;
    mainWindow.webContents.executeJavaScript('window.isTimerRunning && window.isTimerRunning()').then(isRunning => {
      if (isRunning && !widgetWindow) {
        createWidgetWindow();
      }
    });
  });
  
  mainWindow.on("hide", () => {
    widgetManuallyClosed = false;
    mainWindow.webContents.executeJavaScript('window.isTimerRunning && window.isTimerRunning()').then(isRunning => {
      if (isRunning && !widgetWindow) {
        createWidgetWindow();
      }
    });
  });
  
  mainWindow.on("blur", () => {
    mainWindow.webContents.executeJavaScript('window.isTimerRunning && window.isTimerRunning()').then(isRunning => {
      if (isRunning && !widgetWindow && !widgetManuallyClosed) {
        createWidgetWindow();
      }
    });
  });
  
  mainWindow.on("restore", () => {
    if (widgetWindow) {
      widgetWindow.close();
    }
  });
  
  mainWindow.on("show", () => {
    if (widgetWindow) {
      widgetWindow.close();
    }
  });
  
  mainWindow.on("focus", () => {
    if (widgetWindow) {
      widgetWindow.close();
    }
  });
  
  mainWindow.on("closed", () => {
    if (widgetWindow) {
      widgetWindow.close();
    }
    app.quit();
  });

  ipcMain.handle("create-user", async (event, email, password) => {
    return await createUser(email, password);
  });

  ipcMain.handle("login-user", async (event, email, password) => {
    return await loginUser(email, password);
  });

  ipcMain.handle("show-notification", async (event, title, body) => {
    if (Notification.isSupported()) {
      const notification = new Notification({
        title: title,
        body: body,
        icon: path.join(__dirname, "assets/icons/icon.png")
      });
      notification.show();
    }
  });
  
  ipcMain.handle("update-widget", async (event, timerData) => {
    if (widgetWindow && !widgetWindow.isDestroyed()) {
      widgetWindow.webContents.send("timer-update", timerData);
    }
  });
  
  ipcMain.handle("show-main-window", async () => {
    if (mainWindow) {
      mainWindow.restore();
      mainWindow.focus();
    }
  });
  
  ipcMain.handle("close-widget", async () => {
    if (widgetWindow && !widgetWindow.isDestroyed()) {
      widgetManuallyClosed = true;
      widgetWindow.close();
    }
  });

  ipcMain.handle("get-calendar-events", async (event, userEmail, weekStart, weekEnd) => {
    try {
      const params = new URLSearchParams({
        user_email: userEmail,
        week_start: weekStart,
        week_end: weekEnd,
      });

      const res = await fetch(`http://localhost:8080/calendar-events?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch events");
      return await res.json();
    } catch (err) {
      console.error("Error loading events:", err);
      return [];
    }
  });

  ipcMain.handle("create-calendar-event", async (event, eventData) => {
    try {
      const res = await fetch("http://localhost:8080/calendar-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (!res.ok) throw new Error("Failed to create event");
      return await res.json();
    } catch (err) {
      console.error("Error creating event:", err);
      throw err;
    }
  });
}

if (typeof app !== "undefined") {
  createWindow();
}

function createWidgetWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  
  widgetWindow = new BrowserWindow({
    width: 160,
    height: 100,
    x: screenWidth - 180,
    y: screenHeight - 120,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  widgetWindow.loadFile(path.join(__dirname, "widget.html"));
  widgetWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  widgetWindow.setAlwaysOnTop(true, "floating");
  
  // Request current timer state from main window after widget loads
  widgetWindow.webContents.on('did-finish-load', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.executeJavaScript('if (window.updateWidgetWindow) { window.updateWidgetWindow(); }');
    }
  });
  
  widgetWindow.on("closed", () => {
    widgetWindow = null;
  });
}
