import React, { Component } from "react";
import { toast } from "react-toastify";
import {
    EditPostId,
    getAllPostCategory,
    getDetailPostById,
} from "../../../services/userService";
import PostForm from "./PostForm";

const buildSlug = (value) =>
    String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");

const buildPreviewSrc = (value) => {
    if (!value) {
        return "";
    }

    return String(value).startsWith("data:") ? value : `data:image/jpeg;base64,${value}`;
};

class EditPost extends Component {
    constructor(props) {
        super(props);
        this.state = {
            postId: this.props.match?.params?.id || "",
            categories: [],
            formData: {
                title: "",
                slug: "",
                image: "",
                bannerImage: "",
                isActive: "1",
                displayOrder: "",
                shortDescription: "",
                contentHTML: "",
                categoryIds: [],
            },
            previewImg: "",
            previewBannerImg: "",
            slugTouched: false,
            errors: {},
            isSubmitting: false,
            isLoading: true,
        };
    }

    async componentDidMount() {
        await Promise.all([this.loadCategories(), this.loadPostDetail()]);
    }

    loadCategories = async () => {
        try {
            const res = await getAllPostCategory();
            const categories = Array.isArray(res?.data) ? [...res.data] : [];
            categories.sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder) || a.id - b.id);

            this.setState({ categories });
        } catch (error) {
            console.log("loadCategories error", error);
            toast.error("Failed to load post categories.");
        }
    };

    loadPostDetail = async () => {
        const { postId } = this.state;

        if (!postId) {
            toast.error("Post id is required.");
            this.props.history.push("/system/manage-post");
            return;
        }

        try {
            const res = await getDetailPostById(postId);
            if (!res || res.errCode !== 0) {
                toast.error(res?.errMessage || "Failed to load post detail.");
                this.props.history.push("/system/manage-post");
                return;
            }

            const data = res.data || {};
            this.setState({
                formData: {
                    title: data.title || "",
                    slug: data.slug || "",
                    image: data.image || "",
                    bannerImage: data.bannerImage || "",
                    isActive: String(data.isActive ?? 1),
                    displayOrder: data.displayOrder ?? "",
                    shortDescription: data.shortDescription || "",
                    contentHTML: data.contentHTML || "",
                    categoryIds: Array.isArray(data.categoryIds) ? data.categoryIds : [],
                },
                previewImg: buildPreviewSrc(data.image),
                previewBannerImg: buildPreviewSrc(data.bannerImage),
                isLoading: false,
            });
        } catch (error) {
            console.log("loadPostDetail error", error);
            toast.error("Failed to load post detail.");
            this.props.history.push("/system/manage-post");
        }
    };

    handleInputChange = (event, field) => {
        const value = event.target.value;

        this.setState((prevState) => {
            const nextFormData = {
                ...prevState.formData,
                [field]: value,
            };

            let nextSlugTouched = prevState.slugTouched;
            if (field === "title" && !prevState.slugTouched) {
                nextFormData.slug = buildSlug(value);
            }

            if (field === "slug") {
                nextFormData.slug = buildSlug(value);
                nextSlugTouched = true;
            }

            return {
                formData: nextFormData,
                slugTouched: nextSlugTouched,
                errors: {
                    ...prevState.errors,
                    [field]: "",
                },
            };
        });
    };

    handleEditorChange = (value) => {
        this.setState((prevState) => ({
            formData: {
                ...prevState.formData,
                contentHTML: value,
            },
            errors: {
                ...prevState.errors,
                contentHTML: "",
            },
        }));
    };

    handleImageChange = (event, field, previewField) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result || "";
            const base64Value = String(result).split(",")[1] || "";

            this.setState((prevState) => ({
                formData: {
                    ...prevState.formData,
                    [field]: base64Value,
                },
                [previewField]: result,
            }));
        };
        reader.readAsDataURL(file);
    };

    handleRemoveImage = (field, previewField) => {
        this.setState((prevState) => ({
            formData: {
                ...prevState.formData,
                [field]: "",
            },
            [previewField]: "",
        }));
    };

    handleToggleCategory = (categoryId) => {
        this.setState((prevState) => {
            const existed = prevState.formData.categoryIds.includes(categoryId);
            const categoryIds = existed
                ? prevState.formData.categoryIds.filter((item) => item !== categoryId)
                : [...prevState.formData.categoryIds, categoryId];

            return {
                formData: {
                    ...prevState.formData,
                    categoryIds,
                },
                errors: {
                    ...prevState.errors,
                    categoryIds: "",
                },
            };
        });
    };

    validateForm = () => {
        const { formData } = this.state;
        const errors = {};

        if (!formData.title.trim()) {
            errors.title = "Post title is required.";
        }

        if (!formData.slug.trim()) {
            errors.slug = "Slug is required.";
        }

        if (!formData.contentHTML || !formData.contentHTML.replace(/<[^>]+>/g, "").trim()) {
            errors.contentHTML = "Post content is required.";
        }

        if (!Array.isArray(formData.categoryIds) || formData.categoryIds.length === 0) {
            errors.categoryIds = "Please select at least one category.";
        }

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    };

    handleSubmit = async () => {
        if (!this.validateForm()) {
            return;
        }

        this.setState({ isSubmitting: true });

        try {
            const { postId, formData } = this.state;
            const res = await EditPostId({
                id: Number(postId),
                title: formData.title.trim(),
                slug: formData.slug.trim(),
                image: formData.image,
                bannerImage: formData.bannerImage,
                isActive: Number(formData.isActive),
                displayOrder: Number(formData.displayOrder),
                shortDescription: formData.shortDescription.trim(),
                contentHTML: formData.contentHTML,
                contentMarkdown: "",
                categoryIds: formData.categoryIds,
            });

            if (res && res.errCode === 0) {
                toast.success("Update post successfully!");
                this.props.history.push("/system/manage-post");
            } else {
                toast.error(res?.errMessage || "Failed to update post.");
            }
        } catch (error) {
            console.log("handleSubmit error", error);
            toast.error("Failed to update post.");
        } finally {
            this.setState({ isSubmitting: false });
        }
    };

    handleBack = () => {
        this.props.history.push("/system/manage-post");
    };

    render() {
        const {
            categories,
            formData,
            errors,
            previewImg,
            previewBannerImg,
            isSubmitting,
            isLoading,
        } = this.state;

        if (isLoading) {
            return (
                <div className="manage-post-form-container mt-4">
                    <div className="container">
                        <div className="post-form-card shadow-sm text-center py-5">
                            Loading post detail...
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <PostForm
                mode="EDIT"
                categories={categories}
                formData={formData}
                errors={errors}
                previewImg={previewImg}
                previewBannerImg={previewBannerImg}
                isSubmitting={isSubmitting}
                onInputChange={this.handleInputChange}
                onEditorChange={this.handleEditorChange}
                onImageChange={this.handleImageChange}
                onRemoveImage={this.handleRemoveImage}
                onToggleCategory={this.handleToggleCategory}
                onSubmit={this.handleSubmit}
                onBack={this.handleBack}
            />
        );
    }
}

export default EditPost;
