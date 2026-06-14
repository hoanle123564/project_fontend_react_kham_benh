import React, { Component } from "react";
import { toast } from "react-toastify";
import { EditSpecialtyId, getDetailSpecialtyById } from "../../../services/userService";
import { buildImageSrc, readFileAsDataUrl } from "../../../utils/imageUtils";
import SpecialtyForm from "./SpecialtyForm";
import {
    buildSpecialtyPayload,
    getDefaultSpecialtyFormData,
    mapSpecialtyToFormData,
    updateSpecialtyFormField,
    validateSpecialtyForm,
} from "./specialtyFormUtils";

class EditSpecialty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            specialtyId: null,
            formData: getDefaultSpecialtyFormData(),
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
            formData: mapSpecialtyToFormData(item),
            slugTouched: false,
        });
    };

    handleInputChange = (event, field) => {
        const value = event.target.value;

        this.setState((prevState) => {
            const nextState = updateSpecialtyFormField(
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
                descriptionHTML: value,
                descriptionMarkdown: value,
            },
            errors: {
                ...prevState.errors,
                descriptionHTML: "",
            },
        }));
    };

    handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const result = await readFileAsDataUrl(file);
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
        } catch (error) {
            console.log("handle specialty image error", error);
        }
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
        const errors = validateSpecialtyForm(this.state.formData);
        this.setState({ errors });
        return Object.keys(errors).length === 0;
    };

    handleSaveContent = async () => {
        if (!this.validateForm() || this.state.isSubmitting) {
            return;
        }

        this.setState({ isSubmitting: true });

        try {
            const res = await EditSpecialtyId(
                buildSpecialtyPayload(this.state.formData, this.state.specialtyId)
            );

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
