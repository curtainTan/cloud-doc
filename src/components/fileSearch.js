import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

import './fileSearch.css';

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
      const { keyCode } = e;
      if (keyCode === 13 && inputActive) {
        onFileSearch(value);
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
    <div className="file-search alert alert-primary d-flex justify-content-between align-items-center">
      {!inputActive ? (
        <>
          <span className="search-title">{title}</span>
          <button
            className="icon-btn"
            onClick={() => {
              setInputActive(true);
            }}
          >
            <FontAwesomeIcon title="搜索" icon={faSearch} size="lg" />
          </button>
        </>
      ) : (
        <>
          <input
            className="form-control"
            value={value}
            ref={node}
            onChange={e => {
              setValue(e.target.value);
            }}
          />
          <button className="icon-btn" onClick={closeSearch}>
            <FontAwesomeIcon title="关闭" icon={faTimes} size="lg" />
          </button>
        </>
      )}
    </div>
  );
};

FileSearch.propTypes = {
  title: PropTypes.string,
  onFileSearch: PropTypes.func.isRequired,
};

FileSearch.defaultProps = {
  title: '我的云文档',
};

export default FileSearch;
