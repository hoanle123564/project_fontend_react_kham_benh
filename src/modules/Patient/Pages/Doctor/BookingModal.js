import React, { Component } from "react";
import { connect } from "react-redux";
import "./BookingModal.scss";
import * as action from "../../../../store/actions";
import { languages } from "../../../../utils";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { injectIntl } from "react-intl";
import moment from "moment";
import { getDetailDoctor } from "../../../../services/userService";
class BookingModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
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

    validateForm = (isLoggedIn) => {
        const { fỉrstName, lastName, email, phoneNumber, address, reason, gender } = this.state;
        let errors = {};
        let isValid = true;

        // Lý do khám luôn phải có
        if (!reason.trim()) {
            errors.reason = "Vui lòng nhập lý do khám.";
            isValid = false;
        }

        // Nếu KHÔNG đăng nhập → phải nhập full form
        if (!isLoggedIn) {
            if (!fỉrstName.trim()) { errors.fỉrstName = "Vui lòng nhập họ và tên lót."; isValid = false; }
            if (!lastName.trim()) { errors.lastName = "Vui lòng nhập tên."; isValid = false; }
            if (!email.trim()) { errors.email = "Vui lòng nhập email."; isValid = false; }
            if (!phoneNumber.trim()) { errors.phoneNumber = "Vui lòng nhập số điện thoại."; isValid = false; }
            if (!address.trim()) { errors.address = "Vui lòng nhập địa chỉ liên hệ."; isValid = false; }
            if (!gender.trim()) { errors.gender = "Vui lòng chọn giới tính."; isValid = false; }
        }

        this.setState({ errors });
        return isValid;
    };

    SavePatient = async () => {
        const { isLoggedIn, patientInfo } = this.props;

        if (!this.validateForm(isLoggedIn)) return;

        let submitData = {
            doctorId: this.state.profile.id,
            date: this.state.day,
            timeType: this.props.ScheduleTime?.timeType,
            timeString: this.getFormattedDateTime(),
            reason: this.state.reason,
        };

        if (isLoggedIn) {
            // LẤY DỮ LIỆU TỪ REDUX PATIENT
            submitData.patientId = patientInfo.id;
            submitData.firstName = patientInfo.firstName;
            submitData.lastName = patientInfo.lastName;
            submitData.email = patientInfo.email;
            submitData.address = patientInfo.address;
            submitData.gender = patientInfo.gender;
            submitData.phoneNumber = patientInfo.phoneNumber;
        } else {
            // FORM TỰ NHẬP
            submitData.firstName = this.state.fỉrstName;
            submitData.lastName = this.state.lastName;
            submitData.email = this.state.email;
            submitData.address = this.state.address;
            submitData.gender = this.state.gender;
            submitData.phoneNumber = this.state.phoneNumber;
        }

        const res = await this.props.postPatientBooking(submitData);

        if (res && res.errCode === 0) {
            this.toggleModal();
            this.setState({
                fỉrstName: "",
                lastName: "",
                phoneNumber: "",
                email: "",
                address: "",
                reason: "",
                gender: "",
            });
        }
    };

    async componentDidMount() {
        this.props.getGender();
        await this.loadInfo();
    }

    loadInfo = async () => {
        const { profile } = this.props;
        if (profile?.id) {
            let res = await getDetailDoctor(profile.id);
            if (res && res.errCode === 0) {
                this.setState({ profile: res.data });
            }
        }
    };

    componentDidUpdate = async (prevProps) => {
        if (prevProps.profile !== this.props.profile) {
            await this.loadInfo();
        }
        if (prevProps.gender !== this.props.gender) {
            this.setState({ genderArr: this.props.gender });
        }
        if (this.props.ScheduleTime && prevProps.ScheduleTime !== this.props.ScheduleTime) {
            this.setState({ day: this.props.ScheduleTime.date });
        }
    };

    render() {
        const { profile, genderArr, errors } = this.state;
        const { language, isLoggedIn, patientInfo, intl } = this.props;
        console.log('ScheduleTime', this.props.ScheduleTime);

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
                    {/* Bác sĩ */}
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
                                {`${profile?.positionVi || ""}, Bác sĩ ${profile?.firstName || ""} ${profile?.lastName || ""}`}
                            </h5>
                            <p className="doctor-time text-warning fw-semibold mb-0">
                                <i className="fa-regular fa-clock me-1"></i>
                                {this.getFormattedDateTime()}
                            </p>
                        </div>
                    </div>

                    {/* Nếu đã đăng nhập → KHÔNG hiển thị full form */}
                    {isLoggedIn ? (
                        <div className="alert alert-info">
                            Bạn đang đăng nhập bằng email: <b>{patientInfo.email}</b>
                            <br />
                            Thông tin cá nhân sẽ được dùng để đặt lịch.
                        </div>
                    ) : (
                        <>
                            {/* FORM CŨ — GIỮ NGUYÊN 100% */}
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label>Họ và tên lót</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={this.state.fỉrstName}
                                        onChange={(e) => this.setState({ fỉrstName: e.target.value })}
                                    />
                                    {errors.fỉrstName && <small className="text-danger">{errors.fỉrstName}</small>}
                                </div>

                                <div className="col-md-6">
                                    <label>Tên</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={this.state.lastName}
                                        onChange={(e) => this.setState({ lastName: e.target.value })}
                                    />
                                    {errors.lastName && <small className="text-danger">{errors.lastName}</small>}
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
                                    {errors.email && <small className="text-danger">{errors.email}</small>}
                                </div>

                                <div className="col-md-6">
                                    <label>Địa chỉ liên hệ</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={this.state.address}
                                        onChange={(e) => this.setState({ address: e.target.value })}
                                    />
                                    {errors.address && <small className="text-danger">{errors.address}</small>}
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
                                    {errors.phoneNumber && <small className="text-danger">{errors.phoneNumber}</small>}
                                </div>

                                <div className="col-md-6">
                                    <label>Giới tính</label>
                                    <select
                                        className="form-select"
                                        value={this.state.gender}
                                        onChange={(e) => this.setState({ gender: e.target.value })}
                                    >
                                        <option value="">{intl.formatMessage({ id: "user-manage.choose" })}</option>
                                        {genderArr.map((item, index) => (
                                            <option key={index} value={item.keyMap}>
                                                {language === languages.VI ? item.value_vi : item.value_en}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.gender && <small className="text-danger">{errors.gender}</small>}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Lý do khám – luôn hiển thị */}
                    <div className="row mb-3">
                        <div className="col-md-12">
                            <label>Lý do khám</label>
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.reason}
                                onChange={(e) => this.setState({ reason: e.target.value })}
                            />
                            {errors.reason && <small className="text-danger">{errors.reason}</small>}
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
    isLoggedIn: state.patient.isLoggedIn,
    patientInfo: state.patient.patientInfo,
    gender: state.admin.genderArr,
});

const mapDispatchToProps = (dispatch) => ({
    getGender: () => dispatch(action.fetchGender()),
    postPatientBooking: (data) => dispatch(action.SavePatientBooking(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(BookingModal));
