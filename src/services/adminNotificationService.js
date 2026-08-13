import { adminAxios } from "../axios";

export const getAdminNotifications = () => adminAxios.get("/api/admin/notifications");

export const markAdminNotificationsRead = (notificationId) =>
  adminAxios.patch(
    notificationId
      ? `/api/admin/notifications/${encodeURIComponent(notificationId)}/read`
      : "/api/admin/notifications/read"
  );
