const AppWindow = require('../appWindow');
const path = require('path');
const isDev = require('electron-is-dev');

const url = 'https://graph.qq.com/oauth2.0/authorize';
const response_type = 'code';
const client_id = '101871889';
const redirect_uri = 'https://service-424y8wcu-1257620930.gz.apigw.tencentcs.com/login';
const state = 'my-state-only';

const createUpdateWindow = mainWindow => {
  const updateConfig = {
    width: 600,
    height: 400,
    parent: mainWindow,
    frame: false,
  };
  const updateURL = isDev
    ? `file://${path.join(__dirname, '../../updateDownload/index.html')}`
    : `file://${path.join(__dirname, './updateDownload/index.html')}`;
  const updateWindow = new AppWindow(updateConfig, updateURL);
  return updateWindow;
};

const createMainWindow = () => {
  const icon = isDev
    ? path.join(__dirname, '../../public/logo256.ico')
    : path.join(__dirname, './logo256.ico');
  const mainWindowConfig = {
    width: 1024,
    height: 680,
    icon,
  };
  const urlLocation = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, './index.html')}`;
  const mainWindow = new AppWindow(mainWindowConfig, urlLocation);
  return mainWindow;
};

const createAboutWindow = mainWindow => {
  const aboutWindowConfig = {
    width: 600,
    height: 500,
    parent: mainWindow,
  };
  const aboutFileLocation = isDev
    ? `file://${path.join(__dirname, '../../about/index.html')}`
    : `file://${path.join(__dirname, './about/index.html')}`;
  const aboutWindow = new AppWindow(aboutWindowConfig, aboutFileLocation);
  aboutWindow.removeMenu();
  return aboutWindow;
};

const createSettingWindow = mainWindow => {
  const settingsWindowConfig = {
    width: 600,
    height: 500,
    parent: mainWindow,
  };
  const settingsFileLocation = isDev
    ? `file://${path.join(__dirname, '../../setting/settings.html')}`
    : `file://${path.join(__dirname, './setting/settings.html')}`;
  const settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation);
  settingsWindow.removeMenu();
  return settingsWindow;
};

const createLoginWindow = mainWindow => {
  const loginWindowConfig = {
    width: 600,
    height: 400,
    parent: mainWindow,
  };
  const loginURL = `${url}?response_type=${response_type}&client_id=${client_id}&redirect_uri=${redirect_uri}&state=${state}`;
  const loginWindow = new AppWindow(loginWindowConfig, loginURL);
  loginWindow.removeMenu();
  return loginWindow;
};

module.exports = {
  createMainWindow,
  createSettingWindow,
  createUpdateWindow,
  createAboutWindow,
  createLoginWindow,
};
