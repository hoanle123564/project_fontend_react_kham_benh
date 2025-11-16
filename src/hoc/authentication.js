import locationHelperBuilder from "redux-auth-wrapper/history4/locationHelper";
import { connectedRouterRedirect } from "redux-auth-wrapper/history4/redirect";
import { jwtDecode } from "jwt-decode";

const isTokenValid = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        return decoded.exp * 1000 > Date.now();
    } catch (e) {
        return false;
    }
};

// Route yêu cầu đăng nhập
export const userIsAuthenticated = connectedRouterRedirect({
    authenticatedSelector: () => isTokenValid(),
    wrapperDisplayName: "UserIsAuthenticated",
    redirectPath: "/login",
    allowRedirectBack: false,   // ❗ KHÔNG cho trở về URL cũ
});

// Route KHÔNG yêu cầu đăng nhập
export const userIsNotAuthenticated = connectedRouterRedirect({
    authenticatedSelector: () => !isTokenValid(),
    wrapperDisplayName: "UserIsNotAuthenticated",
    redirectPath: "/",          // ❗ KHÔNG dùng redirect-back
    allowRedirectBack: false,
});
