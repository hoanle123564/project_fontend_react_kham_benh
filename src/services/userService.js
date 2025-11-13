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
const getAllCode = (type) => {
  return axios.get(`/api/allcodes?type=${type}`);
};

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

// Lưu thông tin đặt lịch khám bệnh
const postPatientBooking = (data) => {
  return axios.post("/api/patient-book-appointment", data);
};

// Xác nhận đặt lịch khám bệnh
const VerifyPatientBooking = (data) => {
  return axios.post("/api/verify-book-appointment", data);
};

// 
const postSaveSpecialty = (data) => {
  return axios.post("/api/create-specialty", data);
};
const getAllSpecialty = () => {
  return axios.get("/api/get-specialty");
};

const getDetailSpecialtyById = (id, location) => {
  return axios.get(`/api/get-detail-specialty-by-id?id=${id}&location=${location}`);
}
export {
  handleLoginAPI,
  getAllUser,
  CreateUser,
  DeleteUser,
  EditUser,
  getAllCode,
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
  getDetailSpecialtyById
};
