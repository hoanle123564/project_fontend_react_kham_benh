import React, { Component } from "react";
import { connect } from "react-redux";
import "./DoctorSchdule.scss";
import * as action from "../../../../store/actions";
import { languages } from "../../../../utils";
import moment from "moment";
import { getScheduleDoctor } from "../../../../services/userService";
import { FormattedMessage } from "react-intl";
import BookingModal from "./BookingModal";

const APPOINTMENT_TYPES = [
    { id: "AT1", vi: "Khám tại cơ sở", en: "In-person" },
    { id: "AT2", vi: "Khám online", en: "Online" },
];

class DoctorSchdule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allDays: [],
            allAvailableTime: [],
            appointmentTypeId: this.props.appointmentTypeId || "AT1",
            isOpenMondalBooking: false,
            ScheduleTime: {}
        };
    }
    getAllDay = () => {
        let arrDays = [];
        for (let i = 0; i < 7; i++) {
            let object = {};
            if (this.props.language === languages.VI) {
                object.label = moment(new Date())
                    .add(i, "days")
                    .locale("vi")
                    .format("dddd - DD/MM");
            } else {
                object.label = moment(new Date())
                    .add(i, "days")
                    .locale("en")
                    .format("ddd - DD/MM");
            }
            object.value = moment(new Date()).add(i, "days").startOf("day").valueOf();
            arrDays.push(object);
        }
        return arrDays;
    };

    async handleSelect(e) {
        if (!this.props.doctorId) return;
        let date = moment(Number(e.target.value)).format("YYYY-MM-DD");
        let res = await getScheduleDoctor(this.props.doctorId, date);
        this.setState({
            allAvailableTime: res && res.errCode === 0 ? res.data : [],
        });
    }

    handleChange = async (selectedOption) => {
        this.setState({ selectedOption: selectedOption });
    };

    handleAppointmentTypeChange = (appointmentTypeId) => {
        if (this.props.onAppointmentTypeChange) {
            this.props.onAppointmentTypeChange(appointmentTypeId);
        }

        this.setState({ appointmentTypeId });
    };

    getCurrentAppointmentTypeId = () => this.props.appointmentTypeId || this.state.appointmentTypeId || "AT1";

    handleClickScheduleTime = (time) => {
        this.setState({
            isOpenMondalBooking: !this.state.isOpenMondalBooking,
            ScheduleTime: time
        });
    };

    async componentDidMount() {
        let allDays = this.getAllDay();
        this.setState({ allDays });

        const doctorId = this.props.doctorId || this.props.DoctorId;
        if (doctorId) {
            let date = moment(allDays[0].value).format("YYYY-MM-DD");
            let res = await getScheduleDoctor(doctorId, date);

            if (res && res.errCode === 0) {
                this.setState({ allAvailableTime: res.data });
            }
        }
    }

    async componentDidUpdate(prevProps) {
        const doctorId = this.props.doctorId || this.props.DoctorId;
        const prevId = prevProps.doctorId || prevProps.DoctorId;

        if (prevProps.language !== this.props.language) {
            this.setState({ allDays: this.getAllDay() });
        }

        if (doctorId && doctorId !== prevId) {
            let date = moment(this.state.allDays[0].value).format("YYYY-MM-DD");
            let res = await getScheduleDoctor(doctorId, date);
            if (res && res.errCode === 0) {
                this.setState({ allAvailableTime: res.data });
            }
        }
    }

    render() {
        let { allDays, allAvailableTime } = this.state;
        const appointmentTypeId = this.getCurrentAppointmentTypeId();
        const visibleAvailableTime = allAvailableTime.filter(
            (item) =>
                (item.appointmentTypeId || "AT1") === appointmentTypeId &&
                Number(item.isActive) !== 0 &&
                Number(item.remaining) > 0 &&
                Number(item.isBookable) !== 0
        );

        return (
            <>
                <div className="doctor-schedule-container">
                    <div className={`appointment-type-tabs appointment-type-tabs--${appointmentTypeId}`}>
                        {APPOINTMENT_TYPES.map((type) => (
                            <button
                                type="button"
                                key={type.id}
                                className={appointmentTypeId === type.id ? "active" : ""}
                                onClick={() => this.handleAppointmentTypeChange(type.id)}
                            >
                                {this.props.language === languages.VI ? type.vi : type.en}
                            </button>
                        ))}
                    </div>

                    <div className="all-schedule">
                        <select
                            defaultValue={allDays[0]}
                            onChange={(e) => this.handleSelect(e)}
                        >
                            {/* <option value="" disabled hidden>
                                -- <FormattedMessage id="detail-doctor.text-calendar" /> --
                            </option> */}

                            {allDays &&
                                allDays.length > 0 &&
                                allDays.map((item, index) => (
                                    <option key={index} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Hiển thị khung giờ */}
                    <div className="all-available-time">
                        <div className="text-calendar my-2">
                            <div className="time-content">
                                {visibleAvailableTime && visibleAvailableTime.length > 0 ? (
                                    <>
                                        <div className="time-content-btn">
                                            {visibleAvailableTime.map((item, index) => {
                                                return (
                                                    <button
                                                        key={index}
                                                        className="btn-time"
                                                        onClick={() => this.handleClickScheduleTime(item)}
                                                    >
                                                        {this.props.language === languages.VI ? item.value_vi : item.value_en}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="book-free my-3">
                                            <span>
                                                <FormattedMessage id="detail-doctor.book-free" />
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="no-schedule my-3">
                                        <FormattedMessage id="detail-doctor.no-schedule" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <BookingModal
                    isOpenModal={this.state.isOpenMondalBooking}
                    toggleModal={() =>
                        this.setState({ isOpenMondalBooking: false })
                    }
                    ScheduleTime={this.state.ScheduleTime}
                    profile={this.props.doctorProfile}
                />
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        language: state.app.language,
        isLoggedIn: state.patient.isLoggedIn,
        DetailDoctor: state.admin.DetailDoctor,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        GetDetailDoctor: (id) => dispatch(action.GetDetailDoctor(id)),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(DoctorSchdule);
