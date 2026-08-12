import { getRefundAccountLines } from "./refundDisplayUtils";

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
});
