import React from "react";
import { Button } from "reactstrap";
import { FormattedMessage } from "react-intl";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./SpecialtyForm.scss";

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

const SpecialtyForm = ({
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
        <div className="specialty-form-container">
            <div className="container">
                <div className="specialty-form__header">
                    <h3 className="specialty-form__title">
                        <FormattedMessage
                            id={isEditMode ? "manage-specialty.edit-title" : "manage-specialty.add-title"}
                            defaultMessage={isEditMode ? "Edit specialty" : "Add specialty"}
                        />
                    </h3>
                    <Button color="secondary" onClick={onBack}>
                        <i className="fa-solid fa-arrow-left me-2"></i>
                        <FormattedMessage id="manage-post.back" defaultMessage="Back" />
                    </Button>
                </div>

                <div className="specialty-form__grid">
                    <div className="specialty-form__main">
                        <div className="specialty-form__card">
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <label className="form-label">
                                        <FormattedMessage
                                            id="manage-specialty.name-specialty"
                                            defaultMessage="Specialty name"
                                        />
                                    </label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={formData.name}
                                        onChange={(event) => onInputChange(event, "name")}
                                        placeholder="Nhap ten chuyen khoa..."
                                    />
                                    {errors.name && <span className="field-error">{errors.name}</span>}
                                </div>

                                <div className="col-md-8">
                                    <label className="form-label">
                                        <FormattedMessage id="manage-post.slug" defaultMessage="Slug" />
                                    </label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={formData.slug}
                                        onChange={(event) => onInputChange(event, "slug")}
                                        placeholder="slug-chuyen-khoa"
                                    />
                                    {errors.slug && <span className="field-error">{errors.slug}</span>}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        <FormattedMessage
                                            id="manage-post.status"
                                            defaultMessage="Visible"
                                        />
                                    </label>
                                    <div className="form-check form-switch specialty-form__switch">
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
                            </div>
                        </div>

                        <div className="specialty-form__card specialty-form__editor-card">
                            <label className="form-label">
                                <FormattedMessage
                                    id="manage-specialty.description-specialty"
                                    defaultMessage="Specialty description"
                                />
                            </label>
                            <ReactQuill
                                theme="snow"
                                value={formData.descriptionHTML}
                                onChange={onEditorChange}
                                modules={editorModules}
                                formats={editorFormats}
                                placeholder="Nhap mo ta chuyen khoa..."
                            />
                            {errors.descriptionHTML && (
                                <span className="field-error">{errors.descriptionHTML}</span>
                            )}
                        </div>

                        <div className="specialty-form__actions">
                            <Button color="secondary" onClick={onBack}>
                                <FormattedMessage id="manage-post.cancel" defaultMessage="Cancel" />
                            </Button>
                            <Button color="primary" onClick={onSubmit} disabled={isSubmitting}
                                className="save-specialty-btn">
                                <i className="fa-solid fa-floppy-disk me-2"></i>
                                <FormattedMessage
                                    id={isEditMode ? "manage-post.update" : "manage-post.save"}
                                    defaultMessage={isEditMode ? "Update" : "Save"}
                                />
                            </Button>
                        </div>
                    </div>

                    <aside className="specialty-form__aside">
                        <div className="specialty-form__card specialty-form__image-card">
                            <label className="form-label">
                                <FormattedMessage
                                    id="manage-specialty.image-specialty"
                                    defaultMessage="Specialty image"
                                />
                            </label>
                            <input
                                type="file"
                                id={`specialty-image-${mode}`}
                                accept="image/*"
                                hidden
                                onChange={onImageChange}
                            />
                            <div className="specialty-form__image-actions">
                                <label htmlFor={`specialty-image-${mode}`} className="add-image-btn">
                                    <FormattedMessage
                                        id="user-manage.choose-image"
                                        defaultMessage="Choose image"
                                    />
                                </label>
                                {previewImg && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={onRemoveImage}
                                    >
                                        <FormattedMessage
                                            id="user-manage.remove-image"
                                            defaultMessage="Remove image"
                                        />
                                    </button>
                                )}
                            </div>
                            <div className="specialty-form__preview">
                                {previewImg ? (
                                    <img src={previewImg} alt="specialty preview" />
                                ) : (
                                    <span className="text-muted">
                                        <FormattedMessage
                                            id="user-manage.no-image"
                                            defaultMessage="No image"
                                        />
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

export default SpecialtyForm;
