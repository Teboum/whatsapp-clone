import socketio from "socket.io-client";

const ENDPOINT = "http://localhost:9000";

export const socket = socketio.connect(ENDPOINT);

export const socketContext = React.createContext();
