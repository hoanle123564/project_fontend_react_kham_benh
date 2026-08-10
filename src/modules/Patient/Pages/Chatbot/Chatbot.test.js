import { canCreateNewSession } from "./Chatbot";

jest.mock("../../../../services/chatService", () => ({
  createChatSession: jest.fn(),
  getChatSessionMessages: jest.fn(),
  getChatSessions: jest.fn(),
  sendChatMessage: jest.fn(),
}));

jest.mock("../../../../services/onlineBookingPaymentService", () => ({
  getOnlineBookingPayment: jest.fn(),
}));

describe("canCreateNewSession", () => {
  it("blocks a selected conversation without a patient message", () => {
    expect(canCreateNewSession("session-1", [])).toBe(false);
    expect(canCreateNewSession("session-1", [{ role: "bot" }])).toBe(false);
  });

  it("allows the initial conversation and a selected conversation with a patient message", () => {
    expect(canCreateNewSession("", [])).toBe(true);
    expect(canCreateNewSession("session-1", [{ role: "user" }])).toBe(true);
  });
});
