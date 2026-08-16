import { filterClinics, filterDoctors, filterSpecialties } from "./listPageFilterUtils";

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
});
