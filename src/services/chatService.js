import { patientAxios } from "../axios";

const API_BASE_URL =
  process.env.REACT_APP_NODE_API_BASE_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:8080";

const getChatSessions = async () => {
  const response = await patientAxios.get("/api/chat/sessions", { baseURL: API_BASE_URL });
  return response?.data || [];
};

const createChatSession = async () => {
  const response = await patientAxios.post("/api/chat/sessions", {}, { baseURL: API_BASE_URL });
  return response?.data || null;
};

const getChatSessionMessages = async (sessionId) => {
  const response = await patientAxios.get(
    `/api/chat/sessions/${sessionId}/messages`,
    { baseURL: API_BASE_URL }
  );
  return response?.data || [];
};

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
    if (data?.reply) {
      return data;
    }
    throw new Error(data?.reply || data?.message || "Không thể kết nối chatbot.");
  }
};

export {
  API_BASE_URL,
  getChatSessions,
  createChatSession,
  getChatSessionMessages,
  sendChatMessage,
};
