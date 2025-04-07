const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const url = require('url');

function createWindow() {
  // Create the browser window
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true, // Keep security enabled
    },
    roundedCorners: true,
    icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true,
  });

  // Load the index.html file - this is the key change
  win.loadFile(path.join(__dirname, 'index.html'));
  
  // Configure the session to allow access to localhost even when offline
  configureLocalNetworkAccess(win);
  
  // Log any errors
  win.webContents.on('did-fail-load', (e, code, desc) => {
    console.error('Failed to load:', code, desc);
  });
}

// Configure session to handle network requests properly
function configureLocalNetworkAccess(win) {
  // Handle permissions for local network access
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    // Always allow local network access
    if (permission === 'media' || 
        permission === 'geolocation' || 
        permission === 'notifications' || 
        permission === 'midi' || 
        permission === 'midiSysex') {
      return callback(false);
    }
    
    return callback(true);
  });
  
  // Configure custom protocol handling if needed for your application
  // This is helpful for custom schemes or handling specific local requests
  session.defaultSession.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, 
    (details, callback) => {
      // You can modify requests here if needed
      callback({ cancel: false });
    }
  );
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});