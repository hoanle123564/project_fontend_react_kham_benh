import axios from "axios";
import reduxStore from "./redux"; // đường dẫn store

const baseConfig = {
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:8080",
};

const getTokenByRole = (role) => {
  const state = reduxStore.getState();

  switch (role) {
    case "admin":
      return state.adminAuth?.token;
    case "doctor":
      return state.doctor?.token;
    case "patient":
      return state.patient?.token;
    default:
      return null;
  }
};

const getRoleByPath = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const pathname = window.location?.pathname || "";

  if (pathname.startsWith("/system")) {
    return "admin";
  }

  if (pathname.startsWith("/doctor")) {
    return "doctor";
  }

  if (pathname.startsWith("/patient") || pathname.startsWith("/appointments")) {
    return "patient";
  }

  return null;
};

const attachRoleToken = (config, role) => {
  const token = getTokenByRole(role);
  config.headers = config.headers || {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }

  return config;
};

const unwrapResponse = (response) => response.data;

const handleResponseError = (error) => {
  console.log("AXIOS ERROR:", error);
  return Promise.reject(error);
};

const createInstance = (role) => {
  const client = axios.create(baseConfig);

  client.interceptors.request.use(
    (config) => {
      const requestRole = config.authRole || role || getRoleByPath();

      if (requestRole) {
        return attachRoleToken(config, requestRole);
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(unwrapResponse, handleResponseError);

  return client;
};

const instance = createInstance();
const adminAxios = createInstance("admin");
const doctorAxios = createInstance("doctor");
const patientAxios = createInstance("patient");

export { adminAxios, doctorAxios, patientAxios };
export default instance;
