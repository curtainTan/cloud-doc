import React, { useState } from 'react';
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons';
import SimpleMDE from 'react-simplemde-editor';

import FileSearch from './components/fileSearch';
import filesData from './utils/defaultFiles';
import FileList from './components/fileList';
import BottomBtn from './components/BottomBtn';
import TabList from './components/tab/index';

import './app.css';

function App() {
  const [files, setFiles] = useState(filesData);
  const [activeFileID, setActiveFileId] = useState('');
  const [openedFileIDs, setOpenedFileIDs] = useState([]);
  const [unsavedFileIDs, setUnsavedFileIDs] = useState([]);

  const activeFile = files.find(file => file.id === activeFileID);

  const openedFiles = openedFileIDs.map(openID => {
    return files.find(file => file.id === openID);
  });

  return (
    <div className="container-fluid px-0">
      <div className="row no-gutters">
        <div className="col-4 left-panel">
          <FileSearch onFileSearch={() => {}} />
          <FileList
            files={files}
            onFileDelete={() => {}}
            onFileClick={() => {}}
            onSaveEdit={(id, newTitle) => {
              console.log('-----save--', id, newTitle);
            }}
          />
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn text="新建" colorClass="btn-primary" icon={faPlus} />
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
                onTabClick={id => {
                  console.log('---id--', id);
                }}
                onCloseTab={id => {
                  console.log('delete----', id);
                }}
              />
              <SimpleMDE
                value={activeFile && activeFile.body}
                onChange={val => {
                  console.log(val);
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
