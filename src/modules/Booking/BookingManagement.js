import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { toast } from "react-toastify";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import PagePagination from "../../components/Pagination/PagePagination";
import {
  getAdminBookingManagement,
  getAllBooking,
  getDoctorBookingManagement,
  getLookUp,
  updateAdminBookingStatus,
  updateClinicManagerBookingStatus,
  updateDoctorBookingStatus,
} from "../../services/userService";
import "./BookingManagement.scss";

const PAGE_SIZE = 10;
const TERMINAL_STATUSES = ["S3", "S4", "S5", "S6", "S7"];
const DOCTOR_ACTIONS = [
  {
    statusId: "S8",
    key: "accept",
    fallback: "Accept",
    icon: "bi-check-lg",
    className: "accept",
  },
  {
    statusId: "S6",
    key: "reject",
    fallback: "Reject",
    icon: "bi-x-lg",
    className: "reject",
  },
];

class BookingManagement extends Component {
  state = {
    bookings: [],
    statuses: [],
    loading: true,
    updatingId: null,
    errorMessage: "",
    search: "",
    statusFilter: "",
    currentPage: 1,
    pagination: null,
    selectedStatusByBooking: {},
    rejectBooking: null,
  };

  componentDidMount() {
    this.loadData();
  }

  getText = (key, defaultMessage) =>
    this.props.intl.formatMessage({
      id: `booking-management.${key}`,
      defaultMessage,
    });

  isAdmin = () => Boolean(this.props.adminMode || this.props.clinicManagerMode);

  isClinicManager = () => Boolean(this.props.clinicManagerMode);

  loadData = async (page = this.state.currentPage) => {
    this.setState({ loading: true, errorMessage: "" });
    const listBookings = this.isClinicManager()
      ? () => getAllBooking({
        page,
        limit: PAGE_SIZE,
        search: this.state.search.trim(),
        statusId: this.state.statusFilter,
      })
      : this.isAdmin()
        ? getAdminBookingManagement
        : getDoctorBookingManagement;
    try {
      const [bookingResponse, statusResponse] = await Promise.all([
        listBookings(),
        getLookUp("STATUS"),
      ]);
      if (bookingResponse?.errCode !== 0 || statusResponse?.errCode !== 0) {
        this.setState({
          loading: false,
          errorMessage:
            bookingResponse?.errMessage ||
            statusResponse?.errMessage ||
            this.getText("loadError", "Could not load bookings."),
        });
        return;
      }
      this.setState({
        bookings: bookingResponse.data || [],
        statuses: statusResponse.data || [],
        loading: false,
        currentPage: this.isClinicManager() ? Number(bookingResponse.pagination?.page) || page : page,
        pagination: this.isClinicManager() ? bookingResponse.pagination || null : null,
        selectedStatusByBooking: {},
      });
    } catch (error) {
      this.setState({
        loading: false,
        errorMessage: this.getText("loadError", "Could not load bookings."),
      });
    }
  };

  getStatusLabel = (statusId) => {
    const status = this.state.statuses.find((item) => item.keyMap === statusId);
    return this.props.intl.locale === "vi"
      ? status?.value_vi || statusId
      : status?.value_en || statusId;
  };

  formatDate = (value) =>
    value
      ? new Intl.DateTimeFormat(
        this.props.intl.locale === "vi" ? "vi-VN" : "en-GB",
      ).format(new Date(value))
      : "-";

  getAvailableStatuses = (booking) => {
    const allowed = this.isAdmin() && booking.allowedStatusIds === null
      ? this.state.statuses.map(({ keyMap }) => keyMap)
      : booking.allowedStatusIds || [];
    return this.state.statuses.filter(
      ({ keyMap }) => keyMap !== booking.statusId && allowed.includes(keyMap),
    );
  };

  getFilteredBookings = () => {
    if (this.isClinicManager()) return this.state.bookings;
    const search = this.state.search.trim().toLowerCase();
    return this.state.bookings.filter((booking) => {
      const searchable = [
        booking.id,
        booking.patientFirstName,
        booking.patientLastName,
        booking.patientPhoneNumber,
        booking.doctorFirstName,
        booking.doctorLastName,
      ]
        .join(" ")
        .toLowerCase();
      return (
        (!search || searchable.includes(search)) &&
        (!this.state.statusFilter ||
          booking.statusId === this.state.statusFilter)
      );
    });
  };

