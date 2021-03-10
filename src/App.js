import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';

import Home from './pages/home';
import Nav from './components/nav/index';
import UserPage from './pages/user';
import KeepAlive, { AliveScope } from './components/keepalive';

import './app.css';

function App() {
  return (
    <HashRouter>
      <AliveScope>
        <div className="container-fluid px-0">
          <div className="row no-gutters">
            <Nav />
            <Switch>
              <Route exact path="/">
                <KeepAlive id="Test">
                  <Home />
                </KeepAlive>
              </Route>
              <Route path="/user">
                <UserPage />
              </Route>
            </Switch>
          </div>
        </div>
      </AliveScope>
    </HashRouter>
  );
}

export default App;
