import {
    getDateRangeFilters,
    getDateRangeValue,
    validateDateRange,
} from "./dateRangeUtils";

describe("date range utilities", () => {
    it("converts selected local dates to ISO dates and back", () => {
        expect(getDateRangeFilters([new Date(2026, 7, 13), new Date(2026, 7, 20)])).toEqual({
            startDate: "2026-08-13",
            endDate: "2026-08-20",
        });

        expect(getDateRangeValue("2026-08-13", "2026-08-20")).toEqual([
            new Date(2026, 7, 13),
            new Date(2026, 7, 20),
        ]);
    });

    it("validates empty, incomplete, invalid, and chronological ranges", () => {
        expect(validateDateRange()).toBe("");
        expect(validateDateRange("2026-08-13", "")).toBe("incomplete");
        expect(validateDateRange("2026-08-32", "2026-08-20")).toBe("invalid");
        expect(validateDateRange("2026-08-20", "2026-08-13")).toBe("invalid");
        expect(validateDateRange("2026-08-13", "2026-08-20")).toBe("");
    });
});
