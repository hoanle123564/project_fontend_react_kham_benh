import React, { Component, createRef } from "react";
import { withRouter } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import {
  joinVideoConsultation,
  markVideoConsultationStarted,
} from "../../services/userService";
import "./VideoConsultation.scss";

const ROLE_DOCTOR = "doctor";
const ROLE_PATIENT = "patient";

class VideoConsultation extends Component {
  constructor(props) {
    super(props);
    this.roomRef = createRef();
    this.hasRequestedLeave = false;
    this.state = {
      isLoading: true,
      errorMessage: "",
      roomInfo: null,
    };
  }

  componentDidMount() {
    this.bootstrapRoom();
  }

  componentWillUnmount() {
    this.cleanupZegoInstance();
  }

  getRole = () => {
    const search = new URLSearchParams(this.props.location?.search || "");
    const role = search.get("role");
    return role === ROLE_DOCTOR ? ROLE_DOCTOR : ROLE_PATIENT;
  };

  getBookingId = () => this.props.match?.params?.bookingId;

  getAuthRole = () => (this.getRole() === ROLE_DOCTOR ? ROLE_DOCTOR : ROLE_PATIENT);

  getFallbackPath = () =>
    this.getRole() === ROLE_DOCTOR
      ? `/doctor/appointment/${encodeURIComponent(this.getBookingId() || "")}`
      : "/appointments";

  bootstrapRoom = async () => {
    const bookingId = this.getBookingId();

    if (!bookingId) {
      this.setState({
        isLoading: false,
        errorMessage: "Missing booking id.",
      });
      return;
    }

    try {
      const response = await joinVideoConsultation(bookingId, {
        authRole: this.getAuthRole(),
      });

      if (!response || response.errCode !== 0) {
        this.setState({
          isLoading: false,
          errorMessage: response?.errMessage || "Video room is not available.",
        });
        return;
      }

      this.setState(
        {
          isLoading: false,
          roomInfo: response.data || {},
        },
        () => this.joinRoom(response.data || {})
      );
    } catch (error) {
      this.setState({
        isLoading: false,
        errorMessage: error.response?.data?.errMessage || "Cannot open video room.",
      });
    }
  };

  joinRoom = async (roomInfo) => {
    if (!this.roomRef.current || !roomInfo?.appId || !roomInfo?.token) {
      this.setState({ errorMessage: "Video room data is incomplete." });
      return;
    }

    if (this.getRole() === ROLE_DOCTOR) {
      await markVideoConsultationStarted(this.getBookingId(), {
        authRole: ROLE_DOCTOR,
      });
    }

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
      Number(roomInfo.appId),
      roomInfo.token,
      roomInfo.roomId,
      roomInfo.userId,
      roomInfo.userName
    );
    this.zegoInstance = ZegoUIKitPrebuilt.create(kitToken);

    this.zegoInstance.joinRoom({
      container: this.roomRef.current,
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showPreJoinView: true,
      showRoomTimer: true,
      onLeaveRoom: this.handleLeaveRoom,
    });
  };

  resetZegoSingleton = () => {
    try {
      if (ZegoUIKitPrebuilt?._instance) {
        ZegoUIKitPrebuilt._instance = null;
      }
    } catch (error) {
      // Zego internals differ by package version; this is a best-effort reset.
    }
  };

  cleanupZegoInstance = () => {
    const instance = this.zegoInstance;
    if (!instance) return;

    try {
      if (instance.root && typeof instance.root.unmount === "function") {
        instance.root.unmount();
      }
    } catch (error) {
      console.warn("Zego unmount warning:", error);
    }

    this.resetZegoSingleton();
    this.zegoInstance = null;
  };

  handleLeaveRoom = () => {
    if (this.hasRequestedLeave) return;
    this.hasRequestedLeave = true;
    this.cleanupZegoInstance();
    this.props.history.push(this.getFallbackPath());
  };

  handleBack = () => {
    this.handleLeaveRoom();
  };

  render() {
    const { isLoading, errorMessage } = this.state;

    return (
      <div className="video-consultation-page">
        <div className="video-consultation__topbar">
          <button type="button" onClick={this.handleBack}>
            <i className="bi bi-chevron-left" />
            Back
          </button>
          <span>
            {this.getRole() === ROLE_DOCTOR ? "Doctor video room" : "Patient video room"}
          </span>
        </div>

        {isLoading && (
          <div className="video-consultation__state">Opening video room...</div>
        )}

        {errorMessage && (
          <div className="video-consultation__state video-consultation__state--error">
            <p>{errorMessage}</p>
            <button type="button" onClick={this.handleBack}>
              Return
            </button>
          </div>
        )}

        <div
          className={errorMessage ? "video-consultation__room hidden" : "video-consultation__room"}
          ref={this.roomRef}
        />
      </div>
    );
  }
}

export default withRouter(VideoConsultation);
