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
      {
        name: "menu.admin.medical-record",
        icon: "bi bi-journal-medical",
        link: "/system/medical-record",
      },
      {
        name: "menu.admin.manage-booking",
        icon: "bi bi-calendar2-check",
        link: "/system/manage-booking",
      },
      {
        name: "menu.admin.manage-refund",
        icon: "bi bi-cash-stack",
        link: "/system/manage-refund",
      },
      {
        name: "menu.admin.manage-review",
        icon: "bi bi-star",
        link: "/system/manage-review",
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
        name: "menu.admin.manage-clinic-department",
        icon: "bi bi-diagram-3",
        link: "/system/manage-clinic-department",
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
  {
    name: "menu.doctor.dashboard",
    menus: [
      {
        name: "menu.doctor.dashboard",
        icon: "bi bi-speedometer2",
        link: "/doctor/dashboard",
      },
    ],
  },
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
        name: "menu.doctor.appointment",
        icon: "bi bi-person-lines-fill",
        link: "/doctor/appointment",
      },
      {
        name: "menu.doctor.manage-booking",
        icon: "bi bi-calendar2-check",
        link: "/doctor/manage-booking",
      },
      {
        name: "menu.doctor.reviews",
        icon: "bi bi-star",
        link: "/doctor/reviews",
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
  // hồ sơ
  {
    name: "menu.doctor.profile",
    menus: [
      {
        name: "menu.doctor.medical-record",
        icon: "bi bi-journal-medical",
        link: "/doctor/medical-record",
      },
      {
        name: "menu.doctor.manage-patient",
        icon: "bi bi-person-badge",
        link: "/doctor/manage-patient",
      },
      {
        name: "menu.doctor.edit-profile",
        icon: "bi bi-person-gear",
        link: "/doctor/edit-profile",
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

export const doctorClinicManagerMenu = [
  {
    name: "menu.admin.clinic",
    menus: [
      {
        name: "menu.admin.manage-clinic",
        icon: "bi bi-hospital",
        link: "/doctor/manage-clinic",
      },
      {
        name: "menu.admin.manage-clinic-department",
        icon: "bi bi-diagram-3",
        link: "/doctor/manage-clinic-department",
      },
    ],
  },
];

export const clinicManagerMenu = [
  {
    name: "menu.clinic-manager.clinic",
    menus: [
      {
        name: "menu.clinic-manager.my-clinic",
        icon: "bi bi-hospital",
        link: "/system/manage-clinic",
      },
      {
        name: "menu.clinic-manager.departments",
        icon: "bi bi-diagram-3",
        link: "/system/manage-clinic-department",
      },
    ],
  },
  {
    name: "menu.clinic-manager.doctor",
    menus: [
      {
        name: "menu.clinic-manager.doctors",
        icon: "bi bi-people",
        link: "/system/doctor-table",
      },
      {
        name: "menu.clinic-manager.manage-doctor",
        icon: "bi bi-person-badge",
        link: "/system/manage-doctor",
      },
      {
        name: "menu.clinic-manager.schedule",
        icon: "bi bi-calendar3",
        link: "/system/manage-schedule",
      },
      {
        name: "menu.clinic-manager.appointments",
        icon: "bi bi-person-lines-fill",
        link: "/system/list-appointment",
      },
    ],
  },
];

export const patientMenu = [
  {
    name: "menu.patient.account",
    menus: [
      {
        name: "menu.patient.account",
        icon: "fas fa-user-circle",
        link: "/patient-profile",
      },
      {
        name: "menu.patient.appointments",
        icon: "fas fa-calendar-alt",
        link: "/appointments",
      },
      {
        name: "menu.patient.chat",
        icon: "bi bi-chat-left-text",
        link: "/patient/chat",
      },
    ],
  },
];
