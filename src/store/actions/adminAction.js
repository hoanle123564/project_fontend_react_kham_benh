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
  postPatientBooking,
  postSaveSpecialty,
  getAllSpecialty
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


export const GetDAllRequire = () => {
  return async (dispatch, getState) => {
    try {
      let ResPri = await getAllCode('PRICE');
      let ResPay = await getAllCode('PAYMENT');
      if (ResPri && ResPri.errCode === 0 && ResPay && ResPay.errCode === 0) {
        let data = {
          ResPri: ResPri.data,
          ResPay: ResPay.data,
        }
        let listRequire = dispatch({
          type: actionTypes.FETCH_ALL_REQUIRED,
          data: data
        });
        return listRequire;
      } else {
        dispatch(GetDAllRequireFail());
      }
    } catch (error) {
      dispatch(GetDAllRequireFail());
      console.log("GetDAllRequireFail error: ", error);
    }
  };
};
export const GetDAllRequireFail = () => ({
  type: actionTypes.FETCH_ALL_REQUIRED_FAIL,
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
        return res.data;
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

// SAVE PATIENT BOOKING
export const SavePatientBooking = (data) => {
  return async (dispatch, getState) => {
    try {
      let res = await postPatientBooking(data); // Gọi dịch vụ lưu thông tin đặt lịch khám bệnh
      if (res && res.errCode === 0) {
        dispatch({
          type: actionTypes.FETCH_SAVE_PATIENT_BOOKING,
        });
        toast.success("Save patient booking success");
        return res;
      } else {
        toast.error("You already booked this doctor for the same time slot today!");
        dispatch(SavePatientBookingFail());
      }
    } catch (error) {
      toast.error("Save patient booking failed");
      dispatch(SavePatientBookingFail());
      console.log("SavePatientBooking error: ", error);

    }
  };
}
export const SavePatientBookingFail = () => ({
  type: actionTypes.FETCH_SAVE_PATIENT_BOOKING_FAIL,
});

export const SaveSpecialty = (data) => {
  return async (dispatch, getState) => {
    try {
      let res = await postSaveSpecialty(data); // Gọi dịch vụ lưu thông tin chuyên khoa
      if (res && res.errCode === 0) {
        dispatch({
          type: actionTypes.FETCH_SAVE_SPECIALTY,
        });
        toast.success("Save specialty success");
      } else {
        toast.error("Save specialty failed");
        dispatch(SaveSpecialtyFail());
      }
      return res;

    } catch (error) {
      toast.error("Save specialty failed");
      dispatch(SaveSpecialtyFail());
      console.log("SaveSpecialty error: ", error);
    }
  }
};
export const SaveSpecialtyFail = () => ({
  type: actionTypes.FETCH_SAVE_SPECIALTY_FAIL,
});


// GET ALL SPECIALTY
export const GetAllSpecialty = () => {
  return async (dispatch, getState) => {
    try {
      let res = await getAllSpecialty(); // Gọi dịch vụ lấy tất cả chuyên khoa
      if (res && res.errCode === 0) {
        let listSpecialty = dispatch({
          type: actionTypes.FETCH_ALL_SPECIALTY,
          data: res.data,
        });
        return listSpecialty;
      } else {
        dispatch(GetAllSpecialtyFail());
      }
    } catch (error) {
      dispatch(GetAllSpecialtyFail());
      console.log("GetAllSpecialtyFail error: ", error);
    }
  };
}
export const GetAllSpecialtyFail = () => ({
  type: actionTypes.FETCH_ALL_SPECIALTY_FAIL,
});