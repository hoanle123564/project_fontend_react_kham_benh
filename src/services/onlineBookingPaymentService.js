import { getBookingPayment, postPatientBooking } from "./userService";

export const startOnlineBookingPayment = (data) => postPatientBooking(data);
export const getOnlineBookingPayment = (bookingId) => getBookingPayment(bookingId);
