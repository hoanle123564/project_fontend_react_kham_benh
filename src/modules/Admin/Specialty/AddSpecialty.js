import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';

import { toast } from "react-toastify";
import * as action from "../../../store/actions";
import { getAllSpecialty } from "../../../services/userService";
import SpecialtyForm from "./SpecialtyForm";

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

const hasVisibleEditorContent = (value) => {
    if (!value || typeof value !== "string") return false;

    const plainText = value
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .trim();

    return plainText.length > 0;
};

class AddSpecialty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: {
                name: "",
                slug: "",
                descriptionHTML: "",
                descriptionMarkdown: "",
                image: "",
                isActive: "1",
                displayOrder: "",
            },
            previewImg: "",
            slugTouched: false,
            errors: {},
            isSubmitting: false,
        };
    }

    componentDidMount() {
        this.loadNextDisplayOrder();
    }

    loadNextDisplayOrder = async () => {
        try {
            const res = await getAllSpecialty();
            const specialties = Array.isArray(res?.data) ? res.data : [];
            const nextDisplayOrder = specialties.reduce((maxValue, item) => {
                const currentValue = Number(item.displayOrder) || 0;
                return currentValue > maxValue ? currentValue : maxValue;
            }, 0) + 1;

            this.setState((prevState) => ({
                formData: {
                    ...prevState.formData,
                    displayOrder: nextDisplayOrder,
                },
            }));
        } catch (error) {
            console.log("loadNextDisplayOrder specialty error", error);
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
            const nextFormData = {
                ...prevState.formData,
                [field]: value,
            };
            let nextSlugTouched = prevState.slugTouched;

            if (field === "name" && !prevState.slugTouched) {
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
                descriptionHTML: value,
                descriptionMarkdown: value,
            },
            errors: {
                ...prevState.errors,
                descriptionHTML: "",
            },
        }));
    };

    handleImageChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result || "";
            this.setState((prevState) => ({
                previewImg: result,
                formData: {
                    ...prevState.formData,
                    image: String(result).split(",")[1] || "",
                },
                errors: {
                    ...prevState.errors,
                    image: "",
                },
            }));
        };
        reader.readAsDataURL(file);
    };

    handleRemoveImage = () => {
        this.setState((prevState) => ({
            previewImg: "",
            formData: {
                ...prevState.formData,
                image: "",
            },
        }));
    };

    validateForm = () => {
        const { formData } = this.state;
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

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    };

    handleSaveContent = async () => {
        if (!this.validateForm() || this.state.isSubmitting) {
            return;
        }

        this.setState({ isSubmitting: true });

        try {
            const { formData } = this.state;
            const res = await this.props.SaveSpecialty({
                name: formData.name.trim(),
                slug: formData.slug.trim(),
                image: formData.image,
                descriptionHTML: formData.descriptionHTML,
                descriptionMarkdown: formData.descriptionMarkdown,
                isActive: Number(formData.isActive),
                displayOrder: Number(formData.displayOrder) || 1,
            });

            if (res && res.errCode === 0) {
                this.setState({
                    formData: {
                        name: "",
                        slug: "",
                        descriptionHTML: "",
                        descriptionMarkdown: "",
                        image: "",
                        isActive: "1",
                        displayOrder: "",
                    },
                    previewImg: "",
                    slugTouched: false,
                    errors: {},
                });
                await this.loadNextDisplayOrder();
            } else {
                toast.error(res?.errMessage || "Save specialty failed.");
            }
        } catch (error) {
            console.log("SaveSpecialty error", error);
            toast.error("Save specialty failed.");
        } finally {
            this.setState({ isSubmitting: false });
        }
    };

    handleBack = () => {
        this.props.history.push("/system/manage-specialty");
    };

    render() {
        return (
            <SpecialtyForm
                mode="ADD"
                formData={this.state.formData}
                previewImg={this.state.previewImg}
                errors={this.state.errors}
                isSubmitting={this.state.isSubmitting}
                onInputChange={this.handleInputChange}
                onEditorChange={this.handleEditorChange}
                onImageChange={this.handleImageChange}
                onRemoveImage={this.handleRemoveImage}
                onSubmit={this.handleSaveContent}
                onBack={this.handleBack}
            />
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    SaveSpecialty: (data) => dispatch(action.SaveSpecialty(data)),
});

export default connect(null, mapDispatchToProps)(AddSpecialty);
