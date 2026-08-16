export const TIME_PERIOD_KEYS = ["morning", "afternoon", "evening"];

export const getTimePeriod = (startTime) => {
    const match = String(startTime || "").match(/^\s*(\d{1,2})(?::\d{2})?/);
    const hour = match ? Number(match[1]) : NaN;

    if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null;
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
};

export const groupAvailableTime = (times = []) =>
    times.reduce(
        (groups, item) => {
            const period = getTimePeriod(item.startTime || item.value_vi || item.value_en);
            if (period) groups[period].push(item);
            return groups;
        },
        { morning: [], afternoon: [], evening: [] }
    );