  getPageBookings = () => {
    if (this.isClinicManager()) return this.state.bookings;
    const start = (this.state.currentPage - 1) * PAGE_SIZE;
    return this.getFilteredBookings().slice(start, start + PAGE_SIZE);
  };

  handleFilterChange = (field, value) =>
    this.setState({ [field]: value, currentPage: 1 }, () => {
      if (this.isClinicManager()) this.loadData(1);
    });

  handleStatusSelect = (bookingId, statusId) =>
    this.setState((state) => ({
      selectedStatusByBooking: {
        ...state.selectedStatusByBooking,
        [bookingId]: statusId,
      },
    }));

  updateStatus = async (booking, requestedStatusId = "", skipConfirmation = false) => {
    const statusId =
      requestedStatusId || this.state.selectedStatusByBooking[booking.id];
    if (!statusId) return false;
    if (
      !skipConfirmation &&
      !window.confirm(this.getText("confirm", "Confirm booking status update?"))
    )
      return false;

    const updateBooking = this.isClinicManager()
      ? updateClinicManagerBookingStatus
      : this.isAdmin()
        ? updateAdminBookingStatus
        : updateDoctorBookingStatus;
    this.setState({ updatingId: booking.id, errorMessage: "" });
    try {
      const response = await updateBooking(booking.id, { statusId });
      if (response?.errCode !== 0) {
        this.setState({
          updatingId: null,
          errorMessage:
            response?.errMessage ||
            this.getText("updateError", "Could not update booking status."),
        });
        return false;
      }
      toast.success(this.getText("updateSuccess", "Booking status updated."));
      await this.loadData();
      this.setState({ updatingId: null });
      return true;
    } catch (error) {
      this.setState({
        updatingId: null,
        errorMessage: this.getText(
          "updateError",
          "Could not update booking status.",
        ),
      });
      return false;
    }
  };

  openRejectModal = (booking) => {
    if (this.state.updatingId) return;
    this.setState({ rejectBooking: booking, errorMessage: "" });
  };

  closeRejectModal = () => {
    if (this.state.updatingId) return;
    this.setState({ rejectBooking: null });
  };

  confirmReject = async () => {
    const { rejectBooking, updatingId } = this.state;
    if (!rejectBooking || updatingId) return;

    const updated = await this.updateStatus(rejectBooking, "S6", true);
    if (updated) this.setState({ rejectBooking: null });
  };

  renderSummary = () => {
    const items = [
      [
        "total",
        "Total bookings",
        this.state.bookings.length,
        "bi-calendar2-week",
      ],
      [
        "pending",
        "Pending",
        this.state.bookings.filter(({ statusId }) => statusId === "S1").length,
        "bi-hourglass-split",
      ],
      [
        "confirmed",
        "Confirmed",
        this.state.bookings.filter(({ statusId }) => ["S2", "S8"].includes(statusId)).length,
        "bi-check2-circle",
      ],
      [
        "finished",
        "Finished",
        this.state.bookings.filter(({ statusId }) =>
          TERMINAL_STATUSES.includes(statusId),
        ).length,
        "bi-archive",
      ],
    ];
    return (
      <div className="booking-management__summary">
        {items.map(([key, fallback, value, icon]) => (
          <div className="booking-management__summary-card" key={key}>
            <i className={`bi ${icon}`} aria-hidden="true" />
            <div>
              <span>{this.getText(key, fallback)}</span>
              <strong>{value}</strong>
            </div>
          </div>
        ))}
      </div>
    );
  };

