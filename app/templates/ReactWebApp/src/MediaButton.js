import React, { Component } from 'react';



class MediaButton extends React.Component{
    handleClickCamera(){
        window.postMessage("camera!");

    }
    handleClickGallery(){
        window.postMessage("gallery!");

    }

    render(){
        return(
            <div>
            <button onClick={(e)=>
            this.handleClickCamera(e)}>
               Camera
            </button>
            <button onClick={(e)=>
            this.handleClickGallery(e)}>
                Gallery
            </button>
            </div>
        )
    }
}
export default MediaButton;