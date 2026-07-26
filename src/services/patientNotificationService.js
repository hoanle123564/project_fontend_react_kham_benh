import { patientAxios } from "../axios";

export const getPatientNotifications = () => patientAxios.get("/api/patient/notifications");

export const markPatientNotificationsRead = (notificationId) =>
  patientAxios.patch(notificationId
    ? `/api/patient/notifications/${encodeURIComponent(notificationId)}/read`
    : "/api/patient/notifications/read");
