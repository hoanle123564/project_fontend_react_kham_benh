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

class RefundManagement extends Component {
  state = { refunds: [], loading: true, actionId: null };

  componentDidMount() { this.load(); }

  text = (key, fallback, values) => this.props.intl.formatMessage({ id: `refund-management.${key}`, defaultMessage: fallback }, values);

  isClinicManager = () => Boolean(this.props.clinicManagerMode);

  getErrorMessage = (error, fallback) => error?.response?.data?.errMessage || error?.message || fallback;

  load = async () => {
    this.setState({ loading: true });
    try {
      const response = await (this.isClinicManager() ? getClinicManagerRefunds() : getAdminRefunds());
      if (response?.errCode !== 0) throw new Error(response?.errMessage);
      this.setState({ refunds: response.data || [], loading: false });
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

  getStatusLabel = (statusId) => {
    const key = { RFS1: "pending", RFS2: "processing", RFS3: "completed", RFS4: "failed", RFS5: "approved", RFS6: "rejected" }[statusId];
    return key ? this.text(`status.${key}`, key) : this.text("status.unknown", "Unknown");
  };

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

  formatAmount = (amount) => `${Number(amount || 0).toLocaleString("vi-VN")} VND`;

  formatDate = (value) => value ? new Date(value).toLocaleString() : "-";

  renderAction = (refund) => {
    const busy = this.state.actionId === refund.id;
    if (refund.refundMode === "PAYOS") {
      if (refund.statusId === "RFS1") return <>
        <button type="button" className="btn btn-primary btn-sm mr-1" disabled={busy} onClick={() => this.approve(refund)}>{this.text("approve", "Approve")}</button>
        <button type="button" className="btn btn-outline-danger btn-sm" disabled={busy} onClick={() => this.reject(refund)}>{this.text("reject", "Reject")}</button>
      </>;
      if (["RFS5", "RFS2"].includes(refund.statusId)) return <button type="button" className="btn btn-outline-primary btn-sm" disabled={busy} onClick={() => this.sync(refund)}>{this.text("sync", "Sync")}</button>;
      return null;
    }
    if (!this.isClinicManager() && refund.statusId === "RFS1") return <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => this.confirmManual(refund)}>{this.text("confirm", "Confirm refunded")}</button>;
    return null;
  };

  render() {
    const { refunds, loading } = this.state;
    return <div className="booking-management">
      <h2>{this.text("title", "Refund management")}</h2>
      {loading ? <p>{this.text("loading", "Loading refunds...")}</p> : <div className="table-responsive"><table className="table">
        <thead><tr>
          <th>{this.text("patient", "Patient")}</th>
          <th>{this.text("amount", "Amount")}</th>
          <th>{this.text("account", "Refund account")}</th>
          <th>{this.text("reference", "Reference")}</th>
          <th>{this.text("mode", "Mode")}</th>
          <th>{this.text("statusLabel", "Status")}</th>
          <th>{this.text("providerState", "Provider state")}</th>
          <th>{this.text("reason", "Reason")}</th>
          <th>{this.text("timestamps", "Timestamps")}</th>
          <th>{this.text("action", "Action")}</th>
        </tr></thead>
        <tbody>{refunds.map((refund) => <tr key={refund.id}>
          <td>{[refund.firstName, refund.lastName].filter(Boolean).join(" ") || refund.email}</td>
          <td>{this.formatAmount(refund.amount)}</td>
          <td>{[refund.receiverBank, refund.receiverBankBin, refund.receiverAccountNumber, refund.receiverAccountName].filter(Boolean).join(" - ") || this.text("accountMissing", "Patient account is incomplete")}</td>
          <td>{refund.referenceId || "-"}</td>
          <td>{refund.refundMode || "MANUAL"}</td>
          <td>{this.getStatusLabel(refund.statusId)}</td>
          <td>{this.getProviderStateLabel(refund.payosProviderState)}</td>
          <td>{refund.rejectionReason || refund.failureReason || refund.reason || "-"}</td>
          <td>{this.formatDate(refund.approvedAt || refund.rejectedAt || refund.processingAt || refund.refundedAt || refund.failedAt || refund.requestedAt)}</td>
          <td>{this.renderAction(refund)}</td>
        </tr>)}</tbody>
      </table></div>}
    </div>;
  }
}

export default injectIntl(RefundManagement);
