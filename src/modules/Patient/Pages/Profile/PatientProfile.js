import React, { Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import moment from "moment";

import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import PatientSidebar from "../../Layout/PatientSidebar";

import "./PatientProfile.scss";
import userDefault from "../../../../assets/user_default_1.png";

import EditModal from "./EditModal";
import { getPatientProfile, updatePatientProfile } from "../../../../services/userService";
import { buildImageSrc } from "../../../../utils/imageUtils";

class PatientProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditing: false,
            isLoading: false,
            isSaving: false,
            errorMessage: "",
            patientProfile: props.patientInfo || null,
        };
    }

    async componentDidMount() {
        await this.loadProfile();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.patientInfo !== this.props.patientInfo && !this.state.patientProfile) {
            this.setState({ patientProfile: this.props.patientInfo });
        }
    }

    getText = (key, defaultMessage = key) =>
        this.props.intl.formatMessage({
            id: `patient.profile.${key}`,
            defaultMessage,
        });

    loadProfile = async () => {
        this.setState({ isLoading: true, errorMessage: "" });

        try {
            const res = await getPatientProfile();

            if (res?.errCode === 0) {
                this.setState({
                    patientProfile: res.data || null,
                    isLoading: false,
                });
                this.props.patientEditSuccess(res.data);
                return;
            }

            this.setState({
                isLoading: false,
                errorMessage: res?.errMessage || this.getText("loadError"),
            });
        } catch (error) {
            this.setState({
                isLoading: false,
                errorMessage: this.getText("loadError"),
            });
        }
    };

    toggleEdit = () => {
        if (!this.state.isSaving) {
            this.setState((prevState) => ({ isEditing: !prevState.isEditing }));
        }
    };

    handleUpdate = async (data) => {
        this.setState({ isSaving: true, errorMessage: "" });

        try {
            const res = await updatePatientProfile(data);

            if (res?.errCode === 0) {
                this.props.patientEditSuccess(res.data);
                this.setState({
                    patientProfile: res.data || null,
                    isSaving: false,
                    isEditing: false,
                });
                return;
            }

            this.setState({
                isSaving: false,
                errorMessage: res?.errMessage || this.getText("saveError"),
            });
        } catch (error) {
            this.setState({
                isSaving: false,
                errorMessage: this.getText("saveError"),
            });
        }
    };

    formatDate = (value) => {
        if (!value) return this.getText("empty");
        const date = moment(value);
        return date.isValid() ? date.format("DD/MM/YYYY") : this.getText("empty");
    };

    formatGender = (gender) => {
        if (gender === "M") return this.getText("male");
        if (gender === "F") return this.getText("female");
        if (gender === "O") return this.getText("other");
        return this.getText("empty");
    };

    displayValue = (value, suffix = "") => {
        if (value === undefined || value === null || value === "") {
            return this.getText("empty");
        }

        return `${value}${suffix}`;
    };

    renderDetailItem = (icon, label, value) => (
        <div className="detail-item">
            <div className="left">
                <i className={icon}></i>
                <span>{label}</span>
            </div>
            <div className="right">{value}</div>
        </div>
    );

    renderProfileState = (message, withRetry = false) => (
        <>
            <HomeHeader showBanner={false} />
            <div className="patient-dashboard-layout">
                <div className="container d-flex flex-start gap-3">
                    <PatientSidebar />
                    <div className="patient-page-content">
                        <div className={`profile-state ${withRetry ? "profile-state-error" : ""}`}>
                            <div>{message}</div>
                            {withRetry && (
                                <button type="button" onClick={this.loadProfile}>
                                    {this.getText("retry")}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <HomeFooter />
        </>
    );

    render() {
        const { patientProfile, isLoading, isSaving, errorMessage } = this.state;
        const user = patientProfile || this.props.patientInfo;

        if (isLoading && !user) {
            return this.renderProfileState(this.getText("loading"));
        }

        if (!user) {
            return this.renderProfileState(errorMessage || this.getText("notFound"), true);
        }

        const avatar = buildImageSrc(user.image) || userDefault;

        return (
            <>
                <HomeHeader showBanner={false} />
                <div className="patient-dashboard-layout">
                    <div className="container d-flex flex-start gap-3">
                        <PatientSidebar />
                        <div className="patient-page-content">
                            <div className="profile-card">
                                <div className="profile-header">
                                    <div className="avatar-box">
                                        <img src={avatar} alt="avatar" />
                                    </div>

                                    <div className="basic-info">
                                        <h2 className="name">{user.firstName} {user.lastName}</h2>
                                        <p className="role">{this.getText("patient")}</p>
                                    </div>
                                </div>

                                {errorMessage && (
                                    <div className="profile-inline-error">{errorMessage}</div>
                                )}

                                <div className="profile-details">
                                    <h3>{this.getText("contact")}</h3>
                                    {this.renderDetailItem("far fa-envelope", this.getText("email"), this.displayValue(user.email))}
                                    {this.renderDetailItem("fas fa-phone-alt", this.getText("phone"), this.displayValue(user.phoneNumber))}
                                    {this.renderDetailItem("fas fa-venus-mars", this.getText("gender"), this.formatGender(user.gender))}
                                    {this.renderDetailItem("fas fa-map-marker-alt", this.getText("address"), this.displayValue(user.address))}

                                    <h3>{this.getText("health")}</h3>
                                    {this.renderDetailItem("fas fa-id-card", this.getText("medicalCode"), this.displayValue(user.medicalCode))}
                                    {this.renderDetailItem("fas fa-cake-candles", this.getText("dateOfBirth"), this.formatDate(user.dateOfBirth))}
                                    {this.renderDetailItem("fas fa-address-card", this.getText("citizenId"), this.displayValue(user.citizenId))}
                                    {this.renderDetailItem("fas fa-notes-medical", this.getText("insurance"), this.displayValue(user.healthInsuranceCode))}
                                    {this.renderDetailItem("fas fa-droplet", this.getText("bloodType"), this.displayValue(user.bloodType))}
                                    {this.renderDetailItem("fas fa-briefcase", this.getText("occupation"), this.displayValue(user.occupation))}
                                    {this.renderDetailItem("fas fa-triangle-exclamation", this.getText("allergies"), this.displayValue(user.allergies))}
                                </div>

                                <div className="profile-buttons">
                                    <button className="edit-btn" onClick={this.toggleEdit} disabled={isSaving}>
                                        <i className="fas fa-edit"></i> {this.getText("edit")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <HomeFooter />
                <EditModal
                    isOpen={this.state.isEditing}
                    toggle={this.toggleEdit}
                    currentUser={user}
                    onSave={this.handleUpdate}
                    isSaving={isSaving}
                />
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        patientInfo: state.patient.patientInfo,
        language: state.app.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        patientLogout: () => dispatch({ type: "PATIENT_LOGOUT" }),
        patientEditSuccess: (data) => dispatch({ type: "PATIENT_EDIT_SUCCESS", data }),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PatientProfile));
