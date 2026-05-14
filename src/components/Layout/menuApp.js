export const adminMenu = [
  // quản lý tổng hợp
  {
    name: "menu.admin.dashboard",
    menus: [
      {
        name: "menu.admin.dashboard",
        icon: "fa-solid fa-chart-line",
        link: "/system/dashboard",
      },
    ],
  },
  // quản lý người dùng
  {
    name: "menu.admin.manage-user",
    menus: [
      {
        name: "menu.admin.manage-doctor",
        icon: "fas fa-users",
        link: "/system/manage-doctor",
      },
      {
        name: "menu.admin.crud-redux",
        icon: "fa-solid fa-user-group",
        link: "/system/user-manage",
      },
      {
        name: "menu.doctor.manage-schedule",
        icon: "fas fa-users",
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
        icon: "fas fa-hospital",
        link: "/system/manage-clinic",
      },
    ],
  },

  // chuyên khoa
  {
    name: "menu.admin.specialty",
    menus: [
      {
        name: "menu.admin.manage-specialty",
        icon: "fas fa-stethoscope",
        link: "/system/manage-specialty",
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
        icon: "fas fa-notes-medical",
        link: "/doctor/manage-schedule-private",
      },
      {
        name: "menu.doctor.manage-patient",
        icon: "fas fa-notes-medical",
        link: "/doctor/manage-patient",
      },
    ],
  },
  {
    name: "menu.doctor.history-appointment",
    menus: [
      {
        name: "menu.doctor.history-appointment",
        icon: "fas fa-history",
        link: "/doctor/list-appointment",
      },
    ],
  }
];
