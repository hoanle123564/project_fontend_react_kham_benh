import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage, injectIntl } from "react-intl";
import moment from "moment";
import {
    getDoctorPatientDetail,
    getDoctorPatientHistory,
    getDoctorPatients,
} from "../../services/userService";
import "./ManagePatient.scss";


class ManagePatient extends Component {
    constructor(props) {
        super(props);
        this.state = {
            patients: [],
            patientDetail: null,
            patientHistory: [],
            selectedPatientId: null,
            search: "",
            visitFilter: "",
            sortBy: "latestExamDate",
            sortDir: "DESC",
            pagination: {
                page: 1,
                limit: 10,
                total: 0,
            },
            isLoading: false,
            isDetailLoading: false,
            errorMessage: "",
        };
    }

    componentDidMount() {
        const routePatientId = this.getRoutePatientId();
        if (routePatientId) {
            this.fetchPatientDetail(routePatientId);
            return;
        }

        this.fetchPatientList(1);
    }

    componentDidUpdate(prevProps) {
        const previousRoutePatientId = prevProps.match?.params?.patientId || null;
        const routePatientId = this.getRoutePatientId();

        if (String(previousRoutePatientId || "") !== String(routePatientId || "")) {
            this.setState(
                {
                    selectedPatientId: routePatientId,
                    patientDetail: null,
                    patientHistory: [],
                    errorMessage: "",
                },
                () => {
                    if (routePatientId) {
                        this.fetchPatientDetail(routePatientId);
                    } else {
                        this.fetchPatientList(1);
                    }
                }
            );
            return;
        }

        if (prevProps.userInfo?.id !== this.props.userInfo?.id) {
            this.setState(
                {
                    selectedPatientId: routePatientId,
                    patientDetail: null,
                    patientHistory: [],
                },
                () => {
                    if (routePatientId) {
                        this.fetchPatientDetail(routePatientId);
                    } else {
                        this.fetchPatientList(1);
                    }
                }
            );
        }
    }

    getText = (key, defaultMessage = key) =>
        this.props.intl.formatMessage({
            id: `doctor.manage-patient.${key}`,
            defaultMessage,
        });

    getDoctorName = () => {
        const { userInfo } = this.props;
        return `${userInfo?.firstName || ""} ${userInfo?.lastName || ""}`
            .replace(/\s+/g, " ")
            .trim();
    };

    getRoutePatientId = () => this.props.match?.params?.patientId || null;

    isDetailRoute = () => Boolean(this.getRoutePatientId());

    getTotalPages = () => {
        const { total, limit } = this.state.pagination;
        return Math.max(Math.ceil(Number(total || 0) / Number(limit || 10)), 1);
    };

    fetchPatientList = async (page = this.state.pagination.page) => {
        if (!this.props.userInfo?.id) return;

        const { search, sortBy, sortDir, visitFilter, pagination } = this.state;
        this.setState({ isLoading: true, errorMessage: "" });

        try {
            const response = await getDoctorPatients({
                page,
                limit: pagination.limit,
                search: search.trim(),
                visitFilter,
                sortBy,
                sortDir,
            });

            if (!response || response.errCode !== 0) {
                this.setState({
                    isLoading: false,
                    patients: [],
                    patientDetail: null,
                    patientHistory: [],
                    selectedPatientId: null,
                    pagination: { ...pagination, page, total: 0 },
                    errorMessage: response?.errMessage || this.getText("loadError"),
                });
                return;
            }

            const patients = response.data || [];
            const nextPagination = {
                page: Number(response.pagination?.page) || page,
                limit: Number(response.pagination?.limit) || pagination.limit,
                total: Number(response.pagination?.total) || 0,
            };

            this.setState({
                patients,
                selectedPatientId: null,
                patientDetail: null,
                patientHistory: [],
                pagination: nextPagination,
                isLoading: false,
                errorMessage: "",
            });
        } catch {
            this.setState({
                isLoading: false,
                patients: [],
                errorMessage: this.getText("loadError"),
            });
        }
    };

