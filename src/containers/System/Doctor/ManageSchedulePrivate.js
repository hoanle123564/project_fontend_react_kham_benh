import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import DatePicker from "../../../components/Input/DatePicker";
import * as action from "../../../store/actions";
import "./ManageSchedule.scss";
import moment from "moment";
import { toast } from "react-toastify";
import _ from "lodash";

import { postScheduleDoctor } from "../../../services/userService";
class ManageSchedulePrivate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentDate: new Date(),
            AllTime: [],
            selectedTime: [],
        };
    }

    // Xử lý khi chọn ngày
    handleOnchangeDatePicker = (date) => {
        this.setState({ currentDate: date[0] });
    };

    handleClickTime = (time) => {
        this.setState(prevState => {
            const { selectedTime } = prevState;
            const isSelected = selectedTime.includes(time.keyMap);
            const updated = isSelected
                ? selectedTime.filter(item => item !== time.keyMap)
                : [...selectedTime, time.keyMap];
            return { selectedTime: updated };
        });
    };



    handleSaveSchedule = async () => {
        const { selectedTime, currentDate } = this.state;
        const doctorId = this.props.userInfo?.user?.id;

        if (!doctorId) {
            toast.error("Không tìm thấy thông tin bác sĩ!");
            return;
        }

        if (!currentDate) {
            toast.error("Invalid date!");
            return;
        }

        if (!selectedTime || selectedTime.length === 0) {
            toast.error("Invalid select time!");
            return;
        }

        const formattedDate = moment(currentDate).format("DD/MM/YYYY");

        try {
            const res = await postScheduleDoctor({
                doctorId: doctorId,
                date: formattedDate,
                timeType: selectedTime,
            });

            if (res && res.errCode === 0) {
                toast.success("Lưu kế hoạch thành công!");
            } else {
                toast.error(res.errMessage || "Lưu thất bại!");
            }
        } catch (e) {
            toast.error("Lưu thất bại!");
            console.error(e);
        }
    };



    componentDidMount() {
        this.props.fetchAllHour();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.AllScheduleTime !== this.props.AllScheduleTime) {
            this.setState({ AllTime: this.props.AllScheduleTime });
        }
    }

    render() {
        const { AllTime, selectedTime, currentDate } =
            this.state;
        console.log("this.props.userInfo", this.props.userInfo);

        return (
            <div className="manage-schedule-container">
                <div className="m-s-title">
                    <FormattedMessage id="manage-schedule.title" />
                </div>

                <div className="container">
                    <div className="row">
                        {/* Select bác sĩ */}
                        <div className="col-6 form-group">
                            <label className="mr-3" style={{ marginRight: "10px", fontWeight: "600" }}>
                                Bác sĩ hiện tại:
                            </label>

                            <span style={{ fontSize: "16px" }}>
                                {
                                    this.props.userInfo?.user
                                        ? `${this.props.userInfo.user.firstName} ${this.props.userInfo.user.lastName}`
                                        : ""
                                }
                            </span>
                        </div>

                        {/* Chọn ngày */}
                        <div className="col-6 form-group">
                            <label>
                                <FormattedMessage id="manage-schedule.select-date" />
                            </label>

                            <DatePicker
                                onChange={this.handleOnchangeDatePicker}
                                value={currentDate}
                                className="form-control"
                                minDate={moment().startOf('day').toDate()} />
                        </div>

                        {/* Chọn giờ khám */}
                        <div className="col-12 pick-hour-container">
                            <label>
                                <FormattedMessage id="manage-schedule.select-date" />
                            </label>
                            <div className="pick-hour-content">
                                {AllTime &&
                                    AllTime.length > 0 &&
                                    AllTime.map((item, index) => {
                                        const active = selectedTime.includes(item.keyMap);

                                        return (
                                            <button
                                                key={index}
                                                className={
                                                    active
                                                        ? "btn btn-schedule active"
                                                        : "btn btn-schedule"
                                                }
                                                onClick={() => this.handleClickTime(item)}
                                            >
                                                {item.value_vi}
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>

                    {/* Nút lưu */}
                    <div className="text-center mt-4">
                        <button className="btn btn-primary btn-save-schedule"
                            onClick={() => this.handleSaveSchedule()}>
                            <FormattedMessage id="manage-schedule.save-schedule" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
    userInfo: state.user.userInfo,
    AllScheduleTime: state.admin.AllTime,
});

const mapDispatchToProps = (dispatch) => ({
    fetchAllHour: () => dispatch(action.fetchAllHour()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedulePrivate);
