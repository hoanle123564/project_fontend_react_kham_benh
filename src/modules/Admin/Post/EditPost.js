import React, { Component } from "react";
import { toast } from "react-toastify";
import {
    EditPostId,
    getAllPostCategory,
    getDetailPostById,
} from "../../../services/userService";
import { buildImageSrc, readFileAsDataUrl } from "../../../utils/imageUtils";
import PostForm from "./PostForm";
import {
    buildPostPayload,
    getDefaultPostFormData,
    mapPostToFormData,
    sortPostCategories,
    togglePostCategory,
    updatePostFormField,
    validatePostForm,
} from "./postFormUtils";

class EditPost extends Component {
    constructor(props) {
        super(props);
        this.state = {
            postId: this.props.match?.params?.id || "",
            categories: [],
            formData: getDefaultPostFormData(),
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
            this.setState({ categories: sortPostCategories(res?.data || []) });
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
                formData: mapPostToFormData(data),
                previewImg: buildImageSrc(data.image),
                previewBannerImg: buildImageSrc(data.bannerImage),
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
            const nextState = updatePostFormField(
                prevState.formData,
                field,
                value,
                prevState.slugTouched
            );

            return {
                formData: nextState.formData,
                slugTouched: nextState.slugTouched,
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

    handleImageChange = async (event, field, previewField) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        try {
            const result = await readFileAsDataUrl(file);
            const base64Value = String(result).split(",")[1] || "";

            this.setState((prevState) => ({
                formData: {
                    ...prevState.formData,
                    [field]: base64Value,
                },
                [previewField]: result,
            }));
        } catch (error) {
            console.log("handle post image error", error);
        }
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
        this.setState((prevState) => ({
            formData: {
                ...prevState.formData,
                categoryIds: togglePostCategory(prevState.formData.categoryIds, categoryId),
            },
            errors: {
                ...prevState.errors,
                categoryIds: "",
            },
        }));
    };

    validateForm = () => {
        const errors = validatePostForm(this.state.formData);
        this.setState({ errors });
        return Object.keys(errors).length === 0;
    };

    handleSubmit = async () => {
        if (!this.validateForm()) {
            return;
        }

        this.setState({ isSubmitting: true });

        try {
            const res = await EditPostId(buildPostPayload(this.state.formData, this.state.postId));

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
