import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { toast } from "react-toastify";
import {
  approveAdminRefund,
  approveClinicManagerRefund,
  confirmAdminRefund,
  getAdminRefunds,
  getClinicManagerRefunds,
  rejectAdminRefund,
  rejectClinicManagerRefund,
  syncAdminRefund,
  syncClinicManagerRefund,
} from "../../services/userService";
import PagePagination from "../../components/Pagination/PagePagination";
import "./RefundManagement.scss";
import {
  EMPTY_PROVIDER_STATE,
  filterRefunds,
  getRefundAccountLines,
  getRefundPatientName,
  getRefundProviderStates,
  getRefundSummary,
} from "./refundDisplayUtils";

const PAGE_SIZE = 10;

class RefundManagement extends Component {
  state = {
    refunds: [],
    loading: true,
    actionId: null,
    search: "",
    providerState: "",
    requestedDate: "",
    dateFrom: "",
    dateTo: "",
    currentPage: 1,
  };

  componentDidMount() { this.load(); }

  text = (key, fallback, values) => this.props.intl.formatMessage({ id: `refund-management.${key}`, defaultMessage: fallback }, values);

  isClinicManager = () => Boolean(this.props.clinicManagerMode);

  getErrorMessage = (error, fallback) => error?.response?.data?.errMessage || error?.message || fallback;

  load = async () => {
    this.setState({ loading: true });
    try {
      const response = await (this.isClinicManager() ? getClinicManagerRefunds() : getAdminRefunds());
      if (response?.errCode !== 0) throw new Error(response?.errMessage);
      this.setState({
        refunds: Array.isArray(response.data) ? response.data : [],
        loading: false,
      });
    } catch (error) {
      this.setState({ loading: false });
      toast.error(this.getErrorMessage(error, this.text("loadError", "Unable to load refunds.")));
    }
  };

  runAction = async (refund, request, successKey, fallback) => {
    if (this.state.actionId) return;
    this.setState({ actionId: refund.id });
    try {
      const response = await request(refund.id);
      if (response?.errCode !== 0) throw new Error(response?.errMessage);
      const providerPending = ["RFS5", "RFS2"].includes(response?.data?.statusId) && response?.data?.payosProviderState;
      const notify = providerPending ? toast.warn : toast.success;
      notify(response?.errMessage || this.text(successKey, fallback));
      await this.load();
      this.setState({ actionId: null });
    } catch (error) {
      toast.error(this.getErrorMessage(error, fallback));
      this.setState({ actionId: null });
    }
  };

  confirmManual = async (refund) => {
    const transactionId = window.prompt(this.text("referencePrompt", "Enter the refund bank transaction reference"));
    if (!transactionId?.trim()) return;
    await this.runAction(refund, (refundId) => confirmAdminRefund(refundId, transactionId.trim()), "confirmed", "Unable to confirm refund.");
  };

  approve = (refund) => this.runAction(
    refund,
    this.isClinicManager() ? approveClinicManagerRefund : approveAdminRefund,
    "approved",
    "Unable to approve refund.",
  );

  reject = (refund) => {
    const reason = window.prompt(this.text("rejectionPrompt", "Enter the rejection reason"));
    if (!reason?.trim()) return;
    return this.runAction(
      refund,
      (refundId) => (this.isClinicManager() ? rejectClinicManagerRefund : rejectAdminRefund)(refundId, reason.trim()),
      "rejected",
      "Unable to reject refund.",
    );
  };

  sync = (refund) => this.runAction(
    refund,
    this.isClinicManager() ? syncClinicManagerRefund : syncAdminRefund,
    "synced",
    "Unable to synchronize refund.",
  );

  getProviderStateLabel = (state) => {
    const key = {
      PROCESSING: "processing",
      SUCCEEDED: "succeeded",
      FAILED: "failed",
      REJECTED: "rejected",
      CANCELLED: "cancelled",
      DECLINED: "declined",
      HTTP_403_IP_NOT_ALLOWED: "http403Ip",
      HTTP_401: "http401",
      HTTP_403: "http403",
      HTTP_5XX: "http5xx",
      HTTP_TIMEOUT: "timeout",
      HTTP_NETWORK_ERROR: "networkError",
    }[state];
    if (key) return this.text(`provider.${key}`, state);
    if (state?.startsWith("HTTP_")) return this.text("provider.httpError", "PayOS request requires attention");
    return state || "-";
  };

  formatAmount = (amount) => {
    const locale = this.props.intl.locale === "vi" ? "vi-VN" : "en-US";
    return `${new Intl.NumberFormat(locale).format(Number(amount || 0))} VND`;
  };

  formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    const locale = this.props.intl.locale === "vi" ? "vi-VN" : "en-GB";
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  getFilteredRefunds = () => filterRefunds(this.state.refunds, this.state);

  getTotalPages = (refunds) => Math.max(1, Math.ceil(refunds.length / PAGE_SIZE));

