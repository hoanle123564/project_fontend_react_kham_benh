import React, { useMemo, useState } from "react";
import { sendChatMessage } from "../../../../services/chatService";
import ChatMessage from "./ChatMessage";
import DoctorCard from "./DoctorCard";
import SlotCard from "./SlotCard";

const NETWORK_ERROR_MESSAGE = "Có lỗi xảy ra khi kết nối chatbot. Vui lòng thử lại.";

const createSessionId = () => {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getStoredSessionId = () => {
  const stored = localStorage.getItem("chat_session_id");
  if (stored) {
    return stored;
  }

  const sessionId = createSessionId();
  localStorage.setItem("chat_session_id", sessionId);
  return sessionId;
};

const Chatbot = () => {
  const [sessionId, setSessionId] = useState(getStoredSessionId);
  const [messages, setMessages] = useState([]);
  const [currentState, setCurrentState] = useState("");
  const [lastData, setLastData] = useState({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const latestBotMessageId = useMemo(() => {
    const latest = [...messages].reverse().find((message) => message.role === "bot");
    return latest?.id;
  }, [messages]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) {
      return;
    }

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: trimmed,
    };

    setMessages((items) => [...items, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendChatMessage(sessionId, trimmed);
      const botMessage = {
        id: `${Date.now()}-bot`,
        role: "bot",
        text: response.reply || "Chatbot chưa có phản hồi.",
        state: response.state,
        data: response.data || {},
      };

      setCurrentState(response.state || "");
      setLastData(response.data || {});
      setMessages((items) => [...items, botMessage]);
    } catch (error) {
      const botMessage = {
        id: `${Date.now()}-bot-error`,
        role: "bot",
        text: NETWORK_ERROR_MESSAGE,
        state: "ERROR",
        data: {},
      };

      setCurrentState("ERROR");
      setLastData({});
      setMessages((items) => [...items, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    const nextSessionId = createSessionId();
    localStorage.setItem("chat_session_id", nextSessionId);
    setSessionId(nextSessionId);
    setMessages([]);
    setCurrentState("");
    setLastData({});
    setInput("");
    setLoading(false);
  };

  const renderOptions = (message) => {
    const isLatest = message.id === latestBotMessageId;
    const doctors = message.data?.doctors || message.data?.recommended_doctors || [];
    const slots = message.data?.slots || [];

    if (message.state === "WAIT_SELECT_DOCTOR" && doctors.length) {
      return (
        <div className="chatbot-options">
          {doctors.map((doctor, index) => (
            <DoctorCard
              key={doctor.id || doctor.index || index}
              doctor={doctor}
              index={index}
              disabled={!isLatest || loading}
              onSelect={sendMessage}
            />
          ))}
        </div>
      );
    }

    if (message.state === "WAIT_SELECT_SLOT" && slots.length) {
      return (
        <div className="chatbot-options">
          {slots.map((slot, index) => (
            <SlotCard
              key={slot.id || slot.index || index}
              slot={slot}
              index={index}
              disabled={!isLatest || loading}
              onSelect={sendMessage}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="chatbot-shell" data-state={currentState} data-has-data={Object.keys(lastData).length > 0}>
      <div className="chatbot-header">
        <div>
          <h1>Chatbot đặt lịch khám</h1>
          <p>Mô tả triệu chứng, chọn bác sĩ và lịch khám qua trợ lý đặt hẹn.</p>
        </div>
        <button type="button" onClick={resetChat}>
          Bắt đầu lại
        </button>
      </div>

      <div className="chatbot-thread">
        {messages.length === 0 && (
          <div className="chatbot-empty">
            Nhập triệu chứng hoặc nhu cầu khám để bắt đầu.
          </div>
        )}
        {messages.map((message) => (
          <div key={message.id}>
            <ChatMessage message={message} />
            {renderOptions(message)}
          </div>
        ))}
        {loading && <div className="chatbot-loading">Chatbot đang trả lời...</div>}
      </div>

      <form
        className="chatbot-form"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage(input);
        }}
      >
        <input
          type="text"
          value={input}
          disabled={loading}
          placeholder="Nhập tin nhắn..."
          onChange={(event) => setInput(event.target.value)}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Gửi
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
