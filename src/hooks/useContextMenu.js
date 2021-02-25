import { useEffect, useRef } from 'react';

const { remote } = window.require('electron');
const { Menu, MenuItem } = remote;

const useContextMenu = (itemArr = [], targetSelector, deps) => {
  let clickElement = useRef(null);
  useEffect(() => {
    const menu = new Menu();
    itemArr.forEach(element => {
      menu.append(new MenuItem(element));
    });
    const handleContextMenu = e => {
      // 被 targetSelector 包含的区域才显示
      const contextArea = document.querySelector(targetSelector);
      if (contextArea && contextArea.contains(e.target)) {
        clickElement.current = e.target;
        menu.popup({ window: remote.getCurrentWindow() });
      }
    };
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, deps);
  return clickElement;
};

export default useContextMenu;
