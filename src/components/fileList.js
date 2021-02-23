import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faMarkdown } from '@fortawesome/free-brands-svg-icons';
import PropTypes from 'prop-types';
import useKeyPressed from '../hooks/useKeyPress';

const FileList = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {
  const [editState, setEditState] = useState(false);
  const [value, setValue] = useState('');

  const enterPress = useKeyPressed(13);
  const escPress = useKeyPressed(27);

  const closeEdit = () => {
    setEditState(false);
    setValue('');
  };

  useEffect(() => {
    if (enterPress && editState) {
      const editItem = files.find(file => file.id === editState);
      onSaveEdit(editItem.id, value);
      setEditState(false);
      setValue('');
    }
    if (escPress && editState) {
      closeEdit();
    }
  }, [editState]);

  return (
    <ul className="list-group file-list list-group-flush">
      {files.map(item => (
        <li
          className="row list-group-item bg-light d-flex align-items-center file-item"
          key={item.id}
        >
          {editState !== item.id && (
            <>
              <span className="col-1">
                <FontAwesomeIcon icon={faMarkdown} />
              </span>
              <span
                className="col-8 c-link"
                onClick={() => {
                  onFileClick(item.id);
                }}
              >
                {item.title}
              </span>
              <button
                className="icon-btn col-1"
                onClick={() => {
                  setEditState(item.id);
                  setValue(item.title);
                }}
              >
                <FontAwesomeIcon title="编辑" icon={faEdit} />
              </button>
              <button className="icon-btn col-1" onClick={() => {}}>
                <FontAwesomeIcon title="删除" icon={faTrash} />
              </button>
            </>
          )}
          {editState === item.id && (
            <>
              <input
                className="form-control col-10"
                value={value}
                onChange={e => {
                  setValue(e.target.value);
                }}
              />
              <button className="icon-btn col-2" onClick={closeEdit}>
                <FontAwesomeIcon title="关闭" icon={faTimes} />
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

FileList.propTypes = {
  files: PropTypes.array,
  onFileClick: PropTypes.func,
  onFileDelete: PropTypes.func,
  onSaveEdit: PropTypes.func,
};

export default FileList;
