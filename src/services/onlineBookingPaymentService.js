import { cancelPaymentIntent, getPaymentIntent, postPatientBooking } from "./userService";

export const startOnlineBookingPayment = (data) => postPatientBooking(data);
export const getOnlineBookingPayment = (paymentId) => getPaymentIntent(paymentId);
export const cancelOnlineBookingPayment = (paymentId) => cancelPaymentIntent(paymentId);
