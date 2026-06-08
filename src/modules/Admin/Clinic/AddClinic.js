import React, { Component } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import * as action from "../../../store/actions";
import { getAllClinic } from "../../../services/userService";
import ClinicForm from "./ClinicForm";

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

class AddClinic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: {
                name: "",
                slug: "",
                address: "",
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
            const res = await getAllClinic();
            const clinics = Array.isArray(res?.data) ? res.data : [];
            const nextDisplayOrder = clinics.reduce((maxValue, item) => {
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
            console.log("loadNextDisplayOrder clinic error", error);
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
            errors.name = "Vui lòng nhập tên phòng khám.";
        }

        if (!String(formData.slug || "").trim()) {
            errors.slug = "Vui lòng nhập slug.";
        }

        if (!String(formData.address || "").trim()) {
            errors.address = "Vui lòng nhập địa chỉ phòng khám.";
        }

        if (!formData.image) {
            errors.image = "Vui lòng chọn ảnh phòng khám.";
        }

        if (!hasVisibleEditorContent(formData.descriptionHTML)) {
            errors.descriptionHTML = "Vui lòng nhập mô tả phòng khám.";
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
            const res = await this.props.SaveClinic({
                name: formData.name.trim(),
                slug: formData.slug.trim(),
                address: formData.address.trim(),
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
                        address: "",
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
                toast.error(res?.errMessage || "Lưu phòng khám thất bại.");
            }
        } catch (error) {
            console.log("SaveClinic error", error);
            toast.error("Lưu phòng khám thất bại.");
        } finally {
            this.setState({ isSubmitting: false });
        }
    };

    handleBack = () => {
        this.props.history.push("/system/manage-clinic");
    };

    render() {
        return (
            <ClinicForm
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
    SaveClinic: (data) => dispatch(action.SaveClinic(data)),
});

export default connect(null, mapDispatchToProps)(AddClinic);
