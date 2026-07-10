import { buildSlug } from "../../../utils/textUtils";
import { hasVisibleEditorContent } from "../../../utils/richTextUtils";

export const getDefaultPostFormData = (overrides = {}) => ({
  title: "",
  slug: "",
  image: "",
  bannerImage: "",
  isActive: "1",
  displayOrder: "",
  shortDescription: "",
  contentHTML: "",
  categoryIds: [],
  ...overrides,
});

export const sortPostCategories = (categories = []) =>
  [...categories].sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder) || a.id - b.id);

export const getNextDisplayOrder = (items = []) =>
  items.reduce((maxValue, item) => {
    const currentValue = Number(item.displayOrder) || 0;
    return currentValue > maxValue ? currentValue : maxValue;
  }, 0) + 1;

export const updatePostFormField = (formData, field, value, slugTouched) => {
  const nextFormData = {
    ...formData,
    [field]: value,
  };
  let nextSlugTouched = slugTouched;

  if (field === "title" && !slugTouched) {
    nextFormData.slug = buildSlug(value);
  }

  if (field === "slug") {
    nextFormData.slug = buildSlug(value);
    nextSlugTouched = true;
  }

  return { formData: nextFormData, slugTouched: nextSlugTouched };
};

export const togglePostCategory = (categoryIds = [], categoryId) =>
  categoryIds.includes(categoryId)
    ? categoryIds.filter((item) => item !== categoryId)
    : [...categoryIds, categoryId];

export const mapPostToFormData = (data = {}) =>
  getDefaultPostFormData({
    title: data.title || "",
    slug: data.slug || "",
    image: data.image || "",
    bannerImage: data.bannerImage || "",
    isActive: String(data.isActive ?? 1),
    displayOrder: data.displayOrder ?? "",
    shortDescription: data.shortDescription || "",
    contentHTML: data.contentHTML || "",
    categoryIds: Array.isArray(data.categoryIds) ? data.categoryIds : [],
  });

export const validatePostForm = (formData = {}) => {
  const errors = {};

  if (!String(formData.title || "").trim()) {
    errors.title = "Post title is required.";
  }

  if (!String(formData.slug || "").trim()) {
    errors.slug = "Slug is required.";
  }

  if (!hasVisibleEditorContent(formData.contentHTML)) {
    errors.contentHTML = "Post content is required.";
  }

  if (!Array.isArray(formData.categoryIds) || formData.categoryIds.length === 0) {
    errors.categoryIds = "Please select at least one category.";
  }

  return errors;
};

export const buildPostPayload = (formData, id) => ({
  ...(id ? { id: Number(id) } : {}),
  title: String(formData.title || "").trim(),
  slug: String(formData.slug || "").trim(),
  image: formData.image,
  bannerImage: formData.bannerImage,
  isActive: Number(formData.isActive),
  displayOrder: Number(formData.displayOrder),
  shortDescription: String(formData.shortDescription || "").trim(),
  contentHTML: formData.contentHTML,
  categoryIds: formData.categoryIds,
});
