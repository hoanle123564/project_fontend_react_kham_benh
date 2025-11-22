import actionTypes from "./actionTypes";
import { handleLogin } from "../../services/userService";

export const patientLogin = (email, password) => {
    return async (dispatch) => {
        try {
            const res = await handleLogin({ email, password });

            if (res && res.errCode === 0 && res.user.roleId === "R3") {
                dispatch({
                    type: actionTypes.PATIENT_LOGIN_SUCCESS,
                    data: res
                });
            } else {
                dispatch({ type: actionTypes.PATIENT_LOGIN_FAIL });
            }
        } catch (e) {
            dispatch({ type: actionTypes.PATIENT_LOGIN_FAIL });
        }
    };
};

export const patientLogout = () => ({
    type: actionTypes.PATIENT_LOGOUT
});

export const fetchUpdatePatientInfo = (data) => {
    return (dispatch) => {
        try {
            dispatch({
                type: actionTypes.PATIENT_EDIT_SUCCESS,
                data: data
            });
        } catch (e) {
        }
    };
};