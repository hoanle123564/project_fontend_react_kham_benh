import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { injectIntl } from "react-intl";
import moment from "moment";
import { toast } from "react-toastify";

import "./BookingModal.scss";
import EditModal from "../Profile/EditModal";
import { languages, path } from "../../../../utils";
import { isTokenValid } from "../../../../hoc/authentication";
import {
    getDetailDoctor,
    getPatientProfile,
    getScheduleDoctor,
    postPatientBooking,
    updatePatientProfile,
} from "../../../../services/userService";
import { getOnlineBookingPayment, startOnlineBookingPayment } from "../../../../services/onlineBookingPaymentService";

class BookingModal extends Component {
    state = {
        doctorProfile: null,
        patientProfile: null,
        schedule: null,
        isDetailsOpen: true,
        isEditingProfile: false,
        isLoading: false,
        isSubmitting: false,
        isSavingProfile: false,
        reason: "",
        errorMessage: "",
        submitError: "",
        payment: null,
        authRequired: false,
    };

    componentDidMount() {
        if (this.props.isOpenModal) this.loadBookingData();
    }

    componentDidUpdate(prevProps) {
        if (
            (!prevProps.isOpenModal && this.props.isOpenModal) ||
            (this.props.isOpenModal && prevProps.ScheduleTime !== this.props.ScheduleTime)
        ) {
            this.loadBookingData();
        }
        if (prevProps.isOpenModal && !this.props.isOpenModal) this.clearPaymentPolling();
    }

    componentWillUnmount() {
        this.clearPaymentPolling();
    }

    getText = (key, defaultMessage) =>
        this.props.intl.formatMessage({
            id: `booking-modal.${key}`,
            defaultMessage,
        });

    getErrorMessage = (error, fallback) =>
        error?.response?.data?.errMessage || error?.message || fallback;

    isAuthError = (error) => [401, 403].includes(error?.response?.status);

    loadBookingData = async () => {
        const { ScheduleTime, profile, isLoggedIn } = this.props;
        const doctorId = ScheduleTime?.doctorId || profile?.id;

        if (!isLoggedIn) return;

        if (!ScheduleTime?.id || !doctorId || !ScheduleTime?.date) {
            this.setState({
                schedule: null,
                isLoading: false,
                errorMessage: this.getText("schedule-not-found", "Không tìm thấy lịch khám đã chọn."),
            });
            return;
        }

        this.setState({
            isLoading: true,
            errorMessage: "",
            submitError: "",
            schedule: null,
            payment: null,
            authRequired: false,
        });
        this.paymentSucceeded = false;

        try {
            const [patientRes, doctorRes, scheduleRes] = await Promise.all([
                getPatientProfile(),
                getDetailDoctor(doctorId),
                getScheduleDoctor(doctorId, ScheduleTime.date),
            ]);
            const schedule = (scheduleRes?.data || []).find(
                (item) => Number(item.id) === Number(ScheduleTime.id)
            );

            if (patientRes?.errCode !== 0 || !patientRes?.data) {
                throw new Error(this.getText("patient-not-found", "Không tìm thấy hồ sơ bệnh nhân."));
            }

            if (doctorRes?.errCode !== 0 || !doctorRes?.data) {
                throw new Error(this.getText("doctor-not-found", "Không tìm thấy thông tin bác sĩ."));
            }

            if (!schedule) {
                throw new Error(this.getText("schedule-not-found", "Lịch khám đã chọn không còn khả dụng."));
            }

            this.setState({
                patientProfile: patientRes.data,
                doctorProfile: doctorRes.data,
                schedule,
                isLoading: false,
            });
        } catch (error) {
            const authRequired = this.isAuthError(error);
            this.setState({
                isLoading: false,
                authRequired,
                errorMessage: authRequired ? "" : this.getErrorMessage(
                    error,
                    this.getText("load-error", "Không thể tải thông tin đặt khám.")
                ),
            });
        }
    };

    toggleModal = () => {
        if (!this.state.isSubmitting) this.props.toggleModal();
    };

