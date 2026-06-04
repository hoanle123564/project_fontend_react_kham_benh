import axios from "../axios";

const buildImageSrc = (image) => {
  if (!image) {
    return "";
  }

  return String(image).startsWith("data:image")
    ? image
    : `data:image/jpeg;base64,${image}`;
};

// Đăng nhập
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
  return axios.delete("/api/delete-user", {
    data: {
      id: UserId,
    },
  });
};

// Cập nhật thông tin người dùng
const EditUser = (data) => {
  return axios.put("/api/edit-user", data);
};
const changePassword = (data) => {
  return axios.put("/api/change-password", data);
};

// Lấy tất cả thuộc tính
const getLookUp = (type) => {
  return axios.get(`/api/lookup?type=${type}`);
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
  return axios.post("/api/save-doctor", data);
};

// Lấy thông tin chi tiết bác sĩ
const getDetailDoctor = (doctorId) => {
  return axios.get(`/api/detail-doctor?id=${doctorId}`);
};

// Lấy danh sách bác sĩ liên quan (cùng chuyên khoa)
const getRelatedDoctorsService = (doctorId) => {
  return axios.get(`/api/get-related-doctors?id=${doctorId}`);
};

// Lưu lịch trình bác sĩ
const postScheduleDoctor = (data) => {
  return axios.post("/api/create-schedule-doctor", data);
};

// Lấy lịch trình bác sĩ
const getScheduleDoctor = (doctorId, date) => {
  return axios.get(`/api/get-schedule-doctor?doctorId=${doctorId}&date=${date}`);
};

// Lấy danh sách bệnh nhân theo ngày khám của bác sĩ
const getAllPatientForDoctor = (doctorId, date) => {
  return axios.get(`/api/get-list-patient-for-doctor?id=${doctorId}&date=${date}`);
};

const DeleteScheduleDoctor = (ScheduleId) => {
  return axios.delete("/api/delete-schedule-doctor", {
    data: {
      id: ScheduleId,
    },
  });
};
const getAppointmentDoctor = (doctorId) => {
  return axios.get(`/api/get-list-booking-appointment-doctor?id=${doctorId}`);
};
//==========================================
// Lưu thông tin đặt lịch khám bệnh
const postPatientBooking = (data) => {
  return axios.post("/api/patient-book-appointment", data);
};

// Xác nhận đặt lịch khám bệnh
const VerifyPatientBooking = (data) => {
  return axios.post("/api/verify-book-appointment", data);
};

const getListAppoinmentForPatient = (patientId) => {
  return axios.get(`/api/get-list-booking-appointment-patient?id=${patientId}`);
}

const postCancelBookingAppointment = (data) => {
  return axios.post("/api/cancel-book-appointment", data);
};

//==========================================
// specialty
const postSaveSpecialty = (data) => {
  return axios.post("/api/create-specialty", data);
};
const getAllSpecialty = () => {
  return axios.get("/api/get-specialty");
};

const getDetailSpecialtyById = (id, location) => {
  return axios.get(`/api/get-detail-specialty-by-id?id=${id}&location=${location}`);
}

const EditSpecialtyId = (data) => {
  return axios.put("/api/edit-specialty", data);
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

const getAllClinic = () => {
  return axios.get("/api/get-clinic");
};

const getDetailClinicById = (id, location) => {
  return axios.get(`/api/get-detail-clinic-by-id?id=${id}&location=${location}`);
}

const DeleteClinic = (ClinicId) => {
  return axios.delete("/api/delete-clinic", {
    data: {
      id: ClinicId,
    },
  });
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
  return axios.post("/api/send-remedy", data);
};

// get list booking
const getAllBooking = () => {
  return axios.get("/api/get-all-list-booking");
};

const getAdminDashboardStatistics = (revenueType = "month", topDoctorType = "month") => {
  return axios.get(`/api/admin/dashboard-statistics?revenueType=${revenueType}&topDoctorType=${topDoctorType}`);
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
  getRelatedDoctorsService,
  postScheduleDoctor,
  getScheduleDoctor,
  postPatientBooking,
  VerifyPatientBooking,
  postSaveSpecialty,
  getAllSpecialty,
  getDetailSpecialtyById,
  postSaveClinic,
  getAllClinic,
  getDetailClinicById,
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
  EditSpecialtyId,
  DeleteSpecialty,
  getListAppoinmentForPatient,
  postCancelBookingAppointment,
  DeleteScheduleDoctor,
  getAppointmentDoctor,
  getAllBooking,
  getAdminDashboardStatistics,
  buildImageSrc
};