  getPageRefunds = (filteredRefunds, totalPages) => {
    const page = Math.min(this.state.currentPage, totalPages);
    const start = (page - 1) * PAGE_SIZE;
    return filteredRefunds.slice(start, start + PAGE_SIZE);
  };

  handleFilterChange = (field, value) => {
    const nextState = { [field]: value, currentPage: 1 };
    if (field === "requestedDate") {
      nextState.dateFrom = "";
      nextState.dateTo = "";
    }
    if (field === "dateFrom" || field === "dateTo") nextState.requestedDate = "";
    this.setState(nextState);
  };

  renderSummary = () => {
    const summary = getRefundSummary(this.state.refunds);
    const items = [
      ["total", "Total refunds", summary.total, "bi-receipt"],
      ["completed", "Completed", summary.completed, "bi-check2-circle"],
      ["rejected", "Rejected", summary.rejected, "bi-x-circle"],
    ];

    return (
      <div className="refund-management__summary">
        {items.map(([key, fallback, value, icon]) => (
          <div className="refund-management__summary-card" key={key}>
            <i className={`bi ${icon}`} aria-hidden="true" />
            <div>
              <span>{this.text(key, fallback)}</span>
              <strong>{value}</strong>
            </div>
          </div>
        ))}
      </div>
    );
  };

  renderIconAction = (refund, { actionKey, fallback, icon, variant, onClick }) => {
    const busy = this.state.actionId === refund.id;
    const label = this.text(actionKey, fallback);
    const busyLabel = this.text("updating", "Updating…");
    return (
      <button
        type="button"
        className={`refund-management__icon-button refund-management__icon-button--${variant}${busy ? " is-busy" : ""}`}
        disabled={busy}
        aria-label={busy ? busyLabel : label}
        aria-busy={busy}
        title={label}
        onClick={onClick}
      >
        <i className={`bi ${busy ? "bi-arrow-repeat refund-management__icon-button-icon--busy" : icon}`} aria-hidden="true" />
        <span className="visually-hidden">{busy ? busyLabel : label}</span>
      </button>
    );
  };

  renderAction = (refund) => {
    const actionLabel = this.text("action", "Action");
    if (refund.refundMode === "PAYOS") {
      if (refund.statusId === "RFS1") {
        return (
          <div className="refund-management__actions" role="group" aria-label={actionLabel}>
            {this.renderIconAction(refund, {
              actionKey: "approve",
              fallback: "Approve",
              icon: "bi-check-lg",
              variant: "approve",
              onClick: () => this.approve(refund),
            })}
            {this.renderIconAction(refund, {
              actionKey: "reject",
              fallback: "Reject",
              icon: "bi-x-lg",
              variant: "reject",
              onClick: () => this.reject(refund),
            })}
          </div>
        );
      }
      if (["RFS5", "RFS2"].includes(refund.statusId)) {
        return (
          <div className="refund-management__actions" role="group" aria-label={actionLabel}>
            {this.renderIconAction(refund, {
              actionKey: "sync",
              fallback: "Sync",
              icon: "bi-arrow-repeat",
              variant: "sync",
              onClick: () => this.sync(refund),
            })}
          </div>
        );
      }
      return null;
    }
    if (!this.isClinicManager() && refund.statusId === "RFS1") {
      return (
        <div className="refund-management__actions" role="group" aria-label={actionLabel}>
          {this.renderIconAction(refund, {
            actionKey: "confirm",
            fallback: "Confirm refunded",
            icon: "bi-check2-circle",
            variant: "confirm",
            onClick: () => this.confirmManual(refund),
          })}
        </div>
      );
    }
    return null;
  };

