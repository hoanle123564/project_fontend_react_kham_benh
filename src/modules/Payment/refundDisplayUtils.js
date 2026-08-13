export const EMPTY_PROVIDER_STATE = "__EMPTY__";

export const getRefundAccountLines = (refund = {}, fallback = "-") => ({
    bankAccount: [refund.receiverBank, refund.receiverAccountNumber].filter(Boolean).join(" - ") || fallback,
    holder: refund.receiverAccountName || fallback,
});

export const getRefundPatientName = (refund = {}) =>
    [refund.firstName, refund.lastName].filter(Boolean).join(" ").trim();

export const getRefundProviderState = (refund = {}) =>
    String(refund.payosProviderState || "").trim();

export const getRefundProviderStates = (refunds = []) => Array.from(
    new Set(refunds.map(getRefundProviderState).filter(Boolean)),
).sort((left, right) => left.localeCompare(right));

export const getLocalDateKey = (value) => {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    if (value === null || value === undefined || value === "") return "";

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
};

export const matchesRefundDate = (refund = {}, { dateFrom = "", dateTo = "" } = {}) => {
    if (!dateFrom && !dateTo) return true;

    const refundDate = getLocalDateKey(refund.requestedAt);
    if (!refundDate) return false;

    return (!dateFrom || refundDate >= dateFrom) && (!dateTo || refundDate <= dateTo);
};

export const filterRefunds = (refunds = [], filters = {}) => {
    const search = String(filters.search || "").trim().toLowerCase();
    const providerState = filters.providerState || "";

    return refunds.filter((refund) => {
        const patientName = getRefundPatientName(refund).toLowerCase();
        const refundProviderState = getRefundProviderState(refund);
        const matchesSearch = !search || patientName.includes(search);
        const matchesProviderState = providerState === EMPTY_PROVIDER_STATE
            ? !refundProviderState
            : !providerState || refundProviderState === providerState;

        return matchesSearch
            && matchesProviderState
            && matchesRefundDate(refund, filters);
    });
};

export const getRefundSummary = (refunds = []) => refunds.reduce((summary, refund) => {
    summary.total += 1;
    if (refund.statusId === "RFS3") summary.completed += 1;
    if (refund.statusId === "RFS6") summary.rejected += 1;
    return summary;
}, { total: 0, completed: 0, rejected: 0 });
