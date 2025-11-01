import actionTypes from "../actions/actionTypes";

const initialState = {
  genderArr: [],
  positionArr: [],
  roleArr: [],
  user: [],
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
    default:
      return state;
  }
};

export default adminReducer;
