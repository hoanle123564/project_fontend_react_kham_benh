import axios, { adminAxios, doctorAxios, patientAxios } from "../axios";
import { buildImageSrc } from "../utils/imageUtils";

// Đăng nhập
const getCurrentAuthAxios = () => {
  if (typeof window === "undefined") {
    return axios;
  }

  const pathname = window.location?.pathname || "";

  if (pathname.startsWith("/system")) {
    return adminAxios;
  }

  if (pathname.startsWith("/doctor")) {
    return doctorAxios;
  }

  if (pathname.startsWith("/patient") || pathname.startsWith("/appointments")) {
    return patientAxios;
  }

  return axios;
};

const getAuthAxiosByRole = (authRole) => {
  switch (authRole) {
    case "admin":
      return adminAxios;
    case "doctor":
      return doctorAxios;
    case "patient":
      return patientAxios;
    default:
      return getCurrentAuthAxios();
  }
};

const handleLoginAPI = (email, password) => {
  return axios.post("/api/login", { email, password });
};

// Lấy tất cả người dùng
const getAllUser = (id) => {
  //template string
  return axios.get(`/api/get-all-user?id=${id} `);
};

// Tạo người dùng
const CreateUser = (data) => {
  return axios.post("/api/create-new-user", data);
};

// Xóa người dùng
const DeleteUser = (UserId) => {
  // return axios.delete('/api/delete-user', { id });
  return adminAxios.delete("/api/delete-user", {
    data: {
      id: UserId,
    },
  });
};

// Cập nhật thông tin người dùng
const EditUser = (data) => {
  return getCurrentAuthAxios().put("/api/edit-user", data);
};
const changePassword = (data) => {
  return getCurrentAuthAxios().put("/api/change-password", data);
};

// Lấy tất cả thuộc tính
const getLookUp = (type, parentKeyMap) => {
  const parentQuery =
    parentKeyMap !== undefined && parentKeyMap !== null && String(parentKeyMap).trim() !== ""
      ? `&parentKeyMap=${encodeURIComponent(parentKeyMap)}`
      : "";

  return axios.get(`/api/lookup?type=${encodeURIComponent(type)}${parentQuery}`);
};

//==========================================
// Lấy bác sĩ
const getDoctor = (limit) => {
  return axios.get(`/api/top-doctor?limit=${limit}`);
};
// Lấy tất cả bác sĩ
const getAllDoctor = () => {
  return axios.get(`/api/all-doctor`);
};
// Lưu thông tin chi tiết bác sĩ
const postDetailDoctor = (data) => {
  return getCurrentAuthAxios().post("/api/save-doctor", data);
};

// Lấy thông tin chi tiết bác sĩ
const getDetailDoctor = (doctorIdOrSlug) => {
  const value = String(doctorIdOrSlug || "").trim();
  const queryKey = /^\d+$/.test(value) ? "id" : "slug";
  return axios.get(`/api/detail-doctor?${queryKey}=${encodeURIComponent(value)}`);
};

const changeStatusDoctorInfo = (data) => {
  return adminAxios.put("/api/change-status-doctor-info", data);
};

const updateDoctorInfoOrder = (items) => {
  return adminAxios.put("/api/update-doctor-info-order", { items });
};

// Lấy danh sách bác sĩ liên quan (cùng chuyên khoa)
const getRelatedDoctorsService = (doctorId) => {
  return axios.get(`/api/get-related-doctors?id=${doctorId}`);
};

// Lưu lịch trình bác sĩ
const postScheduleDoctor = (data, options = {}) => {
  return getAuthAxiosByRole(options.authRole).post("/api/create-schedule-doctor", data);
};

// Lấy lịch trình bác sĩ
const getScheduleDoctor = (doctorId, date) => {
  return axios.get(`/api/get-schedule-doctor?doctorId=${doctorId}&date=${date}`);
};

const updateScheduleDoctor = (data, options = {}) => {
  return getAuthAxiosByRole(options.authRole).put("/api/update-schedule-doctor", data);
};

