import React from 'react';
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons';
import SimpleMDE from 'react-simplemde-editor';

import FileSearch from './components/fileSearch';
import filesData from './utils/defaultFiles';
import FileList from './components/fileList';
import BottomBtn from './components/BottomBtn';
import TabList from './components/tab/index';

import './components/fileSearch.css';

function App() {
  return (
    <div className="container-fluid px-0">
      <div className="row no-gutters">
        <div className="col-4 left-panel">
          <FileSearch onFileSearch={() => {}} />
          <FileList
            files={filesData}
            onFileDelete={() => {}}
            onFileClick={() => {}}
            onSaveEdit={(id, newTitle) => {
              console.log('-----save--', id, newTitle);
            }}
          />
          <div className="row no-gutters">
            <div className="col">
              <BottomBtn text="新建" colorClass="btn-primary" icon={faPlus} />
            </div>
            <div className="col">
              <BottomBtn text="导入" colorClass="btn-success" icon={faFileImport} />
            </div>
          </div>
        </div>
        <div className="col-8 right-panel">
          <TabList
            files={filesData}
            activedId="1"
            unsaveIds={['1']}
            onTabClick={id => {
              console.log('---id--', id);
            }}
            onCloseTab={id => {
              console.log('delete----', id);
            }}
          />
          <SimpleMDE
            value={filesData[1].body}
            onChange={val => {
              console.log(val);
            }}
            options={{
              minHeight: '515px',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
