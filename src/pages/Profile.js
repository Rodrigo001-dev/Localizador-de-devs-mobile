import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

function Profile({ navigation }) {
    const githubUsername = navigation.getParam('github_username');  //Eu estou pegando um parametro de dentro da rota que eu to recebendo e o nome do parametro é githubUsername

    return <WebView style={{ flex: 1 }} source={{ uri: `https://github.com/${githubUsername}` }} /> // Se eu quiser incluir uma váriavel dentro de uma string eu tiro as '' simples e coloco ``
}

export default Profile;