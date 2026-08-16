const normalize = (value) => String(value || "").trim().toLowerCase();

export const getAvailableProvinceOptions = (items = [], provinceOptions = []) => {
    const availableProvinceCodes = new Set(
        items
            .map((item) => String(item?.provinceCode || "").trim())
            .filter(Boolean)
    );

    return provinceOptions.filter((province) =>
        availableProvinceCodes.has(String(province?.keyMap || "").trim())
    );
};

export const filterDoctors = (doctors = [], { search = "", provinceCode = "", specialtyId, allSpecialties }) => {
    const query = normalize(search);

    return doctors.filter((doctor) => {
        const doctorName = normalize(`${doctor.firstName || ""} ${doctor.lastName || ""}`);
        const matchesName = !query || doctorName.includes(query);
        const matchesProvince = !provinceCode || String(doctor.provinceCode || "") === String(provinceCode);
        const matchesSpecialty = specialtyId === allSpecialties || String(doctor.specialtyId || "") === String(specialtyId);

        return matchesName && matchesProvince && matchesSpecialty;
    });
};

export const filterClinics = (clinics = [], { search = "", provinceCode = "" }) => {
    const query = normalize(search);

    return clinics.filter((clinic) =>
        (!query || normalize(clinic.name).includes(query)) &&
        (!provinceCode || String(clinic.provinceCode || "") === String(provinceCode))
    );
};

export const filterSpecialties = (specialties = [], search = "") => {
    const query = normalize(search);
    return specialties.filter((specialty) => !query || normalize(specialty.name).includes(query));
};
