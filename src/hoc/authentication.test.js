import { isClinicManagerToken } from "./authentication";

const encode = (value) =>
  Buffer.from(JSON.stringify(value))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const tokenFor = (payload) => `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.signature`;

test("clinic-manager guard only accepts an unexpired R4 token", () => {
  const future = Math.floor(Date.now() / 1000) + 60;

  expect(isClinicManagerToken(tokenFor({ roleId: "R4", exp: future }))).toBe(true);
  expect(isClinicManagerToken(tokenFor({ roleId: "R1", exp: future }))).toBe(false);
  expect(isClinicManagerToken(tokenFor({ roleId: "R4", exp: future - 120 }))).toBe(false);
});
