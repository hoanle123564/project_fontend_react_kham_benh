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
        name: "menu.admin.crud",
        link: "/system/user-manage",
      },
      {
        name: "menu.admin.crud-redux",
        link: "/system/user-redux",
      },
      {
        name: "menu.admin.manage-admin",
        link: "/system/user-admin",
      },
      // subMenus: [
      //     { name: 'menu.system.system-administrator.user-manage', link: '/system/user-manage' },
      //     { name: 'menu.system.system-administrator.user-redux', link: '/system/user-redux' },
      // ]
      {
        name: "menu.doctor.manage-schedule",
        link: "/doctor/manage-schedule",
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

  // phòng khám
  {
    name: "menu.admin.handbook",
    menus: [
      {
        name: "menu.admin.manage-handbook",
        link: "/system/manage-handbook",
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
        link: "/doctor/manage-schedule",
      },
    ],
  },
];
