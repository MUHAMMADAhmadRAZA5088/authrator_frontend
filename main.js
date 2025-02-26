const { app, BrowserWindow } = require('electron');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    icon: 'icon.png'
  })

  win.loadURL('http://localhost:3000')
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow)