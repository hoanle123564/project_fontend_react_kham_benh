import actionTypes from "../actions/actionTypes";

const initialState = {
  isLoggedIn: false,
  clinicManagerInfo: null,
  token: null,
};

export default function clinicManagerAuthReducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.CLINIC_MANAGER_LOGIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true,
        clinicManagerInfo: action.data.user,
        token: action.data.token,
      };

    case actionTypes.CLINIC_MANAGER_LOGOUT:
      return initialState;

    case actionTypes.UPDATE_CLINIC_MANAGER_INFO:
      return {
        ...state,
        clinicManagerInfo: action.data,
      };

    default:
      return state;
  }
}
