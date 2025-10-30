import actionTypes from "../actions/actionTypes";

const initialState = {
  genderArr: [],
  positionArr: [],
  roleArr: [],
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

    default:
      return state;
  }
};

export default adminReducer;
