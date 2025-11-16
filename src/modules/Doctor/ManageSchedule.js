import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import Select from "react-select";
import DatePicker from "../../components/Input/DatePicker";
import * as action from "../../store/actions";
import "./ManageSchedule.scss";
import moment from "moment";
import { toast } from "react-toastify";
import _ from "lodash";

import { postScheduleDoctor } from "../../services/userService";
class ManageSchedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectDoctor: "",
      ListDoctor: [],
      currentDate: new Date(),
      AllTime: [],
      selectedTime: [],
    };
  }

  // Xây dựng dữ liệu cho Select bác sĩ
  buildDataSelect = (inputData) => {
    let result = [];
    if (inputData && inputData.length > 0) {
      result = inputData.map((item) => ({
        label: `${item.firstName} ${item.lastName}`,
        value: item.id,
      }));
    }
    return result;
  };

  // Xử lý khi chọn bác sĩ
  handleChangeSelect = (selectDoctor) => {
    this.setState({ selectDoctor });

  };

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
    const { selectedTime, selectDoctor, currentDate } = this.state;

    if (!currentDate) {
      toast.error("Invalid date!");
      return;
    }
    if (!selectDoctor || _.isEmpty(selectDoctor)) {
      toast.error("Invalid select doctor!");
      return;
    }
    if (!selectedTime || selectedTime.length === 0) {
      toast.error("Invalid select time!");
      return;
    }

    const formattedDate = moment(currentDate).format("DD/MM/YYYY");

    try {
      const res = await postScheduleDoctor({
        doctorId: selectDoctor.value,
        date: formattedDate,
        timeType: selectedTime,
      });

      if (res && res.errCode === 0) {
        toast.success("Lưu kế hoạch thành công!");
        //  KHÔNG reset selectedTime nữa
        // Giữ nguyên để nút vẫn active
      } else {
        toast.error(res.errMessage || "Lưu thất bại!");
      }
    } catch (e) {
      toast.error("Lưu thất bại!");
      console.error(e);
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
      this.setState({ AllTime: this.props.AllScheduleTime });
    }
  }

  render() {
    const { AllTime, selectedTime, selectDoctor, currentDate, ListDoctor } =
      this.state;

    return (
      <div className="manage-schedule-container">
        <div className="m-s-title">
          <FormattedMessage id="manage-schedule.title" />
        </div>

        <div className="container">
          <div className="row">
            {/* Select bác sĩ */}
            <div className="col-6 form-group">
              <label>
                <FormattedMessage id="manage-schedule.choose-doctor" />

              </label>
              <Select
                value={selectDoctor}
                onChange={this.handleChangeSelect}
                options={ListDoctor}
                placeholder={<FormattedMessage id="manage-schedule.choose-doctor" />}
              />
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
                    // const active = selectedTime.some((t) => t.keyMap === item.keyMap);
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
