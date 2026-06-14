import React from "react";
import { Button } from "reactstrap";
import { injectIntl } from "react-intl";
import ReactQuill from "react-quill";
import { editorFormats, editorModules } from "../../../utils/richTextUtils";
import "react-quill/dist/quill.snow.css";
import "./ClinicForm.scss";

const ClinicForm = ({
    mode,
    formData,
    previewImg,
    errors,
    isSubmitting,
    clinicTypeOptions = [],
    managerOptions = [],
    provinceOptions = [],
    districtOptions = [],
    wardOptions = [],
    onInputChange,
    onEditorChange,
    onImageChange,
    onRemoveImage,
    onSubmit,
    onBack,
    intl,
    language,
}) => {
    const isEditMode = mode === "EDIT";
    const text = {
        vi: {
            "manage-clinic.edit-title": "Chỉnh sửa cơ sở y tế",
            "manage-clinic.add-title": "Thêm cơ sở y tế",
            "manage-clinic.back": "Quay lại",
            "manage-clinic.name-clinic": "Tên cơ sở y tế",
            "manage-clinic.name-placeholder": "Nhập tên cơ sở y tế...",
            "manage-clinic.visible": "Hiển thị",
            "manage-clinic.clinic-type": "Loại cơ sở",
            "manage-clinic.choose-clinic-type": "Chọn loại cơ sở",
            "manage-clinic.manager": "Người quản lý",
            "manage-clinic.choose-manager": "Chọn người quản lý",
            "manage-clinic.address-clinic": "Địa chỉ chi tiết",
            "manage-clinic.address-placeholder": "Nhập địa chỉ chi tiết...",
            "manage-clinic.province": "Tỉnh/Thành",
            "manage-clinic.choose-province": "Chọn tỉnh/thành",
            "manage-clinic.district": "Quận/Huyện",
            "manage-clinic.choose-district": "Chọn quận/huyện",
            "manage-clinic.ward": "Phường/Xã",
            "manage-clinic.choose-ward": "Chọn phường/xã",
            "manage-clinic.description-clinic": "Mô tả cơ sở y tế",
            "manage-clinic.description-placeholder": "Nhập mô tả cơ sở y tế...",
            "manage-clinic.cancel": "Hủy",
            "manage-clinic.update": "Cập nhật",
            "manage-clinic.save": "Lưu",
            "manage-clinic.image-clinic": "Ảnh cơ sở y tế",
            "manage-clinic.choose-image": "Chọn ảnh",
            "manage-clinic.remove-image": "Xóa ảnh",
            "manage-clinic.image-preview": "Xem trước cơ sở y tế",
            "manage-clinic.no-image": "Chưa có ảnh",
        },
        en: {
            "manage-clinic.edit-title": "Edit clinic",
            "manage-clinic.add-title": "Add clinic",
            "manage-clinic.back": "Back",
            "manage-clinic.name-clinic": "Clinic name",
            "manage-clinic.name-placeholder": "Enter clinic name...",
            "manage-clinic.visible": "Visible",
            "manage-clinic.clinic-type": "Clinic type",
            "manage-clinic.choose-clinic-type": "Choose clinic type",
            "manage-clinic.manager": "Manager",
            "manage-clinic.choose-manager": "Choose manager",
            "manage-clinic.address-clinic": "Detailed address",
            "manage-clinic.address-placeholder": "Enter detailed address...",
            "manage-clinic.province": "Province/City",
            "manage-clinic.choose-province": "Choose province/city",
            "manage-clinic.district": "District",
            "manage-clinic.choose-district": "Choose district",
            "manage-clinic.ward": "Ward",
            "manage-clinic.choose-ward": "Choose ward",
            "manage-clinic.description-clinic": "Clinic description",
            "manage-clinic.description-placeholder": "Enter clinic description...",
            "manage-clinic.cancel": "Cancel",
            "manage-clinic.update": "Update",
            "manage-clinic.save": "Save",
            "manage-clinic.image-clinic": "Clinic image",
            "manage-clinic.choose-image": "Choose image",
            "manage-clinic.remove-image": "Remove image",
            "manage-clinic.image-preview": "Clinic preview",
            "manage-clinic.no-image": "No image",
        },
    };
    const messages = language === "en" ? text.en : text.vi;
    const t = (id, defaultMessage) =>
        messages[id] || intl.formatMessage({ id, defaultMessage });

    return (
        <div className="clinic-form-container">
            <div className="container">
                <div className="clinic-form__header">
                    <h3 className="clinic-form__title">
                        {isEditMode
                            ? t("manage-clinic.edit-title", "Chỉnh sửa cơ sở y tế")
                            : t("manage-clinic.add-title", "Thêm cơ sở y tế")}
                    </h3>
                    <Button color="secondary" onClick={onBack}>
                        <i className="fa-solid fa-arrow-left me-2"></i>
                        {t("manage-clinic.back", "Quay lại")}
                    </Button>
                </div>

                <div className="clinic-form__grid">
                    <div className="clinic-form__main">
                        <div className="clinic-form__card">
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <label className="form-label">
                                        {t("manage-clinic.name-clinic", "Tên cơ sở y tế")}
                                    </label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={formData.name}
                                        onChange={(event) => onInputChange(event, "name")}
                                        placeholder={t("manage-clinic.name-placeholder", "Nhập tên cơ sở y tế...")}
                                    />
                                    {errors.name && <span className="field-error">{errors.name}</span>}
                                </div>

                                <div className="col-md-8">
                                    <label className="form-label">Slug</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={formData.slug}
                                        onChange={(event) => onInputChange(event, "slug")}
                                        placeholder="slug-phong-kham"
                                    />
                                    {errors.slug && <span className="field-error">{errors.slug}</span>}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        {t("manage-clinic.visible", "Hiển thị")}
                                    </label>
                                    <div className="form-check form-switch clinic-form__switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={Number(formData.isActive) === 1}
                                            onChange={(event) =>
                                                onInputChange(
                                                    { target: { value: event.target.checked ? "1" : "0" } },
                                                    "isActive"
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6 d-none">
                                    <label className="form-label">
                                        {t("manage-clinic.clinic-type", "Loại cơ sở")}
                                    </label>
                                    <select
                                        className="form-control"
                                        value={formData.clinicTypeId || ""}
                                        onChange={(event) => onInputChange(event, "clinicTypeId")}
                                    >
                                        <option value="">
                                            {t("manage-clinic.choose-clinic-type", "Chọn loại cơ sở")}
                                        </option>
                                        {clinicTypeOptions.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        {t("manage-clinic.manager", "Người quản lý")}
                                    </label>
                                    <select
                                        className="form-control"
                                        value={formData.managerUserId || ""}
                                        onChange={(event) => onInputChange(event, "managerUserId")}
                                    >
                                        <option value="">
                                            {t("manage-clinic.choose-manager", "Chọn người quản lý")}
                                        </option>
                                        {managerOptions.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">
                                        {t("manage-clinic.address-clinic", "Địa chỉ chi tiết")}
                                    </label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={formData.address}
                                        onChange={(event) => onInputChange(event, "address")}
                                        placeholder={t("manage-clinic.address-placeholder", "Nhập địa chỉ chi tiết...")}
                                    />
                                    {errors.address && <span className="field-error">{errors.address}</span>}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        {t("manage-clinic.province", "Tỉnh/Thành")}
                                    </label>
                                    <select
                                        className="form-control"
                                        value={formData.provinceCode || ""}
                                        onChange={(event) => onInputChange(event, "provinceCode")}
                                    >
                                        <option value="">
                                            {t("manage-clinic.choose-province", "Chọn tỉnh/thành")}
                                        </option>
                                        {provinceOptions.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        {t("manage-clinic.district", "Quận/Huyện")}
                                    </label>
                                    <select
                                        className="form-control"
                                        value={formData.districtCode || ""}
                                        onChange={(event) => onInputChange(event, "districtCode")}
                                        disabled={!formData.provinceCode}
                                    >
                                        <option value="">
                                            {t("manage-clinic.choose-district", "Chọn quận/huyện")}
                                        </option>
                                        {districtOptions.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        {t("manage-clinic.ward", "Phường/Xã")}
                                    </label>
                                    <select
                                        className="form-control"
                                        value={formData.wardCode || ""}
                                        onChange={(event) => onInputChange(event, "wardCode")}
                                        disabled={!formData.districtCode}
                                    >
                                        <option value="">
                                            {t("manage-clinic.choose-ward", "Chọn phường/xã")}
                                        </option>
                                        {wardOptions.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>
                        </div>

                        <div className="clinic-form__card clinic-form__editor-card">
                            <label className="form-label">
                                {t("manage-clinic.description-clinic", "Mô tả cơ sở y tế")}
                            </label>
                            <ReactQuill
                                theme="snow"
                                value={formData.descriptionHTML}
                                onChange={onEditorChange}
                                modules={editorModules}
                                formats={editorFormats}
                                placeholder={t("manage-clinic.description-placeholder", "Nhập mô tả cơ sở y tế...")}
                            />
                            {errors.descriptionHTML && (
                                <span className="field-error">{errors.descriptionHTML}</span>
                            )}
                        </div>

                        <div className="clinic-form__actions">
                            <Button color="secondary" onClick={onBack}>
                                {t("manage-clinic.cancel", "Hủy")}
                            </Button>
                            <Button className="form-clinic-btn" onClick={onSubmit} disabled={isSubmitting}>
                                <i className="fa-solid fa-floppy-disk me-2"></i>
                                {isEditMode
                                    ? t("manage-clinic.update", "Cập nhật")
                                    : t("manage-clinic.save", "Lưu")}
                            </Button>
                        </div>
                    </div>

                    <aside className="clinic-form__aside">
                        <div className="clinic-form__card clinic-form__image-card">
                            <label className="form-label">
                                {t("manage-clinic.image-clinic", "Ảnh cơ sở y tế")}
                            </label>
                            <input
                                type="file"
                                id={`clinic-image-${mode}`}
                                accept="image/*"
                                hidden
                                onChange={onImageChange}
                            />
                            <div className="clinic-form__image-actions">
                                <label htmlFor={`clinic-image-${mode}`} className="add-image-btn">
                                    {t("manage-clinic.choose-image", "Chọn ảnh")}
                                </label>
                                {previewImg && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={onRemoveImage}
                                    >
                                        {t("manage-clinic.remove-image", "Xóa ảnh")}
                                    </button>
                                )}
                            </div>
                            <div className="clinic-form__preview">
                                {previewImg ? (
                                    <img src={previewImg} alt={t("manage-clinic.image-preview", "Xem trước cơ sở y tế")} />
                                ) : (
                                    <span className="text-muted">
                                        {t("manage-clinic.no-image", "Chưa có ảnh")}
                                    </span>
                                )}
                            </div>
                            {errors.image && <span className="field-error">{errors.image}</span>}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default injectIntl(ClinicForm);
