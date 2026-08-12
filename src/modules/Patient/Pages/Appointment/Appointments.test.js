import { getRefundReasonKey, isRefundRequestAvailable } from "./refundUtils";

describe("patient refund request eligibility", () => {
  it("allows a cancelled online paid booking without an existing refund", () => {
    expect(isRefundRequestAvailable({ statusId: "S4", appointmentTypeId: "AT2", paymentStatusId: "PPS2" })).toBe(true);
    expect(isRefundRequestAvailable({ statusId: "S4", appointmentTypeId: "AT2", paymentStatusId: "PPS2", refundId: 9 })).toBe(false);
  });

  it("allows updating only a pending manual refund after doctor rejection", () => {
    expect(isRefundRequestAvailable({ statusId: "S6", appointmentTypeId: "AT2", paymentStatusId: "PPS6", refundMode: "MANUAL", refundStatusId: "RFS1" })).toBe(true);
    expect(isRefundRequestAvailable({ statusId: "S6", appointmentTypeId: "AT2", paymentStatusId: "PPS6", refundMode: "PAYOS", refundStatusId: "RFS1" })).toBe(false);
    expect(isRefundRequestAvailable({ statusId: "S6", appointmentTypeId: "AT2", paymentStatusId: "PPS6", refundMode: "MANUAL", refundStatusId: "RFS3" })).toBe(false);
  });

  it("selects the requested default reason by booking status", () => {
    expect(getRefundReasonKey("S4")).toBe("refundReasonPatientCancelled");
    expect(getRefundReasonKey("S6")).toBe("refundReasonDoctorRejected");
  });
});
