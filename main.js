const { app, ipcMain, BrowserWindow } = require('electron')
const path = require('path')

async function main() {
    await app.whenReady()

    let window = new BrowserWindow({ 
		webPreferences: { preload: path.join(__dirname, 'renderer.js'), contextIsolation: false },
		width: 1000, height: 700,
		titleBarStyle: 'hidden',
		titleBarOverlay: {
		  symbolColor: '#F8FAF2',
		  color: '#3B623F',
		  height: 	30
		}
	})
    window.on('closed', () => app.quit())
    window.loadFile('index.html')
}

main()