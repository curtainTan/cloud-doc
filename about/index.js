const { remote, ipcRenderer } = require('electron');

const app = remote.app;

const $ = selector => {
  const ele = document.querySelectorAll(selector);
  return ele.length > 1 ? ele : ele[0];
};

document.addEventListener('DOMContentLoaded', () => {
  const version = app.getVersion();
  $('.version').innerText = `当前版本：${version}`;
  $('#check-version').addEventListener('click', (e = new Event()) => {
    e.preventDefault();
    ipcRenderer.send('check-version');
  });
});
