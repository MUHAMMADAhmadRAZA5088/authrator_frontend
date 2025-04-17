const { app, BrowserWindow, session, shell, dialog } = require('electron');
const path = require('path');
const url = require('url');

// Check if we're running in development or production
const isDev = process.env.NODE_ENV === 'development';

// Store reference to main window to prevent garbage collection
let mainWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Ensure only one instance of the app runs at a time
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  // Handle second instance launch - focus the main window or process the auth URLs
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      
      // Handle potential auth URL in the command line args
      const authUrl = getAuthUrlFromArgs(commandLine);
      if (authUrl) {
        handleAuthUrl(authUrl);
      }
    }
  });
}

// Protocol registration for macOS
app.on('will-finish-launching', () => {
  // Handle open-url events (macOS)
  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleAuthUrl(url);
  });
});

// Extract and process auth URL from command line arguments
function getAuthUrlFromArgs(args) {
  // Check the arguments for auth protocol URLs
  return args.find(arg => arg.startsWith('authrator://'));
}

// Process authenticated user data after redirect
function handleAuthUrl(authUrl) {
  try {
    console.log('Processing auth URL:', authUrl);
    const urlObj = new URL(authUrl);
    
    // Check if this is a success or failure
    if (urlObj.pathname === '/auth/success') {
      // Get the encoded token from URL params
      const token = urlObj.searchParams.get('token');
      if (token) {
        processAuthToken(token);
      } else {
        console.error('No token found in auth URL');
        showAuthError('No authentication token was received.');
      }
    } else if (urlObj.pathname === '/auth/failed') {
      // Handle auth failure
      showAuthError('Google authentication failed');
    }
  } catch (error) {
    console.error('Error processing auth URL:', error);
    showAuthError('Failed to process authentication data');
  }
}

// Process the authentication token
function processAuthToken(token) {
  try {
    // Decode the base64 token and parse the JSON
    const userData = JSON.parse(atob(token));
    
    console.log('Received user data:', userData);
    
    // Store user data in localStorage and set a specific flag for auth success
    mainWindow.webContents.executeJavaScript(`
      localStorage.setItem('userId', '${userData.id}');
      localStorage.setItem('user', '${JSON.stringify(userData)}');
      
      // Set an auth success flag to indicate successful authentication
      localStorage.setItem('auth_success_timestamp', '${Date.now()}');
      
      // Force navigation using location replace to avoid history issues
      window.location.replace('#/app');
      
      // Also trigger a custom event that the app can listen for
      const authEvent = new CustomEvent('auth_success_event');
      window.dispatchEvent(authEvent);
      
      console.log('Authentication successful! Redirecting to dashboard...');
    `);
    
    // As an additional measure, reload the app after a short delay
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.reload();
        
        // After reload, check and redirect if needed
        mainWindow.webContents.once('did-finish-load', () => {
          mainWindow.webContents.executeJavaScript(`
            const user = localStorage.getItem('user');
            const authSuccess = localStorage.getItem('auth_success_timestamp');
            
            if (user && authSuccess) {
              // If we just authenticated successfully, ensure we're on dashboard
              window.location.replace('#/app');
            }
          `);
        });
      }
    }, 500);
  } catch (error) {
    console.error('Error processing auth token:', error);
    showAuthError('Failed to process authentication data');
  }
}

// Show an error dialog for authentication issues
function showAuthError(message) {
  dialog.showErrorBox('Authentication Error', message);
  
  // Also display in the app
  if (mainWindow) {
    mainWindow.webContents.executeJavaScript(`
      console.error('Authentication error: ${message}');
    `);
  }
}

// Manually check for authentication data in browser localStorage
function checkForPendingAuth() {
  if (!mainWindow) return;
  
  mainWindow.webContents.executeJavaScript(`
    (function() {
      const pendingAuth = localStorage.getItem('authrator_pending_auth');
      if (pendingAuth) {
        // Clear the pending auth
        localStorage.removeItem('authrator_pending_auth');
        return pendingAuth;
      }
      return null;
    })()
  `).then(token => {
    if (token) {
      console.log('Found pending auth token');
      processAuthToken(token);
    }
  }).catch(err => {
    console.error('Error checking for pending auth:', err);
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true, // Keep security enabled
    },
    roundedCorners: true,
    icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true,
  });

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  // Configure the session to allow access to localhost even when offline
  configureLocalNetworkAccess(mainWindow);
  
  // Handle external URLs
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log('Opening external URL:', url);
    
    // For auth URLs, special handling
    if (url.includes('auth-redirect.html') || url.includes('auth-electron.html')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    
    // For Google auth and other external URLs, open in default browser
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    
    return { action: 'allow' };
  });
  
  // Set up page load handler to check for auth data
  mainWindow.webContents.on('did-finish-load', () => {
    // Check for pending authentication after page load
    checkForPendingAuth();
  });
  
  // Log any errors
  mainWindow.webContents.on('did-fail-load', (e, code, desc) => {
    console.error('Failed to load:', code, desc);
  });
  
  // Set up periodic checks for auth data (for when protocol handler fails)
  setInterval(checkForPendingAuth, 3000);
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

// Register the protocol handler
app.setAsDefaultProtocolClient('authrator');

// Create window once the app is ready
app.whenReady().then(() => {
  createWindow();
  
  // Check for auth URL in the command line args
  const authUrl = getAuthUrlFromArgs(process.argv);
  if (authUrl) {
    console.log('Found auth URL in command line args:', authUrl);
    handleAuthUrl(authUrl);
  }
});

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