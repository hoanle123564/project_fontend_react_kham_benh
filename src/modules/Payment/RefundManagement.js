import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { toast } from "react-toastify";
import { confirmAdminRefund, getAdminRefunds } from "../../services/userService";

class RefundManagement extends Component {
  state = { refunds: [], loading: true, confirmingId: null };

  componentDidMount() { this.load(); }
  text = (key, fallback) => this.props.intl.formatMessage({ id: `refund-management.${key}`, defaultMessage: fallback });
  load = async () => {
    this.setState({ loading: true });
    try {
      const response = await getAdminRefunds();
      if (response?.errCode !== 0) throw new Error(response?.errMessage);
      this.setState({ refunds: response.data || [], loading: false });
    } catch (error) { this.setState({ loading: false }); toast.error(error.message || this.text("loadError", "Unable to load refunds.")); }
  };
  confirm = async (refund) => {
    const refundTransactionId = window.prompt(this.text("referencePrompt", "Refund bank transaction reference"));
    if (!refundTransactionId?.trim()) return;
    this.setState({ confirmingId: refund.id });
    try {
      const response = await confirmAdminRefund(refund.id, refundTransactionId.trim());
      if (response?.errCode !== 0) throw new Error(response?.errMessage);
      toast.success(this.text("confirmed", "Refund confirmed."));
      await this.load();
    } catch (error) { toast.error(error.message || this.text("confirmError", "Unable to confirm refund.")); this.setState({ confirmingId: null }); }
  };
  render() {
    const { refunds, loading, confirmingId } = this.state;
    return <div className="booking-management">
      <h2>{this.text("title", "Manual refunds")}</h2>
      {loading ? <p>{this.text("loading", "Loading refunds...")}</p> : <div className="table-responsive"><table className="table">
        <thead><tr><th>{this.text("patient", "Patient")}</th><th>{this.text("amount", "Amount")}</th><th>{this.text("account", "Refund account")}</th><th>{this.text("reason", "Reason")}</th><th>{this.text("status", "Status")}</th><th>{this.text("action", "Action")}</th></tr></thead>
        <tbody>{refunds.map((refund) => <tr key={refund.id}><td>{[refund.firstName, refund.lastName].filter(Boolean).join(" ")}</td><td>{Number(refund.amount).toLocaleString("vi-VN")} VND</td><td>{refund.receiverBank && refund.receiverAccountNumber ? `${refund.receiverBank} - ${refund.receiverAccountNumber}` : this.text("accountMissing", "Patient account is incomplete")}</td><td>{refund.reason || "-"}</td><td>{refund.statusId}</td><td>{refund.statusId === "RFS1" && <button type="button" className="btn btn-primary btn-sm" disabled={confirmingId === refund.id} onClick={() => this.confirm(refund)}>{this.text("confirm", "Confirm refunded")}</button>}</td></tr>)}</tbody>
      </table></div>}
    </div>;
  }
}

export default injectIntl(RefundManagement);
