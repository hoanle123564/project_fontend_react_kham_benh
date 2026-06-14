import actionTypes from "./actionTypes";
import { handleLoginAPI } from "../../services/userService";

export const adminLogin = (email, password) => {
    return async (dispatch) => {
        try {
            const res = await handleLoginAPI(email, password);

            if (res && res.errCode === 0 && ["R1", "R4"].includes(res.user.roleId)) {
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
