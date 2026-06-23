import React, { Component } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import moment from "moment";
import user_default from "../../../../assets/user_default_1.png";
import "./EditModal.scss";

class EditModal extends Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    componentDidMount() {
        this.loadUserToState(this.props.currentUser);
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.currentUser !== this.props.currentUser ||
            (!prevProps.isOpen && this.props.isOpen)
        ) {
            this.loadUserToState(this.props.currentUser);
        }
    }

    getInitialState = () => ({
        email: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
        gender: "",
        avatar: "",
        previewImg: user_default,
        dateOfBirth: "",
        citizenId: "",
        healthInsuranceCode: "",
        bloodType: "",
        occupation: "",
        allergies: "",
        errors: {},
    });

    getText = (key, defaultMessage = key) =>
        this.props.intl.formatMessage({
            id: `patient.profile.edit.${key}`,
            defaultMessage,
        });

    formatInputDate = (value) => {
        if (!value) return "";
        const date = moment(value);
        return date.isValid() ? date.format("YYYY-MM-DD") : "";
    };

    loadUserToState = (user = {}) => {
        this.setState({
            email: user.email || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            phoneNumber: user.phoneNumber || "",
            address: user.address || "",
            gender: user.gender || "",
            avatar: user.image || "",
            previewImg: user.image ? `data:image/jpeg;base64,${user.image}` : user_default,
            dateOfBirth: this.formatInputDate(user.dateOfBirth),
            citizenId: user.citizenId || "",
            healthInsuranceCode: user.healthInsuranceCode || "",
            bloodType: user.bloodType || "",
            occupation: user.occupation || "",
            allergies: user.allergies || "",
            errors: {},
        });
    };

    toggle = () => {
        if (!this.props.isSaving) {
            this.props.toggle();
        }
    };

    handleChange = (e, field) => {
        const value = e.target.value;

        this.setState((prev) => ({
            [field]: value,
            errors: { ...prev.errors, [field]: "" },
        }));
    };

    handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        const reader = new FileReader();

        reader.onloadend = () => {
            this.setState({
                previewImg: previewUrl,
                avatar: reader.result.split(",")[1],
            });
        };
        reader.readAsDataURL(file);
    };

    clearImage = () => {
        this.setState({
            avatar: "",
            previewImg: user_default,
        });
    };

    validate = () => {
        const {
            firstName,
            lastName,
            phoneNumber,
            address,
            gender,
        } = this.state;
        const errors = {};

        if (!firstName.trim()) errors.firstName = this.getText("requiredFirstName");
        if (!lastName.trim()) errors.lastName = this.getText("requiredLastName");

        if (!phoneNumber.trim()) {
            errors.phoneNumber = this.getText("requiredPhone");
        } else if (!/^[0-9]{9,11}$/.test(phoneNumber)) {
            errors.phoneNumber = this.getText("invalidPhone");
        }

        if (!address.trim()) errors.address = this.getText("requiredAddress");
        if (!gender) errors.gender = this.getText("requiredGender");

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    };

    handleSave = () => {
        if (!this.validate()) return;

        const {
            email,
            firstName,
            lastName,
            phoneNumber,
            address,
            gender,
            avatar,
            dateOfBirth,
            citizenId,
            healthInsuranceCode,
            bloodType,
            occupation,
            allergies,
        } = this.state;

        this.props.onSave({
            email,
            firstName,
            lastName,
            phoneNumber,
            address,
            gender,
            image: avatar,
            dateOfBirth,
            citizenId,
            healthInsuranceCode,
            bloodType,
            occupation,
            allergies,
        });
    };

    renderInput = (field, label, options = {}) => {
        const { errors } = this.state;
        const inputType = options.type || "text";
        const ComponentTag = options.multiline ? "textarea" : "input";

        return (
            <div className={options.className || "col-md-6"}>
                <label>{label}</label>
                <ComponentTag
                    type={inputType}
                    className={`form-control ${errors[field] ? "input-error" : ""}`}
                    value={this.state[field]}
                    min={options.min}
                    disabled={options.disabled || this.props.isSaving}
                    onChange={(e) => this.handleChange(e, field)}
                />
                {errors[field] && <div className="error-text">{errors[field]}</div>}
            </div>
        );
    };

    render() {
        const { errors } = this.state;
        const isDefaultImage = this.state.previewImg === user_default;
        const isSaving = this.props.isSaving;

        return (
            <Modal isOpen={this.props.isOpen} toggle={this.toggle} size="lg" centered>
                <ModalHeader toggle={this.toggle}>
                    <i className="fa-solid fa-user-pen me-2"></i>
                    {this.getText("title")}
                </ModalHeader>

                <ModalBody>
                    <div className="row mb-3">
                        {this.renderInput("email", this.getText("email"), {
                            className: "col-md-12",
                            disabled: true,
                        })}
                    </div>

                    <div className="row mb-3">
                        {this.renderInput("lastName", this.getText("lastName"))}
                        {this.renderInput("firstName", this.getText("firstName"))}
                    </div>

                    <div className="row mb-3">
                        {this.renderInput("phoneNumber", this.getText("phone"))}
                        <div className="col-md-6">
                            <label>{this.getText("gender")}</label>
                            <select
                                className={`form-select ${errors.gender ? "input-error" : ""}`}
                                value={this.state.gender}
                                disabled={isSaving}
                                onChange={(e) => this.handleChange(e, "gender")}
                            >
                                <option value="">{this.getText("choose")}</option>
                                <option value="M">{this.getText("male")}</option>
                                <option value="F">{this.getText("female")}</option>
                                <option value="O">{this.getText("other")}</option>
                            </select>
                            {errors.gender && <div className="error-text">{errors.gender}</div>}
                        </div>
                    </div>

                    <div className="row mb-3">
                        {this.renderInput("address", this.getText("address"), {
                            className: "col-md-12",
                        })}
                    </div>

                    <div className="row mb-3">
                        {this.renderInput("dateOfBirth", this.getText("dateOfBirth"), { type: "date" })}
                        {this.renderInput("citizenId", this.getText("citizenId"))}
                    </div>

                    <div className="row mb-3">
                        {this.renderInput("healthInsuranceCode", this.getText("insurance"))}
                        {this.renderInput("bloodType", this.getText("bloodType"))}
                    </div>

                    <div className="row mb-3">
                        {this.renderInput("occupation", this.getText("occupation"))}
                        {this.renderInput("allergies", this.getText("allergies"), { multiline: true })}
                    </div>

                    <div className="row mb-4 align-items-center">
                        <div className="col-md-7">
                            <label>{this.getText("avatar")}</label>

                            <div className="d-flex align-items-center gap-3 mt-2">
                                <label className="btn btn-select-image">
                                    {this.getText("chooseImage")} <i className="fa-solid fa-upload ms-1"></i>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        disabled={isSaving}
                                        onChange={this.handleImageChange}
                                    />
                                </label>

                                {!isDefaultImage && (
                                    <button
                                        type="button"
                                        className="btn btn-remove-image"
                                        onClick={this.clearImage}
                                        disabled={isSaving}
                                    >
                                        {this.getText("removeImage")} <i className="fa-solid fa-xmark ms-1"></i>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="col-md-5 text-center">
                            {isDefaultImage ? (
                                <div className="no-image-box">{this.getText("noImage")}</div>
                            ) : (
                                <img
                                    src={this.state.previewImg}
                                    className="avatar-preview"
                                    alt="preview"
                                />
                            )}
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button color="primary" onClick={this.handleSave} disabled={isSaving}>
                        <i className="fa-solid fa-floppy-disk me-2"></i>
                        {isSaving ? this.getText("saving") : this.getText("save")}
                    </Button>
                    <Button color="secondary" onClick={this.toggle} disabled={isSaving}>
                        <i className="fa-solid fa-xmark me-2"></i>
                        {this.getText("cancel")}
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language
});

export default connect(mapStateToProps)(injectIntl(EditModal));
