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
        name: "menu.admin.crud-redux",
        icon: "fa-solid fa-user-group",
        link: "/system/user-manage",
      },
    ],
  },
  {
    name: "menu.admin.doctor",
    menus: [
      {
        name: "menu.admin.manage-doctor",
        icon: "fas fa-users",
        link: "/system/manage-doctor",
      },
      {
        name: "menu.doctor.manage-schedule",
        icon: "fas fa-users",
        link: "/system/manage-schedule",
      },
    ],
  }
  ,
  {
    name: "menu.admin.manage-doctor",
    menus: [
      {
        name: "menu.admin.manage-admin",
        icon: "fas fa-users",
        link: "/system/manage-admin",
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
      {
        name: "menu.admin.add-clinic",
        icon: "fas fa-hospital",
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
        icon: "fas fa-stethoscope",
        link: "/system/manage-specialty",
      },
      {
        name: "menu.admin.add-specialty",
        icon: "fas fa-stethoscope",
        link: "/system/add-specialty",
      },
    ],
  },
  {
    name: "menu.admin.post",
    menus: [
      {
        name: "menu.admin.manage-post",
        icon: "fas fa-newspaper",
        link: "/system/manage-post",
      },
      {
        name: "menu.admin.manage-post-category",
        icon: "fas fa-folder-open",
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
  },
  {
    name: "menu.doctor.consult",
    menus: [
      {
        name: "menu.doctor.message",
        icon: "fas fa-user-cog",
        link: "/doctor/message",
      },
      {
        name: "menu.doctor.video-call",
        icon: "fas fa-user-cog",
        link: "/doctor/video-call",
      },
    ]
  }
];
