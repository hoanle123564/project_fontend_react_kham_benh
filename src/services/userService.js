import axios from "../axios";


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

// send remedy
const postSendRemedy = (data) => {
  return axios.post("/api/send-remedy", data);
};
export {
  handleLoginAPI,
  getAllUser,
  CreateUser,
  DeleteUser,
  EditUser,
  getLookUp,
  getDoctor,
  getAllDoctor,
  postDetailDoctor,
  getDetailDoctor,
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
  getAllPatientForDoctor,
  postSendRemedy,
  DeleteClinic,
  EditClinicId,
  EditSpecialtyId,
  DeleteSpecialty,
  getListAppoinmentForPatient,
  postCancelBookingAppointment,
  DeleteScheduleDoctor
};
