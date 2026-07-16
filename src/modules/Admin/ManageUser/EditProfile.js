import React, { Component } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import _ from "lodash";
import { languages } from "../../../utils/constant";
import * as action from "../../../store/actions";
import { EditUser, changePassword } from "../../../services/userService";
import "./EditProfile.scss";

class EditProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: "",
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      address: "",
      gender: "",
      roleId: "",
      positionId: "",
      avatar: "",
      previewImg: "",
      genderArr: [],
      positionArr: [],
      roleArr: [],
      errors: {},
      isSaving: false,
      isChangingPassword: false,

      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      securityErrors: {},
    };
  }

  componentDidMount() {
    this.props.getGender();
    this.props.getPosition();
    this.props.getRole();

    const { currentUser } = this.props;
    if (currentUser && !_.isEmpty(currentUser)) {
      this.initUserData(currentUser);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentUser !== this.props.currentUser && this.props.currentUser) {
      this.initUserData(this.props.currentUser);
    }
    if (prevProps.gender !== this.props.gender) {
      this.setState({ genderArr: this.props.gender });
    }
    if (prevProps.position !== this.props.position) {
      this.setState({ positionArr: this.props.position });
    }
    if (prevProps.role !== this.props.role) {
      this.setState({ roleArr: this.props.role });
    }
  }

  initUserData = (user) => {
    this.setState({
      id: user.id || "",
      email: user.email || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      gender: user.gender || "",
      roleId: user.roleId || "",
      positionId: user.positionId || "",
      avatar: user.image || "",
      previewImg: user.image ? `data:image/jpeg;base64,${user.image}` : "https://i.ibb.co/L5T1YhY/avatar.png",
      errors: {},
    });
  };

  handleOnChangeInput = (e, field) => {
    const value = e.target.value;
    const securityFields = ["currentPassword", "newPassword", "confirmPassword"];

    this.setState((prevState) => ({
      ...prevState,
      [field]: value,
      errors: { ...prevState.errors, [field]: "" },
      securityErrors: securityFields.includes(field)
        ? { ...prevState.securityErrors, [field]: "" }
        : prevState.securityErrors,
    }));
  };

  handleOnChangeImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        this.setState({
          previewImg: objectUrl,
          avatar: reader.result.split(",")[1],
        });
      };
      reader.readAsDataURL(file);
    }
  };

  handleRemoveImage = () => {
    this.setState({
      previewImg: "https://i.ibb.co/L5T1YhY/avatar.png",
      avatar: "",
    });
  };

  validateForm = () => {
    const { firstName, lastName, phoneNumber, address, gender, email } = this.state;
    const { language } = this.props;
    const errors = {};

    // First name
    if (!firstName || firstName.trim() === "") {
      errors.firstName = language === languages.VI ? "Họ và tên lót không được để trống!" : "First name is required!";
    }

    // Last name
    if (!lastName || lastName.trim() === "") {
      errors.lastName = language === languages.VI ? "Tên không được để trống!" : "Last name is required!";
    }

    // Email (disabled but validate if edit)
    if (!email || email.trim() === "") {
      errors.email = language === languages.VI ? "Email không được để trống!" : "Email is required!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = language === languages.VI ? "Định dạng email không hợp lệ!" : "Invalid email format!";
    }

    // Phone
    if (!phoneNumber || phoneNumber.trim() === "") {
      errors.phoneNumber = language === languages.VI ? "Số điện thoại không được để trống!" : "Phone number is required!";
    } else if (!/^[0-9]{9,11}$/.test(phoneNumber)) {
      errors.phoneNumber = language === languages.VI ? "Số điện thoại chỉ gồm 9-11 chữ số!" : "Phone number must be 9-11 digits!";
    }

    // Address
    if (!address || address.trim() === "") {
      errors.address = language === languages.VI ? "Địa chỉ không được để trống!" : "Address is required!";
    }

    // Gender
    if (!gender || gender.trim() === "") {
      errors.gender = language === languages.VI ? "Vui lòng chọn giới tính!" : "Please select gender!";
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  handleSaveChanges = async () => {
    const isValid = this.validateForm();
    if (!isValid) {
      toast.warning(this.props.language === languages.VI ? "Vui lòng kiểm tra lại thông tin!" : "Please verify your input!");
      return;
    }

    this.setState({ isSaving: true });
    try {
      const profileData = {
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        address: this.state.address,
        gender: this.state.gender,
        phoneNumber: this.state.phoneNumber,
        positionId: this.state.roleId === "R2" ? this.state.positionId : "", // Position applies only to Doctor role
        image: this.state.avatar,
      };
      const payload = this.props.isAdmin
        ? {
          ...profileData,
          id: this.state.id,
          email: this.state.email,
          roleId: this.state.roleId,
        }
        : profileData;

      const res = await EditUser(payload);
      if (res && res.errCode === 0) {
        toast.success(this.props.language === languages.VI ? "Cập nhật hồ sơ thành công!" : "Profile updated successfully!");

        // Sync with redux auth state immediately to update header
        if (this.props.isAdmin) {
          this.props.updateAdminInfo(res.data);
        } else {
          this.props.updateDoctorInfo(res.data);
        }
      } else {
        toast.error(res?.errMessage || (this.props.language === languages.VI ? "Cập nhật thất bại!" : "Update failed!"));
      }
    } catch (error) {
      console.log("Error updating profile: ", error);
      toast.error(this.props.language === languages.VI ? "Lỗi máy chủ!" : "Server error!");
    } finally {
      this.setState({ isSaving: false });
    }
  };

  handleCancel = () => {
    this.props.history.goBack();
  };

  // Security password handler (simulated)
  handleUpdatePassword = (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = this.state;
    const { language } = this.props;
    const securityErrors = {};

    if (!currentPassword) {
      securityErrors.currentPassword = language === languages.VI ? "Vui lòng nhập mật khẩu hiện tại!" : "Current password is required!";
    }
    if (!newPassword) {
      securityErrors.newPassword = language === languages.VI ? "Vui lòng nhập mật khẩu mới!" : "New password is required!";
    } else if (newPassword.length < 6) {
      securityErrors.newPassword = language === languages.VI ? "Mật khẩu mới phải từ 6 ký tự!" : "New password must be at least 6 characters!";
    }
    if (newPassword !== confirmPassword) {
      securityErrors.confirmPassword = language === languages.VI ? "Mật khẩu xác nhận không khớp!" : "Confirm password does not match!";
    }

    this.setState({ securityErrors });

    if (Object.keys(securityErrors).length === 0) {
      toast.info(
        language === languages.VI
          ? "Chức năng đổi mật khẩu đang được phát triển nâng cấp (API TODO)."
          : "Change password feature is under development (API TODO)."
      );
      this.setState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  validatePasswordForm = () => {
    const { currentPassword, newPassword, confirmPassword } = this.state;
    const { language } = this.props;
    const securityErrors = {};

    if (!currentPassword || currentPassword.trim() === "") {
      securityErrors.currentPassword = language === languages.VI ? "Vui lòng nhập mật khẩu hiện tại!" : "Current password is required!";
    }
    if (!newPassword || newPassword.trim() === "") {
      securityErrors.newPassword = language === languages.VI ? "Vui lòng nhập mật khẩu mới!" : "New password is required!";
    } else if (newPassword.length < 6) {
      securityErrors.newPassword = language === languages.VI ? "Mật khẩu mới phải từ 6 ký tự!" : "New password must be at least 6 characters!";
    } else if (newPassword === currentPassword) {
      securityErrors.newPassword = language === languages.VI ? "Mật khẩu mới phải khác mật khẩu hiện tại!" : "New password must be different from current password!";
    }
    if (!confirmPassword || confirmPassword.trim() === "") {
      securityErrors.confirmPassword = language === languages.VI ? "Vui lòng xác nhận mật khẩu mới!" : "Please confirm your new password!";
    } else if (newPassword !== confirmPassword) {
      securityErrors.confirmPassword = language === languages.VI ? "Mật khẩu xác nhận không khớp!" : "Confirm password does not match!";
    }

    this.setState({ securityErrors });
    return Object.keys(securityErrors).length === 0;
  };

  handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    const { language } = this.props;

    if (!this.validatePasswordForm()) {
      return;
    }

    this.setState({ isChangingPassword: true });
    try {
      const res = await changePassword({
        currentPassword: this.state.currentPassword,
        newPassword: this.state.newPassword,
        confirmPassword: this.state.confirmPassword,
      });

      if (res && res.errCode === 0) {
        toast.success(language === languages.VI ? "Đổi mật khẩu thành công!" : "Password changed successfully!");
        this.setState({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          securityErrors: {},
        });
      } else {
        toast.error(res?.errMessage || (language === languages.VI ? "Đổi mật khẩu thất bại!" : "Password change failed!"));
      }
    } catch (error) {
      console.log("Error changing password: ", error);
      toast.error(language === languages.VI ? "Lỗi máy chủ!" : "Server error!");
    } finally {
      this.setState({ isChangingPassword: false });
    }
  };

  render() {
    const { language } = this.props;
    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      address,
      gender,
      positionId,
      roleId,
      previewImg,
      genderArr,
      positionArr,
      errors,
      isSaving,
      isChangingPassword,
      currentPassword,
      newPassword,
      confirmPassword,
      securityErrors,
    } = this.state;

    // Determine current user display role name
    let roleName = "";
    if (language === languages.VI) {
      roleName = roleId === "R1" ? "Quản trị viên" : roleId === "R2" ? "Bác sĩ" : "Người dùng";
    } else {
      roleName = roleId === "R1" ? "Administrator" : roleId === "R2" ? "Doctor" : "User";
    }

    void roleName;
    return (
      <div className="edit-profile-container">
        {/* <div className="profile-header-banner">
          <div className="banner-gradient"></div>
          <div className="profile-summary">
            <div className="avatar-wrapper">
              <img src={previewImg} alt="avatar" className="profile-avatar-img" />
              <div className="role-tag">{roleName}</div>
            </div>
            <div className="user-text-info">
              <h2 className="full-name">{`${firstName} ${lastName}`}</h2>
              <p className="email-phone-sub">
                <i className="fas fa-envelope me-2"></i>{email}
                {phoneNumber && (
                  <>
                    <span className="divider-dot">•</span>
                    <i className="fas fa-phone me-2"></i>{phoneNumber}
                  </>
                )}
              </p>
            </div>
          </div>
        </div> */}

        <div className="container-fluid mt-4">
          <div className="row g-4">
            {/* Left side: Form Info */}
            <div className="col-12 col-xl-8">
              <div className="profile-card">
                <div className="card-header-premium">
                  <div className="card-header-title">
                    <i className="fas fa-user-edit me-2 header-icon"></i>
                    {language === languages.VI ? "Thông tin cá nhân" : "Personal Information"}
                  </div>
                </div>

                <div className="card-body-premium">
                  <div className="row g-3">
                    {/* First Name */}
                    <div className="col-12 col-md-6">
                      <label className="form-label-premium">
                        {language === languages.VI ? "Họ và tên lót" : "First Name"} <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-input-premium ${errors.firstName ? "input-error" : ""}`}
                        value={firstName}
                        onChange={(e) => this.handleOnChangeInput(e, "firstName")}
                        placeholder={language === languages.VI ? "Nhập họ và tên lót" : "Enter first name"}
                      />
                      {errors.firstName && <div className="error-text-premium">{errors.firstName}</div>}
                    </div>

                    {/* Last Name */}
                    <div className="col-12 col-md-6">
                      <label className="form-label-premium">
                        {language === languages.VI ? "Tên" : "Last Name"} <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-input-premium ${errors.lastName ? "input-error" : ""}`}
                        value={lastName}
                        onChange={(e) => this.handleOnChangeInput(e, "lastName")}
                        placeholder={language === languages.VI ? "Nhập tên" : "Enter last name"}
                      />
                      {errors.lastName && <div className="error-text-premium">{errors.lastName}</div>}
                    </div>

                    {/* Email */}
                    <div className="col-12 col-md-6">
                      <label className="form-label-premium">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-input-premium disabled-input"
                        value={email}
                        disabled
                        title={language === languages.VI ? "Email không được phép thay đổi" : "Email cannot be changed"}
                      />
                      <small className="form-text text-muted">
                        {language === languages.VI ? "Email đăng nhập không thể thay đổi." : "Login email cannot be changed."}
                      </small>
                    </div>

                    {/* Phone Number */}
                    <div className="col-12 col-md-6">
                      <label className="form-label-premium">
                        {language === languages.VI ? "Số điện thoại" : "Phone Number"} <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-input-premium ${errors.phoneNumber ? "input-error" : ""}`}
                        value={phoneNumber}
                        onChange={(e) => this.handleOnChangeInput(e, "phoneNumber")}
                        placeholder={language === languages.VI ? "Nhập số điện thoại" : "Enter phone number"}
                      />
                      {errors.phoneNumber && <div className="error-text-premium">{errors.phoneNumber}</div>}
                    </div>

                    {/* Address */}
                    <div className="col-12">
                      <label className="form-label-premium">
                        {language === languages.VI ? "Địa chỉ" : "Address"} <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-input-premium ${errors.address ? "input-error" : ""}`}
                        value={address}
                        onChange={(e) => this.handleOnChangeInput(e, "address")}
                        placeholder={language === languages.VI ? "Nhập địa chỉ của bạn" : "Enter your address"}
                      />
                      {errors.address && <div className="error-text-premium">{errors.address}</div>}
                    </div>

                    {/* Gender */}
                    <div className="col-12 col-md-6">
                      <label className="form-label-premium">
                        {language === languages.VI ? "Giới tính" : "Gender"} <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select-premium ${errors.gender ? "input-error" : ""}`}
                        value={gender}
                        onChange={(e) => this.handleOnChangeInput(e, "gender")}
                      >
                        <option value="">{language === languages.VI ? "-- Chọn giới tính --" : "-- Select Gender --"}</option>
                        {genderArr.map((item, index) => (
                          <option key={index} value={item.keyMap}>
                            {language === languages.VI ? item.value_vi : item.value_en}
                          </option>
                        ))}
                      </select>
                      {errors.gender && <div className="error-text-premium">{errors.gender}</div>}
                    </div>

                    {/* Position (Only visible for Doctor role - R2) */}
                    {roleId === "R2" && (
                      <div className="col-12 col-md-6">
                        <label className="form-label-premium">
                          {language === languages.VI ? "Chức danh bác sĩ" : "Doctor Title / Position"}
                        </label>
                        <select
                          className="form-select-premium"
                          value={positionId}
                          onChange={(e) => this.handleOnChangeInput(e, "positionId")}
                        >
                          <option value="">{language === languages.VI ? "-- Chọn chức danh --" : "-- Select Position --"}</option>
                          {positionArr.map((item, index) => (
                            <option key={index} value={item.keyMap}>
                              {language === languages.VI ? item.value_vi : item.value_en}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="form-actions-premium mt-4">
                    <button
                      type="button"
                      className="btn-premium-secondary"
                      onClick={this.handleCancel}
                      disabled={isSaving}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      {language === languages.VI ? "Quay lại" : "Back"}
                    </button>
                    <button
                      type="button"
                      className="btn-premium-primary"
                      onClick={this.handleSaveChanges}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          {language === languages.VI ? "Đang lưu..." : "Saving..."}
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          {language === languages.VI ? "Lưu thay đổi" : "Save Changes"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Photo & Security */}
            <div className="col-12 col-xl-4">
              <div className="row g-4">
                {/* Photo Upload Card */}
                <div className="col-12">
                  <div className="profile-card">
                    <div className="card-header-premium">
                      <div className="card-header-title">
                        <i className="fas fa-camera me-2 header-icon"></i>
                        {language === languages.VI ? "Ảnh đại diện" : "Avatar Photo"}
                      </div>
                    </div>

                    <div className="card-body-premium text-center">
                      <div className="photo-preview-box mb-3">
                        <img src={previewImg} alt="Avatar preview" className="photo-preview-image" />
                      </div>
                      {/* <div className="avatar-wrapper">
                        <img src={previewImg} alt="avatar" className="profile-avatar-img" />
                        <div className="role-tag">{roleName}</div>
                      </div> */}

                      <div className="photo-actions">
                        <div className="upload-wrapper">
                          <input
                            type="file"
                            id="upload-avatar-btn"
                            accept="image/png, image/jpeg, image/jpg"
                            hidden
                            onChange={this.handleOnChangeImage}
                          />
                          <label htmlFor="upload-avatar-btn" className="btn-upload-label">
                            <i className="fas fa-upload me-2"></i>
                            {language === languages.VI ? "Chọn ảnh mới" : "Upload New Image"}
                          </label>
                        </div>
                        {previewImg && previewImg !== "https://i.ibb.co/L5T1YhY/avatar.png" && (
                          <button
                            type="button"
                            className="btn-premium-danger mt-2"
                            onClick={this.handleRemoveImage}
                          >
                            <i className="fas fa-trash-alt me-2"></i>
                            {language === languages.VI ? "Xóa ảnh" : "Remove Photo"}
                          </button>
                        )}
                      </div>

                      <div className="text-muted small mt-3">
                        {language === languages.VI
                          ? "Gợi ý định dạng: JPG, JPEG, PNG. Dung lượng vừa phải để tối ưu hóa hiển thị."
                          : "Supported formats: JPG, JPEG, PNG. Choose a reasonably-sized image for optimization."}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Card */}
                <div className="col-12">
                  <div className="profile-card">
                    <div className="card-header-premium">
                      <div className="card-header-title">
                        <i className="fas fa-shield-alt me-2 header-icon"></i>
                        {language === languages.VI ? "Bảo mật & Mật khẩu" : "Security & Password"}
                      </div>
                    </div>

                    <div className="card-body-premium">

                      <form onSubmit={this.handleSubmitPasswordChange}>
                        {/* Current Password */}
                        <div className="mb-3">
                          <label className="form-label-premium">
                            {language === languages.VI ? "Mật khẩu hiện tại" : "Current Password"}
                          </label>
                          <input
                            type="password"
                            className={`form-input-premium ${securityErrors.currentPassword ? "input-error" : ""}`}
                            value={currentPassword}
                            onChange={(e) => this.handleOnChangeInput(e, "currentPassword")}
                            placeholder="••••••••"
                          />
                          {securityErrors.currentPassword && (
                            <div className="error-text-premium">{securityErrors.currentPassword}</div>
                          )}
                        </div>

                        {/* New Password */}
                        <div className="mb-3">
                          <label className="form-label-premium">
                            {language === languages.VI ? "Mật khẩu mới" : "New Password"}
                          </label>
                          <input
                            type="password"
                            className={`form-input-premium ${securityErrors.newPassword ? "input-error" : ""}`}
                            value={newPassword}
                            onChange={(e) => this.handleOnChangeInput(e, "newPassword")}
                            placeholder="••••••••"
                          />
                          {securityErrors.newPassword && (
                            <div className="error-text-premium">{securityErrors.newPassword}</div>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-3">
                          <label className="form-label-premium">
                            {language === languages.VI ? "Xác nhận mật khẩu mới" : "Confirm New Password"}
                          </label>
                          <input
                            type="password"
                            className={`form-input-premium ${securityErrors.confirmPassword ? "input-error" : ""}`}
                            value={confirmPassword}
                            onChange={(e) => this.handleOnChangeInput(e, "confirmPassword")}
                            placeholder="••••••••"
                          />
                          {securityErrors.confirmPassword && (
                            <div className="error-text-premium">{securityErrors.confirmPassword}</div>
                          )}
                        </div>

                        <button type="submit" className="btn-premium-primary w-100 mt-2" disabled={isChangingPassword}>
                          {isChangingPassword ? (
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          ) : (
                            <i className="fas fa-key me-2"></i>
                          )}
                          {language === languages.VI ? "Đổi mật khẩu" : "Update Password"}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const pathName = window.location.pathname;
  const isAdmin = pathName.includes("/system");
  const currentUser = isAdmin ? state.adminAuth.adminInfo : state.doctor.doctorInfo;

  return {
    language: state.app.language,
    currentUser: currentUser,
    isAdmin: isAdmin,
    gender: state.admin.genderArr,
    position: state.admin.positionArr,
    role: state.admin.roleArr,
  };
};

const mapDispatchToProps = (dispatch) => ({
  getGender: () => dispatch(action.fetchGender()),
  getPosition: () => dispatch(action.fetchPosition()),
  getRole: () => dispatch(action.fetchRole()),
  updateAdminInfo: (data) => dispatch({ type: "UPDATE_ADMIN_INFO", data }),
  updateDoctorInfo: (data) => dispatch({ type: "UPDATE_DOCTOR_INFO", data }),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditProfile);
