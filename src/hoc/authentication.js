import locationHelperBuilder from "redux-auth-wrapper/history4/locationHelper";
import { connectedRouterRedirect } from "redux-auth-wrapper/history4/redirect";
import { jwtDecode } from "jwt-decode";

export const isTokenValid = (token) => {
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        return decoded.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

const hasTokenRole = (token, roleId) => {
    if (!isTokenValid(token)) return false;

    try {
        return jwtDecode(token).roleId === roleId;
    } catch {
        return false;
    }
};

export const isAdminToken = (token) => hasTokenRole(token, "R1");
export const isClinicManagerToken = (token) => hasTokenRole(token, "R4");

// ===================================
export const adminIsAuthenticated = connectedRouterRedirect({
    authenticatedSelector: state =>
        state.adminAuth?.isLoggedIn && isAdminToken(state.adminAuth?.token),

    wrapperDisplayName: "AdminIsAuthenticated",
    redirectPath: "/login",
    allowRedirectBack: true
});

export const clinicManagerIsAuthenticated = connectedRouterRedirect({
    authenticatedSelector: state =>
        state.clinicManagerAuth?.isLoggedIn && isClinicManagerToken(state.clinicManagerAuth?.token),

    wrapperDisplayName: "ClinicManagerIsAuthenticated",
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
