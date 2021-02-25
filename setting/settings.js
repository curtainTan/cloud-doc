const { remote } = require('electron');
const Store = require('electron-store');

const settingsStore = new Store({ name: 'Settings' });

const $ = id => {
  return document.getElementById(id);
};

document.addEventListener('DOMContentLoaded', () => {
  let savedLocation = settingsStore.get('savedFileLocation');
  if (savedLocation) {
    $('saved-file-location').value = savedLocation;
  }
  $('select-new-location').addEventListener('click', () => {
    remote.dialog
      .showOpenDialog({
        properties: ['openDirectory'],
        message: '选择文件的储存路径',
      })
      .then(({ filePaths }) => {
        if (Array.isArray(filePaths)) {
          $('saved-file-location').value = filePaths[0];
          savedLocation = filePaths[0];
        }
      });
  });

  $('settings-form').addEventListener('submit', () => {
    settingsStore.set('savedFileLocation', savedLocation);
    remote.getCurrentWindow().close();
  });
});
