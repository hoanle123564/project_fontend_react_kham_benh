import locationHelperBuilder from "redux-auth-wrapper/history4/locationHelper";
import { connectedRouterRedirect } from "redux-auth-wrapper/history4/redirect";
import { jwtDecode } from "jwt-decode";

const isTokenValid = (token) => {
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        return decoded.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

// ===================================
export const adminIsAuthenticated = connectedRouterRedirect({
    authenticatedSelector: state =>
        state.adminAuth?.isLoggedIn && isTokenValid(state.adminAuth?.token),

    wrapperDisplayName: "AdminIsAuthenticated",
    redirectPath: "/login",
    allowRedirectBack: true
});

export const doctorIsAuthenticated = connectedRouterRedirect({
    authenticatedSelector: state =>
        state.doctor?.isLoggedIn && isTokenValid(state.doctor?.token),

    wrapperDisplayName: "DoctorIsAuthenticated",
    redirectPath: "/login",
    allowRedirectBack: true
});

export const patientIsAuthenticated = connectedRouterRedirect({
    authenticatedSelector: state =>
        state.patient?.isLoggedIn && isTokenValid(state.patient?.token),

    wrapperDisplayName: "PatientIsAuthenticated",
    redirectPath: "/home",
    allowRedirectBack: true
});
