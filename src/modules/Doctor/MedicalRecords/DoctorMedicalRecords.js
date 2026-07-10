import React, { Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import moment from "moment";
import {
    getAdminMedicalRecordAppointmentDetail,
    getAdminMedicalRecordDetail,
    getAdminMedicalRecords,
    getDoctorAppointmentDetail,
    getDoctorMedicalRecords,
} from "../../../services/userService";
import MedicalRecordWorkspace from "./MedicalRecordWorkspace";
import "./DoctorMedicalRecords.scss";

const VISIT_STATUS = Object.freeze({
    IN_PROGRESS: "VS2",
    COMPLETED: "VS3",
});

const MEDICAL_RECORD_STATUS = Object.freeze({
    DRAFT: "MR1",
    CLOSED: "MR2",
});

class DoctorMedicalRecords extends Component {
    constructor(props) {
        super(props);
        this.listRequestId = 0;
        this.detailRequestId = 0;
        this.state = {
            appointmentDate: "",
            visitStatusId: "",
            recordStatusId: "",
            search: "",
            records: [],
            pagination: {
                page: 1,
                limit: 10,
                total: 0,
            },
            appointmentDetail: null,
            isLoading: false,
            isDetailLoading: false,
            errorMessage: "",
        };
    }

    componentDidMount() {
        const bookingId = this.getRouteBookingId();
        if (bookingId) {
            this.fetchAppointmentDetail(bookingId);
            return;
        }

        this.fetchRecords();
    }

    componentDidUpdate(prevProps) {
        const previousBookingId = prevProps.match?.params?.bookingId || null;
        const bookingId = this.getRouteBookingId();

        if (String(previousBookingId || "") !== String(bookingId || "")) {
            this.setState(
                {
                    appointmentDetail: null,
                    errorMessage: "",
                },
                () => {
                    if (bookingId) {
                        this.fetchAppointmentDetail(bookingId);
                    } else {
                        this.fetchRecords();
                    }
                }
            );
            return;
        }

        if (prevProps.userInfo?.id !== this.props.userInfo?.id) {
            this.setState(
                {
                    appointmentDetail: null,
                    records: [],
                    pagination: {
                        ...this.state.pagination,
                        page: 1,
                    },
                },
                () => {
                    if (bookingId) {
                        this.fetchAppointmentDetail(bookingId);
                    } else {
                        this.fetchRecords({ page: 1 });
                    }
                }
            );
        }
    }

    getText = (key, defaultMessage = key) =>
        this.props.intl.formatMessage({
            id: `doctor.medical-records.${key}`,
            defaultMessage,
        });

    isAdminMode = () => Boolean(this.props.adminMode);

    getRouteBookingId = () => this.props.match?.params?.bookingId || null;

    isDetailRoute = () => Boolean(this.getRouteBookingId());

    getListPath = () => (this.isAdminMode() ? "/system/medical-record" : "/doctor/medical-record");

    getDetailPath = (bookingId) =>
        `${this.getListPath()}/${encodeURIComponent(bookingId)}`;

    getDoctorName = () => {
        const { userInfo } = this.props;
        return `${userInfo?.firstName || ""} ${userInfo?.lastName || ""}`
            .replace(/\s+/g, " ")
            .trim();
    };

    getRecordDoctorName = (item = {}) => {
        const joinedName = `${item.doctorFirstName || ""} ${item.doctorLastName || ""}`
            .replace(/\s+/g, " ")
            .trim();

        return joinedName || item.doctorName || "-";
    };

    getPatientName = (item = {}) => {
        const joinedName = `${item.patientFirstName || item.currentPatientFirstName || ""} ${item.patientLastName || item.currentPatientLastName || ""
            }`
            .replace(/\s+/g, " ")
            .trim();

        return joinedName || item.patientName || "-";
    };

    getTotalPages = () => {
        const { total, limit } = this.state.pagination;
        return Math.max(Math.ceil(Number(total || 0) / Number(limit || 10)), 1);
    };

    getFallbackVisitStatus = (statusId) => {
        switch (statusId) {
            case VISIT_STATUS.COMPLETED:
                return this.getText("completed");
            case VISIT_STATUS.IN_PROGRESS:
                return this.getText("inProgress");
            default:
                return "-";
        }
    };

    getVisitStatusLabel = (item = {}) => {
        const statusId = item.visitStatusId || item.statusId;
        if (this.props.language === "vi") {
            return item.visitStatusVi || this.getFallbackVisitStatus(statusId);
        }

        return item.visitStatusEn || this.getFallbackVisitStatus(statusId);
    };

    getRecordStatusLabel = (statusId) =>
        statusId === MEDICAL_RECORD_STATUS.CLOSED ? this.getText("closed") : this.getText("draft");

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

    renderStatusBadge = (type, label, statusId) => (
        <span className={`doctor-medical-records__badge ${type} ${statusId || "empty"}`}>
            {label}
        </span>
    );

    fetchRecords = async (options = {}) => {
        if (!this.props.userInfo?.id || this.isDetailRoute()) return;

        const requestId = this.listRequestId + 1;
        this.listRequestId = requestId;
        const page = options.page || this.state.pagination.page;
        this.setState({ isLoading: true, errorMessage: "" });

        try {
            const fetchMedicalRecords = this.isAdminMode()
                ? getAdminMedicalRecords
                : getDoctorMedicalRecords;
            const response = await fetchMedicalRecords({
                date: this.state.appointmentDate,
                visitStatusId: this.state.visitStatusId,
                recordStatusId: this.state.recordStatusId,
                search: this.state.search.trim(),
                page,
                limit: this.state.pagination.limit,
            });

            if (requestId !== this.listRequestId) return;

            if (!response || response.errCode !== 0) {
                this.setState({
                    records: [],
                    isLoading: false,
                    errorMessage: response?.errMessage || this.getText("loadError"),
                });
                return;
            }

            this.setState({
                records: response.data || [],
                pagination: {
                    page: Number(response.pagination?.page) || page,
                    limit: Number(response.pagination?.limit) || this.state.pagination.limit,
                    total: Number(response.pagination?.total) || 0,
                },
                isLoading: false,
                errorMessage: "",
            });
        } catch (error) {
            if (requestId !== this.listRequestId) return;
            this.setState({
                records: [],
                isLoading: false,
                errorMessage: this.getText("loadError"),
            });
        }
    };

    fetchAppointmentDetail = async (bookingId) => {
        if (!bookingId || !this.props.userInfo?.id) return;

        const requestId = this.detailRequestId + 1;
        this.detailRequestId = requestId;
        this.setState({
            isDetailLoading: true,
            appointmentDetail: null,
            errorMessage: "",
        });

        try {
            const fetchAppointmentDetail = this.isAdminMode()
                ? getAdminMedicalRecordAppointmentDetail
                : getDoctorAppointmentDetail;
            const response = await fetchAppointmentDetail(bookingId);
            if (requestId !== this.detailRequestId) return;
            if (String(this.getRouteBookingId() || "") !== String(bookingId || "")) return;

            if (!response || response.errCode !== 0) {
                this.setState({
                    isDetailLoading: false,
                    appointmentDetail: null,
                    errorMessage: response?.errMessage || this.getText("detailError"),
                });
                return;
            }

            this.setState({
                appointmentDetail: response.data || null,
                isDetailLoading: false,
                errorMessage: "",
            });
        } catch (error) {
            if (requestId !== this.detailRequestId) return;
            this.setState({
                isDetailLoading: false,
                appointmentDetail: null,
                errorMessage: this.getText("detailError"),
            });
        }
    };

    handleServerFilterChange = (field, value) => {
        this.setState(
            {
                [field]: value,
                pagination: {
                    ...this.state.pagination,
                    page: 1,
                },
            },
            () => this.fetchRecords({ page: 1 })
        );
    };

    handleSubmit = (event) => {
        event.preventDefault();
        this.setState(
            {
                pagination: {
                    ...this.state.pagination,
                    page: 1,
                },
            },
            () => this.fetchRecords({ page: 1 })
        );
    };

    handleLimitChange = (event) => {
        const limit = Number(event.target.value) || 10;
        this.setState(
            {
                pagination: {
                    ...this.state.pagination,
                    page: 1,
                    limit,
                },
            },
            () => this.fetchRecords({ page: 1 })
        );
    };

    handlePageChange = (page) => {
        if (page < 1 || page > this.getTotalPages() || page === this.state.pagination.page) {
            return;
        }

        this.fetchRecords({ page });
    };

    handleOpenDetail = (item) => {
        if (!item?.bookingId || !this.props.history) return;

        this.props.history.push(this.getDetailPath(item.bookingId));
    };

    handleBackToList = () => {
        if (this.props.history) {
            this.props.history.push(this.getListPath());
        }
    };

    handleRecordChanged = (record = {}) => {
        const medicalRecordId = record.id || record.medicalRecordId;
        if (!medicalRecordId) return;

        this.setState((prevState) => ({
            appointmentDetail:
                Number(prevState.appointmentDetail?.medicalRecordId) === Number(medicalRecordId)
                    ? {
                        ...prevState.appointmentDetail,
                        medicalRecordStatusId:
                            record.statusId || prevState.appointmentDetail.medicalRecordStatusId,
                    }
                    : prevState.appointmentDetail,
        }));
    };

    handleVisitCompleted = (result = {}) => {
        const visit = result.visit || {};
        const bookingId = visit.bookingId || this.getRouteBookingId();

        if (bookingId) {
            this.fetchAppointmentDetail(bookingId);
        }
    };

    renderSummary = () => {
        const closed = this.state.records.filter(
            (item) => item.medicalRecordStatusId === MEDICAL_RECORD_STATUS.CLOSED
        ).length;

        return (
            <div className="doctor-medical-records__summary">
                <div>
                    <span>{this.getText("total")}</span>
                    <strong>{this.state.pagination.total}</strong>
                </div>
                <div>
                    <span>{this.getText("draft")}</span>
                    <strong>{this.state.records.length - closed}</strong>
                </div>
                <div>
                    <span>{this.getText("closed")}</span>
                    <strong>{closed}</strong>
                </div>
            </div>
        );
    };

    renderDetailRow = (label, value) => (
        <div className="doctor-medical-records__detail-row">
            <span>{label}</span>
            <strong>{value || "-"}</strong>
        </div>
    );

    renderTable = () => (
        <div className="doctor-medical-records__table-scroll">
            <table>
                <thead>
                    <tr>
                        <th>{this.getText("record")}</th>
                        <th>{this.getText("patient")}</th>
                        {this.isAdminMode() && <th>{this.getText("doctor")}</th>}
                        <th>{this.getText("appointmentDate")}</th>
                        <th>{this.getText("queueNumber")}</th>
                        <th>{this.getText("visitStatus")}</th>
                        <th>{this.getText("recordStatus")}</th>
                        <th>{this.getText("detail")}</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.records.length > 0 ? (
                        this.state.records.map((item) => (
                            <tr key={item.medicalRecordId} onClick={() => this.handleOpenDetail(item)}>
                                <td>
                                    <span className="doctor-medical-records__record-number">
                                        #{item.medicalRecordId}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className="doctor-medical-records__patient"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            this.handleOpenDetail(item);
                                        }}
                                    >
                                        {this.getPatientName(item)}
                                    </button>
                                    <small>{item.medicalCode || item.patientPhoneNumber || "-"}</small>
                                </td>
                                {this.isAdminMode() && (
                                    <td>
                                        <strong>{this.getRecordDoctorName(item)}</strong>
                                        <small>{item.doctorEmail || item.doctorPhoneNumber || "-"}</small>
                                    </td>
                                )}
                                <td>
                                    {this.formatDate(item.appointmentDate || item.examDate)}
                                    <small>{item.timeTypeVi || item.timeTypeEn || item.timeType || "-"}</small>
                                </td>
                                <td>{item.queueNumber || "-"}</td>
                                <td>
                                    {this.renderStatusBadge(
                                        "visit",
                                        this.getVisitStatusLabel(item),
                                        item.visitStatusId
                                    )}
                                </td>
                                <td>
                                    {this.renderStatusBadge(
                                        "record",
                                        this.getRecordStatusLabel(item.medicalRecordStatusId),
                                        item.medicalRecordStatusId
                                    )}
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className="doctor-medical-records__icon-button"
                                        title={this.getText("detail")}
                                        aria-label={this.getText("detail")}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            this.handleOpenDetail(item);
                                        }}
                                    >
                                        <i className="bi bi-eye" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={this.isAdminMode() ? "8" : "7"}
                                className="doctor-medical-records__empty"
                            >
                                {this.state.isLoading
                                    ? `${this.getText("loading")}...`
                                    : this.getText("noRecords")}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    renderPagination = () => {
        const totalPages = this.getTotalPages();
        const { page } = this.state.pagination;
        const start = Math.max(page - 2, 1);
        const end = Math.min(start + 4, totalPages);
        const pageNumbers = [];

        for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
            pageNumbers.push(pageNumber);
        }

        return (
            <div className="doctor-medical-records__pagination">
                <button
                    type="button"
                    onClick={() => this.handlePageChange(page - 1)}
                    disabled={page <= 1 || this.state.isLoading}
                >
                    <i className="bi bi-chevron-left" />
                    {this.getText("previous")}
                </button>
                {pageNumbers.map((pageNumber) => (
                    <button
                        type="button"
                        key={pageNumber}
                        className={pageNumber === page ? "active" : ""}
                        onClick={() => this.handlePageChange(pageNumber)}
                        disabled={this.state.isLoading}
                    >
                        {pageNumber}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => this.handlePageChange(page + 1)}
                    disabled={page >= totalPages || this.state.isLoading}
                >
                    {this.getText("next")}
                    <i className="bi bi-chevron-right" />
                </button>
            </div>
        );
    };

    renderFooter = () => (
        <div className="doctor-medical-records__footer">
            <span>
                {this.getText("page")} {this.state.pagination.page} {this.getText("of")}{" "}
                {this.getTotalPages()}
            </span>
            {this.renderPagination()}
        </div>
    );

    renderListPage = () => {
        const { appointmentDate, visitStatusId, recordStatusId, search, isLoading } = this.state;

        return (
            <>
                <form className="doctor-medical-records__toolbar" onSubmit={this.handleSubmit}>
                    <label>
                        <span>{this.getText("appointmentDate")}</span>
                        <input
                            type="date"
                            value={appointmentDate}
                            onChange={(event) =>
                                this.handleServerFilterChange("appointmentDate", event.target.value)
                            }
                        />
                    </label>
                    <label>
                        <span>{this.getText("visitStatus")}</span>
                        <select
                            value={visitStatusId}
                            onChange={(event) =>
                                this.handleServerFilterChange("visitStatusId", event.target.value)
                            }
                        >
                            <option value="">{this.getText("all")}</option>
                            <option value="VS2">{this.getText("inProgress")}</option>
                            <option value="VS3">{this.getText("completed")}</option>
                        </select>
                    </label>
                    <label>
                        <span>{this.getText("recordStatus")}</span>
                        <select
                            value={recordStatusId}
                            onChange={(event) =>
                                this.handleServerFilterChange("recordStatusId", event.target.value)
                            }
                        >
                            <option value="">{this.getText("all")}</option>
                            <option value="MR1">{this.getText("draft")}</option>
                            <option value="MR2">{this.getText("closed")}</option>
                        </select>
                    </label>
                    <label className="doctor-medical-records__search">
                        <span>{this.getText("search")}</span>
                        <input
                            type="text"
                            value={search}
                            placeholder={
                                this.isAdminMode()
                                    ? this.getText("adminSearchPlaceholder")
                                    : this.getText("searchPlaceholder")
                            }
                            onChange={(event) => this.setState({ search: event.target.value })}
                        />
                    </label>
                    <button type="submit" disabled={isLoading}>
                        <i className="bi bi-search" />
                        {isLoading ? `${this.getText("loading")}...` : this.getText("searchAction")}
                    </button>
                    <label className="doctor-medical-records__page-size">
                        <span>{this.getText("pageSize")}</span>
                        <select value={this.state.pagination.limit} onChange={this.handleLimitChange}>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                    </label>
                </form>

                <div className="doctor-medical-records__content list-only">
                    <section className="doctor-medical-records__table-panel">
                        {this.renderTable()}
                        {this.renderFooter()}
                    </section>
                </div>
            </>
        );
    };

    renderDetailPage = () => {
        const { appointmentDetail, isDetailLoading } = this.state;

        if (isDetailLoading && !appointmentDetail) {
            return (
                <section className="doctor-medical-records__detail-panel empty">
                    {this.getText("loading")}...
                </section>
            );
        }

        if (!appointmentDetail) {
            return (
                <section className="doctor-medical-records__detail-panel empty">
                    {this.getText("detailError")}
                </section>
            );
        }

        return (
            <section className="doctor-medical-records__detail-panel">
                <div className="doctor-medical-records__detail-header">
                    <div>
                        <span>#{appointmentDetail.medicalRecordId || "-"}</span>
                        <h3>{this.getPatientName(appointmentDetail)}</h3>
                        <p>{appointmentDetail.medicalCode || "-"}</p>
                    </div>
                    {this.renderStatusBadge(
                        "record",
                        this.getRecordStatusLabel(appointmentDetail.medicalRecordStatusId),
                        appointmentDetail.medicalRecordStatusId
                    )}
                </div>

                <div className="doctor-medical-records__detail-grid">
                    {this.renderDetailRow(
                        this.getText("appointmentDate"),
                        this.formatDate(appointmentDetail.examDate || appointmentDetail.appointmentDate)
                    )}
                    {this.renderDetailRow(
                        this.getText("time"),
                        appointmentDetail.timeTypeVi ||
                        appointmentDetail.timeTypeEn ||
                        appointmentDetail.timeType
                    )}
                    {this.renderDetailRow(this.getText("queueNumber"), appointmentDetail.queueNumber)}
                    {this.renderDetailRow(
                        this.getText("visitStatus"),
                        this.getVisitStatusLabel(appointmentDetail)
                    )}
                    {this.isAdminMode() &&
                        this.renderDetailRow(this.getText("doctor"), this.getRecordDoctorName(appointmentDetail))}
                    {this.renderDetailRow(
                        this.getText("startedAt"),
                        this.formatDateTime(appointmentDetail.startedAt)
                    )}
                    {this.renderDetailRow(
                        this.getText("completedAt"),
                        this.formatDateTime(appointmentDetail.completedAt)
                    )}
                </div>

                {appointmentDetail.medicalRecordId ? (
                    <MedicalRecordWorkspace
                        language={this.props.language}
                        selectedItem={appointmentDetail}
                        selectedVisitDetail={appointmentDetail}
                        onRecordChanged={this.handleRecordChanged}
                        onVisitCompleted={this.handleVisitCompleted}
                        readOnly={this.isAdminMode()}
                        getMedicalRecordDetail={
                            this.isAdminMode() ? getAdminMedicalRecordDetail : undefined
                        }
                    />
                ) : (
                    <div className="doctor-medical-records__notice">
                        {this.getText("noMedicalRecord")}
                    </div>
                )}
            </section>
        );
    };

    render() {
        const { errorMessage } = this.state;
        const isDetailRoute = this.isDetailRoute();
        const title = this.isAdminMode()
            ? this.getText("adminTitle")
            : isDetailRoute
                ? this.getText("detailTitle")
                : this.getText("title");

        return (
            <div className="doctor-medical-records-page">
                <div className="doctor-medical-records__header">
                    <div>
                        <h2>{title}</h2>
                        <p>
                            {this.isAdminMode()
                                ? this.getText("adminScope")
                                : `${this.getText("doctor")}: ${this.getDoctorName() || "-"}`}
                        </p>
                    </div>
                    {isDetailRoute ? (
                        <button
                            type="button"
                            className="doctor-medical-records__back-button"
                            onClick={this.handleBackToList}
                        >
                            <i className="fa-solid fa-chevron-left" />
                            {this.getText("backToList")}
                        </button>
                    ) : (
                        this.renderSummary()
                    )}
                </div>

                {errorMessage && <div className="doctor-medical-records__error">{errorMessage}</div>}

                {isDetailRoute ? this.renderDetailPage() : this.renderListPage()}
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => ({
    language: state.app.language,
    userInfo: ownProps.adminMode ? state.adminAuth?.adminInfo : state.doctor?.doctorInfo,
});

export default connect(mapStateToProps)(injectIntl(DoctorMedicalRecords));
