const { ipcRenderer } = require('electron');

// Expose ipcRenderer globally
window.ipcRenderer = ipcRenderer;