    fetchPatientDetail = async (patientId) => {
        if (!patientId) return;

        this.setState({ selectedPatientId: patientId, isDetailLoading: true, errorMessage: "" });

        try {
            const [detailResponse, historyResponse] = await Promise.all([
                getDoctorPatientDetail(patientId),
                getDoctorPatientHistory(patientId),
            ]);

            if (Number(this.state.selectedPatientId) !== Number(patientId)) return;

            if (!detailResponse || detailResponse.errCode !== 0) {
                this.setState({
                    isDetailLoading: false,
                    patientDetail: null,
                    patientHistory: [],
                    errorMessage: detailResponse?.errMessage || this.getText("detailError"),
                });
                return;
            }

            this.setState({
                isDetailLoading: false,
                patientDetail: detailResponse.data || null,
                patientHistory:
                    historyResponse && historyResponse.errCode === 0
                        ? historyResponse.data || []
                        : [],
            });
        } catch {
            if (Number(this.state.selectedPatientId) !== Number(patientId)) return;

            this.setState({
                isDetailLoading: false,
                patientDetail: null,
                patientHistory: [],
                errorMessage: this.getText("detailError"),
            });
        }
    };

    handleSearchChange = (event) => {
        this.setState({ search: event.target.value });
    };

    handleSubmitSearch = (event) => {
        event.preventDefault();
        this.fetchPatientList(1);
    };

