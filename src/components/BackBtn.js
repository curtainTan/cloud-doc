import React, { useState } from 'react';
import { faChevronCircleLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const BackBtn = () => {
    const back = () => {
        window.history.go(-1)
    }
    return (
        <FontAwesomeIcon size='4x' icon={ faChevronCircleLeft } onClick={back} color="rgb(123, 230, 194)" />
    )
}

export default BackBtn