const getDoctorScheduleRules = (doctorId, params = {}, options = {}) => {
  const query = new URLSearchParams({
    doctorId,
    ...Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        acc[key] = value;
      }
      return acc;
    }, {}),
  });
  return getAuthAxiosByRole(options.authRole).get(`/api/doctor-schedule/rules?${query.toString()}`);
};

const previewDoctorScheduleRule = (data, options = {}) => {
  return getAuthAxiosByRole(options.authRole).post("/api/doctor-schedule/rules/preview", data);
};

const createDoctorScheduleRule = (data, options = {}) => {
  return getAuthAxiosByRole(options.authRole).post("/api/doctor-schedule/rules", data);
};

const updateDoctorScheduleRule = (ruleId, data, options = {}) => {
  return getAuthAxiosByRole(options.authRole).put(
    `/api/doctor-schedule/rules/${encodeURIComponent(ruleId)}`,
    data
  );
};

const deleteDoctorScheduleRule = (ruleId, options = {}) => {
  return getAuthAxiosByRole(options.authRole).delete(
    `/api/doctor-schedule/rules/${encodeURIComponent(ruleId)}`
  );
};

// Lấy danh sách bệnh nhân theo ngày khám của bác sĩ
const getAllPatientForDoctor = (doctorId, date) => {
  return doctorAxios.get(`/api/get-list-patient-for-doctor?id=${doctorId}&date=${date}`);
};

const buildDoctorPatientQuery = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      query.append(key, value);
    }
  });

  return query.toString();
};

const getDoctorPatients = (params = {}) => {
  const query = buildDoctorPatientQuery(params);
  return doctorAxios.get(`/api/doctor/patients${query ? `?${query}` : ""}`);
};

const getDoctorPatientDetail = (patientId) => {
  return doctorAxios.get(`/api/doctor/patient-detail?patientId=${encodeURIComponent(patientId)}`);
};

const getDoctorPatientHistory = (patientId) => {
  return doctorAxios.get(`/api/doctor/patient-history?patientId=${encodeURIComponent(patientId)}`);
};

const getDoctorQueue = (params = {}) => {
  const query = buildDoctorPatientQuery(params);
  return doctorAxios.get(`/api/doctor/queue${query ? `?${query}` : ""}`);
};

const getDoctorAppointmentDetail = (bookingId) => {
  return doctorAxios.get(
    `/api/doctor/appointment-detail?bookingId=${encodeURIComponent(bookingId)}`
  );
};

const getAdminMedicalRecordAppointmentDetail = (bookingId) => {
  return adminAxios.get(
    `/api/doctor/appointment-detail?bookingId=${encodeURIComponent(bookingId)}`
  );
};

// params có thể có hoặc rỗng
const getDoctorMedicalRecords = (params = {}) => {
  const query = buildDoctorPatientQuery(params);
  return doctorAxios.get(`/api/doctor/medical-records${query ? `?${query}` : ""}`);
};

const getAdminMedicalRecords = (params = {}) => {
  const query = buildDoctorPatientQuery(params);
  return adminAxios.get(`/api/admin/medical-records${query ? `?${query}` : ""}`);
};

const startDoctorExaminationVisit = (bookingId) => {
  return doctorAxios.post("/api/doctor/examination-visit", { bookingId });
};

const getDoctorExaminationVisitDetail = (examinationVisitId) => {
  return doctorAxios.get(
    `/api/doctor/examination-visit-detail?examinationVisitId=${encodeURIComponent(
      examinationVisitId
    )}`
  );
};

const ensureDoctorMedicalRecord = (examinationVisitId) => {
  return doctorAxios.post("/api/doctor/medical-record", { examinationVisitId });
};

const getMedicalRecordDetail = (medicalRecordId) => {
  return doctorAxios.get(
    `/api/medical-record/detail?medicalRecordId=${encodeURIComponent(medicalRecordId)}`
  );
};

const getAdminMedicalRecordDetail = (medicalRecordId) => {
  return adminAxios.get(
    `/api/medical-record/detail?medicalRecordId=${encodeURIComponent(medicalRecordId)}`
  );
};

