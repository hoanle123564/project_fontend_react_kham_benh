import React, { Component } from "react";
import { toast } from "react-toastify";
import { EditSpecialtyId, getDetailSpecialtyById } from "../../../services/userService";
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

const buildImageSrc = (image) => {
    if (!image) return "";
    return String(image).startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;
};

const getImagePayload = (image) => {
    if (!image) return "";
    if (String(image).startsWith("data:")) {
        const parts = String(image).split(",");
        return parts.length > 1 ? parts[1] : "";
    }
    return image;
};

const hasVisibleEditorContent = (value) => {
    if (!value || typeof value !== "string") return false;

    const plainText = value
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .trim();

    return plainText.length > 0;
};

class EditSpecialty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            specialtyId: null,
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
        this.loadSpecialty();
    }

    loadSpecialty = async () => {
        const routeId = this.props.match?.params?.id;
        const stateItem = this.props.location?.state?.clinicData;
        let item = stateItem || null;

        if (!item && routeId) {
            try {
                const res = await getDetailSpecialtyById(routeId, "ALL");
                if (res && res.errCode === 0) {
                    item = Array.isArray(res.data) ? res.data[0] : res.data;
                }
            } catch (error) {
                console.log("loadSpecialty detail error", error);
            }
        }

        if (!item) {
            toast.error("Specialty not found.");
            this.handleBack();
            return;
        }

        this.setState({
            specialtyId: item.id || routeId,
            previewImg: buildImageSrc(item.image),
            formData: {
                name: item.name || "",
                slug: item.slug || buildSlug(item.name),
                descriptionHTML: item.descriptionHTML || "",
                descriptionMarkdown: item.descriptionMarkdown || item.descriptionHTML || "",
                image: getImagePayload(item.image),
                isActive: String(item.isActive ?? 1),
                displayOrder: item.displayOrder ?? 1,
            },
            slugTouched: false,
        });
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
            const { formData, specialtyId } = this.state;
            const res = await EditSpecialtyId({
                id: specialtyId,
                name: formData.name.trim(),
                slug: formData.slug.trim(),
                image: formData.image,
                descriptionHTML: formData.descriptionHTML,
                descriptionMarkdown: formData.descriptionMarkdown,
                isActive: Number(formData.isActive),
                displayOrder: Number(formData.displayOrder) || 1,
            });

            if (res && res.errCode === 0) {
                toast.success("Specialty updated successfully!");
                this.handleBack();
            } else {
                toast.error(res?.errMessage || "Failed to update specialty.");
            }
        } catch (error) {
            console.error("EditSpecialtyId error", error);
            toast.error("An error occurred while saving.");
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
                mode="EDIT"
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

export default EditSpecialty;
