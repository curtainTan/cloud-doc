import React from 'react';
import { faCloudUploadAlt, faFont } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom'


const ToolList = () => {
    const tools = [
        {
            name: "上传图片",
            icon: faCloudUploadAlt,
            color: "rgb(123, 230, 194)",
            to: '/tools/upload-img',
        },
        {
            name: "图文识别",
            icon: faFont,
            color: "rgb(144, 230, 123)",
            to: '/tools/img-to-text',
        }
    ]
    return (
        <div className="tools-page">
            { tools.map(item => {
                return (
                    <Link key={ item.name } to={ `${item.to}` } >
                        <div className="tools-item" >
                            <div className="tools-item--icon" >
                                <FontAwesomeIcon size="5x" icon={ item.icon } color={ item.color } />
                            </div>
                            <span>{ item.name }</span>
                        </div>
                    </Link>
                )
            }) }
        </div>
    )
}

export default ToolList
