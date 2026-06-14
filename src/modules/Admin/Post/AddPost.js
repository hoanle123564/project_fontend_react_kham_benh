import React, { Component } from "react";
import { toast } from "react-toastify";
import {
    getAllPost,
    getAllPostCategory,
    postSavePost,
} from "../../../services/userService";
import { readFileAsDataUrl } from "../../../utils/imageUtils";
import PostForm from "./PostForm";
import {
    buildPostPayload,
    getDefaultPostFormData,
    getNextDisplayOrder,
    sortPostCategories,
    togglePostCategory,
    updatePostFormField,
    validatePostForm,
} from "./postFormUtils";

class AddPost extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            formData: getDefaultPostFormData(),
            previewImg: "",
            previewBannerImg: "",
            slugTouched: false,
            errors: {},
            isSubmitting: false,
        };
    }

    componentDidMount() {
        this.loadCategories();
        this.loadNextDisplayOrder();
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

    loadNextDisplayOrder = async () => {
        try {
            const res = await getAllPost(1, 100000, "", "", "");
            const posts = Array.isArray(res?.data?.posts) ? res.data.posts : [];
            const nextDisplayOrder = getNextDisplayOrder(posts);

            this.setState((prevState) => ({
                formData: {
                    ...prevState.formData,
                    displayOrder: nextDisplayOrder,
                },
            }));
        } catch (error) {
            console.log("loadNextDisplayOrder error", error);
            this.setState((prevState) => ({
                formData: {
                    ...prevState.formData,
                    displayOrder: 1,
                },
            }));
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
            const res = await postSavePost(buildPostPayload(this.state.formData));

            if (res && res.errCode === 0) {
                toast.success("Create post successfully!");
                this.props.history.push("/system/manage-post");
            } else {
                toast.error(res?.errMessage || "Failed to create post.");
            }
        } catch (error) {
            console.log("handleSubmit error", error);
            toast.error("Failed to create post.");
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
        } = this.state;

        return (
            <PostForm
                mode="CREATE"
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

export default AddPost;
