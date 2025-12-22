const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    createUser: (email, password) => ipcRenderer.invoke('create-user', email, password),
    loginUser: (email, password) => ipcRenderer.invoke('login-user', email, password),
    showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
    updateWidget: (timerData) => ipcRenderer.invoke('update-widget', timerData),
    showMainWindow: () => ipcRenderer.invoke('show-main-window'),
    closeWidget: () => ipcRenderer.invoke('close-widget'),
    onTimerUpdate: (callback) => ipcRenderer.on('timer-update', (event, data) => callback(data)),
    
    getCalendarEvents: (userEmail, weekStart, weekEnd) => ipcRenderer.invoke('get-calendar-events', userEmail, weekStart, weekEnd),
    createCalendarEvent: (eventData) => ipcRenderer.invoke('create-calendar-event', eventData),
    
    isElectron: true
});
