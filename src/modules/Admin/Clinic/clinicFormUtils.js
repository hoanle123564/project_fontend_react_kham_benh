import { buildSlug } from "../../../utils/textUtils";
import { getImagePayload } from "../../../utils/imageUtils";

export const getDefaultClinicFormData = (overrides = {}) => ({
  name: "",
  slug: "",
  address: "",
  image: "",
  banner_img: "",
  managerUserId: "",
  provinceCode: "",
  districtCode: "",
  wardCode: "",
  isActive: "1",
  displayOrder: "",
  ...overrides,
});

export const buildLookupOptions = (items = [], language = "vi") =>
  items.map((item) => ({
    value: item.keyMap || "",
    label: String((language === "vi" ? item.value_vi : item.value_en) || item.keyMap || ""),
  }));

export const buildManagerOptions = (users = []) =>
  users
    .filter((user) => ["R4", "R2"].includes(user.roleId))
    .map((user) => ({
      value: user.id,
      label: String(`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || ""),
    }));

export const getNextDisplayOrder = (items = []) =>
  items.reduce((maxValue, item) => {
    const currentValue = Number(item.displayOrder) || 0;
    return currentValue > maxValue ? currentValue : maxValue;
  }, 0) + 1;

export const updateClinicFormField = (formData, field, value, slugTouched) => {
  const nextFormData = {
    ...formData,
    [field]: value,
  };
  let nextSlugTouched = slugTouched;

  if (field === "name" && !slugTouched) {
    nextFormData.slug = buildSlug(value);
  }

  if (field === "slug") {
    nextFormData.slug = buildSlug(value);
    nextSlugTouched = true;
  }

  if (field === "provinceCode") {
    nextFormData.districtCode = "";
    nextFormData.wardCode = "";
  }

  if (field === "districtCode") {
    nextFormData.wardCode = "";
  }

  return { formData: nextFormData, slugTouched: nextSlugTouched };
};

export const mapClinicToFormData = (clinicData = {}) =>
  getDefaultClinicFormData({
    name: clinicData.name || "",
    slug: clinicData.slug || buildSlug(clinicData.name),
    address: clinicData.address || "",
    image: getImagePayload(clinicData.image),
    banner_img: getImagePayload(clinicData.banner_img),
    managerUserId: clinicData.managerUserId || "",
    provinceCode: clinicData.provinceCode || "",
    districtCode: clinicData.districtCode || "",
    wardCode: clinicData.wardCode || "",
    isActive: String(clinicData.isActive ?? 1),
    displayOrder: clinicData.displayOrder ?? 1,
  });

export const validateClinicForm = (formData = {}) => {
  const errors = {};

  if (!String(formData.name || "").trim()) {
    errors.name = "Vui l\u00f2ng nh\u1eadp t\u00ean ph\u00f2ng kh\u00e1m.";
  }

  if (!String(formData.slug || "").trim()) {
    errors.slug = "Vui l\u00f2ng nh\u1eadp slug.";
  }

  if (!String(formData.address || "").trim()) {
    errors.address = "Vui l\u00f2ng nh\u1eadp \u0111\u1ecba ch\u1ec9 ph\u00f2ng kh\u00e1m.";
  }

  if (!formData.image) {
    errors.image = "Vui l\u00f2ng ch\u1ecdn \u1ea3nh ph\u00f2ng kh\u00e1m.";
  }

  return errors;
};

export const buildClinicPayload = (formData, id) => ({
  ...(id ? { id } : {}),
  name: String(formData.name || "").trim(),
  slug: String(formData.slug || "").trim(),
  address: String(formData.address || "").trim(),
  image: formData.image,
  banner_img: formData.banner_img,
  managerUserId: formData.managerUserId || null,
  provinceCode: formData.provinceCode || null,
  districtCode: formData.districtCode || null,
  wardCode: formData.wardCode || null,
  isActive: Number(formData.isActive),
  displayOrder: Number(formData.displayOrder) || 1,
});
