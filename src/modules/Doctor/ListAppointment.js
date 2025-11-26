import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import "./ListAppointment.scss";
import moment from "moment";
import { getAppointmentDoctor } from "../../services/userService";

class ListAppointment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ListAppointment: [],
        };
    }

    async componentDidMount() {
        if (this.props.userInfo?.id) {
            let response = await getAppointmentDoctor(this.props.userInfo.id);
            this.setState({ ListAppointment: response.data || [] });
        }
    }

    // Mapping status
    renderStatus = (statusId) => {
        const { language } = this.props;
        const statusMap = {
            S1: language === 'vi' ? "Chờ xác nhận" : "Pending",
            S2: language === 'vi' ? "Đã xác nhận" : "Confirmed",
            S3: language === 'vi' ? "Đã khám" : "Completed",
            S4: language === 'vi' ? "Đã hủy" : "Cancelled"
        };
        return statusMap[statusId] || (language === 'vi' ? "Không xác định" : "Unknown");
    };

    render() {
        const { ListAppointment } = this.state;

        return (
            <div className="list-appointment-container">
                <div className="title">
                    <FormattedMessage id="menu.doctor.history-appointment" />
                </div>

                <table className="appointment-table">
                    <thead>
                        <tr>
                            <th><FormattedMessage id="manage-patient.patient-name" /></th>
                            <th><FormattedMessage id="manage-patient.email" /></th>
                            <th><FormattedMessage id="manage-patient.phone-number" /></th>
                            <th>{this.props.language === 'vi' ? 'Ngày khám' : 'Appointment date'}</th>
                            <th>{this.props.language === 'vi' ? 'Khung giờ' : 'Time slot'}</th>
                            <th><FormattedMessage id="manage-patient.reason-appointment" /></th>
                            <th><FormattedMessage id="manage-patient.status" /></th>
                        </tr>
                    </thead>

                    <tbody>
                        {ListAppointment && ListAppointment.length > 0 ? (
                            ListAppointment.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.firstName} {item.lastName}</td>
                                    <td>{item.email}</td>
                                    <td>{item.phoneNumber}</td>
                                    <td>
                                        {moment(item.date).format("DD/MM/YYYY")}
                                    </td>
                                    <td>{item.timeTypeVi}</td>
                                    <td>{item.reason}</td>
                                    <td>
                                        <span className={`status ${item.statusId}`}>
                                            {this.renderStatus(item.statusId)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                                    {this.props.language === 'vi' ? 'Không có lịch hẹn nào' : 'No appointments'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    userInfo: state.doctor?.doctorInfo || state.user?.userInfo,
    language: state.app.language,
});

export default connect(mapStateToProps)(ListAppointment);
