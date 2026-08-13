import {
  EMPTY_PROVIDER_STATE,
  filterRefunds,
  getRefundAccountLines,
  getRefundSummary,
} from "./refundDisplayUtils";

describe("refund account display", () => {
  it("renders bank and account number on the first line and holder on the second", () => {
    expect(getRefundAccountLines({
      receiverBank: "VCB",
      receiverBankBin: "970415",
      receiverAccountNumber: "0123456789",
      receiverAccountName: "NGUYEN VAN A",
    })).toEqual({
      bankAccount: "VCB - 0123456789",
      holder: "NGUYEN VAN A",
    });
  });

  it("searches only the patient's displayed name", () => {
    const refunds = [
      { id: 1, firstName: "Nguyen", lastName: "An", email: "other@example.com" },
      { id: 2, firstName: "Tran", lastName: "Binh", email: "nguyen@example.com" },
    ];

    expect(filterRefunds(refunds, { search: "nguyen" }).map(({ id }) => id)).toEqual([1]);
    expect(filterRefunds(refunds, { search: "other@example.com" })).toEqual([]);
  });

  it("filters provider states, including rows without a provider state", () => {
    const refunds = [
      { id: 1, payosProviderState: "SUCCEEDED" },
      { id: 2, payosProviderState: "HTTP_403" },
      { id: 3, payosProviderState: null },
    ];

    expect(filterRefunds(refunds, { providerState: "HTTP_403" }).map(({ id }) => id)).toEqual([2]);
    expect(filterRefunds(refunds, { providerState: EMPTY_PROVIDER_STATE }).map(({ id }) => id)).toEqual([3]);
  });

  it("filters by an inclusive local requested date range", () => {
    const refunds = [
      { id: 1, requestedAt: new Date(2026, 7, 10, 9, 0).getTime() },
      { id: 2, requestedAt: new Date(2026, 7, 12, 9, 0).getTime() },
      { id: 3, requestedAt: new Date(2026, 7, 15, 9, 0).getTime() },
    ];

    expect(filterRefunds(refunds, { dateFrom: "2026-08-10", dateTo: "2026-08-12" }).map(({ id }) => id)).toEqual([1, 2]);
  });

  it("counts summary cards from the complete loaded list", () => {
    expect(getRefundSummary([
      { statusId: "RFS1" },
      { statusId: "RFS3" },
      { statusId: "RFS3" },
      { statusId: "RFS6" },
      { statusId: "RFS4" },
    ])).toEqual({ total: 5, completed: 2, rejected: 1 });
  });
});
