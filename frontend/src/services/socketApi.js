import { API_URL, getToken } from "./api.js";

let loaderPromise = null;
let socketInstance = null;

function loadSocketClient() {
  if (window.io) return Promise.resolve(window.io);
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${API_URL}/socket.io/socket.io.js`;
    script.async = true;
    script.onload = () => window.io ? resolve(window.io) : reject(new Error("Client Socket.IO indisponible."));
    script.onerror = () => reject(new Error("Impossible de charger Socket.IO depuis le backend."));
    document.head.appendChild(script);
  });
  return loaderPromise;
}

export async function getSocket() {
  if (socketInstance?.connected) return socketInstance;
  const io = await loadSocketClient();
  if (socketInstance) socketInstance.disconnect();
  socketInstance = io(API_URL, { auth: { token: getToken() } });
  return socketInstance;
}

export function closeSocket() {
  socketInstance?.disconnect();
  socketInstance = null;
}
