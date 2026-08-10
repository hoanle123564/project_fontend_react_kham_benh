import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import {
  createChatSession,
  deleteChatSession,
  getChatSessionMessages,
  getChatSessions,
  renameChatSession,
  sendChatMessage,
} from "../../../../services/chatService";
import { getOnlineBookingPayment } from "../../../../services/onlineBookingPaymentService";
import logoSrc from "../../../../assets/logo2.png";
import ChatMessage from "./ChatMessage";
import DoctorCard from "./DoctorCard";
import SlotCard from "./SlotCard";

const NETWORK_ERROR_MESSAGE = "Có lỗi xảy ra khi kết nối chatbot. Vui lòng thử lại.";

const getChatErrorMessage = (error) =>
  error.response?.data?.errMessage || error.message || NETWORK_ERROR_MESSAGE;

const formatMoney = (value) => {
  const amount = Number(value);
  return Number.isInteger(amount) && amount > 0
    ? `${amount.toLocaleString("vi-VN")}đ`
    : "Chưa xác định";
};

const formatPaymentExpiry = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Chưa xác định"
    : date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

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

export const canCreateNewSession = (sessionId, messages) =>
  !sessionId || messages.some((message) => message.role === "user");

const Chatbot = ({ history, isLoggedIn, patientName }) => {
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [menuSessionId, setMenuSessionId] = useState("");
  const [renamingSession, setRenamingSession] = useState(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [renameError, setRenameError] = useState("");
  const [savingRename, setSavingRename] = useState(false);
  const [deleteSessionTarget, setDeleteSessionTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deletingSession, setDeletingSession] = useState(false);
  const [checkingPaymentId, setCheckingPaymentId] = useState("");
  const threadRef = useRef(null);
  const canCreateSessionRef = useRef(true);
  const paymentPollRef = useRef({ key: "", timer: null, inFlight: false });

  const latestBotMessageId = useMemo(() => {
    const latest = [...messages].reverse().find((message) => message.role === "bot");
    return latest?.id;
  }, [messages]);

  const currentState = useMemo(() => {
    const latest = [...messages].reverse().find((message) => message.role === "bot");
    return latest?.state || "";
  }, [messages]);

  const canCreateSession = canCreateNewSession(sessionId, messages);
  canCreateSessionRef.current = canCreateSession;

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
      setErrorText(getChatErrorMessage(error));
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const startNewSession = useCallback(async () => {
    if (!canCreateSessionRef.current) {
      return null;
    }

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
      setErrorText(getChatErrorMessage(error));
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

  const clearPaymentPolling = useCallback(() => {
    if (paymentPollRef.current.timer) {
      window.clearTimeout(paymentPollRef.current.timer);
    }
    paymentPollRef.current = { key: "", timer: null, inFlight: false };
  }, []);

  const applyPaymentStatus = useCallback((messageId, payment) => {
    setMessages((items) =>
      items.map((message) => {
        if (message.id !== messageId) return message;

        const paid = payment?.status === "PAID" && payment?.bookingId;
        return {
          ...message,
          text: paid
            ? `Thanh toán thành công. Mã lịch hẹn của bạn là ${payment.bookingId}.`
            : message.text,
          state: paid ? "BOOKING_CREATED" : message.state,
          data: {
            ...(message.data || {}),
            payment,
            ...(paid ? { booking: { id: payment.bookingId } } : {}),
          },
        };
      })
    );
  }, []);

  const checkPaymentStatus = useCallback(
    async (messageId, payment, silent = false) => {
      if (!payment?.paymentId) return null;

      try {
        const response = await getOnlineBookingPayment(payment.paymentId);
        if (response?.errCode !== 0 || !response?.data) {
          throw new Error(response?.errMessage || "Không thể kiểm tra thanh toán.");
        }

        const updatedPayment = { ...payment, ...response.data };
        applyPaymentStatus(messageId, updatedPayment);
        return updatedPayment;
      } catch (error) {
        if (!silent) setErrorText(getChatErrorMessage(error));
        return null;
      }
    },
    [applyPaymentStatus]
  );

  const startPaymentPolling = useCallback(
    (messageId, payment) => {
      if (!payment?.paymentId || payment.status !== "PENDING") return;

      const key = `${messageId}:${payment.paymentId}`;
      if (
        paymentPollRef.current.key === key &&
        (paymentPollRef.current.timer || paymentPollRef.current.inFlight)
      ) {
        return;
      }

      clearPaymentPolling();
      paymentPollRef.current = { key, timer: null, inFlight: false };

      const poll = async (currentPayment) => {
        if (paymentPollRef.current.key !== key) return;

        paymentPollRef.current.inFlight = true;
        const updatedPayment = await checkPaymentStatus(messageId, currentPayment, true);
        if (paymentPollRef.current.key !== key) return;
        paymentPollRef.current.inFlight = false;

        const nextPayment = updatedPayment || currentPayment;
        const stillPending =
          nextPayment.status === "PENDING" &&
          (!nextPayment.expiresAt || Date.parse(nextPayment.expiresAt) > Date.now());

        if (!stillPending) {
          clearPaymentPolling();
          return;
        }

        paymentPollRef.current.timer = window.setTimeout(() => poll(nextPayment), 4000);
      };

      poll(payment);
    },
    [checkPaymentStatus, clearPaymentPolling]
  );

  useEffect(() => {
    if (loadingMessages) {
      clearPaymentPolling();
      return undefined;
    }

    const latestBotMessage = [...messages].reverse().find((message) => message.role === "bot");
    const payment = latestBotMessage?.data?.payment;
    if (latestBotMessage?.state === "WAIT_PAYMENT" && payment?.status === "PENDING") {
      startPaymentPolling(latestBotMessage.id, payment);
    } else {
      clearPaymentPolling();
    }

    return undefined;
  }, [clearPaymentPolling, loadingMessages, messages, startPaymentPolling]);

  useEffect(() => () => clearPaymentPolling(), [clearPaymentPolling]);

  const checkPaymentManually = async (messageId, payment) => {
    setCheckingPaymentId(String(payment.paymentId));
    await checkPaymentStatus(messageId, payment);
    setCheckingPaymentId("");
  };

  const openRenameModal = (item) => {
    setMenuSessionId("");
    setRenamingSession(item);
    setRenameTitle(item.title || "");
    setRenameError("");
  };

  const closeRenameModal = () => {
    if (savingRename) return;
    setRenamingSession(null);
    setRenameTitle("");
    setRenameError("");
  };

  const submitRename = async (event) => {
    event.preventDefault();
    if (!renamingSession || !renameTitle.trim()) return;

    try {
      setSavingRename(true);
      setRenameError("");
      const updated = await renameChatSession(renamingSession.sessionId, renameTitle);
      setSessions((items) =>
        items.map((session) =>
          session.sessionId === renamingSession.sessionId ? { ...session, ...updated } : session
        )
      );
      setRenamingSession(null);
      setRenameTitle("");
      setRenameError("");
    } catch (error) {
      setRenameError(getChatErrorMessage(error));
    } finally {
      setSavingRename(false);
    }
  };

  const openDeleteModal = (item) => {
    setMenuSessionId("");
    setDeleteSessionTarget(item);
    setDeleteError("");
  };

  const closeDeleteModal = () => {
    if (deletingSession) return;
    setDeleteSessionTarget(null);
    setDeleteError("");
  };

  const removeSession = async () => {
    if (!deleteSessionTarget || deletingSession) return;

    const item = deleteSessionTarget;

    try {
      setDeletingSession(true);
      setDeleteError("");
      await deleteChatSession(item.sessionId);
      const remaining = sessions.filter((session) => session.sessionId !== item.sessionId);
      setSessions(remaining);
      setDeleteSessionTarget(null);

      if (item.sessionId !== sessionId) return;

      setSessionId("");
      setMessages([]);
      if (remaining[0]?.sessionId) {
        await loadMessages(remaining[0].sessionId);
      } else {
        await startNewSession();
      }
    } catch (error) {
      setDeleteError(getChatErrorMessage(error));
    } finally {
      setDeletingSession(false);
    }
  };

  const renderOptions = (message) => {
    const isLatest = message.id === latestBotMessageId;
    if (!isLatest) return null;

    const doctors = message.data?.doctors || message.data?.recommended_doctors || [];
    const slots = (message.data?.slots || []).filter(
      (slot) =>
        Number(slot.isActive) !== 0 &&
        Number(slot.remaining ?? 1) > 0 &&
        Number(slot.isBookable ?? 1) !== 0
    );

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

  const renderPayment = (message) => {
    const payment = message.data?.payment || message.data?.collected_info?.payment;
    if (!payment?.paymentId) return null;

    const isPending = payment.status === "PENDING";
    const isPaid = payment.status === "PAID" && payment.bookingId;
    const isChecking = checkingPaymentId === String(payment.paymentId);
    const statusLabel = isPaid
      ? "Đã thanh toán"
      : isPending
        ? "Đang chờ thanh toán"
        : payment.status === "EXPIRED"
          ? "Đã hết hạn"
          : "Không thành công";

    return (
      <div className="chatbot-payment-card" aria-live="polite">
        <div className="chatbot-payment-card__header">
          <strong>Thanh toán lịch khám online</strong>
          <span className={`chatbot-payment-card__status is-${String(payment.status || "PENDING").toLowerCase()}`}>
            {statusLabel}
          </span>
        </div>
        {payment.qrCodeUrl && isPending && (
          <img className="chatbot-payment-card__qr" src={payment.qrCodeUrl} alt="Mã QR thanh toán" />
        )}
        <div className="chatbot-payment-card__details">
          <span>Số tiền</span>
          <strong>{formatMoney(payment.amount)}</strong>
          <span>Nội dung chuyển khoản</span>
          <strong>{payment.paymentCode || "—"}</strong>
          <span>Hết hạn</span>
          <strong>{formatPaymentExpiry(payment.expiresAt)}</strong>
        </div>
        {isPending && (
          <div className="chatbot-payment-card__actions">
            <button
              type="button"
              onClick={() => checkPaymentManually(message.id, payment)}
              disabled={loading || isChecking}
            >
              {isChecking ? "Đang kiểm tra..." : "Kiểm tra thanh toán"}
            </button>
            <button type="button" className="is-secondary" onClick={() => sendMessage("hủy")} disabled={loading}>
              Hủy
            </button>
          </div>
        )}
        {isPaid && <p className="chatbot-payment-card__success">Lịch hẹn đã được tạo sau khi thanh toán thành công.</p>}
        {!isPending && !isPaid && (
          <p className="chatbot-payment-card__error">Mã thanh toán này không còn hiệu lực. Hãy gửi “có” để thử lại.</p>
        )}
      </div>
    );
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
          disabled={loadingMessages || !canCreateSession}
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
            <div
              key={item.sessionId}
              className={`chatbot-session-item ${item.sessionId === sessionId ? "active" : ""}`}
            >
              <button
                type="button"
                className="chatbot-session-select"
                disabled={loadingMessages || loading}
                onClick={() => loadMessages(item.sessionId)}
              >
                <span>{item.title || "Cuộc trò chuyện mới"}</span>
                <small>{formatSessionTime(item.updatedAt)}</small>
              </button>
              <button
                type="button"
                className="chatbot-session-menu-button"
                aria-label={`Tùy chọn cho ${item.title || "cuộc trò chuyện mới"}`}
                aria-expanded={menuSessionId === item.sessionId}
                disabled={loadingMessages || loading}
                onClick={() => setMenuSessionId((id) => (id === item.sessionId ? "" : item.sessionId))}
              >
                <i className="fa-solid fa-ellipsis"></i>
              </button>
              {menuSessionId === item.sessionId && (
                <div className="chatbot-session-menu">
                  <button type="button" onClick={() => openRenameModal(item)}>
                    <i className="fa-solid fa-pen"></i>
                    Đổi tên
                  </button>
                  <button type="button" className="is-danger" onClick={() => openDeleteModal(item)}>
                    <i className="fa-regular fa-trash-can"></i>
                    Xóa
                  </button>
                </div>
              )}
            </div>
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
              {renderPayment(message)}
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

      <Modal
        isOpen={Boolean(renamingSession)}
        toggle={closeRenameModal}
        centered
        className="chatbot-rename-modal"
      >
        <form onSubmit={submitRename}>
          <ModalHeader toggle={closeRenameModal}>Đổi tên hội thoại</ModalHeader>
          <ModalBody>
            <p className="chatbot-rename-modal__description">
              Nhập tên mới để dễ nhận biết hội thoại này.
            </p>
            <label className="visually-hidden" htmlFor="chatbot-rename-title">
              Tên hội thoại
            </label>
            <input
              id="chatbot-rename-title"
              type="text"
              className="form-control chatbot-rename-modal__input"
              value={renameTitle}
              maxLength="255"
              autoFocus
              disabled={savingRename}
              onChange={(event) => {
                setRenameTitle(event.target.value);
                setRenameError("");
              }}
            />
            {renameError && <div className="chatbot-rename-modal__error">{renameError}</div>}
          </ModalBody>
          <ModalFooter>
            <Button type="button" className="chatbot-rename-modal__cancel" onClick={closeRenameModal} disabled={savingRename}>
              Hủy
            </Button>
            <Button type="submit" className="chatbot-rename-modal__save" disabled={savingRename || !renameTitle.trim()}>
              {savingRename ? "Đang lưu..." : "Lưu"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(deleteSessionTarget)}
        toggle={closeDeleteModal}
        centered
        className="chatbot-delete-modal"
      >
        <ModalHeader toggle={closeDeleteModal}>Xóa hội thoại?</ModalHeader>
        <ModalBody>
          <p className="chatbot-delete-modal__description">
            Bạn có chắc muốn xóa “{deleteSessionTarget?.title || "Cuộc trò chuyện mới"}”? Thao tác này không thể hoàn tác.
          </p>
          {deleteError && <div className="chatbot-delete-modal__error">{deleteError}</div>}
        </ModalBody>
        <ModalFooter>
          <Button
            type="button"
            className="chatbot-delete-modal__cancel"
            onClick={closeDeleteModal}
            disabled={deletingSession}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="chatbot-delete-modal__delete"
            onClick={removeSession}
            disabled={deletingSession}
          >
            {deletingSession ? "Đang xóa..." : "Xóa"}
          </Button>
        </ModalFooter>
      </Modal>
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
