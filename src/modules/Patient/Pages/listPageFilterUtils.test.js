import {
    filterClinics,
    filterDoctors,
    filterSpecialties,
    getAvailableProvinceOptions,
} from "./listPageFilterUtils";

describe("public list filters", () => {
    it("combines doctor name, province, and specialty filters", () => {
        const doctors = [
            { firstName: "An", lastName: "Nguyen", provinceCode: "01", specialtyId: 1 },
            { firstName: "An", lastName: "Tran", provinceCode: "79", specialtyId: 1 },
            { firstName: "Binh", lastName: "Nguyen", provinceCode: "01", specialtyId: 2 },
        ];

        expect(filterDoctors(doctors, { search: "an", provinceCode: "01", specialtyId: 1, allSpecialties: "ALL" })).toEqual([doctors[0]]);
    });

    it("filters clinics by name and province while specialty search stays name-only", () => {
        const clinics = [
            { name: "Phong kham An Tam", provinceCode: "01" },
            { name: "Phong kham An Binh", provinceCode: "79" },
        ];

        expect(filterClinics(clinics, { search: "an", provinceCode: "79" })).toEqual([clinics[1]]);
        expect(filterSpecialties([{ name: "Tim mach" }, { name: "Da lieu" }], "tim")).toEqual([{ name: "Tim mach" }]);
    });

    it("keeps only provinces used by the displayed doctors or clinics", () => {
        const provinceOptions = [
            { keyMap: "01", value_vi: "Ha Noi", value_en: "Ha Noi" },
            { keyMap: "79", value_vi: "Ho Chi Minh", value_en: "Ho Chi Minh" },
            { keyMap: "92", value_vi: "Can Tho", value_en: "Can Tho" },
        ];

        expect(getAvailableProvinceOptions([{ provinceCode: "01" }], provinceOptions)).toEqual([provinceOptions[0]]);
        expect(getAvailableProvinceOptions([{ provinceCode: "79" }], provinceOptions)).toEqual([provinceOptions[1]]);
        expect(getAvailableProvinceOptions([], provinceOptions)).toEqual([]);
        expect(getAvailableProvinceOptions([{ provinceCode: "01" }], [])).toEqual([]);
    });
});
