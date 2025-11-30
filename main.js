const { app, ipcMain, BrowserWindow } = require('electron')
const path = require('path')

async function main() {
    await app.whenReady()

    let window = new BrowserWindow({ 
		webPreferences: { preload: path.join(__dirname, 'renderer.js'), contextIsolation: false },
		width: 1000, height: 700,
		titleBarStyle: 'hidden',
		titleBarOverlay: {
		  symbolColor: '#FFF',
		  color: '#2b252c',
		  height: 	10
		}
	})
    window.on('closed', () => app.quit())
    window.loadFile('index.html')
}

main()