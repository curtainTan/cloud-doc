import React, { useState, useEffect, useRef } from 'react';

const FileSearch = ({ title, onFileSearch }) => {
  const [inputActive, setInputActive] = useState(false);
  const [value, setValue] = useState('');
  const closeSearch = (e = new Event()) => {
    e.preventDefault();
    setInputActive(false);
    setValue('');
  };
  const node = useRef(null);
  useEffect(() => {
    inputActive && node.current.focus();
  }, [inputActive]);

  useEffect(() => {
    const handleInputEvent = e => {
      console.log('--------keycode---------');
      const { keyCode } = e;
      if (keyCode === 13 && inputActive) {
        // onFileSearch(value);
        console.log('-------value---------', value);
      }
      if (keyCode === 27 && inputActive) {
        closeSearch(e);
      }
    };
    document.addEventListener('keyup', handleInputEvent);
    return () => {
      document.removeEventListener('keyup', handleInputEvent);
    };
  });

  return (
    <div className="alert alert-primary">
      {!inputActive ? (
        <div className="d-flex justify-content-between align-items-center">
          <span>{title}</span>
          <button
            className="btn btn-primary"
            onClick={() => {
              setInputActive(true);
            }}
          >
            搜索
          </button>
        </div>
      ) : (
        <div className="row">
          <input
            className="form-control col-8"
            value={value}
            ref={node}
            onChange={e => {
              setValue(e.target.value);
            }}
          />
          <button className="btn btn-primary col-4" onClick={closeSearch}>
            关闭
          </button>
        </div>
      )}
    </div>
  );
};

export default FileSearch;
