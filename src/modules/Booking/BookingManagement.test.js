jest.mock("../../services/userService", () => ({
  getAdminBookingManagement: jest.fn(),
  getAllBooking: jest.fn(),
  getDoctorBookingManagement: jest.fn(),
  getLookUp: jest.fn(),
  updateAdminBookingStatus: jest.fn(),
  updateClinicManagerBookingStatus: jest.fn(),
  updateDoctorBookingStatus: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
  },
}));

jest.mock("../../components/Pagination/PagePagination", () => () => null);

import BookingManagement from "./BookingManagement";
import {
  getAdminBookingManagement,
  getDoctorBookingManagement,
  getLookUp,
} from "../../services/userService";

const BookingManagementPage = BookingManagement.WrappedComponent;
const intl = {
  locale: "en",
  formatMessage: ({ defaultMessage }) => defaultMessage || "",
};

const createPage = () => {
  const page = new BookingManagementPage({ intl });
  page.setState = (update) => {
    const nextState =
      typeof update === "function" ? update(page.state, page.props) : update;
    page.state = { ...page.state, ...nextState };
  };
  return page;
};

describe("doctor booking confirmation modal", () => {
  test("waits for accept confirmation before updating S8", async () => {
    const page = createPage();
    const booking = { id: 42 };
    const updateStatus = jest.fn().mockResolvedValue(true);
    page.updateStatus = updateStatus;

    page.openBookingActionModal(booking, "S8");
    expect(page.state.bookingAction).toEqual({ booking, statusId: "S8" });
    expect(updateStatus).not.toHaveBeenCalled();

    page.closeBookingActionModal();
    expect(page.state.bookingAction).toBeNull();
    expect(updateStatus).not.toHaveBeenCalled();

    page.openBookingActionModal(booking, "S8");
    await page.confirmBookingAction();

    expect(updateStatus).toHaveBeenCalledWith(booking, "S8", true);
    expect(page.state.bookingAction).toBeNull();
  });

  test("keeps rejection on the same confirmation path", async () => {
    const page = createPage();
    const booking = { id: 43 };
    const updateStatus = jest.fn().mockResolvedValue(true);
    page.updateStatus = updateStatus;

    page.openBookingActionModal(booking, "S6");
    await page.confirmBookingAction();

    expect(updateStatus).toHaveBeenCalledWith(booking, "S6", true);
    expect(page.state.bookingAction).toBeNull();
  });
});

describe("booking management refresh", () => {
  test.each([{}, { adminMode: true }])(
    "keeps the current page after a refresh click",
    async (props) => {
      const booking = { id: 99, statusId: "S1" };
      const listBookings = props.adminMode
        ? getAdminBookingManagement
        : getDoctorBookingManagement;
      listBookings.mockResolvedValue({ errCode: 0, data: [booking] });
      getLookUp.mockResolvedValue({ errCode: 0, data: [] });

      const page = new BookingManagementPage({ intl, ...props });
      page.setState = (update) => {
        const nextState =
          typeof update === "function" ? update(page.state, page.props) : update;
        page.state = { ...page.state, ...nextState };
      };
      const root = page.render();
      const inner = root.props.children[0];
      const header = inner.props.children[0];
      const refreshButton = header.props.children[1];

      await refreshButton.props.onClick({ type: "click" });

      expect(page.state.currentPage).toBe(1);
      expect(page.getPageBookings()).toEqual([booking]);
    },
  );
});