const saveMedicalRecordDraft = (data) => {
  return doctorAxios.post("/api/medical-record/draft", data);
};

const saveMedicalRecordPrescription = (data) => {
  return doctorAxios.put("/api/medical-record/prescription", data);
};

const saveMedicalRecordParaclinicalResults = (data) => {
  return doctorAxios.put("/api/medical-record/paraclinical-results", data);
};

const completeMedicalRecordVisit = (data) => {
  return doctorAxios.post("/api/medical-record/complete-visit", data);
};

const closeMedicalRecord = (data) => {
  return doctorAxios.post("/api/medical-record/close", data);
};

const getVisitPaymentSummary = (examinationVisitId) => {
  return doctorAxios.get(
    `/api/doctor/visit-payment-summary?examinationVisitId=${encodeURIComponent(
      examinationVisitId
    )}`
  );
};

const collectVisitPayment = (data) => {
  return doctorAxios.post("/api/doctor/collect-visit-payment", data);
};

const DeleteScheduleDoctor = (ScheduleId, options = {}) => {
  return getAuthAxiosByRole(options.authRole).delete("/api/delete-schedule-doctor", {
    data: {
      id: ScheduleId,
    },
  });
};
const getAppointmentDoctor = (doctorId) => {
  return doctorAxios.get(`/api/get-list-booking-appointment-doctor?id=${doctorId}`);
};
//==========================================
// Lưu thông tin đặt lịch khám bệnh
const postPatientBooking = (data) => {
  return patientAxios.post("/api/patient-book-appointment", data);
};

const getBookingPayment = (bookingId) =>
  patientAxios.get(`/api/bookings/${encodeURIComponent(bookingId)}/payment`);

// Xác nhận đặt lịch khám bệnh
const VerifyPatientBooking = (data) => {
  return axios.post("/api/verify-book-appointment", data);
};

const getListAppoinmentForPatient = () => {
  return patientAxios.get("/api/get-list-booking-appointment-patient");
}

const postCancelBookingAppointment = (data) => {
  return patientAxios.post("/api/cancel-book-appointment", data);
};

const getPatientProfile = () => {
  return patientAxios.get("/api/patient/profile");
};

const updatePatientProfile = (data) => {
  return patientAxios.put("/api/patient/profile", data);
};

//==========================================
// specialty
const postSaveSpecialty = (data) => {
  return axios.post("/api/create-specialty", data);
};
const getAllSpecialty = (options = {}) => {
  const publicOnly = options?.publicOnly ? 1 : "";
  return axios.get(`/api/get-specialty?publicOnly=${publicOnly}`);
};

const getDetailSpecialtyById = (id, location) => {
  return axios.get(`/api/get-detail-specialty-by-id?id=${id}&location=${location}`);
}

const getDetailSpecialtyBySlug = (slug, location) => {
  return axios.get(
    `/api/get-detail-specialty-by-id?slug=${encodeURIComponent(slug)}&location=${location}`
  );
};

const EditSpecialtyId = (data) => {
  return axios.put("/api/edit-specialty", data);
};

const ChangeStatusSpecialty = (data) => {
  return axios.put("/api/change-status-specialty", data);
};

const updateSpecialtyOrder = (items) => {
  return axios.put("/api/update-specialty-order", { items });
};

const DeleteSpecialty = (SpecialtyId) => {
  return axios.delete("/api/delete-specialty", {
    data: {
      id: SpecialtyId,
    },
  });
};


//==========================================
// clinic
const postSaveClinic = (data) => {
  return axios.post("/api/create-clinic", data);
};

const EditClinicId = (data) => {
  return axios.put("/api/edit-clinic", data);
};

const getAllClinic = (options = {}) => {
  const publicOnly = options?.publicOnly ? 1 : "";
  const managedOnly = options?.managedOnly ? 1 : "";
  const client = managedOnly ? getCurrentAuthAxios() : axios;
  return client.get(`/api/get-clinic?publicOnly=${publicOnly}&managedOnly=${managedOnly}`);
};

