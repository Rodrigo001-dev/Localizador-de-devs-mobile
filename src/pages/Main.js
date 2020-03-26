import React, { useState, useEffect } from 'react'; // Para a gente axecutar alguma coisa assim que o componente é montado em tela uma unica vez utilizamos o useEffect 
import { StyleSheet, Image, View, Text, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps'; // Não é necessário colocar chaves porque o MapView é a exportação padrão do react-native-maps
import { requestPermissionsAsync, getCurrentPositionAsync } from 'expo-location'; // requestPermissionsAsync = pedir permissão para o usúario se pode usar a sua localização, getCurrentPositionAsync = para pegar a localização do usúario
import { MaterialIcons } from '@expo/vector-icons';

import api from '../services/api';
import { connect, disconnect, subscribeToNewDevs } from '../services/socket';

function Main({ navigation }) {
    const [devs, setDevs] = useState([]);
    const [currentRegion, setCurrentRegion] = useState(null); // Não vai ter nenhuma região de inicio, currentRegion = Região do mapa que o usuario está
    const [techs, setTechs] = useState('');

    useEffect(() =>{     // Coloamos o useEffect dentro do nosso componente aí ele recebe a função(=>) e depois um [] de dependencias(quando essa função deve executar), e se deixamos o [] vazio ele executa apenas uma vez
        async function loadInitialPosition() {     // Como nós vamos fazer uma chamada assincrona utilizamos o async function
            const { granted } = await requestPermissionsAsync();  // loadInitialPosition = carregar a posição inicial no mapa

            if (granted) {
                const { coords } = await getCurrentPositionAsync({
                    enableHighAccuracy: true, // Para isso funcionar no celular é preciso estár com o GPS abilitado
                });

                const { latitude, longitude } = coords;

                setCurrentRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.04, // O latitude e  o longitude Delta são calculos navais para obter o zoom dentro do mapa
                    longitudeDelta: 0.04,
                })
            }
        }  

        loadInitialPosition();
    }, []) 

    useEffect(() => {
        subscribeToNewDevs(dev => setDevs([...devs, dev])); // dev = data
    }, [devs]); // O UseEffect dispara uma função toda vez que uma váriavel muda de valor

    function setupWebsocket() {
        disconnect();

        const { latitude, longitude } = currentRegion;

        connect(
            latitude,
            longitude,
            techs,
        );
    }

    async function loadDevs(){
        const { latitude, longitude } = currentRegion;

        const response = await api.get('/search', {
            params: {
                latitude,
                longitude,
                techs,
            }
        });

        setDevs(response.data.devs);
        setupWebsocket(); // Existe uma grande probabilidade de a função setupWebSocket ser executada antes da função setDevs
    }

    function handleRegionChanged(region) {
        setCurrentRegion(region);
    }

    if (!currentRegion) {     // Se o currentRegion for nulo
        return null; 
    }

    return (
    <>
        <MapView onRegionChangeComplete={handleRegionChanged} initialRegion={currentRegion} style={styles.map} >  
           {devs.map(dev => (
                <Marker key={dev._id} coordinate={{ latitude: dev.location.coordinates[1], longitude: dev.location.coordinates[0] }} >
                <Image style={styles.avatar} source={{ uri: dev.avatar_url }} />

                <Callout onPress={() => {  // => = arrow function(função flecha)
                    navigation.navigate('Profile', { github_username: dev.github_username }) // Navagação
                }} > // É tudo  que vai aparecer quando eu clicar no avatar
                    <View style={styles.callout} >
                        <Text style={styles.devName} >{dev.name}</Text>
                        <Text style={styles.devBio} >{dev.bio}</Text>
                        <Text style={styles.devTechs} >{dev.techs.join(', ')}</Text>
                    </View>
                </Callout>
            </Marker>
           ))}
        </MapView>  // Quando eu quero incluir um código JavaScript no HTML(JSX) eu sempre coloco as chaves, mas para declarar um objeto no JavaScript eu utilizo chaves
        <View style={styles.searchForm} >
            <TextInput 
                style={styles.searchInput} 
                placeholder="Buscar devs por techs..."
                placeholderTextColor="#999"
                autoCapitalize="words" // Ele vai colocar a primeira letra de cada palavra como caixa alta
                autoCorrect={false}
                value={techs}
                onChangeText={setTechs} // Retorna diretamente o texto excrito
            />

            <TouchableOpacity onPress={loadDevs} style={styles.loadButton} >
                <MaterialIcons name="my-location" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    </>
    );
         
}

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },

    avatar: {
        width: 54,
        height: 54,
        borderRadius: 4,
        borderWidth: 4,
        borderColor: '#fff',
    },

    callout: {
        width: 260,
    },

    devName: {
        fontWeight: 'bold',
        fontSize: 16,
    },

    devBio: {
        color: '#666',
        marginTop: 5,
    },  


    devTechs: {
        marginTop: 5,
    },

    searchForm: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        zIndex: 5,
        flexDirection: 'row', // no React native, todos os elementos, todos os componentes por padrão eles já possuem display flex
    },

    searchInput: {
        flex: 1,
        height: 50,
        backgroundColor: '#fff',
        color: '#333',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 4,
            height: 4,
        },
        elevation: 2,
    },  

    loadButton: {
        width: 50,
        height: 50,
        backgroundColor: '#8e4dff',
        borderRadios: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15,
    },
})

export default Main;