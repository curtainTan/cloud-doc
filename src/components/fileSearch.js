import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

import useKeyPress from '../hooks/useKeyPress';
import useIpcRenderer from '../hooks/useIpcRenderer';

const FileSearch = ({ title, onFileSearch }) => {
  const [inputActive, setInputActive] = useState(false);
  const [value, setValue] = useState('');
  const enterPressed = useKeyPress(13);
  const escPressed = useKeyPress(27);
  const closeSearch = () => {
    setInputActive(false);
    setValue('');
    onFileSearch('');
  };
  const node = useRef(null);
  useEffect(() => {
    inputActive && node.current.focus();
  }, [inputActive]);

  useEffect(() => {
    if (enterPressed && inputActive) {
      onFileSearch(value);
    }
    if (escPressed && inputActive) {
      closeSearch();
    }
  });

  useIpcRenderer({
    'search-file': () => {
      setInputActive(true);
    },
  });

  return (
    <div className="file-search alert alert-primary d-flex justify-content-between align-items-center mb-0">
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
