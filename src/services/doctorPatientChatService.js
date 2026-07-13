import { doctorAxios, patientAxios } from "../axios";
import reduxStore from "../redux";
import { io } from "socket.io-client";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

let socketInstance = null;
let socketRole = null;

const getClient = (role) => (role === "doctor" ? doctorAxios : patientAxios);

const getToken = (role) => {
  const state = reduxStore.getState();
  return role === "doctor" ? state.doctor?.token : state.patient?.token;
};

const createChatRoomFromBooking = (bookingId, role = "patient") =>
  getClient(role).post("/api/chat-rooms/create-from-booking", { bookingId });

const getMyChatRooms = (role = "patient") =>
  getClient(role).get("/api/chat-rooms/my-rooms");

const getChatRoomMessages = (roomId, params = {}, role = "patient") => {
  const page = params.page || 1;
  const limit = params.limit || 50;
  return getClient(role).get(
    `/api/chat-rooms/${encodeURIComponent(roomId)}/messages?page=${page}&limit=${limit}`
  );
};

const sendChatRoomMessage = (roomId, message, role = "patient") =>
  getClient(role).post(`/api/chat-rooms/${encodeURIComponent(roomId)}/messages`, {
    message,
    messageType: "TEXT",
  });

const markChatRoomRead = (roomId, role = "patient") =>
  getClient(role).patch(`/api/chat-rooms/${encodeURIComponent(roomId)}/read`);

const connectChatSocket = (role = "patient") => {
  const token = getToken(role);
  if (!token) return null;

  if (socketInstance && socketRole === role) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
  }

  socketRole = role;
  socketInstance = io(API_BASE_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  return socketInstance;
};

const disconnectChatSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
  }

  socketInstance = null;
  socketRole = null;
};

export {
  createChatRoomFromBooking,
  getMyChatRooms,
  getChatRoomMessages,
  sendChatRoomMessage,
  markChatRoomRead,
  connectChatSocket,
  disconnectChatSocket,
};
