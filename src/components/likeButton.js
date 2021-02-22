import React, { useState, useEffect } from 'react';
import useMouse from '../hooks/useMouse';

const LikeButton = () => {
  const [like, setLike] = useState(0);
  const position = useMouse();
  useEffect(() => {
    document.title = `点击了${like}次`;
  });
  return (
    <div className="box">
      <button
        onClick={() => {
          setLike(like + 1);
        }}
      >
        {like}--qqqq
      </button>
      <h2>
        {position.x} -- {position.y}
      </h2>
    </div>
  );
};

export default LikeButton;
