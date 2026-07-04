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
  updateScheduleDoctor,
  DeleteScheduleDoctor
} from "../../services/userService";

const APPOINTMENT_TYPES = [
  { id: "AT1", vi: "Khám tại cơ sở", en: "In-person" },
  { id: "AT2", vi: "Khám online", en: "Online" },
];

const formatPriceInput = (value) => {
  if (value === null || value === undefined || value === "") return "";
  return String(Number(value) || 0);
};

const formatVnd = (value) => {
  const price = Number(value) || 0;
  return `${price.toLocaleString("vi-VN")} VND`;
};

const parsePriceInput = (value) => {
  if (value === "") return { valid: true, value: "" };
  const price = Number(value);
  return {
    valid: Number.isFinite(price) && price >= 0 && Number.isInteger(price),
    value: price,
  };
};

class ManageSchedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectDoctor: "",
      ListDoctor: [],
      currentDate: new Date(),
      AllTime: [],
      selectedTime: [],
      appointmentTypeId: "AT1",
      priceInput: "",
      priceTouched: false,
      editingPrices: {},
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
      price: Number(item.priceVi) || 0,
      onlinePrice: Number(item.onlinePriceVi) || 0,
    }));
  };

  getDoctorDefaultPrice = (doctor = this.state.selectDoctor, appointmentTypeId = this.state.appointmentTypeId) => {
    if (!doctor) return "";
    const price = appointmentTypeId === "AT2" ? doctor.onlinePrice : doctor.price;
    return price ? String(price) : "";
  };

  syncSuggestedPrice = (doctor, appointmentTypeId) => {
    if (this.state.priceTouched && this.state.priceInput !== "") return;
    this.setState({ priceInput: this.getDoctorDefaultPrice(doctor, appointmentTypeId) });
  };

  // Khi chọn bác sĩ => load lịch theo ngày hiện tại
  handleChangeSelect = async (selectDoctor) => {
    this.setState({
      selectDoctor,
      selectedTime: [] // Reset select time khi đổi bác sĩ
    });
    this.setState({
      priceTouched: false,
      priceInput: this.getDoctorDefaultPrice(selectDoctor, this.state.appointmentTypeId),
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
      this.setState({
        registeredSchedule: res.data,
        editingPrices: this.buildEditingPrices(res.data),
      });
    } else {
      this.setState({ registeredSchedule: [], editingPrices: {} });
    }
  };

  buildEditingPrices = (items = []) => {
    return items.reduce((result, item) => {
      result[item.id] = formatPriceInput(item.price ?? item.effectivePrice);
      return result;
    }, {});
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

  handleAppointmentTypeChange = (appointmentTypeId) => {
    this.setState({ appointmentTypeId }, () => {
      this.syncSuggestedPrice(this.state.selectDoctor, appointmentTypeId);
    });
  };

  handlePriceChange = (event) => {
    this.setState({
      priceInput: event.target.value,
      priceTouched: true,
    });
  };

  handleEditingPriceChange = (id, value) => {
    this.setState((prev) => ({
      editingPrices: {
        ...prev.editingPrices,
        [id]: value,
      },
    }));
  };

  getAppointmentTypeLabel = (item = {}) => {
    const fallback = APPOINTMENT_TYPES.find((type) => type.id === item.appointmentTypeId);
    if (this.props.language === "vi") {
      return item.appointmentTypeVi || fallback?.vi || item.appointmentTypeId || "AT1";
    }

    return item.appointmentTypeEn || fallback?.en || item.appointmentTypeId || "AT1";
  };

  // Lưu lịch
  handleSaveSchedule = async () => {
    const { selectedTime, selectDoctor, currentDate, appointmentTypeId, priceInput } = this.state;

    if (!currentDate) return toast.error("Invalid date!");
    if (!selectDoctor) return toast.error("Vui lòng chọn bác sĩ!");
    if (selectedTime.length === 0) return toast.error("Chưa chọn khung giờ!");

    const parsedPrice = parsePriceInput(priceInput);
    if (!parsedPrice.valid) return toast.error("Gia kham phai la so nguyen khong am!");

    const formattedDate = moment(currentDate).format("DD/MM/YYYY");

    const res = await postScheduleDoctor({
      doctorId: selectDoctor.value,
      date: formattedDate,
      timeType: selectedTime,
      appointmentTypeId,
      price: parsedPrice.value,
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
  handleUpdateSchedulePrice = async (item) => {
    const rawPrice = this.state.editingPrices[item.id] ?? "";
    const parsedPrice = parsePriceInput(rawPrice);
    if (!parsedPrice.valid) return toast.error("Gia kham phai la so nguyen khong am!");

    const res = await updateScheduleDoctor({
      id: item.id,
      price: parsedPrice.value,
    });

    if (res && res.errCode === 0) {
      toast.success(this.props.language === "vi" ? "Cap nhat gia thanh cong!" : "Price updated!");
      this.loadScheduleForDate(this.state.selectDoctor?.value, this.state.currentDate);
    } else {
      toast.error(res?.errMessage || "Update failed!");
    }
  };

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
    this.props.GetAllClinic();
    this.props.fetchAllHour();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.ListDoctor !== this.props.ListDoctor ||
      prevProps.ListClinic !== this.props.ListClinic ||
      prevProps.userInfo !== this.props.userInfo
    ) {
      const ListDoctor = this.buildDataSelect(this.getVisibleDoctors());
      const selectedDoctor = ListDoctor.find(
        (doctor) => doctor.value === this.state.selectDoctor?.value
      );

      this.setState({
        ListDoctor,
        selectDoctor: selectedDoctor || "",
        registeredSchedule: selectedDoctor ? this.state.registeredSchedule : [],
      });
    }

    if (prevProps.AllScheduleTime !== this.props.AllScheduleTime) {
      const sorted = this.sortTimeSlots(this.props.AllScheduleTime);
      this.setState({ AllTime: sorted });
    }
  }

  isClinicManager = () => this.props.userInfo?.roleId === "R4";

  getManagedClinicIds = () => {
    if (!this.isClinicManager()) {
      return null;
    }

    return (this.props.ListClinic || [])
      .filter((clinic) => Number(clinic.managerUserId) === Number(this.props.userInfo?.id))
      .map((clinic) => Number(clinic.id));
  };

  getVisibleDoctors = () => {
    const managedClinicIds = this.getManagedClinicIds();
    if (!managedClinicIds) {
      return this.props.ListDoctor || [];
    }

    return (this.props.ListDoctor || []).filter((doctor) =>
      managedClinicIds.includes(Number(doctor.clinicId))
    );
  };

  render() {
    const {
      AllTime,
      selectedTime,
      appointmentTypeId,
      priceInput,
      editingPrices,
      selectDoctor,
      currentDate,
      ListDoctor,
      registeredSchedule
    } = this.state;
    const visibleRegisteredSchedule = registeredSchedule.filter(
      (item) => (item.appointmentTypeId || "AT1") === appointmentTypeId
    );

    return (
      <div className="manage-schedule-container manage-schedule-container--admin">

        <div className="m-s-title">
          <FormattedMessage id="manage-schedule.title" />
        </div>

        <div className="container">
          <div className="row">

            {/* Select bác sĩ */}
            <div className="col-6 form-group">
              <label><FormattedMessage id="manage-schedule.choose-doctor" /></label>
              <Select
                classNamePrefix="schedule-doctor-select"
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

            <div className="col-12 appointment-type-container">
              <label>{this.props.language === "vi" ? "Loại lịch khám" : "Appointment type"}</label>
              <div className={`appointment-type-tabs appointment-type-tabs--${appointmentTypeId}`}>
                {APPOINTMENT_TYPES.map((type) => (
                  <button
                    type="button"
                    key={type.id}
                    className={appointmentTypeId === type.id ? "active" : ""}
                    onClick={() => this.handleAppointmentTypeChange(type.id)}
                  >
                    {this.props.language === "vi" ? type.vi : type.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn giờ */}
            <div className="col-12 col-md-4 form-group schedule-price-field">
              <label>{this.props.language === "vi" ? "Giá khám" : "Consultation price"}</label>
              <input
                type="number"
                min="0"
                step="1"
                className="form-control"
                value={priceInput}
                onChange={this.handlePriceChange}
                placeholder={this.props.language === "vi" ? "Nhap gia kham" : "Enter price"}
              />
              <small>{formatVnd(priceInput || this.getDoctorDefaultPrice())}</small>
            </div>

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

              {visibleRegisteredSchedule.length === 0 ? (
                <div className="text-muted">{this.props.language === 'vi' ? 'Chưa có ca nào.' : 'No shifts yet.'}</div>
              ) : (
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{this.props.language === 'vi' ? 'Khung giờ' : 'Time slot'}</th>
                      <th>{this.props.language === 'vi' ? 'Loại khám' : 'Type'}</th>
                      <th>{this.props.language === 'vi' ? 'Giá khám' : 'Price'}</th>
                      <th>{this.props.language === 'vi' ? 'Xoá' : 'Delete'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRegisteredSchedule.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>{item.value_vi}</td>
                        <td>{this.getAppointmentTypeLabel(item)}</td>
                        <td className="schedule-price-cell">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={editingPrices[item.id] ?? ""}
                            onChange={(event) => this.handleEditingPriceChange(item.id, event.target.value)}
                          />
                          <span>{formatVnd(editingPrices[item.id] ?? item.effectivePrice)}</span>
                          <button
                            type="button"
                            className="btn-save-price"
                            onClick={() => this.handleUpdateSchedulePrice(item)}
                          >
                            {this.props.language === 'vi' ? 'Lưu' : 'Save'}
                          </button>
                        </td>
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
  ListClinic: state.admin.AllClinic,
});

const mapDispatchToProps = (dispatch) => ({
  fetchAllDoctor: () => dispatch(action.fetchAllDoctor()),
  GetAllClinic: () => dispatch(action.GetAllClinic()),
  fetchAllHour: () => dispatch(action.fetchAllHour()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedule);
