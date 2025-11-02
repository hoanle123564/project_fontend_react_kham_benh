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
export {
  handleLoginAPI,
  getAllUser,
  CreateUser,
  DeleteUser,
  EditUser,
  getAllCode,
  getDoctor,
};
