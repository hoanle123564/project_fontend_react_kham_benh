import { patientAxios } from "../axios";

const API_BASE_URL =
  process.env.REACT_APP_NODE_API_BASE_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:8080";

const sendChatMessage = async (sessionId, message) => {
  try {
    return await patientAxios.post(
      "/api/chat/message",
      {
        session_id: sessionId,
        message,
      },
      { baseURL: API_BASE_URL }
    );
  } catch (error) {
    const data = error.response?.data;
    throw new Error(data?.reply || data?.message || "Không thể kết nối chatbot.");
  }
};

export { API_BASE_URL, sendChatMessage };
