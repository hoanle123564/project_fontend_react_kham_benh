import actionTypes from "./actionTypes";
import {
  getAllCode,
  CreateUser,
  getAllUser,
  DeleteUser,
  EditUser,
  getDoctor,
  getAllDoctor,
  postDetailDoctor,
  getDetailDoctor,
} from "../../services/userService";
import { toast } from "react-toastify";
// GENDDER
export const fetchGender = () => {
  return async (dispatch, getState) => {
    try {
      let res = await getAllCode("GENDER");
      if (res && res.errCode === 0) {
        let gender = dispatch({
          type: actionTypes.FETCH_GENDER,
          data: res.data,
        });
        return gender;
      } else {
        dispatch(fetchGenderFail());
      }
    } catch (error) {
      dispatch(fetchGenderFail());
      console.log("fetchGenderStart error: ", error);
    }
  };
};

export const fetchGenderFail = () => ({
  type: actionTypes.FETCH_GENDER_FAIL,
});

// POSITION
export const fetchPosition = () => {
  return async (dispatch, getState) => {
    try {
      let res = await getAllCode("POSITION");
      if (res && res.errCode === 0) {
        let position = dispatch({
          type: actionTypes.FETCH_POSITION,
          data: res.data,
        });
        return position;
      } else {
        dispatch(fetchPositionFail());
      }
    } catch (error) {
      dispatch(fetchPositionFail());
      console.log("fetchPosition error: ", error);
    }
  };
};

export const fetchPositionFail = () => ({
  type: actionTypes.FETCH_POSITION_FAIL,
});

// ROLE
export const fetchRole = () => {
  return async (dispatch, getState) => {
    try {
      let res = await getAllCode("ROLE");
      if (res && res.errCode === 0) {
        let role = dispatch({
          type: actionTypes.FETCH_ROLE,
          data: res.data,
        });
        return role;
      } else {
        dispatch(fetchRoleFail());
      }
    } catch (error) {
      dispatch(fetchRoleFail());
      console.log("fetchRole error: ", error);
    }
  };
};

export const fetchRoleFail = () => ({
  type: actionTypes.FETCH_ROLE_FAIL,
});

// SAVE / CREATE USER
export const saveUser = (dataUser) => {
  return async (dispatch, getState) => {
    try {
      let res = await CreateUser(dataUser);
      if (res?.errCode === 0) {
        toast.success("Create user success");
        dispatch(fetchAllUser());
      }
    } catch (error) {
      dispatch(fetchRoleFail());
      console.log("fetchRole error: ", error);
    }
  };
};

// GET ALL USERS
export const fetchAllUser = () => {
  return async (dispatch, getState) => {
    try {
      let res = await getAllUser("ALL");
      console.log("getuser", res);

      let res1 = await getDoctor(3);
      console.log("getDoctor", res1);

      if (res && res.errCode === 0) {
        let listUser = dispatch({
          type: actionTypes.FETCH_USERS,
          data: res.users,
        });
        return listUser;
      } else {
        dispatch(fetchRoleFail());
      }
    } catch (error) {
      dispatch(fetchRoleFail());
      console.log("fetchRole error: ", error);
    }
  };
};

export const fetchAllUserFail = () => ({
  type: actionTypes.FETCH_USERS_FAIL,
});

// DELETE USER
export const fetchDeleteUser = (UserId) => {
  return async (dispatch, getState) => {
    try {
      let res = await DeleteUser(UserId);
      if (res && res.errCode === 0) {
        toast.success("Delete user success");
        dispatch({
          type: actionTypes.DELETE_USER,
        });
        dispatch(fetchAllUser());
      } else {
        toast.error("Delete user failed");
        dispatch(fetchDeleteUserFail());
      }
    } catch (error) {
      dispatch(fetchDeleteUserFail());
      console.log("fetchDeleteUserFail error: ", error);
    }
  };
};

export const fetchDeleteUserFail = () => ({
  type: actionTypes.DELETE_USER_FAILD,
});

