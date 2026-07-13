import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { toast } from "react-toastify";
import PagePagination from "../../components/Pagination/PagePagination";
import {
  getAdminBookingManagement,
  getDoctorBookingManagement,
  getLookUp,
  updateAdminBookingStatus,
  updateDoctorBookingStatus,
} from "../../services/userService";
import "./BookingManagement.scss";

const PAGE_SIZE = 10;
const TERMINAL_STATUSES = ["S3", "S4", "S5", "S6", "S7"];

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
    selectedStatusByBooking: {},
  };

  componentDidMount() {
    this.loadData();
  }

  getText = (key, defaultMessage) =>
    this.props.intl.formatMessage({
      id: `booking-management.${key}`,
      defaultMessage,
    });

  isAdmin = () => Boolean(this.props.adminMode);

  loadData = async () => {
    this.setState({ loading: true, errorMessage: "" });
    const listBookings = this.isAdmin()
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
    const start = (this.state.currentPage - 1) * PAGE_SIZE;
    return this.getFilteredBookings().slice(start, start + PAGE_SIZE);
  };

  handleFilterChange = (field, value) =>
    this.setState({ [field]: value, currentPage: 1 });

  handleStatusSelect = (bookingId, statusId) =>
    this.setState((state) => ({
      selectedStatusByBooking: {
        ...state.selectedStatusByBooking,
        [bookingId]: statusId,
      },
    }));

  getReasonPrompt = (statusId) => {
    if (statusId === "S6")
      return this.getText("rejectReason", "Reason for rejection (optional):");
    if (statusId === "S7")
      return this.getText("noShowNote", "No-show note (optional):");
    if (["S4", "S5"].includes(statusId))
      return this.getText("cancelReason", "Cancellation reason (optional):");
    return null;
  };

  updateStatus = async (booking) => {
    const statusId = this.state.selectedStatusByBooking[booking.id];
    if (!statusId) return;
    const prompt = this.getReasonPrompt(statusId);
    const note = prompt ? window.prompt(prompt) : null;
    if (prompt && note === null) return;
    if (
      !window.confirm(this.getText("confirm", "Confirm booking status update?"))
    )
      return;

    const updateBooking = this.isAdmin()
      ? updateAdminBookingStatus
      : updateDoctorBookingStatus;
    this.setState({ updatingId: booking.id, errorMessage: "" });
    try {
      const response = await updateBooking(booking.id, { statusId, note });
      if (response?.errCode !== 0) {
        this.setState({
          updatingId: null,
          errorMessage:
            response?.errMessage ||
            this.getText("updateError", "Could not update booking status."),
        });
        return;
      }
      toast.success(this.getText("updateSuccess", "Booking status updated."));
      await this.loadData();
    } catch (error) {
      this.setState({
        updatingId: null,
        errorMessage: this.getText(
          "updateError",
          "Could not update booking status.",
        ),
      });
    }
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

  renderActions = (booking) => {
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
      search,
      statusFilter,
      currentPage,
    } = this.state;
    const filteredBookings = this.getFilteredBookings();
    const totalPages = Math.max(
      1,
      Math.ceil(filteredBookings.length / PAGE_SIZE),
    );
    const title = this.isAdmin()
      ? this.getText("adminTitle", "Booking management")
      : this.getText("doctorTitle", "My bookings");

    return (
      <div className="booking-management">
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
                      <th>{this.getText("note", "Note")}</th>
                      <th>{this.getText("actions", "Actions")}</th>
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
                        <td className="booking-management__note">
                          {booking.rejectReason ||
                            booking.cancelReason ||
                            booking.noShowNote ||
                            booking.reason ||
                            "-"}
                        </td>
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
                onChange={(page) => this.setState({ currentPage: page })}
                className="booking-management__pagination"
                previousLabel={this.getText("previous", "Previous")}
                nextLabel={this.getText("next", "Next")}
              />
            </footer>
          )}
        </div>
      </div>
    );
  }
}

export default injectIntl(BookingManagement);
