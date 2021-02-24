import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faMarkdown } from '@fortawesome/free-brands-svg-icons';
import PropTypes from 'prop-types';
import useKeyPressed from '../hooks/useKeyPress';

const FileList = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {
  const [editState, setEditState] = useState(false);
  const [value, setValue] = useState('');

  const node = useRef(null);

  const enterPress = useKeyPressed(13);
  const escPress = useKeyPressed(27);

  const closeEdit = editorItem => {
    setEditState(false);
    setValue('');
    if (editorItem.isNew) {
      onFileDelete(editorItem.id);
    }
  };

  useEffect(() => {
    const newFile = files.find(file => file.isNew);
    if (newFile) {
      setEditState(newFile.id);
      setValue(newFile.title);
      node.current.focus();
    }
  }, [files]);

  useEffect(() => {
    const editItem = files.find(file => file.id === editState);
    if (enterPress && editState && value.trim() !== '') {
      onSaveEdit(editItem.id, value);
      setEditState(false);
      setValue('');
    }
    if (escPress && editState) {
      closeEdit(editItem);
    }
  });

  return (
    <ul className="list-group file-list list-group-flush">
      {files.map(item => (
        <li
          className="row list-group-item bg-light d-flex align-items-center file-item mx-0"
          key={item.id}
        >
          {editState !== item.id && !item.isNew && (
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
              <button
                className="icon-btn col-1"
                onClick={() => {
                  onFileDelete(item.id);
                }}
              >
                <FontAwesomeIcon title="删除" icon={faTrash} />
              </button>
            </>
          )}
          {(editState === item.id || item.isNew) && (
            <>
              <input
                className="form-control col-10"
                value={value}
                placeholder="请输入标题"
                ref={node}
                onChange={e => {
                  setValue(e.target.value);
                }}
              />
              <button
                className="icon-btn col-2"
                onClick={() => {
                  closeEdit(item);
                }}
              >
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
