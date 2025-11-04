import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import Select from "react-select";
import DatePicker from "../../../components/Input/DatePicker";
import * as action from "../../../store/actions";
import "./ManaggeSchedule.scss";
import moment from "moment";
class ManageSchedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectDoctor: "",
      options: [],
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

  // Chọn / bỏ chọn khung giờ
  handleClickTime = (time) => {
    let { selectedTime } = this.state;
    const isSelected = selectedTime.includes(time.id); // Kiểm tra time.id có trong selectedTime hay không (true,false)
    console.log('isSelected', isSelected);

    if (isSelected) {
      // Nếu có thì sẽ bỏ ra khỏi selectTime
      selectedTime = selectedTime.filter((item) => item !== time.id);
    } else {
      selectedTime.push(time.id);
    }

    this.setState({
      selectedTime: selectedTime
    });
  };

  componentDidMount() {
    this.props.fetchAllDoctor();
    this.props.fetchAllHour();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.ListDoctor !== this.props.ListDoctor) {
      const options = this.buildDataSelect(this.props.ListDoctor);
      this.setState({ options });
    }

    if (prevProps.AllTime !== this.props.AllTime) {
      this.setState({ AllTime: this.props.AllTime });
    }
  }

  render() {
    const { AllTime, selectedTime, selectDoctor, currentDate, options } =
      this.state;
    console.log('selectedTime', selectedTime);

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
                options={options}
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
                    const active = selectedTime.includes(item.id);
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
            <button className="btn btn-primary btn-save-schedule">
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
  AllTime: state.admin.AllTime,
  ListDoctor: state.admin.AllDoctor,
});

const mapDispatchToProps = (dispatch) => ({
  fetchAllDoctor: () => dispatch(action.fetchAllDoctor()),
  fetchAllHour: () => dispatch(action.fetchAllHour()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedule);
