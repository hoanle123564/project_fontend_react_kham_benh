import React, { Component } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import * as action from "../../../store/actions";
import { getAllClinic, getAllUser, getLookUp } from "../../../services/userService";
import { readFileAsDataUrl } from "../../../utils/imageUtils";
import ClinicForm from "./ClinicForm";
import {
    buildClinicPayload,
    buildLookupOptions,
    buildManagerOptions,
    getDefaultClinicFormData,
    getNextDisplayOrder,
    updateClinicFormField,
    validateClinicForm,
} from "./clinicFormUtils";

class AddClinic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: getDefaultClinicFormData(),
            clinicTypeOptions: [],
            managerOptions: [],
            provinceOptions: [],
            districtOptions: [],
            wardOptions: [],
            previewImg: "",
            slugTouched: false,
            errors: {},
            isSubmitting: false,
        };
    }

    componentDidMount() {
        this.loadNextDisplayOrder();
        this.loadFormOptions();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.language !== this.props.language) {
            this.loadFormOptions();
        }
    }

    loadNextDisplayOrder = async () => {
        try {
            const res = await getAllClinic();
            const clinics = Array.isArray(res?.data) ? res.data : [];
            const nextDisplayOrder = getNextDisplayOrder(clinics);

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

    loadFormOptions = async () => {
        try {
            const [clinicTypeRes, provinceRes, userRes] = await Promise.all([
                getLookUp("CLINIC_TYPE"),
                getLookUp("PROVINCE"),
                getAllUser("ALL"),
            ]);

            this.setState({
                clinicTypeOptions: buildLookupOptions(clinicTypeRes?.data || [], this.props.language),
                provinceOptions: buildLookupOptions(provinceRes?.data || [], this.props.language),
                managerOptions: buildManagerOptions(userRes?.users || []),
            });
        } catch (error) {
            console.log("load clinic form options error", error);
        }
    };

    loadDistrictOptions = async (provinceCode) => {
        if (!provinceCode) {
            this.setState({ districtOptions: [], wardOptions: [] });
            return;
        }

        const res = await getLookUp("DISTRICT", provinceCode);
        this.setState({
            districtOptions: buildLookupOptions(res?.data || [], this.props.language),
            wardOptions: [],
        });
    };

    loadWardOptions = async (districtCode) => {
        if (!districtCode) {
            this.setState({ wardOptions: [] });
            return;
        }

        const res = await getLookUp("WARD", districtCode);
        this.setState({
            wardOptions: buildLookupOptions(res?.data || [], this.props.language),
        });
    };

    handleInputChange = (event, field) => {
        const value = event.target.value;

        this.setState((prevState) => {
            const nextState = updateClinicFormField(
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

        if (field === "provinceCode") {
            this.loadDistrictOptions(value);
        }

        if (field === "districtCode") {
            this.loadWardOptions(value);
        }
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
            console.log("handle clinic image error", error);
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
        const errors = validateClinicForm(this.state.formData);
        this.setState({ errors });
        return Object.keys(errors).length === 0;
    };

    handleSaveContent = async () => {
        if (!this.validateForm() || this.state.isSubmitting) {
            return;
        }

        this.setState({ isSubmitting: true });

        try {
            const res = await this.props.SaveClinic(buildClinicPayload(this.state.formData));

            if (res && res.errCode === 0) {
                this.setState({
                    formData: getDefaultClinicFormData(),
                    previewImg: "",
                    slugTouched: false,
                    errors: {},
                });
                await this.loadNextDisplayOrder();
            } else {
                toast.error(res?.errMessage || "L\u01b0u ph\u00f2ng kh\u00e1m th\u1ea5t b\u1ea1i.");
            }
        } catch (error) {
            console.log("SaveClinic error", error);
            toast.error("L\u01b0u ph\u00f2ng kh\u00e1m th\u1ea5t b\u1ea1i.");
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
                language={this.props.language}
                clinicTypeOptions={this.state.clinicTypeOptions}
                managerOptions={this.state.managerOptions}
                provinceOptions={this.state.provinceOptions}
                districtOptions={this.state.districtOptions}
                wardOptions={this.state.wardOptions}
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

const mapStateToProps = (state) => ({
    language: state.app.language,
});

export default connect(mapStateToProps, mapDispatchToProps)(AddClinic);
