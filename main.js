const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const Store = require('electron-store');

let mainWindow;

app.on('ready', () => {
  Store.initRenderer();
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });
  const urlLocation = isDev ? 'http://localhost:3000' : '';
  mainWindow.loadURL(urlLocation);
});
