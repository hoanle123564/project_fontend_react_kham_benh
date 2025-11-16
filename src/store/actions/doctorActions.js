import actionTypes from "./actionTypes";
import { handleLogin } from "../../services/userService";

export const doctorLogin = (email, password) => {
    return async (dispatch) => {
        try {
            const res = await handleLogin({ email, password });

            if (res && res.errCode === 0 && res.user.roleId === "R2") {
                dispatch({
                    type: actionTypes.DOCTOR_LOGIN_SUCCESS,
                    data: res
                });
            } else {
                dispatch({ type: actionTypes.DOCTOR_LOGIN_FAIL });
            }
        } catch (e) {
            dispatch({ type: actionTypes.DOCTOR_LOGIN_FAIL });
        }
    };
};

export const doctorLogout = () => ({
    type: actionTypes.DOCTOR_LOGOUT
});