    getFullName = (person = {}) =>
        `${person.firstName || ""} ${person.lastName || ""}`.trim() || this.getText("not-updated", "Chưa cập nhật");

    getInitials = (person = {}) =>
        `${person.firstName || ""} ${person.lastName || ""}`
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("") || "?";

    getImageSrc = (image) => {
        if (!image || image === "undefined") return "";
        return image.startsWith?.("data:") ? image : `data:image/jpeg;base64,${image}`;
    };

    formatDate = (value) => {
        const date = moment(value);
        return date.isValid() ? date.format("DD/MM/YYYY") : this.getText("not-updated", "Chưa cập nhật");
    };

    formatGender = (value) => {
        if (value === "M") return this.getText("male", "Nam");
        if (value === "F") return this.getText("female", "Nữ");
        if (value === "O") return this.getText("other", "Khác");
        return this.getText("not-updated", "Chưa cập nhật");
    };

    formatTime = (schedule = {}) => {
        if (schedule.startTime && schedule.endTime) {
            return `${String(schedule.startTime).slice(0, 5)} - ${String(schedule.endTime).slice(0, 5)}`;
        }

        return this.props.language === languages.VI ? schedule.value_vi : schedule.value_en;
    };

    getPrice = () => Number(this.state.schedule?.effectivePrice);

    hasValidPrice = () => Number.isInteger(this.getPrice()) && this.getPrice() > 0;

    formatMoney = (value) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(value);

    handleProfileSave = async (data) => {
        this.setState({ isSavingProfile: true });
        try {
            const response = await updatePatientProfile(data);
            if (response?.errCode !== 0 || !response?.data) {
                throw new Error(response?.errMessage || this.getText("profile-save-error", "Không thể cập nhật hồ sơ."));
            }

            this.setState({
                patientProfile: response.data,
                isEditingProfile: false,
                isSavingProfile: false,
            });
            this.props.patientEditSuccess(response.data);
            toast.success(response.errMessage || this.getText("profile-save-success", "Đã cập nhật hồ sơ."));
        } catch (error) {
            this.setState({ isSavingProfile: false });
            toast.error(this.getErrorMessage(error, this.getText("profile-save-error", "Không thể cập nhật hồ sơ.")));
        }
    };

    handleSubmit = async () => {
        const { schedule } = this.state;
        if (!schedule || !this.hasValidPrice() || this.state.isSubmitting) return;

        this.setState({ isSubmitting: true, submitError: "" });

        try {
            if (schedule.appointmentTypeId === "AT2") {
                const response = await startOnlineBookingPayment({
                    scheduleId: schedule.id,
                    reason: this.state.reason.trim() || null,
                });
                if (response?.errCode !== 0 || !response?.data?.payment) {
                    throw new Error(response?.errMessage || this.getText("submit-error", "Unable to create payment."));
                }
                this.setState({ isSubmitting: false, payment: response.data.payment }, this.startPaymentPolling);
                return;
            }

            const response = await postPatientBooking({
                scheduleId: schedule.id,
                reason: this.state.reason.trim() || null,
            });

            if (response?.errCode !== 0) {
                throw new Error(response?.errMessage || this.getText("submit-error", "Không thể đặt lịch khám."));
            }

            toast.success(response.errMessage || this.getText("submit-success", "Đặt lịch thành công."));
            this.setState({ reason: "", isSubmitting: false });
            this.toggleModal();
        } catch (error) {
            if (this.isAuthError(error)) {
                this.setState({ isSubmitting: false, submitError: "", authRequired: true });
                return;
            }

            const submitError = this.getErrorMessage(
                error,
                this.getText("submit-error", "Không thể đặt lịch khám.")
            );
            this.setState({ isSubmitting: false, submitError });
            toast.error(submitError);
        }
    };

    clearPaymentPolling = () => {
        window.clearTimeout(this.paymentPollTimer);
        this.paymentPollTimer = null;
    };

    isTerminalPayment = (status) => ["PAID", "FAILED", "EXPIRED", "REFUNDED"].includes(status);

