import { getDateRangeFilters, validateDateRange } from "../../../../utils/dateRangeUtils";

export const EMPTY_APPOINTMENT_FILTERS = Object.freeze({
    startDate: "",
    endDate: "",
    statusId: "",
    appointmentTypeId: "",
});

export const BOOKING_STATUS_IDS = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];

export { getDateRangeFilters };

const getTextValue = (value) => (typeof value === "string" ? value.trim() : "");

export const normalizeAppointmentFilters = (filters = {}) => ({
    startDate: getTextValue(filters.startDate),
    endDate: getTextValue(filters.endDate),
    statusId: getTextValue(filters.statusId),
    appointmentTypeId: getTextValue(filters.appointmentTypeId),
});

export const validateAppointmentDateRange = (filters = {}) => {
    const { startDate, endDate } = normalizeAppointmentFilters(filters);

    return validateDateRange(startDate, endDate);
};

export const buildAppointmentQuery = (filters = {}, search = "") => {
    const normalizedFilters = normalizeAppointmentFilters(filters);
    const normalizedSearch = getTextValue(search);
    const query = {};

    Object.keys(normalizedFilters).forEach((key) => {
        if (normalizedFilters[key]) {
            query[key] = normalizedFilters[key];
        }
    });

    if (normalizedSearch) {
        query.search = normalizedSearch;
    }

    return query;
};

export const clearAppointmentFilters = (search = "") => ({
    filters: { ...EMPTY_APPOINTMENT_FILTERS },
    search: typeof search === "string" ? search : "",
});

export const hasAppointmentCriteria = (filters = {}, search = "") =>
    Object.values(normalizeAppointmentFilters(filters)).some(Boolean) || Boolean(getTextValue(search));

export const getAppointmentListState = (appointments, filters = {}, search = "") => {
    if (Array.isArray(appointments) && appointments.length > 0) return "results";
    return hasAppointmentCriteria(filters, search) ? "no-results" : "empty";
};

export const getStatusOptionsWithFallback = (lookupItems = []) => {
    const lookupByKey = (Array.isArray(lookupItems) ? lookupItems : []).reduce((items, item) => {
        if (BOOKING_STATUS_IDS.includes(item?.keyMap)) {
            items[item.keyMap] = item;
        }
        return items;
    }, {});

    return BOOKING_STATUS_IDS.map((keyMap) => lookupByKey[keyMap] || { keyMap });
};
