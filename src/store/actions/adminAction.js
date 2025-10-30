import actionTypes from "./actionTypes";
import { getAllCode } from "../../services/userService";

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
