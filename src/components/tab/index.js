import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import './tabList.scss';

const TabList = ({ files, activedId, unsaveIds, onTabClick, onCloseTab }) => {
  console.log('--unsaveIds-----', unsaveIds, files);

  return (
    <ul className="nav nav-pills tabList-component">
      {files.map(file => {
        const withUnsaveMark = unsaveIds.includes(file.id);
        const fclassName = classnames({
          'nav-link': true,
          active: file.id === activedId,
          withUnsaved: withUnsaveMark,
        });
        return (
          <li className="nav-item" key={file.id}>
            <a
              href="#"
              className={fclassName}
              onClick={e => {
                e.preventDefault();
                onTabClick(file.id);
              }}
            >
              {file.title}
              <span
                className="ml-2 close-icon"
                onClick={e => {
                  e.stopPropagation();
                  onCloseTab(file.id);
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </span>
              {withUnsaveMark && <span className="rounded-circle unsaved-icon ml-2"></span>}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

TabList.propTypes = {
  files: PropTypes.array,
  activedId: PropTypes.string,
  unsaveIds: PropTypes.array,
  onTabClick: PropTypes.func,
  onCloseTab: PropTypes.func,
};

TabList.defaultProps = {
  unsaveIds: [],
};

export default TabList;
