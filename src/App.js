import React from 'react';
import FileSearch from './components/fileSearch';
import filesData from './utils/defaultFiles';
import FileList from './components/fileList';

import './components/fileSearch.css';

function App() {
  return (
    <div className="container-fluid">
      <div className="row">
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
        </div>
        <div className="col-8 bg-primary right-panel">
          <h2>我是右侧</h2>
        </div>
      </div>
    </div>
  );
}

export default App;
