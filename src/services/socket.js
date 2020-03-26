import socketio from 'socket.io-client';

const socket = socketio('http://192.168.0.105:3333', {
    autoConnect: false,
});

function subscribeToNewDevs(subcribeFunction) {  // subcribeFunction = função de call back
    socket.on('new-dev', subcribeFunction); // Ela vai ouvir o evento new-dev e aí ela vai disparar a subcribeFunction assim que ela receber esse evento
}

function connect(latitude, longitude, techs) {
    socket.io.opts.query = {
        latitude,
        longitude,
        techs,
    };

    socket.connect();
}

function disconnect() {
    if (socket.connect) {
        socket.disconnect();
    }
}

export {
    connect,
    disconnect,
    subscribeToNewDevs,
};