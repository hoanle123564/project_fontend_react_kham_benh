import React, { Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import HomeHeader from "../Patient/Layout/HomeHeader";
import HomeFooter from "../Patient/Layout/HomeFooter";
import PatientSidebar from "../Patient/Layout/PatientSidebar";
import ChatList from "./ChatList";
import ChatRoom from "./ChatRoom";
import {
  connectChatSocket,
  disconnectChatSocket,
  getMyChatRooms,
} from "../../services/doctorPatientChatService";
import "./Chat.scss";

class ChatPage extends Component {
  state = {
    rooms: [],
    isLoading: false,
    errorMessage: "",
    searchValue: "",
  };

  componentDidMount() {
    this.socket = connectChatSocket(this.getRole());
    this.loadRooms();
  }

  componentWillUnmount() {
    disconnectChatSocket();
  }

  getRole = () => (this.props.match?.path || "").startsWith("/doctor") ? "doctor" : "patient";

  getBasePath = () => this.getRole() === "doctor" ? "/doctor/message" : "/patient/chat";

  getCurrentUser = () => this.getRole() === "doctor" ? this.props.doctorInfo : this.props.patientInfo;

  getText = (key, defaultMessage = key) =>
    this.props.intl.formatMessage({
      id: `chat.${key}`,
      defaultMessage,
    });

  loadRooms = async () => {
    const role = this.getRole();
    this.setState({ isLoading: true, errorMessage: "" });

    try {
      const response = await getMyChatRooms(role);
      if (!response || response.errCode !== 0) {
        this.setState({
          rooms: [],
          isLoading: false,
          errorMessage: response?.errMessage || this.getText("loadError"),
        });
        return;
      }

      this.setState({ rooms: response.data || [], isLoading: false });
    } catch (error) {
      this.setState({ rooms: [], isLoading: false, errorMessage: this.getText("loadError") });
    }
  };

  handleSelectRoom = (room) => {
    if (!room?.id || !this.props.history) return;
    this.props.history.push(`${this.getBasePath()}/${encodeURIComponent(room.id)}`);
  };

  getSelectedRoom = () => {
    const roomId = this.props.match?.params?.roomId;
    return this.state.rooms.find((room) => Number(room.id) === Number(roomId)) || null;
  };

  getVisibleRooms = () => {
    const keyword = this.state.searchValue.trim().toLowerCase();
    if (!keyword) return this.state.rooms;
    return this.state.rooms.filter((room) =>
      `${room.opponent?.firstName || ""} ${room.opponent?.lastName || ""} ${room.lastMessage || ""}`.toLowerCase().includes(keyword)
    );
  };

  renderContent = () => {
    const roomId = this.props.match?.params?.roomId;
    const selectedRoom = this.getSelectedRoom();
    const rooms = this.getVisibleRooms();
    const user = this.getCurrentUser() || {};

    return (
      <div className={`chat-page ${this.getRole() === "doctor" ? "chat-page--doctor" : ""}`}>
        <div className="chat-page__title">
          <h2>{this.getText("title")}</h2>
          {this.state.errorMessage && <p>{this.state.errorMessage}</p>}
        </div>
        <div className={`chat-page__layout ${roomId ? "chat-page__layout--room-selected" : ""}`}>
          <ChatList
            rooms={rooms}
            selectedRoomId={roomId}
            isLoading={this.state.isLoading}
            getText={this.getText}
            language={this.props.language}
            onSelectRoom={this.handleSelectRoom}
            searchValue={this.state.searchValue}
            onSearch={(searchValue) => this.setState({ searchValue })}
          />
          <ChatRoom
            roomId={roomId}
            room={selectedRoom}
            role={this.getRole()}
            socket={this.socket}
            currentUserId={user.id}
            language={this.props.language}
            getText={this.getText}
            onRoomsChanged={this.loadRooms}
            onBack={() => this.props.history.push(this.getBasePath())}
          />
        </div>
      </div>
    );
  };

  render() {
    if (this.getRole() === "doctor") {
      return this.renderContent();
    }

    return (
      <>
        <HomeHeader showBanner={false} />
        <div className="patient-dashboard-layout">
          <div className="container d-flex flex-start gap-3">
            <PatientSidebar />
            <div className="patient-page-content">{this.renderContent()}</div>
          </div>
        </div>
        <HomeFooter />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
  doctorInfo: state.doctor?.doctorInfo,
  patientInfo: state.patient?.patientInfo,
});

export default connect(mapStateToProps)(injectIntl(ChatPage));
