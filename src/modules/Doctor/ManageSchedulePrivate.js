import React, { Component } from "react";
import { connect } from "react-redux";
import { getDetailDoctor } from "../../services/userService";
import ScheduleRuleManager from "./ScheduleRuleManager";
import "./ManageSchedule.scss";

class ManageSchedulePrivate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      doctorId: null,
      doctorLabel: "",
      loading: true,
    };
  }

  async componentDidMount() {
    await this.resolveDoctorContext();
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.userInfo?.id !== this.props.userInfo?.id) {
      await this.resolveDoctorContext();
    }
  }

  resolveDoctorContext = async () => {
    const userId = this.props.userInfo?.id;
    if (!userId) {
      this.setState({ doctorId: null, doctorLabel: "", loading: false });
      return;
    }

    this.setState({ loading: true });
    const res = await getDetailDoctor(userId);
    const profile = res?.errCode === 0 ? res.data || {} : {};
    const doctorId = profile.doctorId || profile.id || userId;
    const doctorLabel =
      `${profile.firstName || this.props.userInfo?.firstName || ""} ${profile.lastName || this.props.userInfo?.lastName || ""}`.trim() ||
      this.props.userInfo?.email ||
      "";

    this.setState({
      doctorId,
      doctorLabel,
      loading: false,
    });
  };

  render() {
    const { doctorId, doctorLabel, loading } = this.state;

    return (
      <div className="manage-schedule-container manage-schedule-container--doctor">
        {loading && <div className="schedule-rule-empty schedule-rule-empty--page">Đang tải thông tin bác sĩ...</div>}
        {!loading && doctorId && (
          <ScheduleRuleManager
            authRole="doctor"
            doctorId={doctorId}
            doctorLabel={doctorLabel}
            language={this.props.language}
          />
        )}
        {!loading && !doctorId && (
          <div className="schedule-rule-empty schedule-rule-empty--page">
            Không tìm thấy hồ sơ bác sĩ để chỉnh lịch.
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
  userInfo: state.doctor.doctorInfo,
});

export default connect(mapStateToProps)(ManageSchedulePrivate);
