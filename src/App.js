import React from 'react';
import FileSearch from './components/fileSearch';

function App() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-4 left-panel">
          <FileSearch title="我的云文档" onFileSearch={() => {}} />
        </div>
        <div className="col-8 bg-primary right-panel">
          <h2>我是右侧</h2>
        </div>
      </div>
    </div>
  );
}

export default App;
