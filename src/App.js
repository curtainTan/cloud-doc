import React, { useState, useEffect } from 'react';
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons';
import SimpleMDE from 'react-simplemde-editor';
import { v4 as uuidv4 } from 'uuid';

import FileSearch from './components/fileSearch';
import FileList from './components/fileList';
import BottomBtn from './components/BottomBtn';
import TabList from './components/tab/index';
import Loader from './components/loader/loader';

import useIpcRenderer from './hooks/useIpcRenderer';

import { flattenArr, objToArr, timestampToString } from './utils/helper';
import fileHealper from './utils/fileHelper';
import './app.css';

const { join, basename, extname, dirname } = window.require('path');
const { remote, ipcRenderer } = window.require('electron');
const Store = window.require('electron-store');

const fileStore = new Store({ name: 'fileStore' });
const settingsStore = new Store({ name: 'Settings' });

const getAutoSync = () =>
  ['accessKey', 'secretKey', 'bucketName', 'enableAutoSync'].every(key => !!settingsStore.get(key));

const saveFilesToStore = files => {
  // 不需要将所有的信息存入store
  const filesStoreObj = objToArr(files).reduce((result, file) => {
    const { id, path, title, createdAt, isSynced, updatedAt } = file;
    result[id] = {
      id,
      path,
      title,
      createdAt,
      isSynced,
      updatedAt,
    };
    return result;
  }, {});
  fileStore.set('files', filesStoreObj);
};

