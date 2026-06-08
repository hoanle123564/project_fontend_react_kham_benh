import React from "react";
import { Button } from "reactstrap";
import { FormattedMessage } from "react-intl";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./ClinicForm.scss";

const editorModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "code-block"],
        ["link", "image"],
        ["clean"],
    ],
};

const editorFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link",
    "image",
];

const ClinicForm = ({
    mode,
    formData,
    previewImg,
    errors,
    isSubmitting,
    onInputChange,
    onEditorChange,
    onImageChange,
    onRemoveImage,
    onSubmit,
    onBack,
}) => {
    const isEditMode = mode === "EDIT";

    return (
        <div className="clinic-form-container">
            <div className="container">
                <div className="clinic-form__header">
                    <h3 className="clinic-form__title">
                        {isEditMode ? "Chỉnh sửa phòng khám" : "Thêm phòng khám"}
                    </h3>
                    <Button color="secondary" onClick={onBack}>
                        <i className="fa-solid fa-arrow-left me-2"></i>
                        Quay lại
                    </Button>
                </div>

                <div className="clinic-form__grid">
                    <div className="clinic-form__main">
                        <div className="clinic-form__card">
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <label className="form-label">
                                        <FormattedMessage
                                            id="manage-clinic.name-clinic"
                                            defaultMessage="Tên phòng khám"
                                        />
                                    </label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={formData.name}
                                        onChange={(event) => onInputChange(event, "name")}
                                        placeholder="Nhập tên phòng khám..."
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
                                    <label className="form-label">Hiển thị</label>
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

                                <div className="col-12">
                                    <label className="form-label">
                                        <FormattedMessage
                                            id="manage-clinic.address-clinic"
                                            defaultMessage="Địa chỉ phòng khám"
                                        />
                                    </label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={formData.address}
                                        onChange={(event) => onInputChange(event, "address")}
                                        placeholder="Nhập địa chỉ phòng khám..."
                                    />
                                    {errors.address && <span className="field-error">{errors.address}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="clinic-form__card clinic-form__editor-card">
                            <label className="form-label">Mô tả phòng khám</label>
                            <ReactQuill
                                theme="snow"
                                value={formData.descriptionHTML}
                                onChange={onEditorChange}
                                modules={editorModules}
                                formats={editorFormats}
                                placeholder="Nhập mô tả phòng khám..."
                            />
                            {errors.descriptionHTML && (
                                <span className="field-error">{errors.descriptionHTML}</span>
                            )}
                        </div>

                        <div className="clinic-form__actions">
                            <Button color="secondary" onClick={onBack}>
                                Hủy
                            </Button>
                            <Button className="form-clinic-btn" onClick={onSubmit} disabled={isSubmitting}>
                                <i className="fa-solid fa-floppy-disk me-2"></i>
                                {isEditMode ? "Cập nhật" : "Lưu"}
                            </Button>
                        </div>
                    </div>

                    <aside className="clinic-form__aside">
                        <div className="clinic-form__card clinic-form__image-card">
                            <label className="form-label">
                                <FormattedMessage
                                    id="manage-clinic.image-clinic"
                                    defaultMessage="Ảnh phòng khám"
                                />
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
                                    Chọn ảnh
                                </label>
                                {previewImg && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={onRemoveImage}
                                    >
                                        Xóa ảnh
                                    </button>
                                )}
                            </div>
                            <div className="clinic-form__preview">
                                {previewImg ? (
                                    <img src={previewImg} alt="Xem trước phòng khám" />
                                ) : (
                                    <span className="text-muted">Chưa có ảnh</span>
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

export default ClinicForm;
