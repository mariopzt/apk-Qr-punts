import { io } from "socket.io-client";

const URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000"; // Cambiado a 5000 para coincidir con backend

export const socket = io(URL, { autoConnect: false });