// EDIT USERS
export const fetchEditUser = (User) => {
  return async (dispatch, getState) => {
    try {
      let res = await EditUser(User);
      if (res && res.errCode === 0) {
        toast.success("Update user success");
        dispatch({
          type: actionTypes.FETCH_EDIT_USERS,
        });
        dispatch(fetchAllUser());
      } else {
        toast.error("Update user failed");
        dispatch(fetchEditUserFail());
      }
    } catch (error) {
      dispatch(fetchEditUserFail());
      console.log("fetchEditUser error: ", error);
    }
  };
};

export const fetchEditUserFail = () => ({
  type: actionTypes.FETCH_EDIT_USERS_FAIL,
});

export const fetchTopDoctor = () => {
  return async (dispatch, getState) => {
    try {
      let res = await getDoctor(7);

      if (res && res.errCode === 0) {
        let listUser = dispatch({
          type: actionTypes.FETCH_DOCTOR,
          data: res.data,
        });
        return listUser;
      } else {
        dispatch(fetchRoleFail());
      }
    } catch (error) {
      dispatch(fetchRoleFail());
      console.log("fetchTopDoctorFail error: ", error);
    }
  };
};

export const fetchTopDoctorFail = () => ({
  type: actionTypes.FETCH_DOCTOR_FAIL,
});

export const fetchAllDoctor = () => {
  return async (dispatch, getState) => {
    try {
      let res = await getAllDoctor(); // Gọi dịch vụ lấy tất cả bác sĩ
      if (res && res.errCode === 0) {
        let listDoctor = dispatch({
          type: actionTypes.FETCH_ALL_DOCTOR,
          data: res.data,
        });
        return listDoctor;
      } else {
        dispatch(fetchAllDoctorFail());
      }
    } catch (error) {
      dispatch(fetchAllDoctorFail());
      console.log("fetchAllDoctorFail error: ", error);
    }
  };
};
export const fetchAllDoctorFail = () => ({
  type: actionTypes.FETCH_ALL_DOCTOR_FAIL,
});

export const SaveDetailDoctor = (data) => {
  return async (dispatch, getState) => {
    try {
      let res = await postDetailDoctor(data); // Gọi dịch vụ lấy tất cả bác sĩ
      if (res && res.errCode === 0) {
        toast.success("Save detail doctor success");
        dispatch({
          type: actionTypes.SAVE_DETAIL_DOCTOR,
        });
      } else {
        toast.success("Save detail doctor failed");
        dispatch(fetchAllDoctorFail());
      }
    } catch (error) {
      dispatch(fetchAllDoctorFail());
      console.log("SaveDetailDoctor error: ", error);
    }
  };
};
export const SaveDetailDoctorFail = () => ({
  type: actionTypes.SAVE_DETAIL_DOCTOR_FAIL,
});

export const GetDetailDoctor = (doctorId) => {
  return async (dispatch, getState) => {
    try {
      let res = await getDetailDoctor(doctorId); // Gọi dịch vụ lấy tất cả bác sĩ
      if (res && res.errCode === 0) {
        dispatch({
          type: actionTypes.GET_DETAIL_DOCTOR,
          data: res.data,
        });
      } else {
        dispatch(GetDetailDoctorFail());
      }
    } catch (error) {
      dispatch(GetDetailDoctorFail());
      console.log("SaveDetailDoctor error: ", error);
    }
  };
};
export const GetDetailDoctorFail = () => ({
  type: actionTypes.GET_DETAIL_DOCTOR_FAIL,
});

// GET ALL HOUR
export const fetchAllHour = () => {
  return async (dispatch, getState) => {
    try {
      let res = await getAllCode('TIME'); // Gọi dịch vụ lấy tất cả bác sĩ
      if (res && res.errCode === 0) {
        let listHour = dispatch({
          type: actionTypes.FETCH_ALL_HOUR,
          data: res.data,
        });
        return listHour;
      } else {
        dispatch(fetchAllHourFail());
      }
    } catch (error) {
      dispatch(fetchAllHourFail());
      console.log("fetchAllHourFail error: ", error);
    }
  };
};
export const fetchAllHourFail = () => ({
  type: actionTypes.FETCH_ALL_HOUR_FAIL,
});