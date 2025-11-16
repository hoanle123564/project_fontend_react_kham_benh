import actionTypes from "./actionTypes";
import { handleLogin } from "../../services/userService";

export const adminLogin = (email, password) => {
    return async (dispatch) => {
        try {
            const res = await handleLogin({ email, password });

            if (res && res.errCode === 0 && res.user.roleId === "R1") {
                dispatch({
                    type: actionTypes.ADMIN_LOGIN_SUCCESS,
                    data: res
                });
            } else {
                dispatch({ type: actionTypes.ADMIN_LOGIN_FAIL });
            }
        } catch (e) {
            dispatch({ type: actionTypes.ADMIN_LOGIN_FAIL });
        }
    };
};

export const adminLogout = () => ({
    type: actionTypes.ADMIN_LOGOUT
});
