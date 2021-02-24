import React, { useState } from 'react';
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons';
import SimpleMDE from 'react-simplemde-editor';
import { v4 as uuidv4 } from 'uuid';

import FileSearch from './components/fileSearch';
import filesData from './utils/defaultFiles';
import FileList from './components/fileList';
import BottomBtn from './components/BottomBtn';
import TabList from './components/tab/index';

import { flattenArr, objToArr } from './utils/dataHelper';
import fileHealper from './utils/fileHelper';
import './app.css';

const { join } = window.require('path');
const { remote } = window.require('electron');
const Store = window.require('electron-store');

const fileStore = new Store();

const saveFilesToStore = files => {
  // 不需要将所有的信息存入store
  const filesStoreObj = objToArr(files).reduce((result, file) => {
    const { id, path, title, createdAt } = file;
    result[id] = {
      id,
      path,
      title,
      createdAt,
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

  const activeFile = files[activeFileID];
  const filesArr = objToArr(files);
  const saveLocation = remote && remote.app && remote.app.getPath('documents');

  const openedFiles = openedFileIDs.map(openID => {
    return files[openID];
  });

  const fileListArr = searchfeFiles.length > 0 ? searchfeFiles : filesArr;

  const saveCurrentFile = () => {
    fileHealper
      .writeFile(join(saveLocation, `${activeFile.title}.md`), activeFile.body)
      .then(() => {
        setUnsavedFileIDs(unsavedFileIDs.filter(id => id !== activeFile.id));
      });
  };

  const fileClick = fileID => {
    // 设置currentID
    setActiveFileId(fileID);
    const currentFile = files[fileID];
    if (!currentFile.isLoaded) {
      fileHealper.readFile(currentFile.path).then(data => {
        const newFile = { ...files[fileID], body: data, isLoaded: true };
        setFiles({ ...files, [fileID]: newFile });
      });
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
        saveFilesToStore(files);
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
    const newPath = join(saveLocation, `${title}.md`);
    const modifiedFile = { ...files[id], title, isNew: false, path: newPath };
    const newFiles = { ...files, [id]: modifiedFile };
    if (isNew && saveLocation) {
      fileHealper.writeFile(newPath, files[id].body);
      setFiles(newFiles);
      saveFilesToStore(newFiles);
    } else {
      const oldPath = join(saveLocation, `${files[id].title}.md`);
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

  return (
    <div className="container-fluid px-0">
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
              <BottomBtn text="导入" colorClass="btn-success" icon={faFileImport} />
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
              <BottomBtn
                text="保存"
                onBtnClick={saveCurrentFile}
                colorClass="btn-primary"
                icon={faPlus}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
