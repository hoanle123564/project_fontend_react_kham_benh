export const isRefundRequestAvailable = (item = {}) => {
    if (item.appointmentTypeId !== "AT2") return false;
    if (item.statusId === "S4") {
        return item.paymentStatusId === "PPS2" && !item.refundId;
    }
    return item.statusId === "S6"
        && item.paymentStatusId === "PPS6"
        && ["MANUAL", "PAYOS"].includes(item.refundMode)
        && item.refundStatusId === "RFS1";
};

export const getRefundReasonKey = (statusId) =>
    statusId === "S6" ? "refundReasonDoctorRejected" : "refundReasonPatientCancelled";