  render() {
    const {
      refunds,
      loading,
      search,
      providerState,
      requestedDate,
      dateFrom,
      dateTo,
      currentPage,
    } = this.state;
    const filteredRefunds = this.getFilteredRefunds();
    const totalPages = this.getTotalPages(filteredRefunds);
    const page = Math.min(currentPage, totalPages);
    const pageRefunds = this.getPageRefunds(filteredRefunds, totalPages);

    return (
      <div className="refund-management">
        <div className="refund-management__inner">
          <div className="refund-management__header">
            <div>
              <span className="refund-management__eyebrow">
                {this.text("eyebrow", "Refund operations")}
              </span>
              <h1>{this.text("title", "Refund management")}</h1>
              <p>{this.text("subtitle", "Review and track refund requests from one place.")}</p>
            </div>
            <button
              className="refund-management__refresh"
              type="button"
              disabled={loading}
              aria-busy={loading}
              onClick={this.load}
            >
              <i className="bi bi-arrow-clockwise" aria-hidden="true" />
              {this.text("refresh", "Refresh")}
            </button>
          </div>

          {this.renderSummary()}

          <section
            className="refund-management__toolbar"
            aria-label={this.text("filters", "Refund filters")}
          >
            <label>
              <span>{this.text("search", "Search")}</span>
              <div className="refund-management__search">
                <i className="bi bi-search" aria-hidden="true" />
                <input
                  name="refundPatientSearch"
                  autoComplete="off"
                  value={search}
                  onChange={(event) => this.handleFilterChange("search", event.target.value)}
                  placeholder={this.text("searchPlaceholder", "Patient name…")}
                />
              </div>
            </label>
            <label>
              <span>{this.text("filterProviderState", "Provider state")}</span>
              <select
                name="refundProviderState"
                value={providerState}
                onChange={(event) => this.handleFilterChange("providerState", event.target.value)}
              >
                <option value="">{this.text("allProviderStates", "All provider states")}</option>
                <option value={EMPTY_PROVIDER_STATE}>{this.text("missingProviderState", "No provider state")}</option>
                {getRefundProviderStates(refunds).map((state) => (
                  <option value={state} key={state}>{this.getProviderStateLabel(state)}</option>
                ))}
              </select>
            </label>
            <label>
              <span>{this.text("requestedDate", "Requested date")}</span>
              <input
                type="date"
                name="refundRequestedDate"
                autoComplete="off"
                value={requestedDate}
                onChange={(event) => this.handleFilterChange("requestedDate", event.target.value)}
              />
            </label>
            <label>
              <span>{this.text("dateFrom", "From date")}</span>
              <input
                type="date"
                name="refundDateFrom"
                autoComplete="off"
                value={dateFrom}
                onChange={(event) => this.handleFilterChange("dateFrom", event.target.value)}
              />
            </label>
            <label>
              <span>{this.text("dateTo", "To date")}</span>
              <input
                type="date"
                name="refundDateTo"
                autoComplete="off"
                value={dateTo}
                onChange={(event) => this.handleFilterChange("dateTo", event.target.value)}
              />
            </label>
          </section>

          <section className="refund-management__table-card">
            {loading ? (
              <div className="refund-management__state" role="status" aria-live="polite">
                {this.text("loading", "Loading refunds…")}
              </div>
            ) : (
              <div className="refund-management__table-wrap">
                <table className="table refund-management__table">
                  <colgroup>
                    <col className="refund-management__col--patient" />
                    <col className="refund-management__col--amount" />
                    <col className="refund-management__col--account" />
                    <col className="refund-management__col--provider" />
                    <col className="refund-management__col--reason" />
                    <col className="refund-management__col--timestamp" />
                    <col className="refund-management__col--action" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>{this.text("patient", "Patient")}</th>
                      <th className="refund-management__amount">{this.text("amount", "Amount")}</th>
                      <th>{this.text("account", "Refund account")}</th>
                      <th>{this.text("providerState", "Provider state")}</th>
                      <th>{this.text("reason", "Reason")}</th>
                      <th>{this.text("timestamps", "Timestamp")}</th>
                      <th className="refund-management__action-heading">{this.text("action", "Action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRefunds.map((refund) => {
                      const patientName = getRefundPatientName(refund);
                      const patient = patientName || refund.email || "-";
                      const account = getRefundAccountLines(refund, this.text("accountMissing", "Patient account is incomplete"));
                      const providerStateLabel = this.getProviderStateLabel(refund.payosProviderState);
                      const reason = refund.rejectionReason || refund.failureReason || refund.reason || "-";
                      const timestamp = this.formatDate(refund.approvedAt || refund.rejectedAt || refund.processingAt || refund.refundedAt || refund.failedAt || refund.requestedAt);
                      return (
                        <tr key={refund.id}>
                          <td><span className="refund-management__ellipsis" title={patient}>{patient}</span></td>
                          <td className="refund-management__amount"><span className="refund-management__nowrap">{this.formatAmount(refund.amount)}</span></td>
                          <td className="refund-management__account">
                            <span className="refund-management__ellipsis" title={account.bankAccount}>{account.bankAccount}</span>
                            <span className="refund-management__ellipsis" title={account.holder}>{account.holder}</span>
                          </td>
                          <td><span className="refund-management__ellipsis" title={providerStateLabel}>{providerStateLabel}</span></td>
                          <td><span className="refund-management__ellipsis" title={reason}>{reason}</span></td>
                          <td><span className="refund-management__ellipsis" title={timestamp}>{timestamp}</span></td>
                          <td className="refund-management__action-cell">{this.renderAction(refund)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {!filteredRefunds.length && (
                  <div className="refund-management__state" role="status" aria-live="polite">
                    {refunds.length
                      ? this.text("noResults", "No matching refunds.")
                      : this.text("empty", "No refunds found.")}
                  </div>
                )}
              </div>
            )}
          </section>

          {!loading && filteredRefunds.length > 0 && (
            <footer className="refund-management__footer">
              <span>
                {this.text("page", "Page")} {page} {this.text("of", "of")} {totalPages}
              </span>
              <PagePagination
                page={page}
                totalPages={totalPages}
                onChange={(nextPage) => this.setState({ currentPage: nextPage })}
                className="refund-management__pagination"
                previousLabel={this.text("previous", "Previous")}
                nextLabel={this.text("next", "Next")}
              />
            </footer>
          )}
        </div>
      </div>
    );
  }
}

export default injectIntl(RefundManagement);
