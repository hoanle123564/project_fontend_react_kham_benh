import actionTypes from '../actions/actionTypes';

const initialState = {
    isLoggedIn: false,
    patientInfo: null,
    token: null,
    listAppointment: [],

};

export default function patientReducer(state = initialState, action) {
    switch (action.type) {
        case actionTypes.PATIENT_LOGIN_SUCCESS:
            return {
                ...state,
                isLoggedIn: true,
                patientInfo: action.data.user,
                token: action.data.token
            };

        case actionTypes.PATIENT_LOGOUT:
            return initialState;

        case actionTypes.FETCH_LIST_APPOINTMENT_FOR_PATIENT:
            return {
                ...state,
                listAppointment: action.data,
            };
        case actionTypes.FETCH_LIST_APPOINTMENT_FOR_PATIENT_FAIL:
            return {
                ...state,
                listAppointment: [],
            };

        default:
            return state;
    }
}
