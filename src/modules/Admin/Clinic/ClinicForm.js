import React from "react";
import { Button } from "reactstrap";
import { injectIntl } from "react-intl";
import "./ClinicForm.scss";

const ClinicForm = ({
    mode,
    formData,
    previewImg,
    previewBannerImg,
    errors,
    isSubmitting,
    clinicTypeOptions = [],
    managerOptions = [],
    provinceOptions = [],
    districtOptions = [],
    wardOptions = [],
    managerLocked = false,
    onInputChange,
    onImageChange,
    onRemoveImage,
    onSubmit,
    onBack,
    intl,
}) => {
    const isEditMode = mode === "EDIT";
    const t = (id, defaultMessage) => intl.formatMessage({ id, defaultMessage });

    const renderImageCard = ({ label, inputId, field, previewField, previewValue, alt, error }) => (
        <div className="clinic-form__card clinic-form__image-card">
            <label className="form-label">{label}</label>
            <input
                type="file"
                id={inputId}
                accept="image/*"
                hidden
                onChange={(event) => onImageChange(event, field, previewField)}
            />
            <div className="clinic-form__image-actions">
                <label htmlFor={inputId} className="add-image-btn">
                    {t("manage-clinic.choose-image", "Choose image")}
                </label>
                {previewValue && (
                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => onRemoveImage(field, previewField)}
                    >
                        {t("manage-clinic.remove-image", "Remove image")}
                    </button>
                )}
            </div>
            <div className={field === "banner_img" ? "clinic-form__preview clinic-form__preview--banner" : "clinic-form__preview"}>
                {previewValue ? (
                    <img src={previewValue} alt={alt} />
                ) : (
                    <span className="text-muted">{t("manage-clinic.no-image", "No image")}</span>
                )}
            </div>
            {error && <span className="field-error">{error}</span>}
        </div>
    );

    return (
        <div className="clinic-form-container">
            <div className="container">
                <div className="clinic-form__header">
                    <h3 className="clinic-form__title">
                        {isEditMode
                            ? t("manage-clinic.edit-title", "Edit clinic")
                            : t("manage-clinic.add-title", "Add clinic")}
                    </h3>
                    <Button color="secondary" onClick={onBack}>
                        <i className="fa-solid fa-arrow-left me-2"></i>
                        {t("manage-clinic.back", "Back")}
                    </Button>
                </div>

                <div className="clinic-form__grid">
                    <div className="clinic-form__main">
                        <div className="clinic-form__card">
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <label className="form-label">{t("manage-clinic.name-clinic", "Clinic name")}</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={formData.name}
                                        onChange={(event) => onInputChange(event, "name")}
                                        placeholder={t("manage-clinic.name-placeholder", "Enter clinic name...")}
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
                                    <label className="form-label">{t("manage-clinic.visible", "Visible")}</label>
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
                                    <label className="form-label">{t("manage-clinic.clinic-type", "Clinic type")}</label>
                                    <select
                                        className="form-control"
                                        value={formData.clinicTypeId || ""}
                                        onChange={(event) => onInputChange(event, "clinicTypeId")}
                                    >
                                        <option value="">{t("manage-clinic.choose-clinic-type", "Choose clinic type")}</option>
                                        {clinicTypeOptions.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">{t("manage-clinic.manager", "Manager")}</label>
                                    <select
                                        className="form-control"
                                        value={formData.managerUserId || ""}
                                        onChange={(event) => onInputChange(event, "managerUserId")}
                                        disabled={managerLocked}
                                    >
                                        <option value="">{t("manage-clinic.choose-manager", "Choose manager")}</option>
                                        {managerOptions.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">{t("manage-clinic.address-clinic", "Detailed address")}</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={formData.address}
                                        onChange={(event) => onInputChange(event, "address")}
                                        placeholder={t("manage-clinic.address-placeholder", "Enter detailed address...")}
                                    />
                                    {errors.address && <span className="field-error">{errors.address}</span>}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">{t("manage-clinic.province", "Province/City")}</label>
                                    <select
                                        className="form-control"
                                        value={formData.provinceCode || ""}
                                        onChange={(event) => onInputChange(event, "provinceCode")}
                                    >
                                        <option value="">{t("manage-clinic.choose-province", "Choose province/city")}</option>
                                        {provinceOptions.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">{t("manage-clinic.district", "District")}</label>
                                    <select
                                        className="form-control"
                                        value={formData.districtCode || ""}
                                        onChange={(event) => onInputChange(event, "districtCode")}
                                        disabled={!formData.provinceCode}
                                    >
                                        <option value="">{t("manage-clinic.choose-district", "Choose district")}</option>
                                        {districtOptions.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">{t("manage-clinic.ward", "Ward")}</label>
                                    <select
                                        className="form-control"
                                        value={formData.wardCode || ""}
                                        onChange={(event) => onInputChange(event, "wardCode")}
                                        disabled={!formData.districtCode}
                                    >
                                        <option value="">{t("manage-clinic.choose-ward", "Choose ward")}</option>
                                        {wardOptions.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="clinic-form__actions">
                            <Button color="secondary" onClick={onBack}>
                                {t("manage-clinic.cancel", "Cancel")}
                            </Button>
                            <Button className="form-clinic-btn" onClick={onSubmit} disabled={isSubmitting}>
                                <i className="fa-solid fa-floppy-disk me-2"></i>
                                {isEditMode
                                    ? t("manage-clinic.update", "Update")
                                    : t("manage-clinic.save", "Save")}
                            </Button>
                        </div>
                    </div>

                    <aside className="clinic-form__aside">
                        {renderImageCard({
                            label: t("manage-clinic.image-clinic", "Clinic image"),
                            inputId: `clinic-image-${mode}`,
                            field: "image",
                            previewField: "previewImg",
                            previewValue: previewImg,
                            alt: t("manage-clinic.image-preview", "Clinic preview"),
                            error: errors.image,
                        })}
                        {renderImageCard({
                            label: t("manage-clinic.banner-image", "Banner image"),
                            inputId: `clinic-banner-${mode}`,
                            field: "banner_img",
                            previewField: "previewBannerImg",
                            previewValue: previewBannerImg,
                            alt: t("manage-clinic.banner-preview", "Banner preview"),
                            error: errors.banner_img,
                        })}
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default injectIntl(ClinicForm);
