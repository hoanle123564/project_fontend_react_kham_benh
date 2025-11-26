import React, { Component } from "react";
import { connect } from "react-redux";
import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import * as actions from "../../../../store/actions";
import "./Appointments.scss";
import moment from "moment";

class Appointments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            appointments: [],
        };
    }

    async componentDidMount() {
        const { patientInfo } = this.props;
        if (patientInfo?.id) {
            await this.props.ListAppointments(patientInfo.id);
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.listAppointment !== this.props.listAppointment) {
            this.setState({
                appointments: this.props.listAppointment,
            });
        }
    }

    handleCancel = async (bookingId) => {
        let res = await this.props.CancelBooking({ BookingId: bookingId });

        if (res.errCode === 0) {
            // reload data
            this.props.ListAppointments(this.props.patientInfo.id);
        }
    };

    renderStatus = (statusId, statusVi) => {
        const colorMap = {
            S1: "gray",
            S2: "green",
            S3: "blue",
            S4: "red",
        };
        const statusEn = {
            S1: "Pending",
            S2: "Confirmed",
            S3: "Completed",
            S4: "Cancelled"
        };
        const displayText = this.props.language === 'vi' ? statusVi : statusEn[statusId];
        return (
            <span className="status-label" style={{ color: colorMap[statusId] }}>
                {displayText}
            </span>
        );
    };

    render() {
        const { appointments } = this.state;

        return (
            <>
                <HomeHeader showBanner={false} />
                <div className="appointments-container">
                    <h2 className="appointments-title">
                        {this.props.language === 'vi' ? 'Lịch hẹn của tôi' : 'My Appointments'}
                    </h2>

                    <div className="appointments-content">
                        {appointments.length === 0 ? (
                            <p>{this.props.language === 'vi' ? 'Không có lịch hẹn nào.' : 'No appointments.'}</p>
                        ) : (
                            <table className="appointments-table">
                                <thead>
                                    <tr>
                                        <th>{this.props.language === 'vi' ? 'Ngày' : 'Date'}</th>
                                        <th>{this.props.language === 'vi' ? 'Giờ' : 'Time'}</th>
                                        <th>{this.props.language === 'vi' ? 'Bác sĩ' : 'Doctor'}</th>
                                        <th>{this.props.language === 'vi' ? 'Trạng thái' : 'Status'}</th>
                                        <th>{this.props.language === 'vi' ? 'Hành động' : 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((item) => (
                                        <tr key={item.id}>
                                            <td>{moment(item.date).format("DD/MM/YYYY")}</td>
                                            <td>{item.timeVi}</td>
                                            <td>
                                                {item.doctorFirstName}{" "}
                                                {item.doctorLastName}
                                            </td>
                                            <td>
                                                {this.renderStatus(item.statusId, item.statusVi)}
                                            </td>
                                            <td>
                                                {(item.statusId === "S1" ||
                                                    item.statusId === "S2") && (
                                                        <button
                                                            className="btn-cancel"
                                                            onClick={() => this.handleCancel(item.id)}
                                                        >
                                                            {this.props.language === 'vi' ? 'Hủy lịch' : 'Cancel'}
                                                        </button>
                                                    )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
                <HomeFooter />
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
    patientInfo: state.patient.patientInfo, // user login info
    listAppointment: state.patient?.listAppointment || [],
});

const mapDispatchToProps = (dispatch) => ({
    ListAppointments: (patientId) =>
        dispatch(actions.GetListAppoinmentForPatient(patientId)),
    CancelBooking: (BookingId) => dispatch(actions.CancelBookingAppointment(BookingId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Appointments);