    handleVisitFilterChange = (event) => {
        this.setState({ visitFilter: event.target.value }, () => this.fetchPatientList(1));
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
            () => this.fetchPatientList(1)
        );
    };

    handleSort = (field) => {
        const isSameField = this.state.sortBy === field;
        const sortDir = isSameField && this.state.sortDir === "ASC" ? "DESC" : "ASC";

        this.setState({ sortBy: field, sortDir }, () => this.fetchPatientList(1));
    };

    handlePageChange = (page) => {
        if (page < 1 || page > this.getTotalPages() || page === this.state.pagination.page) {
            return;
        }

        this.fetchPatientList(page);
    };

    handleSelectPatient = (patientId) => {
        if (!patientId) return;

        if (this.props.history) {
            this.props.history.push(`/doctor/manage-patient/${encodeURIComponent(patientId)}`);
        }
    };

    handleBackToList = () => {
        if (this.props.history) {
            this.props.history.push("/doctor/manage-patient");
        }
    };

    handleOpenMedicalRecord = (medicalRecordId) => {
        if (!medicalRecordId || !this.props.history) return;

        this.props.history.push(`/doctor/medical-record?recordId=${encodeURIComponent(medicalRecordId)}`);
    };

    formatDate = (value) => {
        if (!value) return "-";
        const parsed = moment(value);
        return parsed.isValid() ? parsed.format("DD/MM/YYYY") : "-";
    };

    formatDateTime = (value) => {
        if (!value) return "-";
        const parsed = moment(value);
        if (!parsed.isValid()) return "-";

        return String(value).length <= 10
            ? parsed.format("DD/MM/YYYY")
            : parsed.format("DD/MM/YYYY HH:mm");
    };

    formatLatestVisit = (patient) => {
        const value = patient?.latestVisitAt || patient?.latestExamDate;
        return value ? this.formatDateTime(value) : this.getText("notAvailable");
    };

    formatGender = (gender) => {
        if (gender === "M") return this.getText("male");
        if (gender === "F") return this.getText("female");
        if (gender) return this.getText("other");
        return "-";
    };

    renderSortButton = (field, label) => {
        const active = this.state.sortBy === field;
        const icon = active
            ? `fa-solid fa-sort-${this.state.sortDir === "ASC" ? "up" : "down"}`
            : "fa-solid fa-sort";

        return (
            <button
                type="button"
                className="manage-patient__sort"
                onClick={() => this.handleSort(field)}
                title={label}
            >
                <span>{label}</span>
                <i className={icon}></i>
            </button>
        );
    };

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
            <div className="manage-patient__pagination">
                <button
                    type="button"
                    onClick={() => this.handlePageChange(page - 1)}
                    disabled={page <= 1 || this.state.isLoading}
                >
                    <i className="fa-solid fa-chevron-left"></i>
                    <span>{this.getText("previous")}</span>
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
                    <span>{this.getText("next")}</span>
                    <i className="fa-solid fa-chevron-right"></i>
                </button>
            </div>
        );
    };

    renderDetailRow = (label, value) => (
        <div className="manage-patient__detail-row">
            <span>{label}</span>
            <strong>{value || "-"}</strong>
        </div>
    );

    renderPatientInfoPanel = () => {
        const { patientDetail } = this.state;

        return (
            <section className="manage-patient__detail-panel">
                <div className="manage-patient__detail-header">
                    <div>
                        <h3>{patientDetail.patientName || "-"}</h3>
                        <p>{patientDetail.email || "-"}</p>
                    </div>
                    <span>{patientDetail.medicalCode || "-"}</span>
                </div>

                <div className="manage-patient__detail-grid">
                    {this.renderDetailRow(this.getText("phone"), patientDetail.phoneNumber)}
                    {this.renderDetailRow(this.getText("gender"), this.formatGender(patientDetail.gender))}
                    {this.renderDetailRow(this.getText("dob"), this.formatDate(patientDetail.dateOfBirth))}
                    {this.renderDetailRow(this.getText("address"), patientDetail.address)}
                    {this.renderDetailRow(this.getText("citizenId"), patientDetail.citizenId)}
                    {this.renderDetailRow(this.getText("insurance"), patientDetail.healthInsuranceCode)}
                    {this.renderDetailRow(this.getText("bloodType"), patientDetail.bloodType)}
                    {this.renderDetailRow(
                        this.getText("latestVisit"),
                        this.formatLatestVisit(patientDetail)
                    )}
                </div>
            </section>
        );
    };

    renderPatientHistoryPanel = () => {
        const { patientHistory } = this.state;

        return (
            <section className="manage-patient__history-panel">
                <div className="manage-patient__history">
                    <h4>{this.getText("history")}</h4>
                    <div className="manage-patient__history-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>{this.getText("appointmentDate")}</th>
                                    <th>{this.getText("time")}</th>
                                    <th>{this.getText("queueNumber")}</th>
                                    <th>{this.getText("prescription")}</th>
                                    <th>{this.getText("paraclinical")}</th>
                                    <th>{this.getText("record")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patientHistory.length > 0 ? (
                                    patientHistory.map((item) => (
                                        <tr key={item.bookingId}>
                                            <td>{this.formatDate(item.appointmentDate)}</td>
                                            <td>
                                                {this.props.language === "vi"
                                                    ? item.timeTypeVi
                                                    : item.timeTypeEn}
                                            </td>
                                            <td>{item.queueNumber || "-"}</td>
                                            <td>{item.prescriptionId ? this.getText("yes") : this.getText("no")}</td>
                                            <td>{Number(item.paraclinicalCount || 0)}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="manage-patient__icon-button"
                                                    disabled={!item.medicalRecordId}
                                                    title={this.getText("viewRecord")}
                                                    aria-label={this.getText("viewRecord")}
                                                    onClick={() => this.handleOpenMedicalRecord(item.medicalRecordId)}
                                                >
                                                    <i className="bi bi-journal-medical"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">{this.getText("noHistory")}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        );
    };

    renderDetailPage = () => {
        const { patientDetail, selectedPatientId, isDetailLoading } = this.state;

        if (isDetailLoading && !patientDetail) {
            return (
                <div className="manage-patient__detail-panel empty">
                    {this.getText("loading")}...
                </div>
            );
        }

        if (!selectedPatientId || !patientDetail) {
            return (
                <div className="manage-patient__detail-panel empty">
                    {this.getText("detailError")}
                </div>
            );
        }

        return (
            <div className="manage-patient__detail-layout">
                {this.renderPatientInfoPanel()}
                {this.renderPatientHistoryPanel()}
            </div>
        );
    };

    render() {
        const { patients, pagination, selectedPatientId, isLoading, errorMessage } = this.state;
        const totalPages = this.getTotalPages();
        const isDetailRoute = this.isDetailRoute();

        return (
            <div className="manage-patient-page">
                <div className="manage-patient__header">
                    <div>
                        <h2>
                            {isDetailRoute ? this.getText("detail") : <FormattedMessage id="manage-patient.title" />}
                        </h2>
                        <p>
                            {this.getText("doctor")}: {this.getDoctorName() || "-"}
                        </p>
                    </div>
                    {isDetailRoute ? (
                        <button
                            type="button"
                            className="manage-patient__back-button"
                            onClick={this.handleBackToList}
                        >
                            <i className="fa-solid fa-chevron-left"></i>
                            {this.getText("backToList", "Back to list")}
                        </button>
                    ) : (
                        <div className="manage-patient__total">
                            {this.getText("total")}: <strong>{pagination.total}</strong>
                        </div>
                    )}
                </div>

                {!isDetailRoute && (
                    <form className="manage-patient__toolbar" onSubmit={this.handleSubmitSearch}>
                        <div className="manage-patient__search">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input
                                type="text"
                                value={this.state.search}
                                onChange={this.handleSearchChange}
                                placeholder={this.getText("searchPlaceholder")}
                            />
                        </div>

                        <button type="submit" disabled={isLoading} title={this.getText("searchPlaceholder")}>
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <span>{this.getText("search")}</span>
                        </button>

                        <select value={this.state.visitFilter} onChange={this.handleVisitFilterChange}>
                            <option value="">{this.getText("allPatients")}</option>
                            <option value="examined">{this.getText("examined")}</option>
                            <option value="not_examined">{this.getText("notExamined")}</option>
                        </select>

                        <label>
                            <span>{this.getText("pageSize")}</span>
                            <select value={pagination.limit} onChange={this.handleLimitChange}>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </label>
                    </form>
                )}

                {errorMessage && <div className="manage-patient__error">{errorMessage}</div>}

                {isDetailRoute ? (
                    this.renderDetailPage()
                ) : (
                    <div className="manage-patient__content">
                    <section className="manage-patient__table-panel">
                        <div className="manage-patient__table-scroll">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{this.renderSortButton("patientName", this.getText("patient"))}</th>
                                        <th>{this.renderSortButton("medicalCode", this.getText("medicalCode"))}</th>
                                        <th>{this.getText("phone")}</th>
                                        <th>{this.renderSortButton("firstBookingCreatedAt", this.getText("firstBooking"))}</th>
                                        <th>{this.renderSortButton("latestExamDate", this.getText("latestVisit"))}</th>
                                        <th>{this.getText("bookings")}</th>
                                        <th>{this.getText("visits")}</th>
                                        <th>{this.getText("detail")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.length > 0 ? (
                                        patients.map((patient) => (
                                            <tr
                                                key={patient.patientId}
                                                className={
                                                    Number(selectedPatientId) === Number(patient.patientId)
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="manage-patient__patient-name"
                                                        onClick={() => this.handleSelectPatient(patient.patientId)}
                                                    >
                                                        {patient.patientName || "-"}
                                                    </button>
                                                    <small>{patient.email || "-"}</small>
                                                </td>
                                                <td>{patient.medicalCode || "-"}</td>
                                                <td>{patient.phoneNumber || "-"}</td>
                                                <td>{this.formatDate(patient.firstBookingCreatedAt)}</td>
                                                <td>{this.formatLatestVisit(patient)}</td>
                                                <td>{patient.bookingCount || 0}</td>
                                                <td>{patient.visitCount || 0}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="manage-patient__icon-button"
                                                        onClick={() => this.handleSelectPatient(patient.patientId)}
                                                        title={this.getText("detail")}
                                                        aria-label={this.getText("detail")}
                                                    >
                                                        <i className="fa-solid fa-circle-info"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="manage-patient__empty">
                                                {isLoading
                                                    ? `${this.getText("loading")}...`
                                                    : this.getText("noPatients")}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="manage-patient__footer">
                            <span>
                                {this.getText("page")} {pagination.page} {this.getText("of")} {totalPages}
                            </span>
                            {this.renderPagination()}
                        </div>
                    </section>
                    </div>
                )}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
    userInfo: state.doctor?.doctorInfo,
});

export default connect(mapStateToProps)(injectIntl(ManagePatient));
