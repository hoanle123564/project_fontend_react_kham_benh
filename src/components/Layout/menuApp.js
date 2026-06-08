export const adminMenu = [
  // quản lý tổng hợp
  {
    name: "menu.admin.dashboard",
    menus: [
      {
        name: "menu.admin.dashboard",
        icon: "bi bi-bar-chart-line",
        link: "/system/dashboard",
      },
    ],
  },
  // quản lý người dùng
  {
    name: "menu.admin.manage-user",
    menus: [
      {
        name: "menu.admin.crud-redux",
        icon: "bi bi-people-fill",
        link: "/system/user-manage",
      },
    ],
  },
  // bác sĩ
  {
    name: "menu.admin.doctor",
    menus: [
      {
        name: "menu.admin.doctor-table",
        icon: "bi bi-table",
        link: "/system/doctor-table",
      },
      {
        name: "menu.admin.manage-doctor",
        icon: "bi bi-person-badge",
        link: "/system/manage-doctor",
      },
      {
        name: "menu.doctor.manage-schedule",
        icon: "bi bi-calendar3",
        link: "/system/manage-schedule",
      },
    ],
  },
  // phòng khám
  {
    name: "menu.admin.clinic",
    menus: [
      {
        name: "menu.admin.manage-clinic",
        icon: "bi bi-hospital",
        link: "/system/manage-clinic",
      },
      {
        name: "menu.admin.add-clinic",
        icon: "bi bi-hospital-fill",
        link: "/system/add-clinic",
      },
    ],
  },
  // chuyên khoa
  {
    name: "menu.admin.specialty",
    menus: [
      {
        name: "menu.admin.manage-specialty",
        icon: "bi bi-heart-pulse",
        link: "/system/manage-specialty",
      },
      {
        name: "menu.admin.add-specialty",
        icon: "bi bi-heart-pulse-fill",
        link: "/system/add-specialty",
      },
    ],
  },
  // bài viết
  {
    name: "menu.admin.post",
    menus: [
      {
        name: "menu.admin.manage-post",
        icon: "bi bi-newspaper",
        link: "/system/manage-post",
      },
      {
        name: "menu.admin.manage-post-category",
        icon: "bi bi-folder2-open",
        link: "/system/manage-post-category",
      },
    ],
  },
];
export const doctorMenu = [
  // quản lý kế hoạch khám bệnh
  {
    name: "menu.doctor.manage-medical",
    menus: [
      {
        name: "menu.doctor.manage-schedule",
        icon: "bi bi-calendar-check",
        link: "/doctor/manage-schedule-private",
      },
      {
        name: "menu.doctor.manage-patient",
        icon: "bi bi-person-lines-fill",
        link: "/doctor/manage-patient",
      },
    ],
  },
  // lịch sử khám bệnh
  {
    name: "menu.doctor.history-appointment",
    menus: [
      {
        name: "menu.doctor.history-appointment",
        icon: "bi bi-clock-history",
        link: "/doctor/list-appointment",
      },
    ],
  },
  // tư vấn
  {
    name: "menu.doctor.consult",
    menus: [
      {
        name: "menu.doctor.message",
        icon: "bi bi-chat-left-text",
        link: "/doctor/message",
      },
      {
        name: "menu.doctor.video-call",
        icon: "bi bi-camera-video",
        link: "/doctor/video-call",
      },
    ]
  }
];
