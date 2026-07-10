import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import {
  createChatSession,
  getChatSessionMessages,
  getChatSessions,
  sendChatMessage,
} from "../../../../services/chatService";
import logoSrc from "../../../../assets/logo2.png";
import ChatMessage from "./ChatMessage";
import DoctorCard from "./DoctorCard";
import SlotCard from "./SlotCard";

const NETWORK_ERROR_MESSAGE = "Có lỗi xảy ra khi kết nối chatbot. Vui lòng thử lại.";

const normalizeMessage = (message, fallbackId) => ({
  id: message.id || fallbackId,
  role: message.role === "user" ? "user" : "bot",
  text: message.text || message.message || "",
  state: message.state || "",
  data: message.data || {},
});

const formatSessionTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Chatbot = ({ history, isLoggedIn, patientName }) => {
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorText, setErrorText] = useState("");
  const threadRef = useRef(null);

  const latestBotMessageId = useMemo(() => {
    const latest = [...messages].reverse().find((message) => message.role === "bot");
    return latest?.id;
  }, [messages]);

  const currentState = useMemo(() => {
    const latest = [...messages].reverse().find((message) => message.role === "bot");
    return latest?.state || "";
  }, [messages]);

  const refreshSessions = useCallback(async () => {
    const items = await getChatSessions();
    setSessions(items);
    return items;
  }, []);

  const loadMessages = useCallback(async (nextSessionId) => {
    if (!nextSessionId) return;

    setLoadingMessages(true);
    setErrorText("");

    try {
      const rows = await getChatSessionMessages(nextSessionId);
      setSessionId(nextSessionId);
      setMessages(rows.map((item, index) => normalizeMessage(item, `${nextSessionId}-${index}`)));
    } catch (error) {
      setErrorText(error.message || NETWORK_ERROR_MESSAGE);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const startNewSession = useCallback(async () => {
    setLoadingMessages(true);
    setErrorText("");

    try {
      const created = await createChatSession();
      if (!created?.sessionId) return null;

      setSessions((items) => [created, ...items.filter((item) => item.sessionId !== created.sessionId)]);
      setSessionId(created.sessionId);
      setMessages([]);
      setInput("");
      return created;
    } catch (error) {
      setErrorText(error.message || NETWORK_ERROR_MESSAGE);
      return null;
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setSessions([]);
      setSessionId("");
      setMessages([]);
      return;
    }

    let mounted = true;

    const init = async () => {
      setLoadingSessions(true);
      setErrorText("");

      try {
        const items = await getChatSessions();
        if (!mounted) return;

        setSessions(items);
        if (items[0]?.sessionId) {
          await loadMessages(items[0].sessionId);
          return;
        }

        await startNewSession();
      } catch (error) {
        if (mounted) {
          setErrorText(error.message || NETWORK_ERROR_MESSAGE);
        }
      } finally {
        if (mounted) {
          setLoadingSessions(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [isLoggedIn, loadMessages, startNewSession]);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, loading, loadingMessages]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading || !isLoggedIn) return;

    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const created = await startNewSession();
      activeSessionId = created?.sessionId || "";
    }
    if (!activeSessionId) return;

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: trimmed,
    };

    setMessages((items) => [...items, userMessage]);
    setInput("");
    setLoading(true);
    setErrorText("");

    try {
      const response = await sendChatMessage(activeSessionId, trimmed);
      const botMessage = {
        id: `${Date.now()}-bot`,
        role: "bot",
        text: response.reply || "Chatbot chưa có phản hồi.",
        state: response.state,
        data: response.data || {},
      };

      setMessages((items) => [...items, botMessage]);
      await refreshSessions();
    } catch (error) {
      setMessages((items) => [
        ...items,
        {
          id: `${Date.now()}-bot-error`,
          role: "bot",
          text: error.message || NETWORK_ERROR_MESSAGE,
          state: "ERROR",
          data: {},
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderOptions = (message) => {
    const isLatest = message.id === latestBotMessageId;
    if (!isLatest) return null;

    const doctors = message.data?.doctors || message.data?.recommended_doctors || [];
    const slots = (message.data?.slots || []).filter((slot) => Number(slot.hasActiveBooking) !== 1);

    if (message.state === "WAIT_SELECT_DOCTOR" && doctors.length) {
      return (
        <div className="chatbot-options">
          {doctors.map((doctor, index) => (
            <DoctorCard
              key={doctor.id || doctor.index || index}
              doctor={doctor}
              index={index}
              disabled={loading}
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
              disabled={loading}
              onSelect={sendMessage}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  if (!isLoggedIn) {
    return (
      <div className="chatbot-login-required">
        <img src={logoSrc} alt="BookingCare" />
        <h1>Đăng nhập để dùng BookingCare AI</h1>
        <p>Lịch sử hội thoại được lưu theo tài khoản bệnh nhân của bạn.</p>
        <button type="button" onClick={() => history.push("/login")}>
          <i className="fa-solid fa-right-to-bracket"></i>
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="chatbot-layout">
      <aside className="chatbot-sidebar">
        <button type="button" className="chatbot-brand" onClick={() => history.push("/home")}>
          <img src={logoSrc} alt="BookingCare" />
          <span>BookingCare AI</span>
        </button>

        <button
          type="button"
          className="chatbot-new-session"
          disabled={loadingMessages}
          onClick={startNewSession}
        >
          <i className="fa-solid fa-plus"></i>
          Tạo cuộc trò chuyện mới
        </button>

        <div className="chatbot-session-title">Lịch sử hội thoại</div>
        <div className="chatbot-session-list">
          {loadingSessions && <div className="chatbot-session-empty">Đang tải...</div>}
          {!loadingSessions && sessions.length === 0 && (
            <div className="chatbot-session-empty">Chưa có cuộc trò chuyện.</div>
          )}
          {sessions.map((item) => (
            <button
              type="button"
              key={item.sessionId}
              className={`chatbot-session-item ${item.sessionId === sessionId ? "active" : ""}`}
              disabled={loadingMessages || loading}
              onClick={() => loadMessages(item.sessionId)}
            >
              <span>{item.title || "Cuộc trò chuyện mới"}</span>
              <small>{formatSessionTime(item.updatedAt)}</small>
            </button>
          ))}
        </div>
      </aside>

      <section className="chatbot-shell" data-state={currentState}>
        <div className="chatbot-header">
          <div>
            <span className="chatbot-kicker">Trợ lý y tế</span>
            <h1>BookingCare AI assistant</h1>
            <p>{patientName ? `Xin chào ${patientName}, ` : ""}mô tả triệu chứng để tôi hỗ trợ tìm bác sĩ phù hợp.</p>
          </div>
        </div>

        <div className="chatbot-thread" ref={threadRef}>
          {errorText && <div className="chatbot-alert">{errorText}</div>}
          {loadingMessages && <div className="chatbot-loading">Đang tải hội thoại...</div>}
          {!loadingMessages && messages.length === 0 && (
            <div className="chatbot-empty">
              <strong>Bắt đầu với triệu chứng hoặc nhu cầu khám.</strong>
              <span>Ví dụ: Tôi đau vai sau khi chơi thể thao và muốn khám online hôm nay.</span>
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
            disabled={loading || loadingMessages}
            placeholder="Nhập tin nhắn..."
            onChange={(event) => setInput(event.target.value)}
          />
          <button type="submit" disabled={loading || loadingMessages || !input.trim()}>
            <i className="fa-solid fa-paper-plane"></i>
            Gửi
          </button>
        </form>
      </section>
    </div>
  );
};

const mapStateToProps = (state) => {
  const patient = state.patient || {};
  const user = patient.patientInfo || {};
  const patientName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return {
    isLoggedIn: Boolean(patient.isLoggedIn && patient.token),
    patientName,
  };
};

export default withRouter(connect(mapStateToProps)(Chatbot));
