import React, { useState } from 'react';

import BottomBtn from '../components/BottomBtn';
import useIpcRenderer from '../hooks/useIpcRenderer';

const Store = window.require('electron-store');
const { ipcRenderer } = window.require('electron');
const userStore = new Store({ name: 'user-info' });

const UserPage = () => {
  const [userInfo, setUserInfo] = useState(userStore.get('userData'));

  const openLogin = () => {
    ipcRenderer.send('open-login-window');
  };

  const loginSuccess = () => {
    // 发送请求获取用户信息
    const userData = userStore.get('userData');
    setUserInfo(userData);
    console.log('--------------userData', userData);
  };

  const logout = () => {
    console.log('点击退出--');
    setUserInfo(null);
    const userData = userStore.set('userData', null);
  };

  useIpcRenderer({
    'login-success': loginSuccess,
  });

  return (
    <div className="user-page col-11">
      {!userInfo && (
        <div onClick={openLogin}>
          <img src="https://wiki.connect.qq.com/wp-content/uploads/2016/12/Connect_logo_5.png" />
        </div>
      )}
      {userInfo && (
        <div className="user-warp">
          <div className="user-warp__header">
            <img className="avatar" src={userInfo.qqinfo.figureurl_2} />
          </div>
          <div className="user-warp__about">
            <div className="user-name">
              <h3>昵称：{userInfo.qqinfo.nickname}</h3>
            </div>
            <div className="user-city">
              <h3>城市：{userInfo.qqinfo.city}</h3>
            </div>
            <div className="user-quit">
              <BottomBtn text="退出" onBtnClick={logout} colorClass="btn-primary" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
