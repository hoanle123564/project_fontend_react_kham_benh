import React, { Component } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { EditClinicId, getAllUser, getDetailClinicById, getLookUp } from "../../../services/userService";
import { buildImageSrc, readFileAsDataUrl } from "../../../utils/imageUtils";
import ClinicForm from "./ClinicForm";
import {
    buildClinicPayload,
    buildLookupOptions,
    buildManagerOptions,
    getDefaultClinicFormData,
    mapClinicToFormData,
    updateClinicFormField,
    validateClinicForm,
} from "./clinicFormUtils";

class EditClinic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clinicId: null,
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
        this.loadClinic();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.language !== this.props.language) {
            this.loadFormOptions(this.state.formData.provinceCode, this.state.formData.districtCode);
        }
    }

    loadFormOptions = async (provinceCode = "", districtCode = "") => {
        try {
            const [clinicTypeRes, provinceRes, userRes, districtRes, wardRes] = await Promise.all([
                getLookUp("CLINIC_TYPE"),
                getLookUp("PROVINCE"),
                getAllUser("ALL"),
                provinceCode ? getLookUp("DISTRICT", provinceCode) : Promise.resolve({ data: [] }),
                districtCode ? getLookUp("WARD", districtCode) : Promise.resolve({ data: [] }),
            ]);

            this.setState({
                clinicTypeOptions: buildLookupOptions(clinicTypeRes?.data || [], this.props.language),
                provinceOptions: buildLookupOptions(provinceRes?.data || [], this.props.language),
                managerOptions: buildManagerOptions(userRes?.users || []),
                districtOptions: buildLookupOptions(districtRes?.data || [], this.props.language),
                wardOptions: buildLookupOptions(wardRes?.data || [], this.props.language),
            });
        } catch (error) {
            console.log("load clinic edit form options error", error);
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
            toast.error("Kh\u00f4ng t\u00ecm th\u1ea5y ph\u00f2ng kh\u00e1m.");
            this.handleBack();
            return;
        }

        this.setState({
            clinicId: clinicData.id || routeId,
            previewImg: buildImageSrc(clinicData.image),
            formData: mapClinicToFormData(clinicData),
            slugTouched: false,
        }, () => {
            this.loadFormOptions(clinicData.provinceCode || "", clinicData.districtCode || "");
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
            const res = await EditClinicId(buildClinicPayload(this.state.formData, this.state.clinicId));

            if (res && res.errCode === 0) {
                toast.success("C\u1eadp nh\u1eadt ph\u00f2ng kh\u00e1m th\u00e0nh c\u00f4ng!");
                this.handleBack();
            } else {
                toast.error(res?.errMessage || "C\u1eadp nh\u1eadt ph\u00f2ng kh\u00e1m th\u1ea5t b\u1ea1i.");
            }
        } catch (error) {
            console.error("EditClinicId error", error);
            toast.error("C\u00f3 l\u1ed7i x\u1ea3y ra khi l\u01b0u ph\u00f2ng kh\u00e1m.");
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

const mapStateToProps = (state) => ({
    language: state.app.language,
});

export default connect(mapStateToProps)(EditClinic);
