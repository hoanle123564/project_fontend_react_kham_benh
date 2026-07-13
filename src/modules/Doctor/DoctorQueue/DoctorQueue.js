import React, { Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import moment from "moment";
import { toast } from "react-toastify";
import {
    collectVisitPayment,
    getDoctorAppointmentDetail,
    getDoctorExaminationVisitDetail,
    getDoctorQueue,
    getVisitPaymentSummary,
    startDoctorExaminationVisit,
    updateDoctorBookingStatus,
} from "../../../services/userService";
import { createChatRoomFromBooking } from "../../../services/doctorPatientChatService";
import DoctorPaymentModal from "./DoctorPaymentModal";
import DoctorQueueSidePanel from "./DoctorQueueSidePanel";
import DoctorQueueTable from "./DoctorQueueTable";
import MedicalRecordWorkspace from "../MedicalRecords/MedicalRecordWorkspace";
import "./DoctorQueue.scss";

const VISIT_STATUS = Object.freeze({
    WAITING: "VS1",
    IN_PROGRESS: "VS2",
    COMPLETED: "VS3",
});

const BOOKING_STATUS = Object.freeze({
    DOCTOR_CONFIRMED: "S8",
    COMPLETED: "S3",
    PATIENT_NO_SHOW: "S7",
});


class DoctorQueue extends Component {
    constructor(props) {
        super(props);
        this.queueRequestId = 0;
        this.detailRequestId = 0;
        this.state = {
            appointmentDate: moment().utcOffset(7).format("YYYY-MM-DD"),
            visitStatusId: "",
            paymentStatusId: "",
            search: "",
            queue: [],
            appointmentDetail: null,
            selectedBookingId: null,
            selectedVisitDetail: null,
            activeStatusTab: VISIT_STATUS.WAITING,
            isLoading: false,
            isAppointmentDetailLoading: false,
            isDetailLoading: false,
            startingBookingId: null,
            paymentModalOpen: false,
            paymentTarget: null,
            paymentSummary: null,
            paymentMethodId: "PAY1",
            amountReceived: "",
            isPaymentLoading: false,
            isCollectingPayment: false,
            openingChatBookingId: null,
            updatingNoShowBookingId: null,
            errorMessage: "",
        };
    }

    componentDidMount() {
        const routeBookingId = this.getRouteBookingId();
        if (routeBookingId) {
            this.fetchAppointmentDetail(routeBookingId);
            return;
        }

        this.fetchQueue();
    }

    componentDidUpdate(prevProps) {
        const previousRouteBookingId = prevProps.match?.params?.bookingId || null;
        const routeBookingId = this.getRouteBookingId();

        if (String(previousRouteBookingId || "") !== String(routeBookingId || "")) {
            this.detailRequestId += 1;
            const routeQueueItem = this.getQueueItemByBookingId(routeBookingId);
            this.setState(
                {
                    appointmentDetail: routeBookingId ? routeQueueItem : null,
                    selectedBookingId: routeBookingId,
                    selectedVisitDetail: null,
                    activeStatusTab: routeQueueItem?.visitStatusId || this.state.activeStatusTab,
                    isAppointmentDetailLoading: Boolean(routeBookingId),
                    isDetailLoading: false,
                    errorMessage: "",
                },
                () => {
                    if (routeBookingId) {
                        this.fetchAppointmentDetail(routeBookingId);
                    } else {
                        this.fetchQueue();
                    }
                }
            );
            return;
        }

        if (prevProps.userInfo?.id !== this.props.userInfo?.id) {
            this.setState(
                {
                    appointmentDetail: null,
                    selectedBookingId: routeBookingId,
                    selectedVisitDetail: null,
                },
                () => {
                    if (routeBookingId) {
                        this.fetchAppointmentDetail(routeBookingId);
                    } else {
                        this.fetchQueue();
                    }
                }
            );
        }
    }

    getText = (key, defaultMessage = key) =>
        this.props.intl.formatMessage({
            id: `doctor.queue.${key}`,
            defaultMessage,
        });

    getDoctorName = () => {
        const { userInfo } = this.props;
        return `${userInfo?.firstName || ""} ${userInfo?.lastName || ""}`
            .replace(/\s+/g, " ")
            .trim();
    };

    getRouteBookingId = () => this.props.match?.params?.bookingId || null;

    isDetailRoute = () => Boolean(this.getRouteBookingId());

    getQueueItemByBookingId = (bookingId) =>
        this.state.queue.find((item) => Number(item.bookingId) === Number(bookingId)) || null;

    getPatientName = (item = {}) =>
        `${item.patientFirstName || ""} ${item.patientLastName || ""}`
            .replace(/\s+/g, " ")
            .trim() || "-";

    getSelectedItem = () =>
        this.state.queue.find(
            (item) => Number(item.bookingId) === Number(this.state.selectedBookingId)
        ) || this.state.appointmentDetail || null;

    getVisitStatusLabel = (item = {}) => {
        const statusId = item.visitStatusId || item.statusId;
        if (this.props.language === "vi") {
            return item.visitStatusVi || this.getFallbackVisitStatus(statusId);
        }

        return item.visitStatusEn || this.getFallbackVisitStatus(statusId);
    };

    getPaymentStatusLabel = (item = {}) => {
        if (this.props.language === "vi") {
            return item.paymentStatusVi || this.getFallbackPaymentStatus(item.paymentStatusId);
        }

        return item.paymentStatusEn || this.getFallbackPaymentStatus(item.paymentStatusId);
    };

    getFallbackVisitStatus = (statusId) => {
        switch (statusId) {
            case VISIT_STATUS.IN_PROGRESS:
                return this.getText("inProgress");
            case VISIT_STATUS.COMPLETED:
                return this.getText("completed");
            default:
                return this.getText("waiting");
        }
    };

    getFallbackPaymentStatus = (statusId) =>
        statusId === "PS2" ? this.getText("paid") : this.getText("unpaid");

    getAppointmentTypeLabel = (item = {}) => {
        if (this.props.language === "vi") {
            return item.appointmentTypeVi || (item.appointmentTypeId === "AT2" ? "Khám online" : "Khám tại cơ sở");
        }

        return item.appointmentTypeEn || (item.appointmentTypeId === "AT2" ? "Online" : "In-person");
    };

    getVideoStatusLabel = (item = {}) => {
        if (item.appointmentTypeId !== "AT2") {
            return this.props.language === "vi" ? "Không áp dụng" : "Not applicable";
        }

        switch (item.videoSessionStatusId) {
            case "VCS2":
                return this.props.language === "vi" ? "Phòng đã mở" : "Room open";
            case "VCS3":
                return this.props.language === "vi" ? "Đã kết thúc" : "Ended";
            case "VCS4":
                return this.props.language === "vi" ? "Đã hủy" : "Cancelled";
            default:
                return this.props.language === "vi" ? "Chưa mở phòng" : "Not opened";
        }
    };

    getPaymentMethodLabel = (methodId) => {
        switch (methodId) {
            case "PAY2":
                return this.getText("transfer");
            case "PAY3":
                return this.getText("card");
            default:
                return this.getText("cash");
        }
    };

    canCollectPayment = (item = {}) =>
        !this.isNoShow(item) && Boolean(item.examinationVisitId) && item.paymentStatusId !== "PS2";

    fetchQueue = async (options = {}) => {
        if (!this.props.userInfo?.id) return;

        const requestId = this.queueRequestId + 1;
        this.queueRequestId = requestId;
        const { appointmentDate, visitStatusId, paymentStatusId, search, selectedBookingId } =
            this.state;
        const queueDate = options.date || appointmentDate;
        const effectiveVisitStatusId = options.includeAllStatuses ? "" : visitStatusId;
        const effectivePaymentStatusId = options.includeAllStatuses ? "" : paymentStatusId;
        const effectiveSearch = options.includeAllStatuses ? "" : search.trim();
        this.setState({ isLoading: true, errorMessage: "" });

        try {
            const response = await getDoctorQueue({
                date: queueDate,
                visitStatusId: effectiveVisitStatusId,
                paymentStatusId: effectivePaymentStatusId,
                search: effectiveSearch,
            });

            if (requestId !== this.queueRequestId) return;

            if (!response || response.errCode !== 0) {
                this.setState({
                    isLoading: false,
                    queue: [],
                    selectedBookingId: null,
                    selectedVisitDetail: null,
                    errorMessage: response?.errMessage || this.getText("loadError"),
                });
                return;
            }

            const queue = response.data || [];
            const preferredBookingId =
                options.selectedBookingId || (this.isDetailRoute() ? this.getRouteBookingId() : selectedBookingId);
            const nextSelectedBookingId = this.isDetailRoute() ? preferredBookingId || null : null;

            this.setState({
                queue,
                appointmentDate: queueDate,
                selectedBookingId: nextSelectedBookingId,
                selectedVisitDetail: this.isDetailRoute() ? this.state.selectedVisitDetail : null,
                isLoading: false,
                errorMessage: "",
            });
        } catch (error) {
            if (requestId !== this.queueRequestId) return;
            this.setState({
                isLoading: false,
                queue: [],
                selectedBookingId: this.isDetailRoute() ? this.getRouteBookingId() : null,
                selectedVisitDetail: this.isDetailRoute() ? this.state.selectedVisitDetail : null,
                errorMessage: this.getText("loadError"),
            });
        }
    };

    fetchAppointmentDetail = async (bookingId) => {
        if (!bookingId || !this.props.userInfo?.id) return;

        this.detailRequestId += 1;
        this.setState({
            isAppointmentDetailLoading: true,
            selectedBookingId: bookingId,
            selectedVisitDetail: null,
            errorMessage: "",
        });

        try {
            const response = await getDoctorAppointmentDetail(bookingId);
            if (String(this.getRouteBookingId() || "") !== String(bookingId || "")) return;

            if (!response || response.errCode !== 0) {
                this.setState({
                    isAppointmentDetailLoading: false,
                    appointmentDetail: null,
                    selectedVisitDetail: null,
                    errorMessage: response?.errMessage || this.getText("detailError"),
                });
                return;
            }

            const appointmentDetail = response.data || {};
            const appointmentDate = appointmentDetail.appointmentDate
                ? moment(appointmentDetail.appointmentDate).format("YYYY-MM-DD")
                : this.state.appointmentDate;
            const activeStatusTab = appointmentDetail.visitStatusId || VISIT_STATUS.WAITING;

            this.setState(
                {
                    appointmentDetail,
                    appointmentDate,
                    activeStatusTab,
                    isAppointmentDetailLoading: false,
                    errorMessage: "",
                },
                () => {
                    this.fetchQueue({
                        date: appointmentDate,
                        selectedBookingId: bookingId,
                        includeAllStatuses: true,
                    });
                    if (appointmentDetail.examinationVisitId) {
                        this.fetchVisitDetail(appointmentDetail.examinationVisitId);
                    }
                }
            );
        } catch (error) {
            if (String(this.getRouteBookingId() || "") !== String(bookingId || "")) return;
            this.setState({
                isAppointmentDetailLoading: false,
                appointmentDetail: null,
                selectedVisitDetail: null,
                errorMessage: this.getText("detailError"),
            });
        }
    };

    fetchVisitDetail = async (examinationVisitId) => {
        if (!examinationVisitId) return;

        const requestId = this.detailRequestId + 1;
        this.detailRequestId = requestId;
        this.setState({ isDetailLoading: true });

        try {
            const response = await getDoctorExaminationVisitDetail(examinationVisitId);
            if (requestId !== this.detailRequestId) return;

            if (!response || response.errCode !== 0) {
                this.setState({ isDetailLoading: false, selectedVisitDetail: null });
                toast.error(response?.errMessage || this.getText("detailError"));
                return;
            }

            this.setState({
                selectedVisitDetail: response.data || null,
                isDetailLoading: false,
            });
        } catch (error) {
            if (requestId !== this.detailRequestId) return;
            this.setState({ isDetailLoading: false, selectedVisitDetail: null });
            toast.error(this.getText("detailError"));
        }
    };

    handleFilterChange = (field, value) => {
        this.setState({ [field]: value }, () => this.fetchQueue());
    };

    handleSubmit = (event) => {
        event.preventDefault();
        this.fetchQueue();
    };

    handleSelectRow = (item) => {
        if (!item?.bookingId || this.isNoShow(item) || !this.props.history) return;

        this.props.history.push(`/doctor/appointment/${encodeURIComponent(item.bookingId)}`);
    };

    handleOpenVideoRoom = (item) => {
        if (!item?.bookingId || !item.canJoinVideo || !this.props.history) return;

        this.props.history.push(
            `/video-consultation/${encodeURIComponent(item.bookingId)}?role=doctor`
        );
    };

    handleOpenChatRoom = async (item) => {
        if (!item?.bookingId || !this.canOpenChatRoom(item) || this.state.openingChatBookingId) return;

        this.setState({ openingChatBookingId: item.bookingId, errorMessage: "" });

        try {
            const response = await createChatRoomFromBooking(item.bookingId, "doctor");
            if (response?.errCode === 0 && response.data?.id) {
                this.props.history.push(`/doctor/message/${encodeURIComponent(response.data.id)}`);
                return;
            }

            this.setState({
                openingChatBookingId: null,
                errorMessage: response?.errMessage || this.getText("chatError", "Could not open chat"),
            });
        } catch (error) {
            const data = error.response?.data;
            this.setState({
                openingChatBookingId: null,
                errorMessage: data?.errMessage || this.getText("chatError", "Could not open chat"),
            });
        }
    };

    handleStartVisit = async (item) => {
        if (!item?.bookingId || this.state.startingBookingId) return;

        this.setState({ startingBookingId: item.bookingId, errorMessage: "" });

        try {
            const response = await startDoctorExaminationVisit(item.bookingId);
            if (!response || response.errCode !== 0) {
                toast.error(response?.errMessage || this.getText("startError"));
                this.setState({ startingBookingId: null });
                return;
            }

            toast.success(this.getText("startSuccess"));
            const visit = response.data || {};
            const bookingId = visit.bookingId || item.bookingId;
            this.setState(
                {
                    startingBookingId: null,
                    selectedBookingId: bookingId,
                },
                () => {
                    if (this.props.history && !this.isDetailRoute()) {
                        this.props.history.push(`/doctor/appointment/${encodeURIComponent(bookingId)}`);
                        return;
                    }

                    this.fetchAppointmentDetail(bookingId);
                    if (visit.id || visit.examinationVisitId) {
                        this.fetchVisitDetail(visit.id || visit.examinationVisitId);
                    }
                }
            );
        } catch (error) {
            toast.error(this.getText("startError"));
            this.setState({ startingBookingId: null });
        }
    };

    handlePatientNoShow = async (item) => {
        if (!this.canMarkNoShow(item) || this.state.updatingNoShowBookingId) return;
        if (!window.confirm(this.getText("confirmNoShow", "Mark this patient as no-show?"))) return;

        this.setState({ updatingNoShowBookingId: item.bookingId, errorMessage: "" });
        try {
            const response = await updateDoctorBookingStatus(item.bookingId, { statusId: "S7" });
            if (response?.errCode !== 0) {
                throw new Error(response?.errMessage || this.getText("noShowError"));
            }
            toast.success(this.getText("noShowSuccess"));
            this.setState(
                { updatingNoShowBookingId: null, visitStatusId: "" },
                () => this.fetchQueue()
            );
        } catch (error) {
            toast.error(error.message || this.getText("noShowError"));
            this.setState({ updatingNoShowBookingId: null });
        }
    };

    handleOpenPaymentModal = async (item) => {
        if (!this.canCollectPayment(item) || this.state.isPaymentLoading) return;

        this.setState({
            paymentModalOpen: true,
            paymentTarget: item,
            paymentSummary: null,
            paymentMethodId: "PAY1",
            amountReceived: "",
            isPaymentLoading: true,
            isCollectingPayment: false,
        });

        try {
            const response = await getVisitPaymentSummary(item.examinationVisitId);
            if (!response || response.errCode !== 0) {
                toast.error(response?.errMessage || this.getText("paymentLoadError"));
                this.setState({ isPaymentLoading: false });
                return;
            }

            const summary = response.data || {};
            this.setState({
                paymentSummary: summary,
                paymentMethodId: summary.paymentMethodId || "PAY1",
                amountReceived: String(Number(summary.amountDue || 0) || ""),
                isPaymentLoading: false,
            });
        } catch (error) {
            toast.error(this.getText("paymentLoadError"));
            this.setState({ isPaymentLoading: false });
        }
    };

    handleClosePaymentModal = () => {
        if (this.state.isCollectingPayment) return;

        this.setState({
            paymentModalOpen: false,
            paymentTarget: null,
            paymentSummary: null,
            paymentMethodId: "PAY1",
            amountReceived: "",
            isPaymentLoading: false,
            isCollectingPayment: false,
        });
    };

    handleCollectPayment = async (event) => {
        event.preventDefault();
        const { paymentTarget, paymentSummary, paymentMethodId, amountReceived, isCollectingPayment } =
            this.state;

        if (!paymentTarget?.examinationVisitId || isCollectingPayment) return;

        const amountDue = Number(paymentSummary?.amountDue || 0);
        const received = Number(amountReceived || 0);

        if (!Number.isFinite(received) || received < amountDue) {
            toast.error(this.getText("insufficientPayment"));
            return;
        }

        this.setState({ isCollectingPayment: true });

        try {
            const response = await collectVisitPayment({
                examinationVisitId: paymentTarget.examinationVisitId,
                paymentMethodId,
                amountReceived: received,
            });

            if (!response || response.errCode !== 0) {
                toast.error(response?.errMessage || this.getText("paymentError"));
                this.setState({ isCollectingPayment: false });
                return;
            }

            toast.success(response.paidNow ? this.getText("paymentSuccess") : this.getText("alreadyPaid"));
            const summary = response.data || {};
            const selectedBookingId = paymentTarget.bookingId || this.state.selectedBookingId;
            this.setState(
                {
                    paymentModalOpen: false,
                    paymentTarget: null,
                    paymentSummary: null,
                    paymentMethodId: "PAY1",
                    amountReceived: "",
                    isCollectingPayment: false,
                },
                () => {
                    if (this.isDetailRoute()) {
                        this.fetchAppointmentDetail(selectedBookingId);
                    } else {
                        this.fetchQueue({ selectedBookingId });
                    }
                    if (summary.examinationVisitId) {
                        this.fetchVisitDetail(summary.examinationVisitId);
                    }
                }
            );
        } catch (error) {
            toast.error(this.getText("paymentError"));
            this.setState({ isCollectingPayment: false });
        }
    };

    handleRecordChanged = (record = {}) => {
        const medicalRecordId = record.id || record.medicalRecordId;
        if (!medicalRecordId) return;

        this.setState((prevState) => ({
            appointmentDetail:
                prevState.appointmentDetail &&
                    Number(prevState.appointmentDetail.examinationVisitId) === Number(record.examinationVisitId)
                    ? {
                        ...prevState.appointmentDetail,
                        medicalRecordId,
                        medicalRecordStatusId: record.statusId,
                    }
                    : prevState.appointmentDetail,
            selectedVisitDetail: prevState.selectedVisitDetail
                ? {
                    ...prevState.selectedVisitDetail,
                    medicalRecordId,
                    medicalRecordStatusId: record.statusId,
                }
                : prevState.selectedVisitDetail,
            queue: prevState.queue.map((item) =>
                Number(item.examinationVisitId) === Number(record.examinationVisitId)
                    ? {
                        ...item,
                        medicalRecordId,
                        medicalRecordStatusId: record.statusId,
                    }
                    : item
            ),
        }));
    };

    handleVisitCompleted = (result = {}) => {
        const visit = result.visit || {};
        const bookingId = visit.bookingId || this.state.selectedBookingId;

        if (this.isDetailRoute()) {
            this.fetchAppointmentDetail(bookingId);
        } else {
            this.fetchQueue({ selectedBookingId: bookingId });
        }
        if (visit.id) {
            this.fetchVisitDetail(visit.id);
        }
    };

    handleBackToQueue = () => {
        if (this.props.history) {
            this.props.history.push("/doctor/appointment");
        }
    };

    handleStatusTabChange = (statusId) => {
        this.setState({ activeStatusTab: statusId });
    };

    canStartVisit = (item = {}) =>
        item.bookingStatusId === BOOKING_STATUS.DOCTOR_CONFIRMED &&
        item.visitStatusId === VISIT_STATUS.WAITING;

    isNoShow = (item = {}) => item.bookingStatusId === BOOKING_STATUS.PATIENT_NO_SHOW;

    canMarkNoShow = (item = {}) =>
        item.bookingStatusId === BOOKING_STATUS.DOCTOR_CONFIRMED &&
        (!item.examinationVisitId || item.visitStatusId === VISIT_STATUS.WAITING);

    canOpenChatRoom = (item = {}) =>
        item.appointmentTypeId === "AT2" &&
        [BOOKING_STATUS.DOCTOR_CONFIRMED, BOOKING_STATUS.COMPLETED].includes(item.bookingStatusId);

    formatDate = (value) => {
        if (!value) return "-";
        const date = moment(value);
        return date.isValid() ? date.format("DD/MM/YYYY") : "-";
    };

    formatDateTime = (value) => {
        if (!value) return "-";
        const date = moment(value);
        return date.isValid() ? date.format("DD/MM/YYYY HH:mm") : "-";
    };

    formatMoney = (value) => {
        const amount = Number(value || 0);
        return amount > 0 ? amount.toLocaleString("vi-VN") : "-";
    };

    renderStatusBadge = (type, label, statusId) => (
        <span className={`doctor-queue__badge ${type} ${statusId || "empty"}`}>{label}</span>
    );

    renderSummary = () => {
        const { queue } = this.state;
        const waiting = queue.filter(
            (item) => !this.isNoShow(item) && item.visitStatusId === VISIT_STATUS.WAITING
        ).length;
        const inProgress = queue.filter(
            (item) => item.visitStatusId === VISIT_STATUS.IN_PROGRESS
        ).length;
        const completed = queue.filter(
            (item) => item.visitStatusId === VISIT_STATUS.COMPLETED
        ).length;

        return (
            <div className="doctor-queue__summary">
                <div>
                    <span>{this.getText("total")}</span>
                    <strong>{queue.length}</strong>
                </div>
                <div>
                    <span>{this.getText("waiting")}</span>
                    <strong>{waiting}</strong>
                </div>
                <div>
                    <span>{this.getText("inProgress")}</span>
                    <strong>{inProgress}</strong>
                </div>
                <div>
                    <span>{this.getText("completed")}</span>
                    <strong>{completed}</strong>
                </div>
            </div>
        );
    };

    renderDetailRow = (label, value) => (
        <div className="doctor-queue__detail-row">
            <span>{label}</span>
            <strong>{value || "-"}</strong>
        </div>
    );

    renderDetailPanel = () => {
        const selectedItem = this.getSelectedItem();
        const { selectedVisitDetail, isDetailLoading, isAppointmentDetailLoading } = this.state;

        if (!selectedItem) {
            return (
                <aside className="doctor-queue__detail-panel empty">
                    {this.getText("chooseVisit")}
                </aside>
            );
        }

        const detail = selectedVisitDetail || selectedItem;
        const isNoShow = this.isNoShow(selectedItem);
        const patientName =
            detail.patientFirstName || detail.patientLastName
                ? `${detail.patientFirstName || ""} ${detail.patientLastName || ""}`
                    .replace(/\s+/g, " ")
                    .trim()
                : this.getPatientName(selectedItem);

        return (
            <aside className="doctor-queue__detail-panel">
                <div className="doctor-queue__detail-header">
                    <div>
                        <span>#{selectedItem.queueNumber || "-"}</span>
                        <h3>{patientName || "-"}</h3>
                    </div>
                    {(isDetailLoading || isAppointmentDetailLoading) && (
                        <small>{this.getText("loading")}...</small>
                    )}
                </div>

                <div className="doctor-queue__detail-grid">
                    {this.renderDetailRow(this.getText("medicalCode"), detail.medicalCode)}
                    {this.renderDetailRow(this.getText("phone"), detail.patientPhoneNumber)}
                    {this.renderDetailRow(this.getText("email"), detail.patientEmail)}
                    {this.renderDetailRow(
                        this.getText("appointmentDate"),
                        this.formatDate(detail.examDate || detail.appointmentDate)
                    )}
                    {this.renderDetailRow(
                        this.getText("time"),
                        detail.timeTypeVi || detail.timeTypeEn || selectedItem.timeType || "-"
                    )}
                    {this.renderDetailRow(this.getText("price"), this.formatMoney(detail.priceAtBooking))}
                    {this.renderDetailRow(
                        this.getText("appointmentType", "Appointment type"),
                        this.getAppointmentTypeLabel(detail)
                    )}
                    {this.renderDetailRow(
                        this.getText("videoStatus", "Video status"),
                        this.getVideoStatusLabel(detail)
                    )}
                    {this.renderDetailRow(
                        this.getText("visitStatus"),
                        this.getVisitStatusLabel(detail)
                    )}
                    {this.renderDetailRow(
                        this.getText("paymentStatus"),
                        this.getPaymentStatusLabel(detail)
                    )}
                    {this.renderDetailRow(
                        this.getText("paymentMethod"),
                        detail.paymentMethodVi ||
                        detail.paymentMethodEn ||
                        (detail.paymentMethodId
                            ? this.getPaymentMethodLabel(detail.paymentMethodId)
                            : "-")
                    )}
                    {this.renderDetailRow(this.getText("startedAt"), this.formatDateTime(detail.startedAt))}
                    {this.renderDetailRow(
                        this.getText("completedAt"),
                        this.formatDateTime(detail.completedAt)
                    )}
                    {this.renderDetailRow(
                        this.getText("medicalRecord"),
                        detail.medicalRecordId ? `#${detail.medicalRecordId}` : "-"
                    )}
                </div>

                {!selectedItem.examinationVisitId && (
                    <div className="doctor-queue__notice">
                        {isNoShow ? this.getText("patientNoShow") : this.getText("notStarted")}
                    </div>
                )}

                {this.canStartVisit(selectedItem) && (
                    <div className="doctor-queue__detail-actions">
                        <button
                            type="button"
                            className="doctor-queue__start"
                            disabled={Number(this.state.startingBookingId) === Number(selectedItem.bookingId)}
                            onClick={() => this.handleStartVisit(selectedItem)}
                        >
                            <i className="bi bi-play-fill" />
                            {Number(this.state.startingBookingId) === Number(selectedItem.bookingId)
                                ? `${this.getText("loading")}...`
                                : this.getText("start")}
                        </button>
                    </div>
                )}

                {!isNoShow && selectedItem.examinationVisitId && (
                    <div className="doctor-queue__detail-actions">
                        <button
                            type="button"
                            className="doctor-queue__payment-button"
                            disabled={!this.canCollectPayment(detail)}
                            title={this.getText("collectPayment")}
                            onClick={() => this.handleOpenPaymentModal(detail)}
                        >
                            <i className="bi bi-cash-coin" />
                            {detail.paymentStatusId === "PS2"
                                ? this.getText("paid")
                                : this.getText("collectPayment")}
                        </button>
                    </div>
                )}

                {!isNoShow && selectedItem.appointmentTypeId === "AT2" && (
                    <div className="doctor-queue__detail-actions">
                        <button
                            type="button"
                            className="doctor-queue__video-button"
                            disabled={!selectedItem.canJoinVideo}
                            title={this.getVideoStatusLabel(selectedItem)}
                            onClick={() => this.handleOpenVideoRoom(selectedItem)}
                        >
                            <i className="bi bi-camera-video" />
                            {this.getText("openVideo", "Open video")}
                        </button>
                    </div>
                )}

                {!isNoShow && selectedItem.appointmentTypeId === "AT2" && (
                    <div className="doctor-queue__detail-actions">
                        <button
                            type="button"
                            className="doctor-queue__chat-button"
                            disabled={
                                !this.canOpenChatRoom(selectedItem) ||
                                Number(this.state.openingChatBookingId) === Number(selectedItem.bookingId)
                            }
                            title={this.getText("openChat", "Open chat")}
                            onClick={() => this.handleOpenChatRoom(selectedItem)}
                        >
                            <i className="bi bi-chat-left-text" />
                            {Number(this.state.openingChatBookingId) === Number(selectedItem.bookingId)
                                ? `${this.getText("loading")}...`
                                : this.getText("openChat", "Open chat")}
                        </button>
                    </div>
                )}

                {!isNoShow && (
                    <MedicalRecordWorkspace
                        language={this.props.language}
                        selectedItem={selectedItem}
                        selectedVisitDetail={selectedVisitDetail}
                        onRecordChanged={this.handleRecordChanged}
                        onVisitCompleted={this.handleVisitCompleted}
                    />
                )}
            </aside>
        );
    };

    renderAppointmentDetailPage = () => {
        const { appointmentDetail, isAppointmentDetailLoading } = this.state;

        if (isAppointmentDetailLoading && !appointmentDetail) {
            return (
                <div className="doctor-queue__detail-panel empty">
                    {this.getText("loading")}...
                </div>
            );
        }

        if (!appointmentDetail) {
            return (
                <div className="doctor-queue__detail-panel empty">
                    {this.getText("detailError")}
                </div>
            );
        }

        return (
            <div className="doctor-queue__detail-layout">
                <DoctorQueueSidePanel
                    appointmentDate={appointmentDetail.appointmentDate}
                    queue={this.state.queue}
                    selectedBookingId={this.state.selectedBookingId}
                    activeStatusTab={this.state.activeStatusTab}
                    isLoading={this.state.isLoading}
                    getText={this.getText}
                    formatDate={this.formatDate}
                    getPatientName={this.getPatientName}
                    onStatusTabChange={this.handleStatusTabChange}
                    onSelectRow={this.handleSelectRow}
                />
                {this.renderDetailPanel()}
            </div>
        );
    };

    render() {
        const {
            appointmentDate,
            visitStatusId,
            paymentStatusId,
            search,
            queue,
            selectedBookingId,
            isLoading,
            startingBookingId,
            paymentModalOpen,
            paymentTarget,
            paymentSummary,
            paymentMethodId,
            amountReceived,
            isPaymentLoading,
            isCollectingPayment,
            openingChatBookingId,
            updatingNoShowBookingId,
            errorMessage,
        } = this.state;
        const doctorName = this.getDoctorName();
        const isDetailRoute = this.isDetailRoute();

        return (
            <div className="doctor-queue-page">
                <div className="doctor-queue__header">
                    <div>
                        <h2>{isDetailRoute ? this.getText("detail") : this.getText("title")}</h2>
                        <p>
                            {this.getText("doctor")}: {doctorName || "-"}
                        </p>
                    </div>
                    {isDetailRoute ? (
                        <button
                            type="button"
                            className="doctor-queue__back-button"
                            onClick={this.handleBackToQueue}
                        >
                            <i className="fa-solid fa-chevron-left" />
                            {this.getText("backToQueue", "Back to queue")}
                        </button>
                    ) : (
                        this.renderSummary()
                    )}
                </div>

                {!isDetailRoute && (
                    <form className="doctor-queue__toolbar" onSubmit={this.handleSubmit}>
                        <label>
                            <span>{this.getText("appointmentDate")}</span>
                            <input
                                type="date"
                                value={appointmentDate}
                                onChange={(event) =>
                                    this.handleFilterChange("appointmentDate", event.target.value)
                                }
                            />
                        </label>
                        <label>
                            <span>{this.getText("visitStatus")}</span>
                            <select
                                value={visitStatusId}
                                onChange={(event) =>
                                    this.handleFilterChange("visitStatusId", event.target.value)
                                }
                            >
                                <option value="">{this.getText("all")}</option>
                                <option value="VS1">{this.getText("waiting")}</option>
                                <option value="VS2">{this.getText("inProgress")}</option>
                                <option value="VS3">{this.getText("completed")}</option>
                            </select>
                        </label>
                        <label>
                            <span>{this.getText("paymentStatus")}</span>
                            <select
                                value={paymentStatusId}
                                onChange={(event) =>
                                    this.handleFilterChange("paymentStatusId", event.target.value)
                                }
                            >
                                <option value="">{this.getText("all")}</option>
                                <option value="PS1">{this.getText("unpaid")}</option>
                                <option value="PS2">{this.getText("paid")}</option>
                            </select>
                        </label>
                        <label className="doctor-queue__search">
                            <span>{this.getText("search")}</span>
                            <input
                                type="text"
                                value={search}
                                placeholder={this.getText("searchPlaceholder")}
                                onChange={(event) => this.setState({ search: event.target.value })}
                            />
                        </label>
                        <button type="submit" disabled={isLoading}>
                            <i className="bi bi-search" />
                            {isLoading ? `${this.getText("loading")}...` : this.getText("searchAction")}
                        </button>
                    </form>
                )}

                {errorMessage && <div className="doctor-queue__error">{errorMessage}</div>}

                {isDetailRoute ? (
                    this.renderAppointmentDetailPage()
                ) : (
                    <div className="doctor-queue__content">
                        <section className="doctor-queue__table-panel">
                            <DoctorQueueTable
                                queue={queue}
                                selectedBookingId={selectedBookingId}
                                isLoading={isLoading}
                                startingBookingId={startingBookingId}
                                getText={this.getText}
                                getPatientName={this.getPatientName}
                                getVisitStatusLabel={this.getVisitStatusLabel}
                                getPaymentStatusLabel={this.getPaymentStatusLabel}
                                getAppointmentTypeLabel={this.getAppointmentTypeLabel}
                                getVideoStatusLabel={this.getVideoStatusLabel}
                                renderStatusBadge={this.renderStatusBadge}
                                canStartVisit={this.canStartVisit}
                                canMarkNoShow={this.canMarkNoShow}
                                isNoShow={this.isNoShow}
                                canOpenChatRoom={this.canOpenChatRoom}
                                canCollectPayment={this.canCollectPayment}
                                onSelectRow={this.handleSelectRow}
                                onStartVisit={this.handleStartVisit}
                                onPatientNoShow={this.handlePatientNoShow}
                                onOpenPaymentModal={this.handleOpenPaymentModal}
                                onOpenVideoRoom={this.handleOpenVideoRoom}
                                onOpenChatRoom={this.handleOpenChatRoom}
                                openingChatBookingId={openingChatBookingId}
                                updatingNoShowBookingId={updatingNoShowBookingId}
                            />
                        </section>
                    </div>
                )}
                <DoctorPaymentModal
                    paymentModalOpen={paymentModalOpen}
                    paymentTarget={paymentTarget}
                    paymentSummary={paymentSummary}
                    paymentMethodId={paymentMethodId}
                    amountReceived={amountReceived}
                    isPaymentLoading={isPaymentLoading}
                    isCollectingPayment={isCollectingPayment}
                    getText={this.getText}
                    getPatientName={this.getPatientName}
                    getFallbackPaymentStatus={this.getFallbackPaymentStatus}
                    formatMoney={this.formatMoney}
                    onClose={this.handleClosePaymentModal}
                    onCollect={this.handleCollectPayment}
                    onPaymentMethodChange={(value) => this.setState({ paymentMethodId: value })}
                    onAmountReceivedChange={(value) => this.setState({ amountReceived: value })}
                />
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
    userInfo: state.doctor?.doctorInfo,
});

export default connect(mapStateToProps)(injectIntl(DoctorQueue));
