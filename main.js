const { app, ipcMain, Menu } = require('electron');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const AppWindow = require('./src/appWindow');
const path = require('path');

const menuTemplate = require('./src/menuTemplate');

let mainWindow;
let settingsWindow;

app.on('ready', () => {
  Store.initRenderer();
  const mainWindowConfig = {
    width: 1024,
    height: 680,
  };
  const urlLocation = isDev ? 'http://localhost:3000' : '';
  mainWindow = new AppWindow(mainWindowConfig, urlLocation);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // hook up main events
  ipcMain.on('open-settings-window', () => {
    const settingsWindowConfig = {
      width: 500,
      height: 400,
      parent: mainWindow,
    };
    const settingsFileLocation = `file://${path.join(__dirname, './setting/settings.html')}`;
    settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation);
    settingsWindow.on('closed', () => {
      settingsWindow = null;
    });
  });

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});
