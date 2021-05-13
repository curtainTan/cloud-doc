const { app, ipcMain, Menu, dialog } = require('electron');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const menuTemplate = require('./src/menuTemplate');
const QiniuManeger = require('./src/utils/qiniuManeger');
const { v4 } = require('uuid');
const { join } = path;
const {
  createMainWindow,
  createSettingWindow,
  createUpdateWindow,
  createAboutWindow,
  createLoginWindow,
} = require('./src/utils/createWindow');

const config = require('./config')

const fileStore = new Store({ name: 'fileStore' });
const settingsStore = new Store({ name: 'Settings' });
const createManeger = () => {
  const ak = settingsStore.get('accessKey');
  const sk = settingsStore.get('secretKey');
  const bucketName = settingsStore.get('bucketName');
  return new QiniuManeger(ak, sk, bucketName);
};

const createImgManeger = () => {
  const ak = config.imgBucket.accessKey
  const sk = config.imgBucket.secretKey
  const bucketName = config.imgBucket.bucket
  return new QiniuManeger( ak, sk, bucketName )
}

const checkVersion = autoUpdater => {
  if (isDev) {
    autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml');
    autoUpdater.checkForUpdates();
  } else {
    autoUpdater.checkForUpdatesAndNotify();
  }
};

let mainWindow;
let settingsWindow;
let updateWindow;
let aboutWindow;
let loginWindow;
let isAutoCheckedUpdate = true;

