import actionTypes from '../actions/actionTypes';

const initialState = {
    isLoggedIn: false,
    adminInfo: null,
    token: null
};

export default function adminAuthReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.ADMIN_LOGIN_SUCCESS:
            return {
                ...state,
                isLoggedIn: true,
                adminInfo: action.data.user,
                token: action.data.token
            };

        case actionTypes.ADMIN_LOGOUT:
            return initialState;

        default:
            return state;
    }
}
