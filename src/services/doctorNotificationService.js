import { doctorAxios } from "../axios";

export const getDoctorNotifications = () => doctorAxios.get("/api/doctor/notifications");

export const markDoctorNotificationsRead = (notificationId) =>
  doctorAxios.patch(notificationId
    ? `/api/doctor/notifications/${encodeURIComponent(notificationId)}/read`
    : "/api/doctor/notifications/read");