  renderDoctorActions = (booking) => {
    const availableStatusIds = new Set(
      this.getAvailableStatuses(booking).map(({ keyMap }) => keyMap),
    );
    const actions = DOCTOR_ACTIONS.filter(({ statusId }) =>
      availableStatusIds.has(statusId),
    );

    if (!actions.length)
      return (
        <span className="booking-management__muted">
          {this.getText("noActions", "No actions")}
        </span>
      );

    const isUpdating = this.state.updatingId === booking.id;
    return (
      <div
        className="booking-management__doctor-actions"
        role="group"
        aria-label={this.getText("doctorActions", "Booking actions")}
        aria-busy={isUpdating}
      >
        {actions.map(({ statusId, key, fallback, icon, className }, index) => (
          <React.Fragment key={statusId}>
            {index > 0 && (
              <span
                className="booking-management__doctor-action-divider"
                aria-hidden="true"
              />
            )}
            <button
              type="button"
              className={`booking-management__doctor-action booking-management__doctor-action--${className}`}
              disabled={isUpdating}
              aria-label={this.getText(key, fallback)}
              onClick={() =>
                statusId === "S6"
                  ? this.openRejectModal(booking)
                  : this.updateStatus(booking, statusId)
              }
            >
              <i className={`bi ${icon}`} aria-hidden="true" />
              <span>
                {isUpdating
                  ? this.getText("updating", "Updating…")
                  : this.getText(key, fallback)}
              </span>
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  };

  renderActions = (booking) => {
    if (!this.isAdmin()) return this.renderDoctorActions(booking);

    const options = this.getAvailableStatuses(booking);
    if (!options.length)
      return (
        <span className="booking-management__muted">
          {this.getText("noActions", "No actions")}
        </span>
      );
    const selectedStatus = this.state.selectedStatusByBooking[booking.id] || "";
    return (
      <div className="booking-management__actions">
        <select
          value={selectedStatus}
          aria-label={this.getText("chooseStatus", "Choose a new status")}
          name={`bookingStatus-${booking.id}`}
          autoComplete="off"
          onChange={(event) =>
            this.handleStatusSelect(booking.id, event.target.value)
          }
        >
          <option value="">
            {this.getText("chooseStatus", "Choose status")}
          </option>
          {options.map(({ keyMap }) => (
            <option value={keyMap} key={keyMap}>
              {this.getStatusLabel(keyMap)}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!selectedStatus || this.state.updatingId === booking.id}
          onClick={() => this.updateStatus(booking)}
        >
          {this.state.updatingId === booking.id
            ? this.getText("updating", "Updating…")
            : this.getText("update", "Update")}
        </button>
      </div>
    );
  };

  render() {
    const {
      bookings,
      statuses,
      loading,
      errorMessage,
      updatingId,
      rejectBooking,
      search,
      statusFilter,
      currentPage,
    } = this.state;
    const filteredBookings = this.getFilteredBookings();
    const totalPages = this.isClinicManager()
      ? Math.max(1, Math.ceil((this.state.pagination?.total || 0) / PAGE_SIZE))
      : Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
    const title = this.isAdmin()
      ? this.getText("adminTitle", "Booking management")
      : this.getText("doctorTitle", "My bookings");

    return (
      <div
        className={`booking-management${
          this.isAdmin() ? "" : " booking-management--doctor"
        }`}
      >
        <div className="booking-management__inner">
          <div className="booking-management__header">
            <div>
              <span className="booking-management__eyebrow">
                {this.getText("eyebrow", "Appointment operations")}
              </span>
              <h1>{title}</h1>
              <p>
                {this.getText(
                  "subtitle",
                  "Track and update appointment status from one place.",
                )}
              </p>
            </div>
            <button
              className="booking-management__refresh"
              type="button"
              onClick={this.loadData}
            >
              <i className="bi bi-arrow-clockwise" aria-hidden="true" />{" "}
              {this.getText("refresh", "Refresh")}
            </button>
          </div>
          {this.renderSummary()}
          <section
            className="booking-management__toolbar"
            aria-label={this.getText("filters", "Booking filters")}
          >
            <label>
              <span>{this.getText("search", "Search")}</span>
              <div className="booking-management__search">
                <i className="bi bi-search" aria-hidden="true" />
                <input
                  name="bookingSearch"
                  autoComplete="off"
                  value={search}
                  onChange={(event) =>
                    this.handleFilterChange("search", event.target.value)
                  }
                  placeholder={this.getText(
                    "searchPlaceholder",
                    "Booking ID, patient, doctor or phone",
                  )}
                />
              </div>
            </label>
            <label>
              <span>{this.getText("filterStatus", "Status")}</span>
              <select
                name="bookingStatusFilter"
                value={statusFilter}
                onChange={(event) =>
                  this.handleFilterChange("statusFilter", event.target.value)
                }
              >
                <option value="">
                  {this.getText("allStatuses", "All statuses")}
                </option>
                {statuses.map(({ keyMap }) => (
                  <option value={keyMap} key={keyMap}>
                    {this.getStatusLabel(keyMap)}
                  </option>
                ))}
              </select>
            </label>
          </section>
          {errorMessage && (
            <div className="booking-management__alert" role="alert">
              {errorMessage}
            </div>
          )}
          <section className="booking-management__table-card">
            {loading ? (
              <div className="booking-management__state">
                {this.getText("loading", "Loading bookings...")}
              </div>
            ) : (
              <div className="booking-management__table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{this.getText("booking", "Booking")}</th>
                      <th>{this.getText("patient", "Patient")}</th>
                      <th>{this.getText("doctor", "Doctor")}</th>
                      <th>{this.getText("schedule", "Schedule")}</th>
                      <th>{this.getText("status", "Status")}</th>
                      {this.isAdmin() && (
                        <th>{this.getText("note", "Note")}</th>
                      )}
                      <th>
                        {this.getText(
                          this.isAdmin() ? "actions" : "doctorActions",
                          this.isAdmin() ? "Update" : "Actions",
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.getPageBookings().map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <strong>#{booking.id}</strong>
                          <small>
                            {booking.appointmentTypeVi ||
                              booking.appointmentTypeEn ||
                              "-"}
                          </small>
                        </td>
                        <td>
                          <strong>
                            {`${booking.patientFirstName || ""} ${booking.patientLastName || ""}`.trim() ||
                              "-"}
                          </strong>
                          <small>
                            {booking.patientPhoneNumber ||
                              booking.patientEmail ||
                              "-"}
                          </small>
                        </td>
                        <td>
                          {`${booking.doctorFirstName || ""} ${booking.doctorLastName || ""}`.trim() ||
                            "-"}
                        </td>
                        <td>
                          <strong>{this.formatDate(booking.date)}</strong>
                          <small>
                            {booking.timeVi || booking.timeEn || "-"}
                          </small>
                        </td>
                        <td>
                          <span
                            className={`booking-management__status ${booking.statusId}`}
                          >
                            {this.getStatusLabel(booking.statusId)}
                          </span>
                        </td>
                        {this.isAdmin() && (
                          <td className="booking-management__note">
                            {booking.reason || "-"}
                          </td>
                        )}
                        <td>{this.renderActions(booking)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filteredBookings.length && (
                  <div className="booking-management__state">
                    {bookings.length
                      ? this.getText("noResults", "No matching bookings.")
                      : this.getText("empty", "No bookings found.")}
                  </div>
                )}
              </div>
            )}
          </section>
          {!loading && filteredBookings.length > 0 && (
            <footer className="booking-management__footer">
              <span>
                {this.getText("page", "Page")} {Math.min(currentPage, totalPages)}{" "}
                {this.getText("of", "of")} {totalPages}
              </span>
              <PagePagination
                page={Math.min(currentPage, totalPages)}
                totalPages={totalPages}
                onChange={(page) => this.isClinicManager() ? this.loadData(page) : this.setState({ currentPage: page })}
                className="booking-management__pagination"
                previousLabel={this.getText("previous", "Previous")}
                nextLabel={this.getText("next", "Next")}
              />
            </footer>
          )}
        </div>
        <Modal
          isOpen={Boolean(rejectBooking)}
          toggle={this.closeRejectModal}
          centered
          className="booking-management-reject-modal"
        >
          <ModalHeader toggle={this.closeRejectModal}>
            {this.getText("rejectTitle", "Reject appointment?")}
          </ModalHeader>
          <ModalBody>
            <p className="booking-management-reject-modal__description">
              {this.getText(
                "rejectDescription",
                "Are you sure you want to reject this appointment? This action cannot be undone.",
              )}
            </p>
            {errorMessage && (
              <div
                className="booking-management-reject-modal__error"
                role="alert"
              >
                {errorMessage}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              className="booking-management-reject-modal__cancel"
              onClick={this.closeRejectModal}
              disabled={Boolean(updatingId)}
            >
              {this.getText("rejectCancel", "Cancel")}
            </Button>
            <Button
              type="button"
              className="booking-management-reject-modal__reject"
              onClick={this.confirmReject}
              disabled={Boolean(updatingId)}
            >
              {updatingId
                ? this.getText("rejecting", "Rejecting…")
                : this.getText("reject", "Reject")}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default injectIntl(BookingManagement);
