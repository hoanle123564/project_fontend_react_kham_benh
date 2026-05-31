import React from "react";
import { Button } from "reactstrap";
import { FormattedMessage } from "react-intl";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./PostForm.scss";

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

const PostForm = ({
    mode,
    formData,
    errors,
    categories,
    previewImg,
    previewBannerImg,
    isSubmitting,
    onInputChange,
    onEditorChange,
    onImageChange,
    onRemoveImage,
    onToggleCategory,
    onSubmit,
    onBack,
}) => {
    const isEditMode = mode === "EDIT";
    const selectedCategoryIds = formData.categoryIds || [];

    return (
        <div className="manage-post-form-container mt-4">
            <div className="container">
                <div className="form-header">
                    <h3 className="title-page mb-0">
                        <FormattedMessage
                            id={isEditMode ? "manage-post.edit-title" : "manage-post.add-title"}
                            defaultMessage={isEditMode ? "Edit post" : "Add post"}
                        />
                    </h3>

                    <Button color="secondary" onClick={onBack}>
                        <i className="fa-solid fa-arrow-left me-2"></i>
                        <FormattedMessage id="manage-post.back" defaultMessage="Back" />
                    </Button>
                </div>

                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="post-form-card shadow-sm">
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <label className="form-label">
                                        <FormattedMessage id="manage-post.form-title" defaultMessage="Post title" />
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.title}
                                        onChange={(event) => onInputChange(event, "title")}
                                        placeholder="Enter post title..."
                                    />
                                    {errors.title && <span className="field-error">{errors.title}</span>}
                                </div>

                                <div className="col-md-8">
                                    <label className="form-label">
                                        <FormattedMessage id="manage-post.slug" defaultMessage="Slug" />
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.slug}
                                        onChange={(event) => onInputChange(event, "slug")}
                                        placeholder="enter-post-slug"
                                    />
                                    {errors.slug && <span className="field-error">{errors.slug}</span>}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        <FormattedMessage id="manage-post.status" defaultMessage="Visible" />
                                    </label>
                                    <div className="form-check form-switch post-status-switch">
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
                                    <div className="auto-order-notice">
                                        <i className="fa-solid fa-arrows-up-down-left-right me-2"></i>
                                        <FormattedMessage
                                            id="manage-post.auto-display-order"
                                            defaultMessage="Display order is updated automatically by the system."
                                        />
                                    </div>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">
                                        <FormattedMessage
                                            id="manage-post.short-description"
                                            defaultMessage="Short description"
                                        />
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        value={formData.shortDescription}
                                        onChange={(event) => onInputChange(event, "shortDescription")}
                                        placeholder="Enter short description..."
                                    />
                                    {errors.shortDescription && (
                                        <span className="field-error">{errors.shortDescription}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="post-form-card shadow-sm mt-4">
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <label className="form-label">
                                        <FormattedMessage id="manage-post.image" defaultMessage="Thumbnail" />
                                    </label>
                                    <div className="image-upload-card">
                                        <input
                                            type="file"
                                            id={`post-image-${mode}`}
                                            accept="image/*"
                                            hidden
                                            onChange={(event) => onImageChange(event, "image", "previewImg")}
                                        />
                                        <div className="image-actions">
                                            <label htmlFor={`post-image-${mode}`} className="btn btn-outline-primary">
                                                <FormattedMessage
                                                    id="user-manage.choose-image"
                                                    defaultMessage="Choose image"
                                                />
                                            </label>
                                            {previewImg && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    onClick={() => onRemoveImage("image", "previewImg")}
                                                >
                                                    <FormattedMessage
                                                        id="user-manage.remove-image"
                                                        defaultMessage="Remove image"
                                                    />
                                                </button>
                                            )}
                                        </div>
                                        <div className="preview-box">
                                            {previewImg ? (
                                                <img src={previewImg} alt="post preview" />
                                            ) : (
                                                <span className="text-muted">
                                                    <FormattedMessage
                                                        id="user-manage.no-image"
                                                        defaultMessage="No image"
                                                    />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        <FormattedMessage
                                            id="manage-post.banner-image"
                                            defaultMessage="Banner image"
                                        />
                                    </label>
                                    <div className="image-upload-card">
                                        <input
                                            type="file"
                                            id={`post-banner-${mode}`}
                                            accept="image/*"
                                            hidden
                                            onChange={(event) =>
                                                onImageChange(event, "bannerImage", "previewBannerImg")
                                            }
                                        />
                                        <div className="image-actions">
                                            <label htmlFor={`post-banner-${mode}`} className="btn btn-outline-primary">
                                                <FormattedMessage
                                                    id="user-manage.choose-image"
                                                    defaultMessage="Choose image"
                                                />
                                            </label>
                                            {previewBannerImg && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    onClick={() =>
                                                        onRemoveImage("bannerImage", "previewBannerImg")
                                                    }
                                                >
                                                    <FormattedMessage
                                                        id="user-manage.remove-image"
                                                        defaultMessage="Remove image"
                                                    />
                                                </button>
                                            )}
                                        </div>
                                        <div className="preview-box">
                                            {previewBannerImg ? (
                                                <img src={previewBannerImg} alt="post banner preview" />
                                            ) : (
                                                <span className="text-muted">
                                                    <FormattedMessage
                                                        id="user-manage.no-image"
                                                        defaultMessage="No image"
                                                    />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="post-form-card shadow-sm mt-4">
                            <label className="form-label mb-3">
                                <FormattedMessage id="manage-post.content" defaultMessage="Post content" />
                            </label>
                            <ReactQuill
                                theme="snow"
                                value={formData.contentHTML}
                                onChange={onEditorChange}
                                modules={editorModules}
                                formats={editorFormats}
                                placeholder="Enter post content..."
                            />
                            {errors.contentHTML && (
                                <span className="field-error">{errors.contentHTML}</span>
                            )}
                        </div>

                        <div className="form-footer-actions">
                            <Button color="secondary" onClick={onBack}>
                                <FormattedMessage id="manage-post.cancel" defaultMessage="Cancel" />
                            </Button>
                            <Button color="primary" onClick={onSubmit} disabled={isSubmitting}>
                                <i className="fa-solid fa-floppy-disk me-2"></i>
                                <FormattedMessage
                                    id={isEditMode ? "manage-post.update" : "manage-post.save"}
                                    defaultMessage={isEditMode ? "Update post" : "Save post"}
                                />
                            </Button>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="post-category-sidebar shadow-sm">
                            <div className="sidebar-title">
                                <FormattedMessage
                                    id="manage-post.category-list"
                                    defaultMessage="Post categories"
                                />
                            </div>

                            <div className="category-list">
                                {categories && categories.length > 0 ? (
                                    categories.map((category) => (
                                        <label key={category.id} className="category-item">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategoryIds.includes(category.id)}
                                                onChange={() => onToggleCategory(category.id)}
                                            />
                                            <span>{category.name}</span>
                                        </label>
                                    ))
                                ) : (
                                    <div className="empty-category">
                                        <FormattedMessage
                                            id="manage-post.no-category"
                                            defaultMessage="No post categories found."
                                        />
                                    </div>
                                )}
                            </div>

                            {errors.categoryIds && (
                                <span className="field-error">{errors.categoryIds}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostForm;