function App() {
  const [files, setFiles] = useState(fileStore.get('files') || {});
  const [searchfeFiles, setSearchfeFiles] = useState([]);
  const [activeFileID, setActiveFileId] = useState('');
  const [openedFileIDs, setOpenedFileIDs] = useState([]);
  const [unsavedFileIDs, setUnsavedFileIDs] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const activeFile = files[activeFileID];
  const filesArr = objToArr(files);
  // const saveLocation = remote && remote.app && remote.app.getPath('documents');
  const saveLocation = settingsStore.get('savedFileLocation') || remote.app.getPath('documents');

  const openedFiles = openedFileIDs.map(openID => {
    return files[openID];
  });

  const fileListArr = searchfeFiles.length > 0 ? searchfeFiles : filesArr;

  const importFiles = () => {
    remote.dialog
      .showOpenDialog({
        title: '选择导入的 MarkDown 文件',
        properties: ['openFile', 'multiSelections'],
        filters: [
          {
            name: 'MarkDown files',
            extensions: ['md'],
          },
        ],
      })
      .then(selectData => {
        if (!selectData.canceled) {
          // 1. 先获取数组
          const filteredPath = selectData.filePaths.filter(path => {
            const alreadyAdded = Object.values(files).find(file => {
              return file.path === path;
            });
            return !alreadyAdded;
          });
          // 2. 对数组处理成我们需要的结构：id，title，path
          const importFilesArr = filteredPath.map(path => {
            return {
              id: uuidv4(),
              title: basename(path, extname(path)),
              path,
            };
          });
          // 3. 扁平化处理
          const newFiles = { ...files, ...flattenArr(importFilesArr) };
          // 5. 设置和更新 store
          setFiles(newFiles);
          saveFilesToStore(newFiles);
          // 弹窗提示成功
          remote.dialog.showMessageBox({
            type: 'info',
            tittle: `成功导入了${selectData.filePaths.length}个文件`,
            message: `成功导入了${selectData.filePaths.length}个文件`,
          });
        }
      });
  };

  const saveCurrentFile = () => {
    const { path, body, title } = activeFile;
    fileHealper.writeFile(path, body).then(() => {
      setUnsavedFileIDs(unsavedFileIDs.filter(id => id !== activeFile.id));
      if (getAutoSync()) {
        ipcRenderer.send('upload-file', { key: `${title}.md`, path });
      }
    });
  };

  const fileClick = fileID => {
    // 设置currentID
    setActiveFileId(fileID);
    const currentFile = files[fileID];
    const { id, title, path, isLoaded } = currentFile;
    if (!isLoaded) {
      if (getAutoSync()) {
        ipcRenderer.send('download-file', { key: `${title}.md`, path, id });
      } else {
        fileHealper.readFile(currentFile.path).then(data => {
          const newFile = { ...files[fileID], body: data, isLoaded: true };
          setFiles({ ...files, [fileID]: newFile });
        });
      }
    }

    if (!openedFileIDs.includes(fileID)) {
      setOpenedFileIDs([...openedFileIDs, fileID]);
    }
  };

  const tabClick = fileID => {
    setActiveFileId(fileID);
  };

  const tabClose = fileID => {
    const tabWithout = openedFileIDs.filter(itemID => fileID !== itemID);
    setOpenedFileIDs(tabWithout);
    // 设置选中的tab
    if (tabWithout.length > 0) {
      setActiveFileId(tabWithout[tabWithout.length - 1]);
    } else {
      setActiveFileId('');
    }
  };

  const fileChange = (id, value) => {
    if (value !== files[id].body) {
      const newFile = { ...files[id], body: value };
      setFiles({ ...files, [id]: newFile });
      if (!unsavedFileIDs.includes(id)) {
        setUnsavedFileIDs([...unsavedFileIDs, id]);
      }
    }
  };

  const deleteFile = id => {
    // 移除文件
    if (files[id].isNew) {
      delete files[id];
      setFiles({ ...files });
    } else {
      fileHealper.deleteFile(files[id].path).then(() => {
        // delete files[id];
        const { [id]: value, ...aferDelete } = files;
        setFiles(aferDelete);
        // 移除打开的tab
        saveFilesToStore(aferDelete);
        tabClose(id);
      });
    }
  };

  const fileSearch = keyWord => {
    // 筛选
    const newFiles = filesArr.filter(file => file.title.includes(keyWord));
    setSearchfeFiles(newFiles);
  };

  const updateFileName = (id, title, isNew) => {
    // 根据是否是新文件进行处理
    // 如果不是新文件，路径用老的路径 + title
    // 如果不是新文件，
    const newPath = isNew
      ? join(saveLocation, `${title}.md`)
      : join(dirname(files[id].path), `${title}.md`);
    const modifiedFile = { ...files[id], title, isNew: false, path: newPath };
    const newFiles = { ...files, [id]: modifiedFile };
    if (isNew && saveLocation) {
      fileHealper.writeFile(newPath, files[id].body);
      setFiles(newFiles);
      saveFilesToStore(newFiles);
    } else {
      const oldPath = files[id].path;
      fileHealper.renameFile(oldPath, newPath).then(res => {
        setFiles(newFiles);
        saveFilesToStore(newFiles);
      });
    }
  };

  const createNewFile = () => {
    const newID = uuidv4();
    const newFiles = {
      ...files,
      [newID]: {
        id: newID,
        title: '',
        body: '## 请输入 markdown',
        createdAt: new Date().getTime(),
        isNew: true,
      },
    };
    setFiles(newFiles);
  };

  const activeFileUploaded = () => {
    const { id } = activeFile;
    const modifiedFile = { ...files[id], isSynced: true, updatedAt: new Date().getTime() };
    const newFiles = { ...files, [id]: modifiedFile };
    setFiles(newFiles);
    saveFilesToStore(newFiles);
  };

  const activeFileDownloaded = (event, message) => {
    const currentFile = files[message.id];
    const { id, path } = currentFile;

    fileHealper.readFile(path).then(value => {
      let newFile;
      if (message.status === 'download-success') {
        newFile = {
          ...files[id],
          body: value,
          isLoaded: true,
          isSynced: true,
          updatedAt: new Date().getTime(),
        };
      } else {
        newFile = { ...files[id], body: value, isLoaded: true };
      }
      const newFiles = { ...files, [id]: newFile };
      setFiles(newFiles);
      saveFilesToStore(newFiles);
    });
  };

  const setLoadingFun = (event, status) => {
    setLoading(status);
  };

  const filesUploaded = () => {
    const newFiles = objToArr(files).reduce((result, file) => {
      const currentTime = new Date().getTime();
      result[file.id] = {
        ...file,
        isSynced: true,
        updatedAt: currentTime,
      };
      return result;
    }, {});
    setFiles(newFiles);
    saveFilesToStore(newFiles);
  };

  useIpcRenderer({
    'create-new-file': createNewFile,
    'import-file': importFiles,
    'save-edit-file': saveCurrentFile,
    'active-file-uploaded': activeFileUploaded,
    'file-downloaded': activeFileDownloaded,
    'loading-status': setLoadingFun,
    'files-uploaded': filesUploaded,
  });

  return (
    <div className="container-fluid px-0">
      {isLoading && <Loader />}
      <div className="row no-gutters">
        <div className="col-4 left-panel">
          <FileSearch onFileSearch={fileSearch} />
          <FileList
            files={fileListArr}
            onFileDelete={deleteFile}
            onFileClick={fileClick}
            onSaveEdit={updateFileName}
          />
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn
                text="新建"
                onBtnClick={createNewFile}
                colorClass="btn-primary"
                icon={faPlus}
              />
            </div>
            <div className="col">
              <BottomBtn
                text="导入"
                onBtnClick={importFiles}
                colorClass="btn-success"
                icon={faFileImport}
              />
            </div>
          </div>
        </div>
        <div className="col-8 right-panel">
          {!activeFile && <div className="start-page">选择或者创建新的 MarkDown 文档</div>}
          {activeFile && (
            <>
              <TabList
                files={openedFiles}
                activedId={activeFileID}
                unsaveIds={unsavedFileIDs}
                onTabClick={tabClick}
                onCloseTab={tabClose}
              />
              <SimpleMDE
                key={activeFile && activeFile.id}
                value={activeFile && activeFile.body}
                onChange={value => {
                  fileChange(activeFile.id, value);
                }}
                options={{
                  minHeight: '515px',
                }}
              />
              {activeFile.isSynced && (
                <span className="sync-status">
                  已同步，上次同步{timestampToString(activeFile.updatedAt)}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
