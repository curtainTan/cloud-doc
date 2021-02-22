import React, { useEffect, useState } from 'react';

const useMouse = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const upDateMouse = (e = new Event()) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    document.addEventListener('click', upDateMouse);
    return () => {
      document.removeEventListener('click', upDateMouse);
    };
  });
  return position;
};

export default useMouse;
