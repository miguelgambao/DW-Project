const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    createUser: (email, password) => ipcRenderer.invoke('create-user', email, password),
    loginUser: (email, password) => ipcRenderer.invoke('login-user', email, password)
});