const getDetailClinicById = (id, location, options = {}) => {
  const managedOnly = options?.managedOnly ? "&managedOnly=1" : "";
  const client = options?.managedOnly ? getCurrentAuthAxios() : axios;
  return client.get(`/api/get-detail-clinic-by-id?id=${id}&location=${location}${managedOnly}`);
}

const getDetailClinicBySlug = (slug, location) => {
  return axios.get(
    `/api/get-detail-clinic-by-id?slug=${encodeURIComponent(slug)}&location=${location}`
  );
};

const ChangeStatusClinic = (data) => {
  return axios.put("/api/change-status-clinic", data);
};

const updateClinicOrder = (items) => {
  return axios.put("/api/update-clinic-order", { items });
};

const DeleteClinic = (ClinicId) => {
  return axios.delete("/api/delete-clinic", {
    data: {
      id: ClinicId,
    },
  });
};

const getClinicContentSections = (clinicId) => {
  return getCurrentAuthAxios().get(`/api/get-clinic-content-section?clinicId=${encodeURIComponent(clinicId)}`);
};

const postSaveClinicContentSection = (data) => {
  return getCurrentAuthAxios().post("/api/create-clinic-content-section", data);
};

const EditClinicContentSection = (data) => {
  return getCurrentAuthAxios().put("/api/edit-clinic-content-section", data);
};

const DeleteClinicContentSection = (data) => {
  return getCurrentAuthAxios().delete("/api/delete-clinic-content-section", { data });
};

const ChangeStatusClinicContentSection = (data) => {
  return getCurrentAuthAxios().put("/api/change-status-clinic-content-section", data);
};

const updateClinicContentSectionOrder = (clinicId, items) => {
  return getCurrentAuthAxios().put("/api/update-clinic-content-section-order", { clinicId, items });
};

const getClinicDepartment = (clinicId) => {
  return axios.get(`/api/get-clinic-department?clinicId=${clinicId}`);
};

const postSaveClinicDepartment = (data) => {
  return axios.post("/api/create-clinic-department", data);
};

const EditClinicDepartmentId = (data) => {
  return axios.put("/api/edit-clinic-department", data);
};

const ChangeStatusClinicDepartment = (data) => {
  return axios.put("/api/change-status-clinic-department", data);
};

//==========================================
// post category
const postSavePostCategory = (data) => {
  return axios.post("/api/create-post-category", data);
};

const getAllPostCategory = () => {
  return axios.get("/api/get-post-category");
};

const getDetailPostCategoryById = (id) => {
  return axios.get(`/api/get-detail-post-category-by-id?id=${id}`);
};

const getPublicPostCategories = () => {
  return axios.get("/api/public/post-categories");
};

const getPublicPostCategoryDetail = (categorySlug) => {
  return axios.get(`/api/public/post-category-detail?categorySlug=${encodeURIComponent(categorySlug)}`);
};

const EditPostCategoryId = (data) => {
  return axios.put("/api/edit-post-category", data);
};

const updatePostCategoryOrder = (items) => {
  return axios.put("/api/update-post-category-order", { items });
};

const changeStatusPostCategory = (data) => {
  return axios.put("/api/change-status-post-category", data);
};

const DeletePostCategory = (PostCategoryId) => {
  return axios.delete("/api/delete-post-category", {
    data: {
      id: PostCategoryId,
    },
  });
};

//==========================================
// post
const postSavePost = (data) => {
  return axios.post("/api/create-post", data);
};

const getAllPost = (
  page = 1,
  limit = 10,
  keyword = "",
  categoryId = "",
  isActive = ""
) => {
  return axios.get(
    `/api/get-post?page=${page}&limit=${limit}&keyword=${keyword}&categoryId=${categoryId}&isActive=${isActive}`
  );
};

const getDetailPostById = (id) => {
  return axios.get(`/api/get-detail-post-by-id?id=${id}`);
};

const getPublicPostsByCategory = (categorySlug, page = 1, limit = 10) => {
  return axios.get(
    `/api/public/posts-by-category?categorySlug=${encodeURIComponent(categorySlug)}&page=${page}&limit=${limit}`
  );
};

