import React, { Component } from "react";
import moment from "moment";
import {
  getChatRoomMessages,
  markChatRoomRead,
  sendChatRoomMessage,
} from "../../services/doctorPatientChatService";

const getName = (person = {}) =>
  `${person.firstName || ""} ${person.lastName || ""}`.replace(/\s+/g, " ").trim() || "-";

class ChatRoom extends Component {
  state = {
    room: this.props.room || null,
    messages: [],
    input: "",
    isLoading: false,
    isSending: false,
    errorMessage: "",
  };

  componentDidMount() {
    this.bindSocket();
    this.loadMessages();
    this.resizeComposer();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.socket !== this.props.socket) {
      this.unbindSocket(prevProps.socket, prevProps.roomId);
      this.bindSocket();
    }

    if (String(prevProps.roomId || "") !== String(this.props.roomId || "")) {
      this.unbindSocket(this.props.socket, prevProps.roomId);
      this.bindSocket();
      this.setState(
        { room: this.props.room || null, messages: [], input: "", errorMessage: "" },
        this.loadMessages
      );
      return;
    }

    if (prevProps.room !== this.props.room && this.props.room) {
      this.setState({ room: this.props.room });
    }
  }

  componentWillUnmount() {
    this.unbindSocket(this.props.socket, this.props.roomId);
  }

  bindSocket = () => {
    const { socket, roomId } = this.props;
    if (!socket || !roomId) return;

    socket.off("new_message", this.handleSocketMessage);
    socket.off("message_read", this.handleMessageRead);
    socket.off("chat_error", this.handleSocketError);
    socket.on("new_message", this.handleSocketMessage);
    socket.on("message_read", this.handleMessageRead);
    socket.on("chat_error", this.handleSocketError);
    socket.emit("join_room", roomId);
  };

  unbindSocket = (socket, roomId) => {
    if (!socket) return;
    if (roomId) socket.emit("leave_room", roomId);
    socket.off("new_message", this.handleSocketMessage);
    socket.off("message_read", this.handleMessageRead);
    socket.off("chat_error", this.handleSocketError);
  };

  loadMessages = async () => {
    const { roomId, role } = this.props;
    if (!roomId) return;

    this.setState({ isLoading: true, errorMessage: "" });

    try {
      const response = await getChatRoomMessages(roomId, { page: 1, limit: 50 }, role);
      if (!response || response.errCode !== 0) {
        this.setState({
          isLoading: false,
          errorMessage: response?.errMessage || this.props.getText("loadError"),
        });
        return;
      }

      this.setState(
        {
          room: response.data?.room || this.props.room || null,
          messages: response.data?.messages || [],
          isLoading: false,
        },
        () => {
          this.scrollToBottom();
          this.markRead();
        }
      );
    } catch (error) {
      this.setState({ isLoading: false, errorMessage: this.props.getText("loadError") });
    }
  };

  markRead = async () => {
    const { roomId, role, onRoomsChanged } = this.props;
    if (!roomId) return;

    try {
      await markChatRoomRead(roomId, role);
      if (onRoomsChanged) onRoomsChanged();
    } catch (error) {
      // Read markers are best-effort; message loading still succeeded.
    }
  };

  handleSocketMessage = (payload = {}) => {
    const message = payload.message || payload;
    if (Number(message.roomId) !== Number(this.props.roomId)) return;

    this.setState(
      (prevState) => {
        if (prevState.messages.some((item) => Number(item.id) === Number(message.id))) {
          return null;
        }

        return {
          messages: [...prevState.messages, message],
          room: payload.room || prevState.room,
        };
      },
      () => {
        this.scrollToBottom();
        if (Number(message.senderId) !== Number(this.props.currentUserId)) {
          this.markRead();
        }
        if (this.props.onRoomsChanged) this.props.onRoomsChanged();
      }
    );
  };

  handleMessageRead = (payload = {}) => {
    if (Number(payload.roomId) !== Number(this.props.roomId)) return;
    if (Number(payload.readByUserId) === Number(this.props.currentUserId)) return;

    this.setState((prevState) => ({
      messages: prevState.messages.map((message) =>
        Number(message.senderId) === Number(this.props.currentUserId)
          ? { ...message, isRead: true }
          : message
      ),
    }));
  };

  handleSocketError = (payload = {}) => {
    this.setState({ errorMessage: payload.message || this.props.getText("socketError") });
  };

  handleSend = async () => {
    const { input, isSending } = this.state;
    const message = input.trim();
    if (!message || isSending) return;

    this.setState({ isSending: true, errorMessage: "" });

    try {
      const response = await sendChatRoomMessage(this.props.roomId, message, this.props.role);
      if (!response || response.errCode !== 0) {
        this.setState({
          isSending: false,
          errorMessage: response?.errMessage || this.props.getText("sendError"),
        });
        return;
      }

      this.setState(
        (prevState) => ({
          input: "",
          isSending: false,
          messages: prevState.messages.some(
            (item) => Number(item.id) === Number(response.data?.message?.id)
          )
            ? prevState.messages
            : [...prevState.messages, response.data.message],
        }),
        () => {
          this.scrollToBottom();
          this.resizeComposer();
          if (this.props.onRoomsChanged) this.props.onRoomsChanged();
        }
      );
    } catch (error) {
      this.setState({ isSending: false, errorMessage: this.props.getText("sendError") });
    }
  };

  handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.handleSend();
    }
  };

  handleInputChange = (event) => {
    this.setState({ input: event.target.value }, this.resizeComposer);
  };

  resizeComposer = () => {
    if (!this.composerInput) return;
    const baseHeight = 38;
    const maxHeight = 116;
    this.composerInput.style.height = `${baseHeight}px`;
    const nextHeight = Math.min(Math.max(this.composerInput.scrollHeight, baseHeight), maxHeight);
    this.composerInput.style.height = `${nextHeight}px`;
    this.composerInput.style.overflowY = this.composerInput.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  scrollToBottom = () => {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  };

  renderHeader = () => {
    const { getText } = this.props;
    const { room } = this.state;
    if (!room) return null;

    const image = room.opponent?.image ? `data:image/jpeg;base64,${room.opponent.image}` : null;

    return (
      <div className="chat-room__header">
        <div className="chat-room__person">
          <button type="button" className="chat-room__back" onClick={this.props.onBack} aria-label={getText("back")} title={getText("back")}><i className="bi bi-arrow-left" /></button>
          {image ? <img src={image} alt="" /> : <span className="chat-room__avatar">{getName(room.opponent).slice(0, 1).toUpperCase()}</span>}
          <div><span>{getText("conversationWith")}</span><h3>{getName(room.opponent)}</h3></div>
        </div>
      </div>
    );
  };

  render() {
    const { getText, currentUserId } = this.props;
    const { messages, input, isLoading, isSending, errorMessage } = this.state;

    if (!this.props.roomId) {
      return <section className="chat-room chat-room--empty">{getText("chooseRoom")}</section>;
    }

    return (
      <section className="chat-room">
        {this.renderHeader()}
        {errorMessage && <div className="chat-room__error">{errorMessage}</div>}

        <div className="chat-room__messages" ref={(node) => { this.messagesContainer = node; }}>
          {isLoading ? (
            <div className="chat-room__state">{getText("loading")}</div>
          ) : messages.length > 0 ? (
            messages.map((message) => {
              const mine = Number(message.senderId) === Number(currentUserId);
              return (
                <div
                  key={message.id}
                  className={`chat-room__message ${mine ? "mine" : "theirs"}`}
                >
                  <p>{message.message}</p>
                  <span>{message.createdAt ? moment(message.createdAt).format("HH:mm") : ""}</span>
                </div>
              );
            })
          ) : (
            <div className="chat-room__state">{getText("noMessages")}</div>
          )}
        </div>

        <div className="chat-room__composer">
          <textarea
            value={input}
            rows={1}
            placeholder={getText("placeholder")}
            onChange={this.handleInputChange}
            onKeyDown={this.handleKeyDown}
            aria-label={getText("placeholder")}
            ref={(node) => { this.composerInput = node; }}
          />
          <button type="button" disabled={isSending || !input.trim()} onClick={this.handleSend} aria-label={getText("send")} title={getText("send")}>
            <i className="bi bi-send" />
            {isSending ? getText("sending") : getText("send")}
          </button>
        </div>
      </section>
    );
  }
}

export default ChatRoom;
