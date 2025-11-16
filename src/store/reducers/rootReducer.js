import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import appReducer from "./appReducer";
import adminReducer from "./adminReducer";
import patientReducer from "./patientReducer";
import doctorReducer from "./doctorReducer";
import adminAuthReducer from "./adminAuthReducer";  // <--- thêm mới

import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

const persistCommonConfig = {
  storage,
  stateReconciler: autoMergeLevel2,
};

// Persist cho từng role riêng
const patientConfig = {
  ...persistCommonConfig,
  key: "patient",
  whitelist: ["isLoggedIn", "patientInfo", "token"],
};

const doctorConfig = {
  ...persistCommonConfig,
  key: "doctor",
  whitelist: ["isLoggedIn", "doctorInfo", "token"],
};

const adminConfig = {
  ...persistCommonConfig,
  key: "adminAuth",
  whitelist: ["isLoggedIn", "adminInfo", "token"],
};

const appPersistConfig = {
  ...persistCommonConfig,
  key: "app",
  whitelist: ["language"],
};

export default function createRootReducer(history) {
  return combineReducers({
    router: connectRouter(history),

    // AUTH
    patient: persistReducer(patientConfig, patientReducer),
    doctor: persistReducer(doctorConfig, doctorReducer),
    adminAuth: persistReducer(adminConfig, adminAuthReducer),

    // DATA CRUD
    admin: adminReducer,

    // APP SETTINGS
    app: persistReducer(appPersistConfig, appReducer),
  });
}
