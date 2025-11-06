import React, { Component } from "react";
import { connect } from "react-redux";
import "./DoctorSchdule.scss";
import * as action from "../../../store/actions";
import { languages } from "../../../utils";
import moment from "moment";
import localization from "moment/locale/vi"; // phải thêm để đổi sang tiếng việt trong moment mặc đù không dùng trực tiếp
import { getScheduleDoctor } from "../../../services/userService";
class DoctorSchdule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allDays: [],
            allAvailableTime: [],
        }
    }
    setDay = () => {
        let arrDays = [];
        for (let i = 0; i < 7; i++) {
            let object = {};
            if (this.props.language === languages.VI) {
                object.label = moment(new Date()).add(i, 'days').locale('vi').format('dddd - DD/MM');
            } else {
                object.label = moment(new Date()).add(i, 'days').locale('en').format('ddd - DD/MM');
            }
            object.value = moment(new Date()).add(i, 'days').startOf('day').valueOf();
            arrDays.push(object);
        }

        this.setState({
            allDays: arrDays
        });
    }


    handleSelect = async (e) => {
        console.log('selected date', this.props.DetailDoctor.id);
        if (this.props.DetailDoctor && this.props.DetailDoctor.id) {
            let doctorId = this.props.DetailDoctor.id;
            console.log('doctorId', doctorId);
            let date = Number(e.target.value);
            date = moment(date).format('YYYY-MM-DD');
            console.log('date', date);

            let res = await getScheduleDoctor(doctorId, date);
            if (res && res.errCode === 0) {
                this.setState({
                    allAvailableTime: res.data
                });
            } else {
                this.setState({
                    allAvailableTime: []
                });
            }
            console.log('get schedule doctor', res);
        } else {
            console.log('khong co id');
        }

    }

    async componentDidMount() {

        console.log('moment vi', moment().locale('vi').format('dddd - DD/MM'));
        console.log('moment en', moment().locale('en').format('ddd - DD/MM'));
        this.setDay();


    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.language !== prevProps.language) {
            this.setDay();

        }
    }
    handleChange = async (selectedOption) => {
        this.setState({ selectedOption: selectedOption });
    }
    render() {
        let { allDays, allAvailableTime } = this.state;
        console.log('allDays', allDays);
        console.log('allAvailableTime', allAvailableTime);


        return (
            <>
                <div className="doctor-schedule-container">
                    <div className="all-schedule">
                        <select defaultValue="" onChange={(e) => this.handleSelect(e)}>
                            <option value="" disabled hidden>-- Chọn ngày --</option>

                            {allDays && allDays.length > 0 && allDays.map((item, index) => (
                                <option key={index} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>

                    </div>

                    <div className="all-available-time">
                        {/* <span>Hiển thị khung giờ khả dụng ở đây...</span> */}
                        <div className="text-calendar my-2">
                            <span>
                                <i className="fas fa-calendar-alt">
                                </i>
                                Lịch khám
                            </span>

                            <div className="time-content">
                                {
                                    allAvailableTime && allAvailableTime.length > 0 ? (
                                        <>
                                            <div className="time-content-btn">
                                                {allAvailableTime.map((item, index) => {
                                                    return (
                                                        <button key={index} className="btn-time">
                                                            {item.value_vi}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                            <div className="book-free my-3">
                                                <span>
                                                    Chọn và đặt (miễn phí)
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="no-schedule my-3">
                                            Không có lịch khám trong ngày này
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div >

            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        language: state.app.language,
        isLoggedIn: state.user.isLoggedIn,

    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        GetDetailDoctor: (id) => dispatch(action.GetDetailDoctor(id)),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(DoctorSchdule);
