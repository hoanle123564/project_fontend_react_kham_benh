const initialState = {
    isLoggedIn: false,
    patientInfo: null,
    token: null
};

export default function patientReducer(state = initialState, action) {
    switch (action.type) {
        case 'PATIENT_LOGIN_SUCCESS':
            return {
                ...state,
                isLoggedIn: true,
                patientInfo: action.data.user,
                token: action.data.token
            };

        case 'PATIENT_LOGOUT':
            return initialState;

        default:
            return state;
    }
}
