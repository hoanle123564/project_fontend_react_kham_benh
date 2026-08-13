const toIsoDate = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const isIsoDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

export const getDateRangeFilters = (dates = []) => ({
    startDate: toIsoDate(dates[0]),
    endDate: toIsoDate(dates[1]),
});

export const getDateRangeValue = (startDate = "", endDate = "") => [startDate, endDate]
    .filter(Boolean)
    .map((value) => {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day);
    });

export const validateDateRange = (startDate = "", endDate = "") => {
    if (!startDate && !endDate) return "";
    if (!startDate || !endDate) return "incomplete";
    if (!isIsoDate(startDate) || !isIsoDate(endDate) || startDate > endDate) return "invalid";
    return "";
};
