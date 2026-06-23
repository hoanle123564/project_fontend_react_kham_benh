import React, { Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import PatientSidebar from "../../Layout/PatientSidebar";
import * as actions from "../../../../store/actions";
import "./Appointments.scss";
import moment from "moment";

class Appointments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            appointments: props.listAppointment || [],
            isLoading: false,
            errorMessage: "",
            cancelingId: null,
        };
    }

    async componentDidMount() {
        await this.loadAppointments();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.listAppointment !== this.props.listAppointment) {
            this.setState({
                appointments: this.props.listAppointment || [],
            });
        }
    }

    getText = (key, defaultMessage = key) =>
        this.props.intl.formatMessage({
            id: `patient.appointments.${key}`,
            defaultMessage,
        });

    loadAppointments = async () => {
        this.setState({ isLoading: true, errorMessage: "" });

        try {
            const actionResult = await this.props.ListAppointments();

            if (Array.isArray(actionResult?.data)) {
                this.setState({
                    appointments: actionResult.data,
                    isLoading: false,
                });
                return;
            }

            this.setState({
                isLoading: false,
                errorMessage: this.getText("error"),
            });
        } catch (error) {
            this.setState({
                isLoading: false,
                errorMessage: this.getText("error"),
            });
        }
    };

    handleCancel = async (bookingId) => {
        this.setState({ cancelingId: bookingId, errorMessage: "" });

        try {
            const res = await this.props.CancelBooking({ BookingId: bookingId });

            if (res?.errCode === 0) {
                await this.loadAppointments();
                this.setState({ cancelingId: null });
                return;
            }

            this.setState({
                cancelingId: null,
                errorMessage: res?.errMessage || this.getText("cancelError"),
            });
        } catch (error) {
            this.setState({
                cancelingId: null,
                errorMessage: this.getText("cancelError"),
            });
        }
    };

    renderStatus = (statusId, statusVi, statusEnValue) => {
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
            S4: "Cancelled",
        };
        const displayText =
            this.props.language === "vi"
                ? statusVi || statusId
                : statusEnValue || statusEn[statusId] || statusId;

        return (
            <span className="status-label" style={{ color: colorMap[statusId] || "#555" }}>
                {displayText}
            </span>
        );
    };

    renderQueueNumber = (queueNumber) => {
        if (!queueNumber) {
            return <span className="queue-empty">{this.getText("noQueue")}</span>;
        }

        return <span className="queue-number">{queueNumber}</span>;
    };

    renderTable = () => {
        const { appointments, cancelingId } = this.state;
        const { language } = this.props;

        return (
            <table className="appointments-table">
                <thead>
                    <tr>
                        <th>{this.getText("date")}</th>
                        <th>{this.getText("queue")}</th>
                        <th>{this.getText("time")}</th>
                        <th>{this.getText("doctor")}</th>
                        <th>{this.getText("status")}</th>
                        <th>{this.getText("actions")}</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map((item) => (
                        <tr key={item.id}>
                            <td>{moment(item.date).format("DD/MM/YYYY")}</td>
                            <td>{this.renderQueueNumber(item.queueNumber)}</td>
                            <td>{language === "vi" ? item.timeVi : item.timeEn}</td>
                            <td>
                                {item.doctorFirstName} {item.doctorLastName}
                            </td>
                            <td>{this.renderStatus(item.statusId, item.statusVi, item.statusEn)}</td>
                            <td>
                                {(item.statusId === "S1" || item.statusId === "S2") && (
                                    <button
                                        className="btn-cancel"
                                        disabled={cancelingId === item.id}
                                        onClick={() => this.handleCancel(item.id)}
                                    >
                                        {cancelingId === item.id
                                            ? this.getText("canceling")
                                            : this.getText("cancel")}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    renderContent = () => {
        const { appointments, isLoading, errorMessage } = this.state;

        if (isLoading && appointments.length === 0) {
            return <p className="appointments-state">{this.getText("loading")}</p>;
        }

        if (errorMessage && appointments.length === 0) {
            return (
                <div className="appointments-state appointments-state-error">
                    <p>{errorMessage}</p>
                    <button type="button" onClick={this.loadAppointments}>
                        {this.getText("retry")}
                    </button>
                </div>
            );
        }

        if (appointments.length === 0) {
            return <p className="appointments-empty">{this.getText("empty")}</p>;
        }

        return (
            <>
                {errorMessage && <div className="appointments-inline-error">{errorMessage}</div>}
                {this.renderTable()}
            </>
        );
    };

    render() {
        return (
            <>
                <HomeHeader showBanner={false} />
                <div className="patient-dashboard-layout">
                    <div className="container d-flex flex-start gap-3">
                        <PatientSidebar />
                        <div className="patient-page-content">
                            <h2 className="appointments-title">{this.getText("title")}</h2>

                            <div className="appointments-content">
                                {this.renderContent()}
                            </div>
                        </div>
                    </div>
                </div>
                <HomeFooter />
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
    listAppointment: state.patient?.listAppointment || [],
});

const mapDispatchToProps = (dispatch) => ({
    ListAppointments: () => dispatch(actions.GetListAppoinmentForPatient()),
    CancelBooking: (BookingId) => dispatch(actions.CancelBookingAppointment(BookingId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Appointments));
