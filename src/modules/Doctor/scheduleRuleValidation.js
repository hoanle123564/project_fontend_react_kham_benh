const toTimeMinutes = (value) => {
  const [hours, minutes] = String(value || "").slice(0, 5).split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

const isActiveFixedRule = (rule = {}) =>
  Number(rule.isActive) !== 0 && !rule._deleted && (!rule.ruleType || rule.ruleType === "FIXED");

export const fixedRulesOverlap = (left = {}, right = {}) => {
  if (!isActiveFixedRule(left) || !isActiveFixedRule(right)) return false;
  if (
    left.doctorId !== undefined &&
    right.doctorId !== undefined &&
    Number(left.doctorId) !== Number(right.doctorId)
  ) {
    return false;
  }
  if (Number(left.weekday) !== Number(right.weekday)) return false;
  if ((left.appointmentTypeId || null) !== (right.appointmentTypeId || null)) return false;

  const leftStart = toTimeMinutes(left.startTime);
  const leftEnd = toTimeMinutes(left.endTime);
  const rightStart = toTimeMinutes(right.startTime);
  const rightEnd = toTimeMinutes(right.endTime);

  if ([leftStart, leftEnd, rightStart, rightEnd].some((value) => value === null)) return false;
  return leftStart < rightEnd && leftEnd > rightStart;
};

export const getFixedSlotConflictKeys = (slots = []) => {
  const conflicts = new Set();

  for (let leftIndex = 0; leftIndex < slots.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < slots.length; rightIndex += 1) {
      const left = slots[leftIndex];
      const right = slots[rightIndex];
      if (!fixedRulesOverlap(left, right)) continue;

      if (left._key || left.id) conflicts.add(left._key || String(left.id));
      if (right._key || right.id) conflicts.add(right._key || String(right.id));
    }
  }

  return conflicts;
};
