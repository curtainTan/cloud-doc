import React from 'react';
import { faCog, faUser, faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';

import './index.css';

const navData = [
  {
    to: '/',
    icon: faHome,
  },
  {
    to: '/user',
    icon: faUser,
  },
  {
    to: '/setting',
    icon: faCog,
  },
];

const Nav = () => {
  return (
    <div className="nav flex-column col-1">
      {navData.map(nav => {
        return (
          <NavLink exact key={nav.to} className="nav-link" activeClassName="selected" to={nav.to}>
            <FontAwesomeIcon icon={nav.icon} size="lg" />
          </NavLink>
        );
      })}
    </div>
  );
};

export default Nav;