const getPublicPostDetail = (categorySlug, postSlug) => {
  return axios.get(
    `/api/public/post-detail?categorySlug=${encodeURIComponent(categorySlug)}&postSlug=${encodeURIComponent(postSlug)}`
  );
};

const getPublicRelatedPosts = (categorySlug, postSlug, limit = 7) => {
  return axios.get(
    `/api/public/related-posts?categorySlug=${encodeURIComponent(categorySlug)}&postSlug=${encodeURIComponent(postSlug)}&limit=${limit}`
  );
};

const EditPostId = (data) => {
  return axios.put("/api/edit-post", data);
};

const ChangeStatusPost = (data) => {
  return axios.put("/api/change-status-post", data);
};

const updatePostOrder = (items) => {
  return axios.put("/api/update-post-order", { items });
};

const DeletePost = (PostId) => {
  return axios.delete("/api/delete-post", {
    data: {
      id: PostId,
    },
  });
};

// send remedy
const postSendRemedy = (data) => {
  return doctorAxios.post("/api/send-remedy", data);
};

// get list booking
const getAllBooking = () => {
  return getCurrentAuthAxios().get("/api/get-all-list-booking");
};

const getAdminBookingManagement = () => adminAxios.get("/api/admin/bookings");
const getAdminRefunds = () => adminAxios.get("/api/admin/refunds");
const confirmAdminRefund = (refundId, refundTransactionId) =>
  adminAxios.post(`/api/admin/refunds/${encodeURIComponent(refundId)}/confirm`, { refundTransactionId });
const updateAdminBookingStatus = (bookingId, data) =>
  adminAxios.patch(`/api/admin/bookings/${encodeURIComponent(bookingId)}/status`, data);
const getDoctorBookingManagement = () => doctorAxios.get("/api/doctor/bookings");
const updateDoctorBookingStatus = (bookingId, data) =>
  doctorAxios.patch(`/api/doctor/bookings/${encodeURIComponent(bookingId)}/status`, data);

const getPublicDoctorReviews = (doctorId, params = {}) => {
  const query = buildDoctorPatientQuery(params);
  return axios.get(`/api/doctors/${encodeURIComponent(doctorId)}/reviews${query ? `?${query}` : ""}`);
};

const getBookingReviewEligibility = (bookingId) =>
  patientAxios.get(`/api/bookings/${encodeURIComponent(bookingId)}/review-eligibility`);

const createBookingReview = (bookingId, data) =>
  patientAxios.post(`/api/bookings/${encodeURIComponent(bookingId)}/review`, data);

const getDoctorReviews = (params = {}) => {
  const query = buildDoctorPatientQuery(params);
  return doctorAxios.get(`/api/doctor/reviews${query ? `?${query}` : ""}`);
};

const createDoctorReviewReply = (reviewId, data) =>
  doctorAxios.post(`/api/doctor/reviews/${encodeURIComponent(reviewId)}/reply`, data);

const updateDoctorReviewReply = (reviewId, data) =>
  doctorAxios.patch(`/api/doctor/reviews/${encodeURIComponent(reviewId)}/reply`, data);

const getAdminReviews = (params = {}) => {
  const query = buildDoctorPatientQuery(params);
  return adminAxios.get(`/api/admin/reviews${query ? `?${query}` : ""}`);
};

const updateAdminReviewVisibility = (reviewId, data) =>
  adminAxios.patch(`/api/admin/reviews/${encodeURIComponent(reviewId)}/visibility`, data);

const getAdminDashboardStatistics = (
  revenueType = "month",
  topDoctorType = "month",
  options = {}
) => {
  const recentPage = options.recentPage || 1;
  const recentLimit = options.recentLimit || 5;
  return adminAxios.get(
    `/api/admin/dashboard-statistics?revenueType=${revenueType}&topDoctorType=${topDoctorType}&recentPage=${recentPage}&recentLimit=${recentLimit}`
  );
};

const joinVideoConsultation = (bookingId, options = {}) => {
  return getAuthAxiosByRole(options.authRole).post("/api/video-consultation/join-token", {
    bookingId,
  });
};