    handlePaymentSuccess = (payment) => {
        if (this.paymentSucceeded) return;
        this.paymentSucceeded = true;
        this.clearPaymentPolling();
        this.setState({ payment });
        toast.success(this.getText("payment-success", "Thanh toán thành công"));
        window.setTimeout(() => {
            if (this.props.isOpenModal) this.toggleModal();
        }, 1200);
    };

    applyPaymentStatus = (payment) => {
        if (payment.status === "PAID") return this.handlePaymentSuccess(payment);
        this.setState({ payment });
        if (this.isTerminalPayment(payment.status)) this.clearPaymentPolling();
    };

    checkPaymentStatus = async (isPolling = false) => {
        const { payment } = this.state;
        if (!payment?.bookingId || this.isCheckingPayment) return;
        this.isCheckingPayment = true;
        if (!isPolling) this.setState({ isCheckingPayment: true });
        try {
            const response = await getOnlineBookingPayment(payment.bookingId);
            if (response?.errCode !== 0) throw new Error(response?.errMessage);
            const updatedPayment = { ...payment, ...response.data };
            this.applyPaymentStatus(updatedPayment);
            return updatedPayment;
        } catch (error) {
            if (!isPolling) toast.error(this.getErrorMessage(error, this.getText("payment-check-error", "Unable to check payment.")));
            this.clearPaymentPolling();
            return null;
        } finally {
            this.isCheckingPayment = false;
            if (!isPolling) this.setState({ isCheckingPayment: false });
        }
    };

    startPaymentPolling = () => {
        this.clearPaymentPolling();
        const poll = async () => {
            const { payment } = this.state;
            if (!this.props.isOpenModal || !payment || this.isTerminalPayment(payment.status) || Date.parse(payment.expiresAt) <= Date.now()) {
                this.clearPaymentPolling();
                return;
            }
            const updatedPayment = await this.checkPaymentStatus(true);
            if (updatedPayment && !this.paymentSucceeded && !this.isTerminalPayment(updatedPayment.status)) this.paymentPollTimer = window.setTimeout(poll, 4000);
        };
        this.paymentPollTimer = window.setTimeout(poll, 4000);
    };

    renderAvatar = (person, className) => {
        const image = this.getImageSrc(person?.image);
        return (
            <div className={className} aria-hidden="true">
                {image ? <img src={image} alt="" /> : <span>{this.getInitials(person)}</span>}
            </div>
        );
    };

    renderDetails = () => {
        const { patientProfile } = this.state;
        const rows = [
            [this.getText("medical-code", "Mã bệnh nhân"), patientProfile.medicalCode],
            [this.getText("full-name", "Họ và tên"), this.getFullName(patientProfile)],
            [this.getText("gender", "Giới tính"), this.formatGender(patientProfile.gender)],
            [this.getText("date-of-birth", "Ngày sinh"), this.formatDate(patientProfile.dateOfBirth)],
            [this.getText("phone", "Số điện thoại"), patientProfile.phoneNumber],
        ];

        return (
            <div className="booking-modal__patient-details">
                {rows.map(([label, value]) => (
                    <div className="booking-modal__detail-row" key={label}>
                        <span>{label}</span>
                        <strong>{value || "—"}</strong>
                    </div>
                ))}
            </div>
        );
    };

