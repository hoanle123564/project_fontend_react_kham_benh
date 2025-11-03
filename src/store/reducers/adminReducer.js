import actionTypes from "../actions/actionTypes";

const initialState = {
  genderArr: [],
  positionArr: [],
  roleArr: [],
  user: [],
  doctor: [],
  AllDoctor: [],
  DetailDoctor: {},
};

const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    // gender
    case actionTypes.FETCH_GENDER:
      state.genderArr = action.data;
      return {
        ...state,
      };

    case actionTypes.FETCH_GENDER_FAIL:
      state.genderArr = [];
      return {
        ...state,
      };
    // positon
    case actionTypes.FETCH_POSITION:
      state.positionArr = action.data;
      return {
        ...state,
      };

    case actionTypes.FETCH_POSITION_FAIL:
      state.positionArr = [];
      return {
        ...state,
      };
    // role
    case actionTypes.FETCH_ROLE:
      state.roleArr = action.data;
      return {
        ...state,
      };

    case actionTypes.FETCH_ROLE_FAIL:
      state.roleArr = [];
      return {
        ...state,
      };
    // save / create user
    case actionTypes.SAVE_USER:
      return {
        ...state,
      };
    case actionTypes.SAVE_USER_FAILD:
      return {
        ...state,
      };
    // get all user
    case actionTypes.FETCH_USERS:
      state.user = action.data;
      return {
        ...state,
      };

    case actionTypes.FETCH_USERS_FAIL:
      state.user = [];
      return {
        ...state,
      };

    // get doctor
    case actionTypes.FETCH_DOCTOR:
      state.doctor = action.data;
      return {
        ...state,
      };

    case actionTypes.FETCH_DOCTOR_FAIL:
      state.doctor = [];
      return {
        ...state,
      };

    // get all doctor
    case actionTypes.FETCH_ALL_DOCTOR:
      state.AllDoctor = action.data;
      return {
        ...state,
      };
    case actionTypes.FETCH_ALL_DOCTOR_FAIL:
      state.AllDoctor = [];
      return {
        ...state,
      };

    // get detail doctor
    case actionTypes.GET_DETAIL_DOCTOR:
      state.DetailDoctor = action.data;
      return {
        ...state,
      };
    case actionTypes.GET_DETAIL_DOCTOR_FAIL:
      state.DetailDoctor = {};
      return {
        ...state,
      };
    default:
      return state;
  }
};

export default adminReducer;
