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

const store = new Store();
store.set('name', 'wiki__');

function App() {
  const [files, setFiles] = useState(flattenArr(filesData));
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
    const newFile = { ...files[id], body: value };
    setFiles({ ...files, [id]: newFile });
    if (!unsavedFileIDs.includes(id)) {
      setUnsavedFileIDs([...unsavedFileIDs, id]);
    }
  };

  const deleteFile = id => {
    // 移除文件
    fileHealper.deleteFile(join(saveLocation, `${files[id] && files[id].title}.md`)).then(() => {
      delete files[id];
      setFiles(files);
    });
    // 移除打开的tab
    tabClose(id);
  };

  const fileSearch = keyWord => {
    // 筛选
    const newFiles = filesArr.filter(file => file.title.includes(keyWord));
    setSearchfeFiles(newFiles);
  };

  const updateFileName = (id, title, isNew) => {
    const modifiedFile = { ...files[id], title, isNew: false };
    if (isNew && saveLocation) {
      fileHealper.writeFile(join(saveLocation, `${title}.md`), files[id].body);
      setFiles({ ...files, [id]: modifiedFile });
    } else {
      fileHealper
        .renameFile(join(saveLocation, `${files[id].title}.md`), join(saveLocation, `${title}.md`))
        .then(res => {
          setFiles({ ...files, [id]: modifiedFile });
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
