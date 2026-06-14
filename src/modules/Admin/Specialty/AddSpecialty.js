import React, { Component } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import * as action from "../../../store/actions";
import { getAllSpecialty } from "../../../services/userService";
import { readFileAsDataUrl } from "../../../utils/imageUtils";
import SpecialtyForm from "./SpecialtyForm";
import {
    buildSpecialtyPayload,
    getDefaultSpecialtyFormData,
    getNextDisplayOrder,
    updateSpecialtyFormField,
    validateSpecialtyForm,
} from "./specialtyFormUtils";

class AddSpecialty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: getDefaultSpecialtyFormData(),
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
            const nextDisplayOrder = getNextDisplayOrder(specialties);

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
            const res = await this.props.SaveSpecialty(buildSpecialtyPayload(this.state.formData));

            if (res && res.errCode === 0) {
                this.setState({
                    formData: getDefaultSpecialtyFormData(),
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
