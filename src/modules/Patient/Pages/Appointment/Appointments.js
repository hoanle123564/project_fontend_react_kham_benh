import React, { Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import PatientSidebar from "../../Layout/PatientSidebar";
import * as actions from "../../../../store/actions";
import "./Appointments.scss";
import moment from "moment";
import { buildImageSrc } from "../../../../utils/imageUtils";
import userDefault from "../../../../assets/user_default.png";
import { createChatRoomFromBooking } from "../../../../services/doctorPatientChatService";
import { createBookingReview } from "../../../../services/userService";
import { toast } from "react-toastify";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

const REVIEW_COMMENT_MAX = 1000;
const REVIEW_STARS = [1, 2, 3, 4, 5];

class Appointments extends Component {
    constructor(props) {
        super(props);
        this.state = {
            appointments: props.listAppointment || [],
            isLoading: false,
            errorMessage: "",
            cancelingId: null,
            creatingChatId: null,
            selectedAppointmentId: null,
            reviewModalOpen: false,
            reviewTarget: null,
            reviewRating: 0,
            reviewHoverRating: 0,
            reviewComment: "",
            reviewError: "",
            submittingReview: false,
        };
        this.reminderToastKeys = new Set();
        this.hasLoadedAppointments = false;
        this.appointmentPollTimer = null;
        this.isComponentMounted = false;
    }

    async componentDidMount() {
        this.isComponentMounted = true;
        await this.loadAppointments();
        this.appointmentPollTimer = setInterval(this.loadAppointments, 60 * 1000);
    }

    componentWillUnmount() {
        this.isComponentMounted = false;
        if (this.appointmentPollTimer) {
            clearInterval(this.appointmentPollTimer);
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.listAppointment !== this.props.listAppointment) {
            this.setState({
                appointments: this.props.listAppointment || [],
            });
        }
    }

    getText = (key, defaultMessage = key, values) =>
        this.props.intl.formatMessage({
            id: `patient.appointments.${key}`,
            defaultMessage,
        }, values);

    loadAppointments = async () => {
        this.setState({ isLoading: true, errorMessage: "" });

        try {
            const actionResult = await this.props.ListAppointments();
            if (!this.isComponentMounted) return;

            if (Array.isArray(actionResult?.data)) {
                this.handleReminderToasts(actionResult.data);
                this.setState({
                    appointments: actionResult.data,
                    isLoading: false,
                });
                return;
            }

            this.setState({
                isLoading: false,
                errorMessage: this.getText("error"),
            });
        } catch (error) {
            if (!this.isComponentMounted) return;
            this.setState({
                isLoading: false,
                errorMessage: this.getText("error"),
            });
        }
    };

    handleReminderToasts = (appointments = []) => {
        const keys = appointments
            .filter((item) => item.inAppNotifiedAt)
            .map((item) => `${item.id}:${item.inAppNotifiedAt}`);

        if (!this.hasLoadedAppointments) {
            keys.forEach((key) => this.reminderToastKeys.add(key));
            this.hasLoadedAppointments = true;
            return;
        }

        keys.forEach((key) => {
            if (!this.reminderToastKeys.has(key)) {
                this.reminderToastKeys.add(key);
                toast.info(this.getText("reminderToast"));
            }
        });
    };

    handleCancel = async (bookingId) => {
        const cancelReason = window.prompt(this.getText("cancelReasonPrompt", "Lý do hủy lịch (không bắt buộc):"));
        if (cancelReason === null) return;
        this.setState({ cancelingId: bookingId, errorMessage: "" });

        try {
            const res = await this.props.CancelBooking({ BookingId: bookingId, cancelReason });

            if (res?.errCode === 0) {
                await this.loadAppointments();
                this.setState({ cancelingId: null });
                toast.success(this.getText("cancelSuccess", "Hủy lịch thành công."));
                return;
            }

            this.setState({
                cancelingId: null,
                errorMessage: res?.errMessage || this.getText("cancelError"),
            });
        } catch (error) {
            this.setState({
                cancelingId: null,
                errorMessage: this.getText("cancelError"),
            });
        }
    };

    renderStatus = (statusId, statusVi, statusEnValue) => {
        const colorMap = {
            S1: "gray",
            S2: "green",
            S3: "blue",
            S4: "red",
            S5: "red",
            S6: "red",
            S7: "red",
            S8: "green",
        };
        const statusEn = {
            S1: "Pending",
            S2: "Confirmed",
            S3: "Completed",
            S4: "Cancelled",
            S5: "Cancelled by doctor",
            S6: "Rejected by doctor",
            S7: "Patient no-show",
            S8: "Confirmed by doctor",
        };
        const displayText =
            this.props.language === "vi"
                ? statusVi || statusId
                : statusEnValue || statusEn[statusId] || statusId;

        return (
            <span className="status-label" style={{ color: colorMap[statusId] || "#555" }}>
                {displayText}
            </span>
        );
    };

    renderQueueNumber = (queueNumber) => {
        if (!queueNumber) {
            return <span className="queue-empty">{this.getText("noQueue")}</span>;
        }

        return <span className="queue-number">{queueNumber}</span>;
    };

    renderReminderBadge = (item) => {
        if (!item?.inAppNotifiedAt) return null;

        return (
            <span className="appointment-reminder-badge">
                <i className="fas fa-clock" aria-hidden="true"></i>
                {this.getText("reminderBadge")}
            </span>
        );
    };

    getAppointmentTypeLabel = (item = {}) => {
        const fallbackKey = item.appointmentTypeId === "AT2" ? "typeOnline" : "typeInPerson";

        if (this.props.language === "vi") {
            return item.appointmentTypeVi || this.getText(fallbackKey);
        }

        return item.appointmentTypeEn || this.getText(fallbackKey);
    };

    getVideoStatusLabel = (item = {}) => {
        if (item.appointmentTypeId !== "AT2") {
            return this.getText("videoNotApplicable");
        }

        switch (item.videoSessionStatusId) {
            case "VCS2":
                return this.getText("videoRoomOpen");
            case "VCS3":
                return this.getText("videoEnded");
            case "VCS4":
                return this.getText("videoCancelled");
            default:
                return this.getText("videoWaiting");
        }
    };

    handleSelectAppointment = (item) => {
        this.setState({ selectedAppointmentId: item.id });
    };

    handleJoinVideo = (bookingId) => {
        this.props.history.push(`/video-consultation/${encodeURIComponent(bookingId)}?role=patient`);
    };

    handleOpenChat = async (item) => {
        if (!item?.id || this.state.creatingChatId) return;

        this.setState({ creatingChatId: item.id, errorMessage: "" });

        try {
            const response = await createChatRoomFromBooking(item.id, "patient");
            if (response?.errCode === 0 && response.data?.id) {
                this.props.history.push(`/patient/chat/${encodeURIComponent(response.data.id)}`);
                return;
            }

            this.setState({
                creatingChatId: null,
                errorMessage: response?.errMessage || this.getText("chatError"),
            });
        } catch (error) {
            const data = error.response?.data;
            this.setState({
                creatingChatId: null,
                errorMessage: data?.errMessage || this.getText("chatError"),
            });
        }
    };

    openReviewModal = (item) => {
        this.setState({
            reviewModalOpen: true,
            reviewTarget: item,
            reviewRating: 0,
            reviewHoverRating: 0,
            reviewComment: "",
            reviewError: "",
            submittingReview: false,
        });
    };

    closeReviewModal = () => {
        if (this.state.submittingReview) return;
        this.setState({
            reviewModalOpen: false,
            reviewTarget: null,
            reviewRating: 0,
            reviewHoverRating: 0,
            reviewComment: "",
            reviewError: "",
        });
    };

    handleReviewSubmit = async () => {
        const { reviewTarget, reviewRating, reviewComment, submittingReview } = this.state;
        const comment = reviewComment.trim();
        if (submittingReview || !reviewTarget?.id) return;
        if (!reviewRating || !comment) {
            this.setState({ reviewError: this.getText("reviewRequired") });
            return;
        }

        this.setState({ submittingReview: true, reviewError: "" });
        try {
            const response = await createBookingReview(reviewTarget.id, {
                rating: reviewRating,
                comment,
            });

            if (response?.errCode === 0) {
                const reviewId = response.data?.id || response.id;
                this.setState((state) => ({
                    appointments: state.appointments.map((item) =>
                        Number(item.id) === Number(reviewTarget.id)
                            ? {
                                ...item,
                                reviewId,
                                canReviewDoctor: false,
                                reviewedDoctor: true,
                                reviewReason: "ALREADY_REVIEWED",
                            }
                            : item
                    ),
                    reviewModalOpen: false,
                    reviewTarget: null,
                    reviewRating: 0,
                    reviewHoverRating: 0,
                    reviewComment: "",
                    reviewError: "",
                    submittingReview: false,
                }));
                toast.success(this.getText("reviewSuccess"));
                return;
            }

            this.setState({
                submittingReview: false,
                reviewError: response?.errMessage || this.getText("reviewError"),
            });
        } catch (error) {
            const data = error.response?.data;
            this.setState({
                submittingReview: false,
                reviewError: data?.errMessage || this.getText("reviewError"),
            });
        }
    };

    getSelectedAppointment = () => {
        const selectedAppointment = this.state.appointments.find(
            (item) => Number(item.id) === Number(this.state.selectedAppointmentId)
        );

        return selectedAppointment || this.state.appointments[0] || null;
    };

    displayValue = (value) => {
        if (value === undefined || value === null || value === "") {
            return this.getText("notAvailable");
        }

        return value;
    };

    formatDate = (value) => {
        if (!value) return this.getText("notAvailable");
        const parsed = moment(value);
        return parsed.isValid() ? parsed.format("DD/MM/YYYY") : this.getText("notAvailable");
    };

    formatTime = (item = {}) => this.displayValue(this.props.language === "vi" ? item.timeVi : item.timeEn);

    formatGender = (gender) => {
        if (gender === "M") return this.getText("male");
        if (gender === "F") return this.getText("female");
        if (gender === "O") return this.getText("other");
        return this.getText("notAvailable");
    };

    getDoctorName = (item = {}) => this.displayValue([item.doctorFirstName, item.doctorLastName].filter(Boolean).join(" "));

    getPatientName = (item = {}) => this.displayValue([item.patientFirstName, item.patientLastName].filter(Boolean).join(" "));

    getClinicAddress = (item = {}) => this.displayValue(item.clinicAddress || item.clinicName);

    getDoctorImage = (item = {}) => buildImageSrc(item.doctorImage) || userDefault;

    renderDetailRow = (labelKey, value) => (
        <div className="appointments-info-row">
            <span>{this.getText(labelKey)}</span>
            <strong>{this.displayValue(value)}</strong>
        </div>
    );

    renderActions = (item) => {
        const { cancelingId, creatingChatId } = this.state;

        return (
            <div className="appointments-actions">
                {item.appointmentTypeId === "AT2" && ["S1", "S2"].includes(item.statusId) && (
                    <button type="button" className="btn-video" disabled>
                        {this.getText("chatWaitingConfirm")}
                    </button>
                )}
                {item.appointmentTypeId === "AT2" && ["S8", "S3"].includes(item.statusId) && (
                    <button
                        type="button"
                        className="btn-video"
                        disabled={creatingChatId === item.id}
                        onClick={() => this.handleOpenChat(item)}
                    >
                        {creatingChatId === item.id
                            ? this.getText("openingChat")
                            : this.getText("chatWithDoctor")}
                    </button>
                )}
                {item.canJoinVideo && (
                    <button
                        type="button"
                        className="btn-video"
                        onClick={() => this.handleJoinVideo(item.id)}
                    >
                        {this.getText("joinVideo")}
                    </button>
                )}
                {item.reviewedDoctor && (
                    <span className="review-status-badge">
                        <i className="fas fa-check" aria-hidden="true"></i>
                        {this.getText("reviewedDoctor")}
                    </span>
                )}
                {item.canReviewDoctor && (
                    <button
                        type="button"
                        className="btn-review"
                        onClick={() => this.openReviewModal(item)}
                    >
                        <i className="fas fa-star" aria-hidden="true"></i>
                        {this.getText("reviewDoctor")}
                    </button>
                )}
                {(item.statusId === "S1" || item.statusId === "S2") && (
                    <button
                        type="button"
                        className="btn-cancel"
                        disabled={cancelingId === item.id}
                        onClick={() => this.handleCancel(item.id)}
                    >
                        {cancelingId === item.id
                            ? this.getText("canceling")
                            : this.getText("cancel")}
                    </button>
                )}
            </div>
        );
    };

    renderReviewModal = () => {
        const {
            reviewModalOpen,
            reviewTarget,
            reviewRating,
            reviewHoverRating,
            reviewComment,
            reviewError,
            submittingReview,
        } = this.state;
        const activeRating = reviewHoverRating || reviewRating;
        const remaining = REVIEW_COMMENT_MAX - reviewComment.length;

        return (
            <Modal
                isOpen={reviewModalOpen}
                toggle={this.closeReviewModal}
                centered
                className="doctor-review-modal"
            >
                <ModalHeader toggle={this.closeReviewModal}>
                    {this.getText("reviewTitle")}
                </ModalHeader>
                <ModalBody>
                    {reviewTarget && (
                        <div className="doctor-review-modal__doctor">
                            <img
                                src={this.getDoctorImage(reviewTarget)}
                                alt={this.getDoctorName(reviewTarget)}
                                width="56"
                                height="56"
                            />
                            <div>
                                <strong>{this.getDoctorName(reviewTarget)}</strong>
                                <span>
                                    {this.formatDate(reviewTarget.date)} - {this.formatTime(reviewTarget)}
                                </span>
                            </div>
                        </div>
                    )}
                    <div className="doctor-review-modal__field">
                        <label>{this.getText("reviewRating")}</label>
                        <div
                            className="doctor-review-modal__stars"
                            onMouseLeave={() => this.setState({ reviewHoverRating: 0 })}
                        >
                            {REVIEW_STARS.map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    className={star <= activeRating ? "active" : ""}
                                    aria-label={this.getText("reviewStarLabel", "{count} stars", { count: star })}
                                    onMouseEnter={() => this.setState({ reviewHoverRating: star })}
                                    onFocus={() => this.setState({ reviewHoverRating: star })}
                                    onBlur={() => this.setState({ reviewHoverRating: 0 })}
                                    onClick={() => this.setState({ reviewRating: star })}
                                >
                                    <i className="fas fa-star" aria-hidden="true"></i>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="doctor-review-modal__field">
                        <label htmlFor="doctorReviewComment">{this.getText("reviewComment")}</label>
                        <textarea
                            id="doctorReviewComment"
                            rows="5"
                            maxLength={REVIEW_COMMENT_MAX}
                            value={reviewComment}
                            placeholder={this.getText("reviewCommentPlaceholder")}
                            onChange={(event) =>
                                this.setState({ reviewComment: event.target.value, reviewError: "" })
                            }
                        />
                        <small>
                            {this.getText("reviewCounter", "{count} characters remaining", { count: remaining })}
                        </small>
                    </div>
                    {reviewError && <div className="doctor-review-modal__error">{reviewError}</div>}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" type="button" onClick={this.closeReviewModal} disabled={submittingReview}>
                        {this.getText("reviewClose")}
                    </Button>
                    <Button
                        color="primary"
                        type="button"
                        onClick={this.handleReviewSubmit}
                        disabled={submittingReview || !reviewRating || !reviewComment.trim()}
                    >
                        {submittingReview
                            ? this.getText("reviewSubmitting")
                            : this.getText("reviewSubmit")}
                    </Button>
                </ModalFooter>
            </Modal>
        );
    };

    renderResultSection = (item) => {
        const hasResult = Boolean(item.preliminaryDiagnosis || item.doctorConclusion);

        return (
            <section className="appointments-section appointments-section--result">
                <h3>{this.getText("resultTitle")}</h3>
                {hasResult ? (
                    <div className="appointments-result">
                        {item.preliminaryDiagnosis && this.renderDetailRow("preliminaryDiagnosis", item.preliminaryDiagnosis)}
                        {item.doctorConclusion && this.renderDetailRow("doctorConclusion", item.doctorConclusion)}
                    </div>
                ) : (
                    <p className="appointments-result-empty">{this.getText("resultWaiting")}</p>
                )}
            </section>
        );
    };

    renderAppointmentDetail = () => {
        const item = this.getSelectedAppointment();
        if (!item) return null;

        return (
            <div className="appointments-detail-panel">
                <div className="appointments-detail-header">
                    <div>
                        <span>{this.getText("queue")}</span>
                        <strong>{item.queueNumber || this.getText("noQueue")}</strong>
                    </div>
                    <div className="appointments-detail-status">
                        {this.renderStatus(item.statusId, item.statusVi, item.statusEn)}
                        {this.renderReminderBadge(item)}
                    </div>
                </div>

                <section className="appointments-doctor-card">
                    <img
                        src={this.getDoctorImage(item)}
                        alt={this.getDoctorName(item)}
                        className="appointments-doctor-avatar"
                        width="88"
                        height="88"
                    />
                    <div>
                        <span>{this.getText("doctorInfoTitle")}</span>
                        <strong>{this.getDoctorName(item)}</strong>
                        <p>{this.getClinicAddress(item)}</p>
                    </div>
                </section>

                <section className="appointments-section">
                    <h3>{this.getText("bookingInfoTitle")}</h3>
                    {this.renderDetailRow("bookingCode", item.id)}
                    {this.renderDetailRow("appointmentDate", this.formatDate(item.date))}
                    {this.renderDetailRow("appointmentTime", this.formatTime(item))}
                </section>

                <section className="appointments-section">
                    <h3>{this.getText("patientInfoTitle")}</h3>
                    {this.renderDetailRow("medicalCode", item.medicalCode)}
                    {this.renderDetailRow("patientName", this.getPatientName(item))}
                    {this.renderDetailRow("dateOfBirth", this.formatDate(item.dateOfBirth))}
                    {this.renderDetailRow("phoneNumber", item.patientPhoneNumber)}
                    {this.renderDetailRow("gender", this.formatGender(item.patientGender))}
                    {this.renderDetailRow("address", item.patientAddress)}
                </section>

                {this.renderResultSection(item)}
                {this.renderActions(item)}
            </div>
        );
    };

    renderAppointmentList = (selectedAppointment) => {
        const { appointments } = this.state;

        return (
            <div className="appointments-list-panel">
                <div className="appointments-list">
                    {appointments.map((item) => {
                        const isSelected = Number(selectedAppointment?.id) === Number(item.id);

                        return (
                            <button
                                type="button"
                                key={item.id}
                                className={`appointments-list-item ${isSelected ? "selected" : ""}`}
                                aria-pressed={isSelected}
                                onClick={() => this.handleSelectAppointment(item)}
                            >
                                <div className="appointments-list-item__main">
                                    <div className="appointments-list-item__info">
                                        <strong>{this.getDoctorName(item)}</strong>
                                        <span>{this.formatDate(item.date)} - {this.formatTime(item)}</span>
                                        <span>{this.getPatientName(item)}</span>
                                    </div>
                                    <div className="appointments-list-item__queue">
                                        {this.renderQueueNumber(item.queueNumber)}
                                    </div>
                                </div>
                                <div className="appointments-list-item__meta">
                                    {this.renderStatus(item.statusId, item.statusVi, item.statusEn)}
                                    {this.renderReminderBadge(item)}
                                    <span className={`appointment-type-badge ${item.appointmentTypeId || "AT1"}`}>
                                        {this.getAppointmentTypeLabel(item)}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    renderAppointmentLayout = () => {
        const selectedAppointment = this.getSelectedAppointment();

        return (
            <div className="appointments-layout">
                {this.renderAppointmentList(selectedAppointment)}
                {this.renderAppointmentDetail()}
            </div>
        );
    };

    renderContent = () => {
        const { appointments, isLoading, errorMessage } = this.state;

        if (isLoading && appointments.length === 0) {
            return <p className="appointments-state">{this.getText("loading")}</p>;
        }

        if (errorMessage && appointments.length === 0) {
            return (
                <div className="appointments-state appointments-state-error">
                    <p>{errorMessage}</p>
                    <button type="button" onClick={this.loadAppointments}>
                        {this.getText("retry")}
                    </button>
                </div>
            );
        }

        if (appointments.length === 0) {
            return <p className="appointments-empty">{this.getText("empty")}</p>;
        }

        return (
            <>
                {errorMessage && <div className="appointments-inline-error">{errorMessage}</div>}
                {this.renderAppointmentLayout()}
            </>
        );
    };

    render() {
        return (
            <>
                <HomeHeader showBanner={false} />
                <div className="patient-dashboard-layout">
                    <div className="container d-flex flex-start gap-3">
                        <PatientSidebar />
                        <div className="patient-page-content">
                            <h2 className="appointments-title">{this.getText("title")}</h2>

                            <div className="appointments-content">
                                {this.renderContent()}
                            </div>
                        </div>
                    </div>
                </div>
                <HomeFooter />
                {this.renderReviewModal()}
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
    listAppointment: state.patient?.listAppointment || [],
});

const mapDispatchToProps = (dispatch) => ({
    ListAppointments: () => dispatch(actions.GetListAppoinmentForPatient()),
    CancelBooking: (BookingId) => dispatch(actions.CancelBookingAppointment(BookingId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Appointments));