    renderPatientColumn = () => {
        const { patientProfile, isDetailsOpen, reason } = this.state;

        return (
            <section className="booking-modal__left-column">
                <div className="booking-modal__card booking-modal__patient-card">
                    <div className="booking-modal__patient-header">
                        <div className="booking-modal__patient-heading">
                            {this.renderAvatar(patientProfile, "booking-modal__patient-avatar")}
                            <div>
                                <span className="booking-modal__self-badge">{this.getText("self", "Tôi")}</span>
                                <h2>{this.getFullName(patientProfile)}</h2>
                                <p>{this.formatDate(patientProfile.dateOfBirth)}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="booking-modal__collapse-button"
                            onClick={() => this.setState((state) => ({ isDetailsOpen: !state.isDetailsOpen }))}
                            aria-expanded={isDetailsOpen}
                            aria-label={this.getText("toggle-patient", "Thu gọn hoặc mở rộng thông tin bệnh nhân")}
                        >
                            <i className={`fas fa-chevron-${isDetailsOpen ? "up" : "down"}`}></i>
                        </button>
                    </div>
                    {isDetailsOpen && this.renderDetails()}
                    <button
                        type="button"
                        className="booking-modal__adjust-button"
                        onClick={() => this.setState({ isEditingProfile: true })}
                    >
                        {this.getText("adjust", "Điều chỉnh")}
                    </button>
                </div>

                <div className="booking-modal__note-section">
                    <h2>{this.getText("additional-info", "Thông tin bổ sung (không bắt buộc)")}</h2>
                    <label htmlFor="booking-note">{this.getText("note", "Ghi chú")}</label>
                    <textarea
                        id="booking-note"
                        value={reason}
                        onChange={(event) => this.setState({ reason: event.target.value })}
                        placeholder={this.getText("note-placeholder", "Triệu chứng, thuốc đang dùng, tiền sử, ...")}
                        disabled={this.state.isSubmitting}
                    />
                </div>
            </section>
        );
    };

    renderBookingColumn = () => {
        const { doctorProfile, patientProfile, schedule, isSubmitting, payment, isCheckingPayment } = this.state;
        const isOnline = schedule.appointmentTypeId === "AT2";
        const appointmentType = isOnline
            ? this.getText("online", "Khám trực tuyến")
            : this.getText("in-person", "Khám trực tiếp");
        const location = isOnline
            ? appointmentType
            : doctorProfile.clinicAddress || this.getText("not-updated", "Chưa cập nhật");
        const rows = [
            [this.getText("appointment-date", "Ngày khám"), this.formatDate(schedule.date)],
            [this.getText("time-slot", "Khung giờ"), this.formatTime(schedule)],
            [this.getText("appointment-type", "Hình thức"), appointmentType],
            [this.getText("patient", "Bệnh nhân"), this.getFullName(patientProfile)],
            [this.getText("price", "Giá khám"), this.hasValidPrice() ? this.formatMoney(this.getPrice()) : null],
        ];

        return (
            <aside className="booking-modal__right-column">
                <div className="booking-modal__card booking-modal__summary-card">
                    <h2>{this.getText("booking-info", "Thông tin đặt khám")}</h2>
                    <div className="booking-modal__doctor-summary">
                        {this.renderAvatar(doctorProfile, "booking-modal__doctor-avatar")}
                        <div>
                            <h3>{this.getFullName(doctorProfile)}</h3>
                            {doctorProfile.specialtyName && <p>{doctorProfile.specialtyName}</p>}
                            <span>{location}</span>
                        </div>
                    </div>
                    <div className="booking-modal__summary-rows">
                        {rows.map(([label, value]) => (
                            <div className={`booking-modal__summary-row${label === this.getText("price", "Giá khám") ? " booking-modal__summary-row--price" : ""}`} key={label}>
                                <span>{label}</span>
                                <strong>{value || this.getText("price-unavailable", "Chưa xác định được giá khám")}</strong>
                            </div>
                        ))}
                    </div>
                    {payment ? <div className="booking-modal__payment" aria-live="polite">
                        <h3>{this.getText("payment-title", "SePay payment")}</h3>
                        {payment.qrCodeUrl && <img src={payment.qrCodeUrl} alt={this.getText("payment-qr", "SePay payment QR code")} />}
                        <p>{this.getText("payment-code", "Transfer content")}: <strong>{payment.paymentCode}</strong></p>
                        <p>{this.getText("payment-amount", "Amount")}: <strong>{this.formatMoney(payment.amount)}</strong></p>
                        <p>{this.getText("payment-expires", "Expires")}: {moment(payment.expiresAt).format("DD/MM/YYYY HH:mm")}</p>
                        {payment.status === "PENDING" && <p>{this.getText("payment-waiting", "Waiting for SePay confirmation. This button does not confirm payment.")}</p>}
                        <button type="button" className="booking-modal__submit-button" onClick={() => this.checkPaymentStatus(false)} disabled={isCheckingPayment}>
                            {isCheckingPayment ? this.getText("payment-checking", "Checking payment...") : this.getText("payment-check", "Check payment status")}
                        </button>
                    </div> : <button
                        type="button"
                        className="booking-modal__submit-button"
                        onClick={this.handleSubmit}
                        disabled={!this.hasValidPrice() || isSubmitting}
                    >
                        {isSubmitting
                            ? this.getText("submitting", "Đang xử lý...")
                            : isOnline
                                ? this.getText("book-and-pay", "Đặt lịch và thanh toán")
                                : this.getText("book", "Đặt lịch")}
                    </button>}
                </div>
                <p className="booking-modal__terms">
                    {this.getText("terms", "Bằng cách nhấn nút xác nhận, bạn đã đồng ý với các điều khoản và điều kiện đặt khám.")}
                </p>
            </aside>
        );
    };

