import {
  ADMIN_AUTH_KEY,
  CLINIC_MANAGER_AUTH_KEY,
  migrateLegacyAuthToSession,
} from "./authSessionMigration";
import sessionStorage from "redux-persist/lib/storage/session";
import getStoredState from "redux-persist/lib/getStoredState";
import { adminConfig, clinicManagerConfig } from "./reducers/rootReducer";

const encode = (value) =>
  Buffer.from(JSON.stringify(value))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const tokenFor = (payload) =>
  `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.signature`;

const createStorage = () => {
  const values = new Map();

  return {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
};

const storedAuth = (infoKey, user, token) =>
  JSON.stringify({
    isLoggedIn: JSON.stringify(true),
    [infoKey]: JSON.stringify(user),
    token: JSON.stringify(token),
  });

const readStoredAuth = (storage, key, infoKey) => {
  const persisted = JSON.parse(storage.getItem(key));
  return {
    token: JSON.parse(persisted.token),
    user: JSON.parse(persisted[infoKey]),
  };
};

test("R1 and R4 auth persist in tab-scoped session storage", () => {
  expect(adminConfig.storage).toBe(sessionStorage);
  expect(clinicManagerConfig.storage).toBe(sessionStorage);
});

test("migrated auth rehydrates through Redux Persist", async () => {
  const localStorage = createStorage();
  const token = tokenFor({ roleId: "R1", exp: Math.floor(Date.now() / 1000) + 60 });
  const user = { id: 1, roleId: "R1" };

  window.sessionStorage.clear();
  localStorage.setItem(ADMIN_AUTH_KEY, storedAuth("adminInfo", user, token));
  migrateLegacyAuthToSession({
    localStorage,
    sessionStorage: window.sessionStorage,
    pathname: "/system/dashboard",
  });

  await expect(getStoredState(adminConfig)).resolves.toMatchObject({
    isLoggedIn: true,
    adminInfo: user,
    token,
  });
  window.sessionStorage.clear();
});

test("does not overwrite an existing tab session with legacy shared auth", () => {
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const adminToken = tokenFor({ roleId: "R1", exp: Math.floor(Date.now() / 1000) + 60 });
  const clinicManagerToken = tokenFor({ roleId: "R4", exp: Math.floor(Date.now() / 1000) + 60 });

  sessionStorage.setItem(
    ADMIN_AUTH_KEY,
    storedAuth("adminInfo", { id: 1, roleId: "R1" }, adminToken)
  );
  localStorage.setItem(
    CLINIC_MANAGER_AUTH_KEY,
    storedAuth("clinicManagerInfo", { id: 4, roleId: "R4" }, clinicManagerToken)
  );

  expect(
    migrateLegacyAuthToSession({
      localStorage,
      sessionStorage,
      pathname: "/system/dashboard",
    })
  ).toBeNull();
  expect(readStoredAuth(sessionStorage, ADMIN_AUTH_KEY, "adminInfo").token).toBe(adminToken);
  expect(localStorage.getItem(CLINIC_MANAGER_AUTH_KEY)).toBeNull();
});

test("migrates a valid legacy R1 session into the first tab only", () => {
  const localStorage = createStorage();
  const adminSession = createStorage();
  const secondTabSession = createStorage();
  const token = tokenFor({ roleId: "R1", exp: Math.floor(Date.now() / 1000) + 60 });
  const user = { id: 1, roleId: "R1" };

  localStorage.setItem(ADMIN_AUTH_KEY, storedAuth("adminInfo", user, token));

  expect(
    migrateLegacyAuthToSession({
      localStorage,
      sessionStorage: adminSession,
      pathname: "/system/dashboard",
    })
  ).toBe("R1");
  expect(readStoredAuth(adminSession, ADMIN_AUTH_KEY, "adminInfo")).toEqual({ token, user });
  expect(localStorage.getItem(ADMIN_AUTH_KEY)).toBeNull();
  expect(localStorage.getItem(CLINIC_MANAGER_AUTH_KEY)).toBeNull();
  expect(
    migrateLegacyAuthToSession({
      localStorage,
      sessionStorage: secondTabSession,
      pathname: "/clinic-manager/manage-clinic",
    })
  ).toBeNull();
  expect(secondTabSession.getItem(CLINIC_MANAGER_AUTH_KEY)).toBeNull();
});

test("normalizes legacy R4 admin state into clinic-manager session storage", () => {
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const token = tokenFor({ roleId: "R4", exp: Math.floor(Date.now() / 1000) + 60 });
  const user = { id: 4, roleId: "R4" };

  localStorage.setItem(ADMIN_AUTH_KEY, storedAuth("adminInfo", user, token));

  expect(
    migrateLegacyAuthToSession({
      localStorage,
      sessionStorage,
      pathname: "/clinic-manager/manage-clinic",
    })
  ).toBe("R4");
  expect(
    readStoredAuth(sessionStorage, CLINIC_MANAGER_AUTH_KEY, "clinicManagerInfo")
  ).toEqual({ token, user });
  expect(sessionStorage.getItem(ADMIN_AUTH_KEY)).toBeNull();
  expect(localStorage.getItem(ADMIN_AUTH_KEY)).toBeNull();
});

test("clears expired legacy auth without migrating it", () => {
  const localStorage = createStorage();
  const sessionStorage = createStorage();

  localStorage.setItem(
    CLINIC_MANAGER_AUTH_KEY,
    storedAuth(
      "clinicManagerInfo",
      { id: 4, roleId: "R4" },
      tokenFor({ roleId: "R4", exp: Math.floor(Date.now() / 1000) - 60 })
    )
  );

  expect(
    migrateLegacyAuthToSession({
      localStorage,
      sessionStorage,
      pathname: "/clinic-manager/manage-clinic",
    })
  ).toBeNull();
  expect(sessionStorage.getItem(CLINIC_MANAGER_AUTH_KEY)).toBeNull();
  expect(localStorage.getItem(CLINIC_MANAGER_AUTH_KEY)).toBeNull();
});
