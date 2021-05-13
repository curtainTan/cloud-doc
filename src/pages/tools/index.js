import React, { useState } from 'react';
import { faCloudUploadAlt, faFont } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, Switch, Route } from 'react-router-dom'

import UploadImgPage from './upload-img'
import ImgToTextPage from './img-to-text'
import ToolList from './tool-list'
import './tools.css'

const ToolsPage = () => {
    return (
        <div className="col-11" >
            <Switch>
                <Route exact path="/tools" >
                    <ToolList />
                </Route>
                <Route path="/tools/upload-img">
                    <UploadImgPage />
                </Route>
                <Route path="/tools/img-to-text">
                    <ImgToTextPage />
                </Route>
            </Switch>
        </div>
    )
}

export default ToolsPage