app.on('ready', () => {
  Store.initRenderer();
  mainWindow = createMainWindow();
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  autoUpdater.autoDownload = false;
  checkVersion(autoUpdater);

  autoUpdater.on('error', error => {
    dialog.showErrorBox('Error', error === null ? 'unknow' : error);
  });

  autoUpdater.on('update-available', () => {
    dialog
      .showMessageBox({
        type: 'info',
        title: '应用有新的版本',
        message: '发现新版本，是否现在更新',
        buttons: ['是', '否'],
      })
      .then(result => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
          updateWindow = createUpdateWindow(mainWindow);
          updateWindow.on('closed', () => {
            updateWindow = null;
          });
        }
      });
  });

  autoUpdater.on('update-not-available', () => {
    if (isAutoCheckedUpdate) {
      isAutoCheckedUpdate = false;
    } else {
      dialog.showMessageBox({
        title: '没有新版本',
        message: '当前已经是最新版本',
      });
    }
  });

  autoUpdater.on('download-progress', progressObj => {
    if (updateWindow) {
      updateWindow.webContents.send('download-progress', { progressObj });
    }
  });

  autoUpdater.on('update-downloaded', () => {
    // 模拟一个下载完成事件
    updateWindow.webContents.send('download-progress', {
      progressObj: {
        percent: 100,
      },
    });
    dialog
      .showMessageBox({
        title: '安装更新',
        message: '更新下载完毕，应用将重启并进行安装',
        buttons: ['是', '否'],
      })
      .then(result => {
        if (result.response === 0) {
          setImmediate(() => autoUpdater.quitAndInstall());
        }
      });
  });

  ipcMain.on('delete-file', (event, data) => {
    const maneger = createManeger();
    maneger.deleteFile(data.key).then(res => {
      console.log('-------云端已经删除：', res);
    });
  });

  ipcMain.on('file-rename', (event, data = {}) => {
    const maneger = createManeger();
    maneger.rename(data.oldName, data.newName);
  });

  // hook up main events
  ipcMain.on('open-settings-window', () => {
    settingsWindow = createSettingWindow(mainWindow);
    settingsWindow.on('closed', () => {
      settingsWindow = null;
    });
  });

  ipcMain.on('open-login-window', () => {
    loginWindow = createLoginWindow(mainWindow);
    loginWindow.on('closed', () => {
      loginWindow = null;
    });
  });

  // 打开关于页面
  ipcMain.on('open-about-window', () => {
    aboutWindow = createAboutWindow(mainWindow);
    aboutWindow.on('closed', () => {
      aboutWindow = null;
    });
  });

  ipcMain.on('check-version', () => {
    checkVersion(autoUpdater);
  });

  // 关闭窗口
  ipcMain.on('close-window', (event, data) => {
    if ((data.window = 'updateWindow')) {
      updateWindow && updateWindow.close();
    }
    if ((data.window = 'loginWindow')) {
      // 发送登录成功的事件到页面
      loginWindow && loginWindow.close();
    }
  });

  // 登录成功
  ipcMain.on('login-success', () => {
    mainWindow.webContents.send('login-success');
  });

  ipcMain.on( 'upload-img', ( event, data ) => {
    const ImgManeger = createImgManeger()
    ImgManeger.uploadFile( data.name, data.path ).then( res => {
      mainWindow && mainWindow.webContents && mainWindow.webContents.send('uploaded-file', res);
    } )
  })

  ipcMain.on('upload-file', (event, data) => {
    const maneger = createManeger();
    maneger
      .uploadFile(data.key, data.path)
      .then(res => {
        mainWindow && mainWindow.webContents && mainWindow.webContents.send('active-file-uploaded');
      })
      .catch(() => {
        dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确');
      });
  });

  ipcMain.on('download-file', (event, data) => {
    const maneger = createManeger();
    const fileObj = fileStore.get('files');
    const { key, path, id } = data;
    maneger.getStat(key).then(
      res => {
        const serverUpdateTime = Math.round(res.putTime / 10000);
        const localUpdateTime = fileObj[id].updatedAt;
        if (serverUpdateTime > localUpdateTime || !localUpdateTime) {
          maneger.downloadFile(key, path).then(() => {
            mainWindow.webContents.send('file-downloaded', { status: 'download-success', id });
          });
        } else {
          mainWindow.webContents.send('file-downloaded', { status: 'no-new-file', id });
        }
      },
      err => {
        console.log('------没有文件---', err);
        if (err.statusCode === 612) {
          mainWindow.webContents.send('file-downloaded', { status: 'no-file', id });
        }
      }
    );
  });

  ipcMain.on('download-all-to-local', () => {
    mainWindow.webContents.send('loading-status', true);
    const maneger = createManeger();
    const fileObj = fileStore.get('files');
    const mergeFileObj = { ...fileObj };
    Object.keys(fileObj).forEach(key => {
      const title = fileObj[key].title;
      fileObj[title] = fileObj[key];
    });
    const downloadArr = [];
    maneger.getListInfo().then(res => {
      const cloudFiles = res.items;
      cloudFiles.forEach((file = {}) => {
        const reg = /\.md$/;
        if (reg.test(file.key)) {
          const title = file.key.split(reg)[0];
          const serverUpdateTime = Math.round(file.putTime / 10000);

          // 本地没有文件信息
          if (!fileObj[title]) {
            const id = v4();
            const saveLocation = settingsStore.get('savedFileLocation') || app.getPath('documents');
            const savePath = join(saveLocation, file.key);
            mergeFileObj[id] = {
              id,
              title,
              path: savePath,
              createdAt: Date.now(),
              isSynced: true,
              updatedAt: serverUpdateTime,
            };
            fileObj[title] = mergeFileObj[id];
          }

          const { updatedAt, path } = fileObj[title];
          if (serverUpdateTime >= updatedAt || !updatedAt) {
            downloadArr.push(maneger.downloadFile(file.key, path));
          }
        }
      });
      Promise.all(downloadArr)
        .then(res => {
          // 将 mergeFileObj 写入本地
          fileStore.set('files', mergeFileObj);
          mainWindow.webContents.send('refresh-files');
          dialog.showMessageBox({
            type: 'info',
            title: `成功同步到本地了${res.length}个文件`,
            message: `成功同步到本地了${res.length}个文件`,
          });
        })
        .finally(() => {
          mainWindow.webContents.send('loading-status', false);
        });
    });
  });

  ipcMain.on('upload-all-to-qiniu', () => {
    mainWindow.webContents.send('loading-status', true);
    const maneger = createManeger();
    const filesObj = fileStore.get('files') || {};
    const upLoadPromiseArr = Object.keys(filesObj).map(key => {
      const file = filesObj[key];
      return maneger.uploadFile(`${file.title}.md`, file.path);
    });
    Promise.all(upLoadPromiseArr)
      .then(result => {
        console.log(result);
        // 上传成功--提示
        dialog.showMessageBox({
          type: 'info',
          title: `成功上传了${result.length}个文件`,
          message: `成功上传了${result.length}个文件`,
        });
        mainWindow.webContents.send('files-uploaded');
      })
      .catch(err => {
        dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确');
      })
      .finally(() => {
        mainWindow.webContents.send('loading-status', false);
      });
  });

  let menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // 修改 config 配置
  ipcMain.on('config-is-saved', () => {
    let qiniuMenu = process.platform === 'darwin' ? menu.items[3] : menu.items[2];

    const switchItems = toggle => {
      [1, 2, 3].forEach(item => {
        qiniuMenu.submenu.items[item].enabled = toggle;
      });
    };
    const qiniuIsConfiged = ['accessKey', 'secretKey', 'bucketName'].every(
      key => !!settingsStore.get(key)
    );
    if (qiniuIsConfiged) {
      switchItems(true);
    } else {
      switchItems(false);
    }
  });
});
