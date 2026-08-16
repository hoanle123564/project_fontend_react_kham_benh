import { getTimePeriod, groupAvailableTime } from "./doctorScheduleTimeUtils";

describe("doctor schedule time periods", () => {
    it("maps the requested boundary hours to morning, afternoon, and evening", () => {
        expect([
            "00:00:00",
            "11:59:00",
            "12:00:00",
            "17:59:00",
            "18:00:00",
            "23:59:00",
        ].map(getTimePeriod)).toEqual([
            "morning",
            "morning",
            "afternoon",
            "afternoon",
            "evening",
            "evening",
        ]);
    });

    it("keeps slots grouped in their original order", () => {
        const slots = [
            { id: 1, startTime: "18:00:00" },
            { id: 2, startTime: "08:00:00" },
            { id: 3, startTime: "12:00:00" },
        ];

        expect(groupAvailableTime(slots)).toEqual({
            morning: [slots[1]],
            afternoon: [slots[2]],
            evening: [slots[0]],
        });
    });
});
