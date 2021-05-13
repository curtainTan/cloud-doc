import React, { useState } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import useIpcRenderer from '../../hooks/useIpcRenderer';
import BackBtn from '../../components/BackBtn'

const { ipcRenderer, clipboard } = window.require('electron');

const ImgToTextPage = () => {
    const [ imageSrc, setimageSrc ] = useState('')
    const [ textList, setTextList ] = useState([])

    const changeHandler = ( e ) => {
        const file = e.target.files[0]
        let render
        if( file ) {
            render = new FileReader()
            render.readAsDataURL( file )
            render.onload = function(e){
                setimageSrc( e.target.result )
            }
        }
    }

    const uploadImage = () => {
        imageSrc && ipcRenderer.send( 'image-to-text', {
            result: imageSrc
        })
    }

    const clipboardHandler = ( text ) => {
        clipboard.writeText( text )
    }

    const setResult = ( event, res ) => {
        console.log( '最后的结果：', res )
        setTextList( res.words_result )
    }

    const clipboardAllHandler = () => {
        let str = ''
        textList.forEach( item => {
            str += `${item.words}\n`
        })
        clipboard.writeText( str )
    }

    useIpcRenderer({
        'image-to-texted': setResult,
    })
    return (
        <div className="imageToTextPage row">
            <div className="uploadImagePage-back" >
                <BackBtn />
            </div>
            <div className="center-box col-10 col-md-11 col-sm-11 col-lg-10" >
                <div className="upload-title" >图文识别</div>
                <div className="row" >
                    <div className="img-to-text__left col-6" >
                        <label htmlFor="upload-input" className="upload-label" >
                            {
                                !imageSrc && <div className="icon-plus"> <FontAwesomeIcon size="4x" color="rgb(38, 112, 248)" icon={ faPlus } /></div>
                            }
                            {
                                imageSrc && <div className="imgToText-box" style={{ backgroundImage: `url(${ imageSrc })` }} ></div>
                            }
                        </label>
                        <input id="upload-input" type="file" accept="image/*" onChange={ changeHandler } />
                        <div>
                            <button className="btn btn-primary" onClick={ uploadImage } >文字识别</button>
                        </div>
                    </div>
                    <div className="img-to-text__right col-6">
                        <div className="img-to-text__right-title" >
                            识别结果
                        </div>
                        <div className="text-list list-group">
                            { !textList.length && <div className="imgToText__no-result" >暂无结果...</div> }
                            { textList.length > 0 && textList.map( (item, index) => {
                                return (
                                    <div className="textItem list-group-item list-group-item-action row" key={ index } >
                                        <span className="col-1" >{ index }</span>
                                        <span className="col-9 col-md-7" >{ item.words }</span>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary col-2"
                                            onClick={ () => { clipboardHandler( item.words ) } }
                                        >copy</button>
                                    </div>
                                )
                            })}
                            {
                                textList.length > 0 && (
                                    <div className="copy-all" >
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={ clipboardAllHandler }
                                        >复制所有文本</button>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ImgToTextPage
