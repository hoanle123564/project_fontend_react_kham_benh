import { fixedRulesOverlap, getFixedSlotConflictKeys } from "./scheduleRuleValidation";

const slot = (overrides = {}) => ({
  _key: "slot",
  ruleType: "FIXED",
  weekday: 1,
  appointmentTypeId: "AT1",
  startTime: "09:00",
  endTime: "10:00",
  isActive: 1,
  ...overrides,
});

test("fixed schedule overlap uses half-open ranges and same type/day scope", () => {
  expect(fixedRulesOverlap(slot(), slot({ _key: "other", startTime: "09:30" }))).toBe(true);
  expect(fixedRulesOverlap(slot(), slot({ _key: "other" }))).toBe(true);
  expect(fixedRulesOverlap(slot(), slot({ _key: "other", startTime: "10:00", endTime: "11:00" }))).toBe(false);
  expect(fixedRulesOverlap(slot(), slot({ _key: "other", weekday: 2 }))).toBe(false);
  expect(fixedRulesOverlap(slot({ doctorId: 1 }), slot({ _key: "other", doctorId: 2 }))).toBe(false);
  expect(fixedRulesOverlap(slot(), slot({ _key: "other", appointmentTypeId: "AT2" }))).toBe(false);
  expect(fixedRulesOverlap(slot(), slot({ _key: "other", isActive: 0 }))).toBe(false);
});

test("conflict keys include every slot in an overlapping pair", () => {
  const conflicts = getFixedSlotConflictKeys([
    slot({ _key: "first" }),
    slot({ _key: "second", startTime: "09:30" }),
    slot({ _key: "third", startTime: "10:00", endTime: "11:00" }),
  ]);

  expect([...conflicts]).toEqual(["first", "second"]);
});
