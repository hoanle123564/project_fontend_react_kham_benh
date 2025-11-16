import React, { Component } from "react";
import { connect } from "react-redux";
import "./DoctorSchdule.scss";
import * as action from "../../../../store/actions";
import { languages } from "../../../../utils";
import moment from "moment";
import localization from "moment/locale/vi"; // phải thêm để đổi sang tiếng việt trong moment mặc đù không dùng trực tiếp
import { getScheduleDoctor, getDetailDoctor } from "../../../../services/userService";
import { FormattedMessage } from "react-intl";
import BookingModal from "./BookingModal";

class DoctorSchdule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allDays: [],
            allAvailableTime: [],
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

        return (
            <>
                <div className="doctor-schedule-container">
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
                                {allAvailableTime && allAvailableTime.length > 0 ? (
                                    <>
                                        <div className="time-content-btn">
                                            {allAvailableTime.map((item, index) => {
                                                return (
                                                    <button
                                                        key={index}
                                                        className="btn-time"
                                                        onClick={() => this.handleClickScheduleTime(item)}
                                                    >
                                                        {item.value_vi}
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