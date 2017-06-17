import io from 'socket.io-client'

const clientSocket = io(window.location.origin);

(() => {
    clientSocket.on('tweet', (tweet) => {
        console.log(tweet);
    })
})();

export default clientSocket;