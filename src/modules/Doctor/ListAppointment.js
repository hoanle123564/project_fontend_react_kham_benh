import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import "./ListAppointment.scss";
import moment from "moment";
import { getAllBooking, getAppointmentDoctor } from "../../services/userService";

class ListAppointment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ListAppointment: [],
    };
  }

  async componentDidMount() {
    await this.loadAppointments();
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.userInfo?.id !== this.props.userInfo?.id) {
      await this.loadAppointments();
    }
  }

  isClinicManager = () => this.props.userInfo?.roleId === "R4";

  loadAppointments = async () => {
    if (!this.props.userInfo?.id) return;

    const response = this.isClinicManager()
      ? await getAllBooking()
      : await getAppointmentDoctor(this.props.userInfo.id);

    this.setState({ ListAppointment: response?.data || [] });
  };

  getPatientName = (item) =>
    `${item.firstName || item.patientFirstName || ""} ${item.lastName || item.patientLastName || ""}`
      .replace(/\s+/g, " ")
      .trim();

  getDoctorName = (item) =>
    `${item.doctorFirstName || ""} ${item.doctorLastName || ""}`
      .replace(/\s+/g, " ")
      .trim();

  renderStatus = (statusId) => {
    const { language } = this.props;
    const statusMap = {
      S1: language === "vi" ? "Chờ xác nhận" : "Pending",
      S2: language === "vi" ? "Đã xác nhận" : "Confirmed",
      S3: language === "vi" ? "Đã khám" : "Completed",
      S4: language === "vi" ? "Đã hủy" : "Cancelled",
    };
    return statusMap[statusId] || (language === "vi" ? "Không xác định" : "Unknown");
  };

  render() {
    const { ListAppointment } = this.state;
    const isClinicManager = this.isClinicManager();

    return (
      <div className="list-appointment-container">
        <div className="title">
          <FormattedMessage id="menu.doctor.history-appointment" />
        </div>

        <table className="appointment-table">
          <thead>
            <tr>
              <th>
                <FormattedMessage id="manage-patient.patient-name" />
              </th>
              {isClinicManager && (
                <th>{this.props.language === "vi" ? "Bác sĩ" : "Doctor"}</th>
              )}
              <th>
                <FormattedMessage id="manage-patient.email" />
              </th>
              <th>
                <FormattedMessage id="manage-patient.phone-number" />
              </th>
              <th>{this.props.language === "vi" ? "Ngày khám" : "Appointment date"}</th>
              <th>{this.props.language === "vi" ? "Khung giờ" : "Time slot"}</th>
              <th>
                <FormattedMessage id="manage-patient.reason-appointment" />
              </th>
              <th>
                <FormattedMessage id="manage-patient.status" />
              </th>
            </tr>
          </thead>

          <tbody>
            {ListAppointment && ListAppointment.length > 0 ? (
              ListAppointment.map((item, index) => (
                <tr key={index}>
                  <td>{this.getPatientName(item)}</td>
                  {isClinicManager && <td>{this.getDoctorName(item) || "-"}</td>}
                  <td>{item.email || item.patientEmail}</td>
                  <td>{item.phoneNumber || item.patientPhoneNumber}</td>
                  <td>{moment(item.date).format("DD/MM/YYYY")}</td>
                  <td>{item.timeTypeVi || item.timeVi}</td>
                  <td>{item.reason}</td>
                  <td>
                    <span className={`status ${item.statusId}`}>
                      {this.props.language === "vi"
                        ? item.statusVi || this.renderStatus(item.statusId)
                        : item.statusEn || this.renderStatus(item.statusId)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={isClinicManager ? "8" : "7"}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  {this.props.language === "vi" ? "Không có lịch hẹn nào" : "No appointments"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const isSystemPath = ownProps.location?.pathname?.startsWith("/system");

  return {
    userInfo: isSystemPath
      ? state.adminAuth?.adminInfo
      : state.doctor?.doctorInfo || state.user?.userInfo,
    language: state.app.language,
  };
};

export default connect(mapStateToProps)(ListAppointment);
