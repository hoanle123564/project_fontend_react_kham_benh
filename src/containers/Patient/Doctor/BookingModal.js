import React, { Component } from "react";
import { connect } from "react-redux";
import "./BookingModal.scss";
import * as action from "../../../store/actions";
import { languages } from "../../../utils";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { injectIntl } from "react-intl";
import moment from "moment";

class BookingModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpenModal: false,
            fỉrstName: "",
            lastName: "",
            phoneNumber: "",
            email: "",
            address: "",
            reason: "",
            day: "",
            gender: "",
            timeString: "",
            genderArr: [],
            profile: {},

            //  Thêm trạng thái lỗi
            errors: {},
        };
    }

    toggleModal = () => {
        this.props.toggleModal();
    };

    getFormattedDateTime = () => {
        const { ScheduleTime, language } = this.props;
        if (!ScheduleTime || !ScheduleTime.date) return "";

        const date = moment(ScheduleTime.date).format("DD/MM/YYYY");
        const dayOfWeek =
            language === languages.VI
                ? moment(ScheduleTime.date).locale("vi").format("dddd")
                : moment(ScheduleTime.date).locale("en").format("dddd");
        const day = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
        const time =
            language === languages.VI
                ? ScheduleTime.value_vi
                : ScheduleTime.value_en;


        return `${time} - ${day} - ${date}`;
    };

    // 🔹 Hàm kiểm tra dữ liệu hợp lệ
    validateForm = () => {
        const { fỉrstName, lastName, email, phoneNumber, address, reason, gender } =
            this.state;
        let errors = {};
        let isValid = true;

        // Kiểm tra rỗng
        if (!fỉrstName.trim()) {
            errors.fỉrstName = "Vui lòng nhập họ và tên lót.";
            isValid = false;
        }
        if (!lastName.trim()) {
            errors.lastName = "Vui lòng nhập tên.";
            isValid = false;
        }
        if (!email.trim()) {
            errors.email = "Vui lòng nhập email.";
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Địa chỉ email không hợp lệ.";
            isValid = false;
        }
        if (!phoneNumber.trim()) {
            errors.phoneNumber = "Vui lòng nhập số điện thoại.";
            isValid = false;
        } else if (!/^(0|\+84)[0-9]{9,10}$/.test(phoneNumber)) {
            errors.phoneNumber = "Số điện thoại không hợp lệ.";
            isValid = false;
        }
        if (!address.trim()) {
            errors.address = "Vui lòng nhập địa chỉ liên hệ.";
            isValid = false;
        }
        if (!reason.trim()) {
            errors.reason = "Vui lòng nhập lý do khám.";
            isValid = false;
        }
        if (!gender.trim()) {
            errors.gender = "Vui lòng chọn giới tính.";
            isValid = false;
        }

        this.setState({ errors });
        return isValid;
    };

    SavePatient = async () => {
        if (!this.validateForm()) {
            return;
        }

        console.log("Thông tin bệnh nhân", this.state);

        const res = await this.props.postPatientBooking({
            firstName: this.state.fỉrstName,
            lastName: this.state.lastName,
            phoneNumber: this.state.phoneNumber,
            email: this.state.email,
            address: this.state.address,
            reason: this.state.reason,
            date: this.state.day,
            doctorId: this.state.profile.id,
            timeType: this.props.ScheduleTime?.timeType,
            gender: this.state.gender,
            timeString: this.getFormattedDateTime(),
        });

        console.log("res", res);
    };

    componentDidMount() {
        this.props.getGender();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.DetailDoctor !== this.props.DetailDoctor) {
            this.setState({
                profile: this.props.DetailDoctor,
            });
        }
        if (prevProps.gender !== this.props.gender) {
            this.setState({
                genderArr: this.props.gender,
            });
        }
        if (
            this.props.ScheduleTime &&
            prevProps.ScheduleTime !== this.props.ScheduleTime
        ) {
            this.setState({
                day: this.props.ScheduleTime.date,
            });
        }
    }

    render() {
        const { profile, genderArr, errors } = this.state;
        const { language, intl } = this.props;

        return (
            <Modal
                isOpen={this.props.isOpenModal}
                toggle={this.toggleModal}
                className={"booking-modal-container"}
                size="lg"
                centered
            >
                <ModalHeader toggle={this.toggleModal}>
                    <i className="fa-solid fa-user me-2"></i>
                    Đặt lịch khám bệnh
                </ModalHeader>
                <ModalBody>
                    {/* --- Thông tin bác sĩ --- */}
                    <div className="doctor-booking-info d-flex align-items-center mb-3">
                        <div className="doctor-avatar me-3">
                            <img
                                src={
                                    profile?.image && profile.image !== "undefined"
                                        ? `data:image/jpeg;base64,${profile.image}`
                                        : "/default-doctor.png"
                                }
                                alt="doctor"
                            />
                        </div>
                        <div className="doctor-meta">
                            <h5 className="doctor-name mb-1">
                                {`${profile?.positionVi || ""}, Bác sĩ ${profile?.firstName || ""
                                    } ${profile?.lastName || ""}`}
                            </h5>
                            <p className="doctor-time text-warning fw-semibold mb-0">
                                <i className="fa-regular fa-clock me-1"></i>
                                {this.getFormattedDateTime()}
                            </p>


                        </div>
                    </div>

                    {/* --- Thông tin phòng khám --- */}
                    <div className="clinic-info text-secondary mb-3">
                        <i className="fa-solid fa-hospital me-2"></i>
                        {`Phòng khám ${profile.nameClinic || ""}`}
                        <p className="ms-4 text-muted mb-1">
                            <i className="fa-solid fa-location-dot me-1"></i>
                            {`Địa chỉ: ${profile.addressClinic || ""}, ${profile.province || ""
                                }`}
                        </p>
                        <div className="ms-4 text-muted mb-3">
                            <span className="fw-semibold">Giá khám:</span>
                            <span className="text-dark">
                                {language === "vi"
                                    ? ` ${Number(profile.priceVi || 0).toLocaleString("vi-VN")} VNĐ`
                                    : ` ${Number(profile.priceEn || 0).toLocaleString("en-US")} $`}
                            </span>
                        </div>
                    </div>

                    {/* --- Thông tin bệnh nhân --- */}
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label>Họ và tên lót</label>
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.fỉrstName}
                                onChange={(e) => this.setState({ fỉrstName: e.target.value })}
                            />
                            {errors.fỉrstName && (
                                <small className="text-danger">{errors.fỉrstName}</small>
                            )}
                        </div>
                        <div className="col-md-6">
                            <label>Tên</label>
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.lastName}
                                onChange={(e) => this.setState({ lastName: e.target.value })}
                            />
                            {errors.lastName && (
                                <small className="text-danger">{errors.lastName}</small>
                            )}
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label>Email</label>
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.email}
                                onChange={(e) => this.setState({ email: e.target.value })}
                            />
                            {errors.email && (
                                <small className="text-danger">{errors.email}</small>
                            )}
                        </div>
                        <div className="col-md-6">
                            <label>Địa chỉ liên hệ</label>
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.address}
                                onChange={(e) => this.setState({ address: e.target.value })}
                            />
                            {errors.address && (
                                <small className="text-danger">{errors.address}</small>
                            )}
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label>SĐT</label>
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.phoneNumber}
                                onChange={(e) => this.setState({ phoneNumber: e.target.value })}
                            />
                            {errors.phoneNumber && (
                                <small className="text-danger">{errors.phoneNumber}</small>
                            )}
                        </div>
                        <div className="col-md-6">
                            <label>Giới tính</label>
                            <select
                                className="form-select"
                                value={this.state.gender}
                                onChange={(e) => this.setState({ gender: e.target.value })}
                            >
                                <option value="">
                                    {intl.formatMessage({ id: "user-manage.choose" })}
                                </option>
                                {genderArr.map((item, index) => (
                                    <option key={index} value={item.keyMap}>
                                        {language === languages.VI
                                            ? item.value_vi
                                            : item.value_en}
                                    </option>
                                ))}
                            </select>
                            {errors.gender && (
                                <small className="text-danger">{errors.gender}</small>
                            )}
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-12">
                            <label>Lý do khám</label>
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.reason}
                                onChange={(e) => this.setState({ reason: e.target.value })}
                            />
                            {errors.reason && (
                                <small className="text-danger">{errors.reason}</small>
                            )}
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button color="primary" onClick={this.SavePatient}>
                        Xác nhận đặt khám
                    </Button>
                    <Button color="secondary" onClick={this.toggleModal}>
                        Đóng
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
    isLoggedIn: state.user.isLoggedIn,
    DetailDoctor: state.admin.DetailDoctor,
    gender: state.admin.genderArr,
});

const mapDispatchToProps = (dispatch) => ({
    getGender: () => dispatch(action.fetchGender()),
    GetDetailDoctor: (id) => dispatch(action.GetDetailDoctor(id)),
    postPatientBooking: (data) => dispatch(action.SavePatientBooking(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(BookingModal));
