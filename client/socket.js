import io from 'socket.io-client'

export default io(window.location.origin);