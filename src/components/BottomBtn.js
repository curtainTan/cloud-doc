import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

const BottomBtn = ({ text, colorClass, icon, onBtnClick }) => {
  return (
    <button type="button" className={`btn btn-block no-border ${colorClass}`} onClick={onBtnClick}>
      {icon && <FontAwesomeIcon icon={icon} className="mr-2" />}
      {text}
    </button>
  );
};

BottomBtn.propTypes = {
  text: PropTypes.string,
  colorClass: PropTypes.string,
  icon: PropTypes.object,
  onBtnClick: PropTypes.func,
};

BottomBtn.defaultProps = {
  text: '新建',
};

export default BottomBtn;
