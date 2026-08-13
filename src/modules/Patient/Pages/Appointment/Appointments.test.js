import { getRefundReasonKey, isRefundRequestAvailable } from "./refundUtils";
import {
  BOOKING_STATUS_IDS,
  buildAppointmentQuery,
  clearAppointmentFilters,
  getAppointmentListState,
  getDateRangeFilters,
  getStatusOptionsWithFallback,
  validateAppointmentDateRange,
} from "./appointmentFilterUtils";

describe("patient refund request eligibility", () => {
  it("allows a cancelled online paid booking without an existing refund", () => {
    expect(isRefundRequestAvailable({ statusId: "S4", appointmentTypeId: "AT2", paymentStatusId: "PPS2" })).toBe(true);
    expect(isRefundRequestAvailable({ statusId: "S4", appointmentTypeId: "AT2", paymentStatusId: "PPS2", refundId: 9 })).toBe(false);
  });

  it("allows updating a pending manual or PayOS refund after doctor rejection", () => {
    expect(isRefundRequestAvailable({ statusId: "S6", appointmentTypeId: "AT2", paymentStatusId: "PPS6", refundMode: "MANUAL", refundStatusId: "RFS1" })).toBe(true);
    expect(isRefundRequestAvailable({ statusId: "S6", appointmentTypeId: "AT2", paymentStatusId: "PPS6", refundMode: "PAYOS", refundStatusId: "RFS1" })).toBe(true);
    expect(isRefundRequestAvailable({ statusId: "S6", appointmentTypeId: "AT2", paymentStatusId: "PPS6", refundMode: "MANUAL", refundStatusId: "RFS3" })).toBe(false);
  });

  it("selects the requested default reason by booking status", () => {
    expect(getRefundReasonKey("S4")).toBe("refundReasonPatientCancelled");
    expect(getRefundReasonKey("S6")).toBe("refundReasonDoctorRejected");
  });
});

describe("patient appointment filters", () => {
  it("maps range dates and AT1/AT2 filters to the server query", () => {
    const range = getDateRangeFilters([new Date(2026, 5, 1), new Date(2026, 5, 30)]);

    expect(range).toEqual({ startDate: "2026-06-01", endDate: "2026-06-30" });
    expect(buildAppointmentQuery({ ...range, statusId: "S8", appointmentTypeId: "AT2" }, "  123 Nguyen  "))
      .toEqual({
        startDate: "2026-06-01",
        endDate: "2026-06-30",
        statusId: "S8",
        appointmentTypeId: "AT2",
        search: "123 Nguyen",
      });
    expect(buildAppointmentQuery({ appointmentTypeId: "AT1" })).toEqual({ appointmentTypeId: "AT1" });
  });

  it("requires a complete, chronological date range", () => {
    expect(validateAppointmentDateRange({ startDate: "2026-06-01" })).toBe("incomplete");
    expect(validateAppointmentDateRange({ startDate: "2026-06-31", endDate: "2026-07-01" })).toBe("invalid");
    expect(validateAppointmentDateRange({ startDate: "2026-07-02", endDate: "2026-07-01" })).toBe("invalid");
    expect(validateAppointmentDateRange({ startDate: "2026-06-01", endDate: "2026-06-30" })).toBe("");
  });

  it("clears filters without clearing the search and reports an empty filtered list", () => {
    expect(clearAppointmentFilters("BS Nguyen")).toEqual({
      filters: {
        startDate: "",
        endDate: "",
        statusId: "",
        appointmentTypeId: "",
      },
      search: "BS Nguyen",
    });
    expect(getAppointmentListState([], {}, "BS Nguyen")).toBe("no-results");
    expect(getAppointmentListState([], {}, "")).toBe("empty");
  });

  it("keeps the S1 through S8 status order when the lookup is incomplete", () => {
    expect(getStatusOptionsWithFallback([{ keyMap: "S8", value_vi: "Bác sĩ đã xác nhận" }]).map((item) => item.keyMap))
      .toEqual(BOOKING_STATUS_IDS);
  });
});
