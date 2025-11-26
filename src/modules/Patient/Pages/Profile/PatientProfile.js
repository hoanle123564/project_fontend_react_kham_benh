import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";

import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";

import "./PatientProfile.scss";
import user_default from "../../../../assets/user_default_1.png";

import EditModal from "./EditModal";
import * as action from "../../../../store/actions";

class PatientProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditing: false
        };
    }

    toggleEdit = () => {
        this.setState({ isEditing: !this.state.isEditing });
    };

    handleUpdate = async (data) => {
        let res = await this.props.fetchEditUser(data);
        console.log('res edit patient profile', res);

        if (res && res.errCode === 0) {
            this.props.patientEditSuccess(res.data);
            this.toggleEdit();
        }
    };

    render() {
        const { patientInfo, language } = this.props;

        if (!patientInfo) {
            return <div>{language === 'vi' ? 'Không tìm thấy thông tin bệnh nhân' : 'Patient information not found'}</div>;
        }

        const user = patientInfo;
        const avatar = user.image ? `data:image/jpeg;base64,${user.image}` : user_default;

        return (
            <>
                <HomeHeader />

                <div className="profile-cover"></div>

                <div className="profile-wrapper">
                    <div className="profile-card">

                        <div className="profile-header">
                            <div className="avatar-box">
                                <img src={avatar} alt="avatar" />
                            </div>

                            <div className="basic-info">
                                <h2 className="name">{user.firstName} {user.lastName}</h2>
                                <p className="role">{this.props.language === 'vi' ? 'Bệnh nhân' : 'Patient'}</p>
                            </div>
                        </div>

                        <div className="profile-details">
                            <div className="detail-item">
                                <div className="left">
                                    <i className="far fa-envelope"></i><FormattedMessage id="manage-patient.email" />
                                </div>
                                <div className="right">{user.email}</div>
                            </div>

                            <div className="detail-item">
                                <div className="left">
                                    <i className="fas fa-phone-alt"></i><FormattedMessage id="manage-patient.phone-number" />
                                </div>
                                <div className="right">{user.phoneNumber}</div>
                            </div>

                            <div className="detail-item">
                                <div className="left">
                                    <i className="fas fa-venus-mars"></i><FormattedMessage id="manage-patient.gender" />
                                </div>
                                <div className="right">
                                    {user.gender === "M" ? (this.props.language === 'vi' ? "Nam" : "Male") :
                                        user.gender === "F" ? (this.props.language === 'vi' ? "Nữ" : "Female") :
                                            (this.props.language === 'vi' ? "Khác" : "Other")}
                                </div>
                            </div>

                            <div className="detail-item">
                                <div className="left">
                                    <i className="fas fa-map-marker-alt"></i><FormattedMessage id="manage-patient.address" />
                                </div>
                                <div className="right">{user.address}</div>
                            </div>
                        </div>

                        <div className="profile-buttons">
                            <button className="edit-btn" onClick={this.toggleEdit}>
                                <i className="fas fa-edit"></i> {this.props.language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                            </button>

                            <button className="logout-btn-patient" onClick={() => {
                                this.props.patientLogout();
                                localStorage.removeItem("patientToken");
                            }}>
                                <i className="fas fa-sign-out-alt"></i> <FormattedMessage id="home-header.logout" />
                            </button>
                        </div>

                    </div>
                </div>

                <HomeFooter />

                <EditModal
                    isOpen={this.state.isEditing}
                    toggle={this.toggleEdit}
                    currentUser={patientInfo}
                    onSave={this.handleUpdate}
                />
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        patientInfo: state.patient.patientInfo,
        language: state.app.language
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        patientLogout: () => dispatch({ type: "PATIENT_LOGOUT" }),
        patientEditSuccess: (data) => dispatch({ type: "PATIENT_EDIT_SUCCESS", data }),
        fetchEditUser: (data) => dispatch(action.fetchEditUser(data)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PatientProfile);