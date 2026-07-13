import React, { Component } from "react";
import { connect } from "react-redux";
import Select from "react-select";
import * as action from "../../store/actions";
import ScheduleRuleManager from "./ScheduleRuleManager";
import "./ManageSchedule.scss";

class ManageSchedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectDoctor: null,
      listDoctor: [],
    };
  }

  componentDidMount() {
    this.props.fetchAllDoctor();
    this.props.GetAllClinic();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.ListDoctor !== this.props.ListDoctor ||
      prevProps.ListClinic !== this.props.ListClinic ||
      prevProps.userInfo !== this.props.userInfo
    ) {
      const listDoctor = this.buildDataSelect(this.getVisibleDoctors());
      const selectedDoctor = listDoctor.find(
        (doctor) => doctor.value === this.state.selectDoctor?.value
      );

      this.setState({
        listDoctor,
        selectDoctor: selectedDoctor || null,
      });
    }
  }

  buildDataSelect = (inputData) => {
    if (!inputData || inputData.length === 0) return [];
    return inputData.map((item) => ({
      label: `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.email,
      value: item.id,
    }));
  };

  isClinicManager = () => this.props.userInfo?.roleId === "R4";

  getManagedClinicIds = () => {
    if (!this.isClinicManager()) {
      return null;
    }

    return (this.props.ListClinic || [])
      .filter((clinic) => Number(clinic.managerUserId) === Number(this.props.userInfo?.id))
      .map((clinic) => Number(clinic.id));
  };

  getVisibleDoctors = () => {
    const managedClinicIds = this.getManagedClinicIds();
    if (!managedClinicIds) {
      return this.props.ListDoctor || [];
    }

    return (this.props.ListDoctor || []).filter((doctor) =>
      managedClinicIds.includes(Number(doctor.clinicId))
    );
  };

  render() {
    const { selectDoctor, listDoctor } = this.state;

    return (
      <div className="manage-schedule-container manage-schedule-container--admin">
        <div className="schedule-admin-doctor-picker">
          <label>Chọn bác sĩ</label>
          <Select
            classNamePrefix="schedule-doctor-select"
            value={selectDoctor}
            onChange={(option) => this.setState({ selectDoctor: option })}
            options={listDoctor}
            placeholder="Chọn bác sĩ"
          />
        </div>

        {selectDoctor ? (
          <ScheduleRuleManager
            authRole="admin"
            doctorId={selectDoctor.value}
            doctorLabel={selectDoctor.label}
            language={this.props.language}
          />
        ) : (
          <div className="schedule-rule-empty schedule-rule-empty--page">
            Chọn bác sĩ để điều chỉnh lịch làm việc.
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
  userInfo: state.adminAuth.adminInfo,
  ListDoctor: state.admin.AllDoctor,
  ListClinic: state.admin.AllClinic,
});

const mapDispatchToProps = (dispatch) => ({
  fetchAllDoctor: () => dispatch(action.fetchAllDoctor()),
  GetAllClinic: () => dispatch(action.GetAllClinic()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedule);
