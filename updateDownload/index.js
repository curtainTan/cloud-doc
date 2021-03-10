const { remote, ipcRenderer } = require('electron');

let downloadFinished = false;
let total = '';

const $ = selector => {
  const ele = document.querySelectorAll(selector);
  return ele.length > 1 ? ele : ele[0];
};

document.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('download-progress', (event, data) => {
    console.log('传入的数据：', data);
    if (data && data.progressObj) {
      if (data.progressObj.total > 1024 * 1024) {
        total = (data.progressObj.total / 1024 / 1024).toFixed(2) + 'm';
      } else {
        total = (data.progressObj.total / 1024).toFixed(2) + 'k';
      }
      const speed = data.progressObj.bytesPerSecond / 1024 || 0;
      $('.total').innerText = `总大小：${total}`;
      $('.percent').innerText = `下载进度：${data.progressObj.percent}%`;
      $('.speed').innerText = `下载速度：${speed}k/s`;
      $('.progress-bar').style.width = `${data.progressObj.percent}%`;

      if (data.progressObj.percent === 100) {
        downloadFinished = true;
        $('.speed').innerText = `下载速度：0k/s`;
        $('.btn').innerText = '下载完成';
      }
    }
  });

  $('.btn').addEventListener('click', (e = new Event()) => {
    if (downloadFinished) {
      $('.btn').innerText = '请稍等...';
    } else {
      // 关闭窗口，取消下载
      // ipcRenderer.send('close-window', { window: 'updateWindow' });
      remote.getCurrentWindow().close();
    }
  });
});
