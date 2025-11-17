import React, { Component } from "react";
import { connect } from "react-redux";

import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";

import "./PatientProfile.scss";
import user_default from "../../../../assets/user_default_1.png";

class PatientProfile extends Component {

    handleLogout = () => {
        this.props.patientLogout();
        localStorage.removeItem("patientToken");
    };

    render() {
        const { patientInfo } = this.props;

        if (!patientInfo) {
            return (
                <div className="profile-main">
                    Không tìm thấy thông tin bệnh nhân
                </div>
            );
        }

        const user = patientInfo;
        const fullName = `${user.firstName} ${user.lastName}`;
        const avatar = user.image
            ? `data:image/jpeg;base64,${user.image}`
            : user_default;

        return (
            <>
                <HomeHeader />

                {/* COVER */}
                <div className="profile-cover"></div>

                <div className="profile-wrapper">

                    {/* CARD PROFILE */}
                    <div className="profile-card">

                        {/* Avatar + Name */}
                        <div className="profile-header">
                            <div className="avatar-box">
                                <img src={avatar} alt="avatar" />
                            </div>

                            <div className="basic-info">
                                <h2 className="name">{fullName}</h2>
                                <p className="role">Bệnh nhân</p>
                            </div>
                        </div>

                        {/* DETAILS */}
                        <div className="profile-details">

                            <div className="detail-item">
                                <div className="left">
                                    <i className="far fa-envelope"></i>
                                    <span>Email</span>
                                </div>
                                <div className="right">{user.email}</div>
                            </div>

                            <div className="detail-item">
                                <div className="left">
                                    <i className="fas fa-phone-alt"></i>
                                    <span>Số điện thoại</span>
                                </div>
                                <div className="right">{user.phoneNumber || "Chưa cập nhật"}</div>
                            </div>

                            <div className="detail-item">
                                <div className="left">
                                    <i className="fas fa-venus-mars"></i>
                                    <span>Giới tính</span>
                                </div>
                                <div className="right">
                                    {user.gender === "M" ? "Nam" :
                                        user.gender === "F" ? "Nữ" : "Khác"}
                                </div>
                            </div>

                            <div className="detail-item">
                                <div className="left">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>Địa chỉ</span>
                                </div>
                                <div className="right">{user.address || "Chưa cập nhật"}</div>
                            </div>

                        </div>

                        {/* LOGOUT */}
                        <button className="logout-btn-patient" onClick={this.handleLogout}>
                            <i className="fas fa-sign-out-alt"></i> Đăng xuất
                        </button>

                    </div>
                </div>

                <HomeFooter />
            </>
        );
    }
}

export default connect(
    state => ({
        patientInfo: state.patient.patientInfo
    }),
    dispatch => ({
        patientLogout: () => dispatch({ type: "PATIENT_LOGOUT" })
    })
)(PatientProfile);
