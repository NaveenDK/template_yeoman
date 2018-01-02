import React, { Component } from 'react';
import {
  Platform,
  Text,
  View,
  WebView,
  TouchableHighlight,
  Button
} from 'react-native';
import {ImagePicker} from 'expo';

export default class testWebBridge extends React.Component {
  
    constructor( props ) {
      super( props );
      this.webView = null;
  }
  
  
render() {
      return (
       <View style= {{flex:1}}>
            <WebView          
              source={{uri:'https://blooming-tor-31315.herokuapp.com/'}}
              style={{ marginTop: 20  }} 
              ref={( webView ) => this.webView = webView}
              onMessage={
                (event)=>{
                  if(event.nativeEvent.data =="gallery!"){
                  console.log(event.nativeEvent.data)
                    this._pickImage()}
                  if(event.nativeEvent.data =="camera!"){
                 console.log(event.nativeEvent.data)
                    this._uploadImage()}
              }}
              />
        </View>
     )
    }

    _pickImage = async () => {
      let pickerResult = await ImagePicker.launchImageLibraryAsync({
        exif: true,
        allowsEditing: false,
        quality: 0.7,
        base64: true,
      })
  
      if (pickerResult.cancelled) {
        return
      }
  
      console.log(pickerResult)
  }
  
    _uploadImage = async() =>{
          let result = await ImagePicker.launchCameraAsync({
                  allowsEditing: true,
                 aspect: [4, 3],
                 });
    
              if (result.cancelled) {
                return;
              }
            let localUri = result.uri;
            let filename = localUri.split('/').pop();
    
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;
    
            let formData = new FormData();
            formData.append('photo', { uri: localUri, name: filename, type });

           console.log(formData);

            return await fetch(YOUR_SERVER_URL, {
              method: 'POST',
              body: formData,
              header: {
                'content-type': 'multipart/form-data',
              },
            });
  
          }
  }
  