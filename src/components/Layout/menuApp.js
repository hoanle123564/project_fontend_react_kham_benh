export const adminMenu = [
  // quản lý người dùng
  {
    name: "menu.admin.manage-user",
    menus: [
      {
        name: "menu.admin.manage-doctor",
        link: "/system/manage-doctor",
      },
      {
        name: "menu.admin.crud-redux",
        link: "/system/user-manage",
      },
      {
        name: "menu.admin.manage-admin",
        link: "/system/user-admin",
      },
      {
        name: "menu.doctor.manage-schedule",
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
        link: "/system/manage-specialty",
      },
    ],
  },

];
export const doctorMenu = [
  // quản lý kế hoạch khám bệnh
  {
    name: "menu.admin.manage-user",
    menus: [
      {
        name: "menu.doctor.manage-schedule",
        link: "/doctor/manage-schedule-private",
      },
      {
        name: "menu.doctor.manage-patient",
        link: "/doctor/manage-patient",
      },
    ],
  },
  {
    name: "menu.doctor.history-appointment",
    menus: [
      {
        name: "menu.doctor.history-appointment",
        link: "/doctor/list-appointment",
      },
    ],
  }
];
