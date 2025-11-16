import actionTypes from '../actions/actionTypes';
const initialState = {
    isLoggedIn: false,
    doctorInfo: null,
    token: null
};

export default function doctorReducer(state = initialState, action) {
    switch (action.type) {
        case action.TypesDOCTOR_LOGIN_SUCCESS:
            return {
                ...state,
                isLoggedIn: true,
                doctorInfo: action.data.user,
                token: action.data.token
            };

        case actionTypes.DOCTOR_LOGOUT:
            return initialState;

        default:
            return state;
    }
}