    renderLoading = () => (
        <div className="booking-modal__loading" aria-live="polite">
            <div className="booking-modal__skeleton booking-modal__skeleton--large"></div>
            <div className="booking-modal__skeleton booking-modal__skeleton--small"></div>
        </div>
    );

    render() {
        const { isOpenModal, isLoggedIn } = this.props;
        const { isLoading, patientProfile, doctorProfile, schedule, errorMessage, submitError, authRequired } = this.state;
        const loginRequired = !isLoggedIn || authRequired;

        return (
            <>
                <Modal
                    isOpen={isOpenModal}
                    toggle={this.toggleModal}
                    className="booking-modal-container"
                    size="xl"
                    centered
                >
                    <ModalHeader toggle={this.toggleModal}>
                        <i className="fa-solid fa-calendar-check me-2"></i>
                        {this.getText("title", "Xác nhận đặt lịch khám")}
                    </ModalHeader>
                    <ModalBody>
                        {loginRequired ? (
                            <div className="booking-modal__login-required">
                                <p>{this.getText("login-required", "Bạn cần đăng nhập để đặt lịch khám.")}</p>
                                <Link
                                    className="booking-modal__login-button"
                                    to={{
                                        pathname: path.LOGIN,
                                        state: {
                                            returnTo: this.props.returnTo,
                                            resumeBooking: this.props.ScheduleTime,
                                        },
                                    }}
                                    onClick={this.toggleModal}
                                >
                                    {this.getText("login", "Đăng nhập")}
                                </Link>
                            </div>
                        ) : isLoading ? (
                            this.renderLoading()
                        ) : errorMessage || !patientProfile || !doctorProfile || !schedule ? (
                            <div className="booking-modal__state-error" role="alert">
                                {errorMessage || this.getText("load-error", "Không thể tải thông tin đặt khám.")}
                                <button type="button" onClick={this.loadBookingData}>
                                    {this.getText("retry", "Thử lại")}
                                </button>
                            </div>
                        ) : (
                            <div className="booking-modal__layout">
                                {this.renderPatientColumn()}
                                {this.renderBookingColumn()}
                            </div>
                        )}
                        {submitError && <div className="booking-modal__submit-error" role="alert">{submitError}</div>}
                    </ModalBody>
                </Modal>
                {this.state.isEditingProfile && (
                    <EditModal
                        isOpen
                        toggle={() => this.setState({ isEditingProfile: false })}
                        currentUser={this.state.patientProfile || {}}
                        onSave={this.handleProfileSave}
                        isSaving={this.state.isSavingProfile}
                    />
                )}
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
    isLoggedIn: state.patient.isLoggedIn && isTokenValid(state.patient.token),
});

const mapDispatchToProps = (dispatch) => ({
    patientEditSuccess: (data) => dispatch({ type: "PATIENT_EDIT_SUCCESS", data }),
});

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(BookingModal));
