import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import DatePicker from "../../components/Input/DatePicker";
import * as action from "../../store/actions";
import "./ManageSchedule.scss";
import moment from "moment";
import { toast } from "react-toastify";
import {
    postScheduleDoctor,
    getScheduleDoctor,
    DeleteScheduleDoctor
} from "../../services/userService";

class ManageSchedulePrivate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentDate: new Date(),
            AllTime: [],
            selectedTime: [],
            registeredSchedule: []
        };
    }

    // Sắp xếp giờ theo value_vi
    sortTimeSlots = (timeList) => {
        return [...timeList].sort((a, b) => {
            const t1 = a.value_vi.split(" - ")[0].trim();
            const t2 = b.value_vi.split(" - ")[0].trim();

            return moment(t1, "H:mm") - moment(t2, "H:mm");
        });
    };

    // Khi chọn ngày => tải lịch đã đăng ký
    handleOnchangeDatePicker = async (date) => {
        const doctorId = this.props.userInfo?.id;
        const selectedDate = moment(date[0]).format("DD/MM/YYYY");

        this.setState({ currentDate: date[0] });

        if (doctorId) {
            let res = await getScheduleDoctor(doctorId, selectedDate);
            console.log('res.data.data: ', res);

            if (res && res.errCode === 0) {

                this.setState({ registeredSchedule: res.data });
            }
        }
    };

    // Chọn giờ
    handleClickTime = (time) => {
        this.setState(prev => {
            const isSelected = prev.selectedTime.includes(time.keyMap);
            return {
                selectedTime: isSelected
                    ? prev.selectedTime.filter(t => t !== time.keyMap)
                    : [...prev.selectedTime, time.keyMap]
            };
        });
    };

    // Lưu lịch
    handleSaveSchedule = async () => {
        const { selectedTime, currentDate } = this.state;
        const doctorId = this.props.userInfo?.id;

        if (!doctorId) return toast.error("Không tìm thấy thông tin bác sĩ!");
        if (!currentDate) return toast.error("Invalid date!");
        if (selectedTime.length === 0) return toast.error("Chưa chọn khung giờ!");

        const formattedDate = moment(currentDate).format("DD/MM/YYYY");

        let res = await postScheduleDoctor({
            doctorId,
            date: formattedDate,
            timeType: selectedTime
        });

        if (res && res.errCode === 0) {
            toast.success("Lưu lịch thành công!");
            this.handleOnchangeDatePicker([currentDate]); // reload lịch đã đăng ký
        } else {
            toast.error(res.errMessage || "Save failed!");
        }
    };

    // Xoá lịch theo ID
    handleDeleteSchedule = async (id) => {
        let res = await DeleteScheduleDoctor(id);
        if (res && res.errCode === 0) {
            toast.success("Delete success!");
            this.handleOnchangeDatePicker([this.state.currentDate]);
        } else {
            toast.error(res.errMessage || "Delete failed!");
        }
    };

    loadScheduleForDate = async (date) => {
        const doctorId = this.props.userInfo?.id;
        const selectedDate = moment(date).format("DD/MM/YYYY");
        if (doctorId) {
            let res = await getScheduleDoctor(doctorId, selectedDate);
            if (res && res.errCode === 0) {
                this.setState({ registeredSchedule: res.data });
            }
        }
    };

    async componentDidMount() {
        this.props.fetchAllHour();
        await this.loadScheduleForDate(this.state.currentDate);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.AllScheduleTime !== this.props.AllScheduleTime) {
            const sorted = this.sortTimeSlots(this.props.AllScheduleTime);
            this.setState({ AllTime: sorted });
        }
    }

    render() {
        const { AllTime, selectedTime, registeredSchedule, currentDate } = this.state;

        return (
            <div className="manage-schedule-container">

                <div className="m-s-title">
                    <FormattedMessage id="manage-schedule.title" />
                </div>

                <div className="container">
                    <div className="row">

                        <div className="col-6 form-group">
                            <label style={{ fontWeight: 600 }}>Bác sĩ hiện tại:</label>
                            <span style={{ marginLeft: 10 }}>
                                {this.props.userInfo
                                    ? `${this.props.userInfo.firstName} ${this.props.userInfo.lastName}`
                                    : ""}
                            </span>
                        </div>

                        <div className="col-6 form-group">
                            <label>
                                <FormattedMessage id="manage-schedule.select-date" />
                            </label>
                            <DatePicker
                                onChange={this.handleOnchangeDatePicker}
                                value={currentDate}
                                className="form-control"
                                minDate={moment().startOf("day").toDate()}
                            />
                        </div>

                        {/* Chọn giờ */}
                        <div className="col-12 pick-hour-container">
                            <label>Chọn giờ khám</label>
                            <div className="pick-hour-content">
                                {AllTime.map((item, index) => {
                                    const active = selectedTime.includes(item.keyMap);
                                    return (
                                        <button
                                            key={index}
                                            className={
                                                active ? "btn btn-schedule active" : "btn btn-schedule"
                                            }
                                            onClick={() => this.handleClickTime(item)}
                                        >
                                            {item.value_vi}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Bảng lịch đã đăng ký */}
                        <div className="col-12 registered-table">
                            <h5>Ca đã đăng ký trong ngày</h5>

                            {registeredSchedule.length === 0 ? (
                                <div className="text-muted">Chưa có ca nào.</div>
                            ) : (
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Khung giờ</th>
                                            <th>Xoá</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registeredSchedule.map((item, index) => (
                                            <tr key={item.id}>
                                                <td>{index + 1}</td>
                                                <td>{item.value_vi}</td>
                                                <td>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => this.handleDeleteSchedule(item.id)}
                                                    >
                                                        Xoá
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                    </div>

                    <div className="text-center mt-4">
                        <button
                            className="btn btn-primary btn-save-schedule"
                            onClick={this.handleSaveSchedule}
                        >
                            <FormattedMessage id="manage-schedule.save-schedule" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
    userInfo: state.doctor.doctorInfo,   // cố định đúng reducer
    AllScheduleTime: state.admin.AllTime,
});

const mapDispatchToProps = (dispatch) => ({
    fetchAllHour: () => dispatch(action.fetchAllHour()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedulePrivate);