const markVideoConsultationStarted = (bookingId, options = {}) => {
  return getAuthAxiosByRole(options.authRole).post("/api/video-consultation/mark-started", {
    bookingId,
  });
};

const getDoctorDashboardStatistics = (range = "week") => {
  return doctorAxios.get(`/api/doctor/dashboard-statistics?range=${encodeURIComponent(range)}`);
};

export {
  handleLoginAPI,
  getAllUser,
  CreateUser,
  DeleteUser,
  EditUser,
  changePassword,
  getLookUp,
  getDoctor,
  getAllDoctor,
  postDetailDoctor,
  getDetailDoctor,
  changeStatusDoctorInfo,
  updateDoctorInfoOrder,
  getRelatedDoctorsService,
  postScheduleDoctor,
  getScheduleDoctor,
  updateScheduleDoctor,
  getDoctorScheduleRules,
  previewDoctorScheduleRule,
  createDoctorScheduleRule,
  updateDoctorScheduleRule,
  deleteDoctorScheduleRule,
  postPatientBooking,
  getBookingPayment,
  VerifyPatientBooking,
  postSaveSpecialty,
  getAllSpecialty,
  getDetailSpecialtyById,
  getDetailSpecialtyBySlug,
  ChangeStatusSpecialty,
  updateSpecialtyOrder,
  postSaveClinic,
  getAllClinic,
  getDetailClinicById,
  getDetailClinicBySlug,
  ChangeStatusClinic,
  updateClinicOrder,
  getClinicContentSections,
  postSaveClinicContentSection,
  EditClinicContentSection,
  DeleteClinicContentSection,
  ChangeStatusClinicContentSection,
  updateClinicContentSectionOrder,
  postSavePostCategory,
  getAllPostCategory,
  getDetailPostCategoryById,
  getPublicPostCategories,
  getPublicPostCategoryDetail,
  EditPostCategoryId,
  updatePostCategoryOrder,
  changeStatusPostCategory,
  DeletePostCategory,
  postSavePost,
  getAllPost,
  getDetailPostById,
  getPublicPostsByCategory,
  getPublicPostDetail,
  getPublicRelatedPosts,
  EditPostId,
  ChangeStatusPost,
  updatePostOrder,
  DeletePost,
  getAllPatientForDoctor,
  postSendRemedy,
  DeleteClinic,
  EditClinicId,
  getClinicDepartment,
  postSaveClinicDepartment,
  EditClinicDepartmentId,
  ChangeStatusClinicDepartment,
  EditSpecialtyId,
  DeleteSpecialty,
  getListAppoinmentForPatient,
  postCancelBookingAppointment,
  getPatientProfile,
  updatePatientProfile,
  DeleteScheduleDoctor,
  getAppointmentDoctor,
  getDoctorPatients,
  getDoctorPatientDetail,
  getDoctorPatientHistory,
  getDoctorQueue,
  getDoctorAppointmentDetail,
  getDoctorMedicalRecords,
  getAdminMedicalRecordAppointmentDetail,
  getAdminMedicalRecords,
  startDoctorExaminationVisit,
  getDoctorExaminationVisitDetail,
  ensureDoctorMedicalRecord,
  getMedicalRecordDetail,
  getAdminMedicalRecordDetail,
  saveMedicalRecordDraft,
  saveMedicalRecordPrescription,
  saveMedicalRecordParaclinicalResults,
  completeMedicalRecordVisit,
  closeMedicalRecord,
  getVisitPaymentSummary,
  collectVisitPayment,
  getAllBooking,
  getAdminBookingManagement,
  getAdminRefunds,
  confirmAdminRefund,
  updateAdminBookingStatus,
  getDoctorBookingManagement,
  updateDoctorBookingStatus,
  getPublicDoctorReviews,
  getBookingReviewEligibility,
  createBookingReview,
  getDoctorReviews,
  createDoctorReviewReply,
  updateDoctorReviewReply,
  getAdminReviews,
  updateAdminReviewVisibility,
  getAdminDashboardStatistics,
  joinVideoConsultation,
  markVideoConsultationStarted,
  getDoctorDashboardStatistics,
  buildImageSrc
};
