const { app, BrowserWindow, Menu } = require('electron');
const isDev = require('electron-is-dev');
const Store = require('electron-store');

const menuTemplate = require('./src/menuTemplate');

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

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});
