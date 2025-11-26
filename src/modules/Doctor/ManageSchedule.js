import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import Select from "react-select";
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

class ManageSchedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectDoctor: "",
      ListDoctor: [],
      currentDate: new Date(),
      AllTime: [],
      selectedTime: [],
      registeredSchedule: []
    };
  }

  // Sắp xếp giờ theo value_vi (giống Private)
  sortTimeSlots = (timeList) => {
    return [...timeList].sort((a, b) => {
      const t1 = a.value_vi.split(" - ")[0].trim();
      const t2 = b.value_vi.split(" - ")[0].trim();
      return moment(t1, "H:mm") - moment(t2, "H:mm");
    });
  };

  // Tạo option cho Select bác sĩ
  buildDataSelect = (inputData) => {
    if (!inputData || inputData.length === 0) return [];
    return inputData.map((item) => ({
      label: `${item.firstName} ${item.lastName}`,
      value: item.id,
    }));
  };

  // Khi chọn bác sĩ => load lịch theo ngày hiện tại
  handleChangeSelect = async (selectDoctor) => {
    this.setState({
      selectDoctor,
      selectedTime: [] // Reset select time khi đổi bác sĩ
    });
    await this.loadScheduleForDate(selectDoctor.value, this.state.currentDate);
  };

  // Khi chọn ngày => load lịch
  handleOnchangeDatePicker = async (date) => {
    this.setState({
      currentDate: date[0],
      selectedTime: [] // Reset select time khi đổi ngày
    });

    if (this.state.selectDoctor?.value) {
      await this.loadScheduleForDate(this.state.selectDoctor.value, date[0]);
    }
  };

  // Tải lịch đã đăng ký
  loadScheduleForDate = async (doctorId, date) => {
    const formatDate = moment(date).format("DD/MM/YYYY");
    let res = await getScheduleDoctor(doctorId, formatDate);

    if (res && res.errCode === 0) {
      this.setState({ registeredSchedule: res.data });
    } else {
      this.setState({ registeredSchedule: [] });
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
    const { selectedTime, selectDoctor, currentDate } = this.state;

    if (!currentDate) return toast.error("Invalid date!");
    if (!selectDoctor) return toast.error("Vui lòng chọn bác sĩ!");
    if (selectedTime.length === 0) return toast.error("Chưa chọn khung giờ!");

    const formattedDate = moment(currentDate).format("DD/MM/YYYY");

    const res = await postScheduleDoctor({
      doctorId: selectDoctor.value,
      date: formattedDate,
      timeType: selectedTime,
    });

    if (res && res.errCode === 0) {
      toast.success("Lưu kế hoạch thành công!");
      this.setState({ selectedTime: [] }); // Reset select time sau khi lưu
      this.loadScheduleForDate(selectDoctor.value, currentDate);
    } else {
      toast.error(res.errMessage || "Lưu thất bại!");
    }
  };

  // Xoá lịch
  handleDeleteSchedule = async (id) => {
    let res = await DeleteScheduleDoctor(id);

    if (res && res.errCode === 0) {
      toast.success("Xoá thành công!");
      this.loadScheduleForDate(this.state.selectDoctor?.value, this.state.currentDate);
    } else {
      toast.error(res.errMessage || "Delete failed!");
    }
  };

  componentDidMount() {
    this.props.fetchAllDoctor();
    this.props.fetchAllHour();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.ListDoctor !== this.props.ListDoctor) {
      const ListDoctor = this.buildDataSelect(this.props.ListDoctor);
      this.setState({ ListDoctor });
    }

    if (prevProps.AllScheduleTime !== this.props.AllScheduleTime) {
      const sorted = this.sortTimeSlots(this.props.AllScheduleTime);
      this.setState({ AllTime: sorted });
    }
  }

  render() {
    const {
      AllTime,
      selectedTime,
      selectDoctor,
      currentDate,
      ListDoctor,
      registeredSchedule
    } = this.state;

    return (
      <div className="manage-schedule-container">

        <div className="m-s-title">
          <FormattedMessage id="manage-schedule.title" />
        </div>

        <div className="container">
          <div className="row">

            {/* Select bác sĩ */}
            <div className="col-6 form-group">
              <label><FormattedMessage id="manage-schedule.choose-doctor" /></label>
              <Select
                value={selectDoctor}
                onChange={this.handleChangeSelect}
                options={ListDoctor}
                placeholder={<FormattedMessage id="manage-schedule.choose-doctor" />}
              />
            </div>

            {/* Chọn ngày */}
            <div className="col-6 form-group">
              <label><FormattedMessage id="manage-schedule.select-date" /></label>
              <DatePicker
                onChange={this.handleOnchangeDatePicker}
                value={currentDate}
                className="form-control"
                minDate={moment().startOf("day").toDate()}
              />
            </div>

            {/* Chọn giờ */}
            <div className="col-12 pick-hour-container">
              <label>{this.props.language === 'vi' ? 'Chọn giờ khám' : 'Select time slot'}</label>
              <div className="pick-hour-content">
                {AllTime.map((item, index) => {
                  const active = selectedTime.includes(item.keyMap);

                  return (
                    <button
                      key={index}
                      className={active ? "btn btn-schedule active" : "btn btn-schedule"}
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
              <h5>{this.props.language === 'vi' ? 'Ca đã đăng ký trong ngày' : 'Registered shifts today'}</h5>

              {registeredSchedule.length === 0 ? (
                <div className="text-muted">{this.props.language === 'vi' ? 'Chưa có ca nào.' : 'No shifts yet.'}</div>
              ) : (
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{this.props.language === 'vi' ? 'Khung giờ' : 'Time slot'}</th>
                      <th>{this.props.language === 'vi' ? 'Xoá' : 'Delete'}</th>
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
                            {this.props.language === 'vi' ? 'Xoá' : 'Delete'}
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

  isLoggedIn: state.adminAuth.isLoggedIn,
  language: state.app.language,
  userInfo: state.adminAuth.adminInfo,
  AllScheduleTime: state.admin.AllTime,
  ListDoctor: state.admin.AllDoctor,
});

const mapDispatchToProps = (dispatch) => ({
  fetchAllDoctor: () => dispatch(action.fetchAllDoctor()),
  fetchAllHour: () => dispatch(action.fetchAllHour()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedule);
