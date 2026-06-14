import { buildSlug } from "../../../utils/textUtils";
import { getImagePayload } from "../../../utils/imageUtils";
import { hasVisibleEditorContent } from "../../../utils/richTextUtils";

export const getDefaultSpecialtyFormData = (overrides = {}) => ({
  name: "",
  slug: "",
  descriptionHTML: "",
  descriptionMarkdown: "",
  image: "",
  isActive: "1",
  displayOrder: "",
  ...overrides,
});

export const getNextDisplayOrder = (items = []) =>
  items.reduce((maxValue, item) => {
    const currentValue = Number(item.displayOrder) || 0;
    return currentValue > maxValue ? currentValue : maxValue;
  }, 0) + 1;

export const updateSpecialtyFormField = (formData, field, value, slugTouched) => {
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

  return { formData: nextFormData, slugTouched: nextSlugTouched };
};

export const mapSpecialtyToFormData = (item = {}) =>
  getDefaultSpecialtyFormData({
    name: item.name || "",
    slug: item.slug || buildSlug(item.name),
    descriptionHTML: item.descriptionHTML || "",
    descriptionMarkdown: item.descriptionMarkdown || item.descriptionHTML || "",
    image: getImagePayload(item.image),
    isActive: String(item.isActive ?? 1),
    displayOrder: item.displayOrder ?? 1,
  });

export const validateSpecialtyForm = (formData = {}) => {
  const errors = {};

  if (!String(formData.name || "").trim()) {
    errors.name = "Specialty name is required.";
  }

  if (!String(formData.slug || "").trim()) {
    errors.slug = "Slug is required.";
  }

  if (!formData.image) {
    errors.image = "Specialty image is required.";
  }

  if (!hasVisibleEditorContent(formData.descriptionHTML)) {
    errors.descriptionHTML = "Specialty description is required.";
  }

  return errors;
};

export const buildSpecialtyPayload = (formData, id) => ({
  ...(id ? { id } : {}),
  name: String(formData.name || "").trim(),
  slug: String(formData.slug || "").trim(),
  image: formData.image,
  descriptionHTML: formData.descriptionHTML,
  descriptionMarkdown: formData.descriptionMarkdown,
  isActive: Number(formData.isActive),
  displayOrder: Number(formData.displayOrder) || 1,
});
