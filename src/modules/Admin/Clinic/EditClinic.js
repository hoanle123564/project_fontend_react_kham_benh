import React, { Component } from "react";
import { toast } from "react-toastify";
import { EditClinicId, getDetailClinicById } from "../../../services/userService";
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

class EditClinic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clinicId: null,
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
        this.loadClinic();
    }

    loadClinic = async () => {
        const routeId = this.props.match?.params?.id;
        const stateItem = this.props.location?.state?.clinicData;
        let clinicData = stateItem || null;

        if (!clinicData && routeId) {
            try {
                const res = await getDetailClinicById(routeId, "ALL");
                if (res && res.errCode === 0) {
                    clinicData = Array.isArray(res.data) ? res.data[0] : res.data;
                }
            } catch (error) {
                console.log("loadClinic detail error", error);
            }
        }

        if (!clinicData) {
            toast.error("Không tìm thấy phòng khám.");
            this.handleBack();
            return;
        }

        this.setState({
            clinicId: clinicData.id || routeId,
            previewImg: buildImageSrc(clinicData.image),
            formData: {
                name: clinicData.name || "",
                slug: clinicData.slug || buildSlug(clinicData.name),
                address: clinicData.address || "",
                descriptionHTML: clinicData.descriptionHTML || "",
                descriptionMarkdown: clinicData.descriptionMarkdown || clinicData.descriptionHTML || "",
                image: getImagePayload(clinicData.image),
                isActive: String(clinicData.isActive ?? 1),
                displayOrder: clinicData.displayOrder ?? 1,
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
            const { formData, clinicId } = this.state;
            const res = await EditClinicId({
                id: clinicId,
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
                toast.success("Cập nhật phòng khám thành công!");
                this.handleBack();
            } else {
                toast.error(res?.errMessage || "Cập nhật phòng khám thất bại.");
            }
        } catch (error) {
            console.error("EditClinicId error", error);
            toast.error("Có lỗi xảy ra khi lưu phòng khám.");
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

export default EditClinic;
