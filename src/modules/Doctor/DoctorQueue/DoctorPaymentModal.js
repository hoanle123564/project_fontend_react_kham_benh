import React, { Component } from "react";

class DetailRow extends Component {
    render() {
        const { label, value } = this.props;

        return (
            <div className="doctor-queue__detail-row">
                <span>{label}</span>
                <strong>{value || "-"}</strong>
            </div>
        );
    }
}

class DoctorPaymentModal extends Component {
    getPatientName = () => {
        const { paymentTarget, getPatientName } = this.props;

        return paymentTarget?.patientFirstName || paymentTarget?.patientLastName
            ? `${paymentTarget.patientFirstName || ""} ${paymentTarget.patientLastName || ""}`
                  .replace(/\s+/g, " ")
                  .trim()
            : getPatientName(paymentTarget || {});
    };

    render() {
        const {
            paymentModalOpen,
            paymentTarget,
            paymentSummary,
            paymentMethodId,
            amountReceived,
            isPaymentLoading,
            isCollectingPayment,
            getText,
            getFallbackPaymentStatus,
            formatMoney,
            onClose,
            onCollect,
            onPaymentMethodChange,
            onAmountReceivedChange,
        } = this.props;

        if (!paymentModalOpen) return null;

        const amountDue = Number(paymentSummary?.amountDue || paymentTarget?.priceAtBooking || 0);
        const received = Number(amountReceived || 0);
        const changeDue = received > amountDue ? received - amountDue : 0;
        const isPaid = paymentSummary?.paymentStatusId === "PS2";
        const patientName = this.getPatientName();

        return (
            <div className="doctor-queue__modal-backdrop" role="presentation">
                <form className="doctor-queue__payment-modal" onSubmit={onCollect}>
                    <div className="doctor-queue__modal-header">
                        <div>
                            <span>#{paymentTarget?.queueNumber || "-"}</span>
                            <h3>{getText("paymentModalTitle")}</h3>
                            <p>{patientName || "-"}</p>
                        </div>
                        <button
                            type="button"
                            className="doctor-queue__modal-close"
                            disabled={isCollectingPayment}
                            title={getText("cancel")}
                            onClick={onClose}
                        >
                            <i className="bi bi-x-lg" />
                        </button>
                    </div>

                    {isPaymentLoading ? (
                        <div className="doctor-queue__modal-loading">{getText("loading")}...</div>
                    ) : (
                        <>
                            <div className="doctor-queue__payment-summary">
                                <DetailRow label={getText("amountDue")} value={formatMoney(amountDue)} />
                                <DetailRow
                                    label={getText("paymentStatus")}
                                    value={getFallbackPaymentStatus(paymentSummary?.paymentStatusId)}
                                />
                            </div>

                            <label className="doctor-queue__modal-field">
                                <span>{getText("paymentMethod")}</span>
                                <select
                                    value={paymentMethodId}
                                    disabled={isPaid || isCollectingPayment}
                                    onChange={(event) => onPaymentMethodChange(event.target.value)}
                                >
                                    <option value="PAY1">{getText("cash")}</option>
                                    <option value="PAY2">{getText("transfer")}</option>
                                    <option value="PAY3">{getText("card")}</option>
                                </select>
                            </label>

                            <label className="doctor-queue__modal-field">
                                <span>{getText("amountReceived")}</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={amountReceived}
                                    disabled={isPaid || isCollectingPayment}
                                    onChange={(event) => onAmountReceivedChange(event.target.value)}
                                />
                            </label>

                            <div className="doctor-queue__change-line">
                                <span>{getText("changeDue")}</span>
                                <strong>{formatMoney(changeDue)}</strong>
                            </div>

                            <div className="doctor-queue__modal-actions">
                                <button
                                    type="button"
                                    className="secondary"
                                    disabled={isCollectingPayment}
                                    onClick={onClose}
                                >
                                    {getText("cancel")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        isPaid ||
                                        isCollectingPayment ||
                                        !Number.isFinite(received) ||
                                        received < amountDue
                                    }
                                >
                                    <i className="bi bi-check2-circle" />
                                    {isCollectingPayment
                                        ? `${getText("loading")}...`
                                        : getText("confirmPayment")}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        );
    }
}

export default DoctorPaymentModal;
