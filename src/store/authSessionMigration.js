import { isAdminToken, isClinicManagerToken } from "../hoc/authentication";

export const ADMIN_AUTH_KEY = "persist:adminAuth";
export const CLINIC_MANAGER_AUTH_KEY = "persist:clinicManagerAuth";

const parsePersistedValue = (value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const readPersistedAuth = (storage, key, infoKey) => {
  const raw = storage.getItem(key);
  if (!raw) return null;

  try {
    const persisted = JSON.parse(raw);
    const token = parsePersistedValue(persisted.token);
    const user = parsePersistedValue(persisted[infoKey]);

    return token && user ? { token, user } : null;
  } catch {
    return null;
  }
};

const toPersistedAuth = (infoKey, auth) =>
  JSON.stringify({
    isLoggedIn: JSON.stringify(true),
    [infoKey]: JSON.stringify(auth.user),
    token: JSON.stringify(auth.token),
  });

const clearLegacyAuth = (storage) => {
  storage.removeItem(ADMIN_AUTH_KEY);
  storage.removeItem(CLINIC_MANAGER_AUTH_KEY);
};

export const migrateLegacyAuthToSession = ({
  localStorage,
  sessionStorage,
  pathname = "",
}) => {
  try {
    const hasSessionAuth =
      sessionStorage.getItem(ADMIN_AUTH_KEY) ||
      sessionStorage.getItem(CLINIC_MANAGER_AUTH_KEY);

    if (hasSessionAuth) {
      clearLegacyAuth(localStorage);
      return null;
    }

    const adminAuth = readPersistedAuth(
      localStorage,
      ADMIN_AUTH_KEY,
      "adminInfo"
    );
    const clinicManagerAuth = readPersistedAuth(
      localStorage,
      CLINIC_MANAGER_AUTH_KEY,
      "clinicManagerInfo"
    );
    const candidates = [];

    if (adminAuth && isAdminToken(adminAuth.token)) {
      candidates.push({ roleId: "R1", ...adminAuth });
    }
    if (clinicManagerAuth && isClinicManagerToken(clinicManagerAuth.token)) {
      candidates.push({ roleId: "R4", ...clinicManagerAuth });
    }
    if (adminAuth && isClinicManagerToken(adminAuth.token)) {
      candidates.push({ roleId: "R4", ...adminAuth });
    }

    const preferredRole = /(^|\/)clinic-manager(?:\/|$)/.test(pathname)
      ? "R4"
      : "R1";
    const selected = candidates.find(({ roleId }) => roleId === preferredRole) || candidates[0];

    if (selected?.roleId === "R1") {
      sessionStorage.setItem(
        ADMIN_AUTH_KEY,
        toPersistedAuth("adminInfo", selected)
      );
    } else if (selected?.roleId === "R4") {
      sessionStorage.setItem(
        CLINIC_MANAGER_AUTH_KEY,
        toPersistedAuth("clinicManagerInfo", selected)
      );
    }

    clearLegacyAuth(localStorage);
    return selected?.roleId || null;
  } catch {
    return null;
  }
};
