const { remote } = require('electron');
const Store = require('electron-store');

const settingsStore = new Store({ name: 'Settings' });
const qiniuConfigArr = ['#saved-file-location', '#accessKey', '#secretKey', '#bucketName'];

const $ = selector => {
  const ele = document.querySelectorAll(selector);
  return ele.length > 1 ? ele : ele[0];
};

document.addEventListener('DOMContentLoaded', () => {
  let savedLocation = settingsStore.get('savedFileLocation');
  if (savedLocation) {
    $('#saved-file-location').value = savedLocation;
  }

  // 获取之前的信息，填入input中
  qiniuConfigArr.forEach(selector => {
    const savedValue = settingsStore.get(selector.substr(1));
    if (savedValue) {
      $(selector).value = savedValue;
    }
  });

  $('#select-new-location').addEventListener('click', () => {
    remote.dialog
      .showOpenDialog({
        properties: ['openDirectory'],
        message: '选择文件的储存路径',
      })
      .then(({ filePaths }) => {
        if (Array.isArray(filePaths)) {
          $('#saved-file-location').value = filePaths[0];
          // savedLocation = filePaths[0];
        }
      });
  });

  $('#settings-form').addEventListener('submit', (e = new Event()) => {
    e.preventDefault();
    qiniuConfigArr.forEach(selector => {
      if ($(selector)) {
        let { id, value } = $(selector);
        settingsStore.set(id, value ? value : '');
      }
    });
    // settingsStore.set('savedFileLocation', savedLocation);
    remote.getCurrentWindow().close();
  });

  $('.nav-tabs').addEventListener('click', (e = new Event()) => {
    e.preventDefault();
    $('.nav-link').forEach((element = new HTMLDivElement()) => {
      element.classList.remove('active');
    });
    e.target.classList.add('active');
    $('.config-area').forEach((element = new HTMLDivElement()) => {
      element.style.display = 'none';
    });
    $(e.target.dataset.tab).style.display = 'block';
  });
});
