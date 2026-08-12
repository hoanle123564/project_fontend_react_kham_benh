export const getRefundAccountLines = (refund = {}, fallback = "-") => ({
    bankAccount: [refund.receiverBank, refund.receiverAccountNumber].filter(Boolean).join(" - ") || fallback,
    holder: refund.receiverAccountName || fallback,
});
