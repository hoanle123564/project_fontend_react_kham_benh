import axios from "axios";
import reduxStore from "./redux"; // đường dẫn store của bạn

const instance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:8080",
});

// Gửi token cho tất cả request
instance.interceptors.request.use(
  (config) => {
    const state = reduxStore.getState();

    // Lấy token từ Redux Persist của từng role
    const adminToken = state.adminAuth?.token;
    const doctorToken = state.doctor?.token;
    const patientToken = state.patient?.token;

    // Ưu tiên role nào đang đăng nhập
    const finalToken = adminToken || doctorToken || patientToken;

    if (finalToken) {
      config.headers.Authorization = `Bearer ${finalToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Luôn trả về response.data
instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.log("AXIOS ERROR:", error);
    return Promise.reject(error);
  }
);

export default instance;
