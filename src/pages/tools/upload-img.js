import React, { useState } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import useIpcRenderer from '../../hooks/useIpcRenderer';
import BackBtn from '../../components/BackBtn'


const { ipcRenderer, clipboard } = window.require('electron');

const UploadImgPage = () => {
    const [ file, setFile ] = useState({})
    const [ imageSrc, setimageSrc ] = useState('')
    const [ imageList, setImageList ] = useState([])

    const changeHandler = ( e ) => {
        const file = e.target.files[0]
        let render
        if( file ) {
            setFile( file )
            render = new FileReader()
            render.readAsDataURL( file )
            render.onload = function(e){
                setimageSrc( e.target.result )
            }
        }
    }
    const uploadImage = () => {
        const name = `${Date.now()}-${ file.name }`
        ipcRenderer.send( 'upload-img', {
            name,
            path: file.path,
        })
    }
    const uploadedFile = ( event, data ) => {
        const imgSrc = 'http://yu-img.curtaintan.club/' + data.key
        const time = new Date()
        let timeData = time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds()
        const item = {
            imgSrc,
            timeData,
        }
        setImageList([ item, ...imageList ])
    }
    const clipboardHandler = ( imgSrc ) => {
        clipboard.writeText( imgSrc )
    }
    useIpcRenderer({
        'uploaded-file': uploadedFile,
    })
    return (
        <div className="uploadImagePage row">
            <div className="uploadImagePage-back" >
                <BackBtn />
            </div>
            <div className="center-box col-8 .col-md-12 .col-sm-12 .col-lg-8" >
                <div className="upload-title" >图片上传</div>
                <div className="upload-top" >
                    <label htmlFor="upload-input" className="upload-label" >
                        {
                            !imageSrc && <div className="icon-plus"> <FontAwesomeIcon size="4x" color="rgb(38, 112, 248)" icon={ faPlus } /></div>
                        }
                        {
                            imageSrc && <div className="uploadimg-box" style={{ backgroundImage: `url(${ imageSrc })` }} ></div>
                        }
                    </label>
                    <input id="upload-input" type="file" accept="image/*" onChange={ changeHandler } />
                    <div>
                        <button className="btn btn-primary" onClick={ uploadImage } >上传</button>
                    </div>
                </div>
                <div className="upload-clipboard list-group">
                    {
                        imageList.map( item => {
                            return (
                                 <div className="srcItem list-group-item list-group-item-action row" key={ item.imgSrc } >
                                    <span className="col-2 upload-time" >{ item.timeData }</span>
                                    <span className="col-9" >{ item.imgSrc }</span>
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary col-1"
                                        onClick={ () => { clipboardHandler( item.imgSrc ) } }
                                    >copy</button>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default UploadImgPage
