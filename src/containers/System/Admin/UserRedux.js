import React, { Component } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect } from "react-redux";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { languages } from "../../../utils/constant";
import * as action from "../../../store/actions";
import "./UserRedux.scss";

class UserRedux extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      address: "",
      gender: "",
      position: "",
      role: "",
      avatar: "",
      previewImg: "",
      isModalOpen: false,
      genderArr: [],
      positionArr: [],
      roleArr: [],
      // lưu lỗi từng dòng
      errors: {},
    };
  }

  async componentDidMount() {
    this.props.getGender();
    this.props.getPosition();
    this.props.getRole();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.gender !== this.props.gender)
      this.setState({ genderArr: this.props.gender });

    if (prevProps.position !== this.props.position)
      this.setState({ positionArr: this.props.position });

    if (prevProps.role !== this.props.role)
      this.setState({ roleArr: this.props.role });

    if (prevProps.ListUser !== this.props.ListUser)
      this.setState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
        gender: "",
        position: "",
        role: "",
        avatar: "",
        previewImg: "",
        errors: {},
      });
  }

  toggleModal = () => {
    this.setState({ isModalOpen: !this.state.isModalOpen });
  };

  handleChangeInput = (e, field) => {
    this.setState({
      [field]: e.target.value,
      errors: { ...this.state.errors, [field]: "" },
    });
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

  // ✅ Kiểm tra và gán lỗi từng dòng
  checkValidateInput = () => {
    const { email, password, firstName, lastName, phoneNumber, address } =
      this.state;
    const errors = {};
    const { language } = this.props;

    // email
    if (!email || email.trim() === "")
      errors.email =
        language === languages.VI
          ? "Vui lòng nhập Email!"
          : "Please enter your email!";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email =
        language === languages.VI
          ? "Email không hợp lệ!"
          : "Invalid email address!";

    // password
    if (!password || password.trim() === "")
      errors.password =
        language === languages.VI
          ? "Vui lòng nhập mật khẩu!"
          : "Please enter your password!";

    // first name
    if (!firstName || firstName.trim() === "")
      errors.firstName =
        language === languages.VI
          ? "Vui lòng nhập tên!"
          : "Please enter first name!";

    // last name
    if (!lastName || lastName.trim() === "")
      errors.lastName =
        language === languages.VI
          ? "Vui lòng nhập họ!"
          : "Please enter last name!";

    // phone
    if (!phoneNumber || phoneNumber.trim() === "")
      errors.phoneNumber =
        language === languages.VI
          ? "Vui lòng nhập số điện thoại!"
          : "Please enter phone number!";
    else if (!/^[0-9]{9,11}$/.test(phoneNumber))
      errors.phoneNumber =
        language === languages.VI
          ? "Số điện thoại không hợp lệ!"
          : "Invalid phone number!";

    // address
    if (!address || address.trim() === "")
      errors.address =
        language === languages.VI
          ? "Vui lòng chọn địa chỉ!"
          : "Please select an address!";

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  handleSaveUser = async () => {
    let valid = this.checkValidateInput();
    if (!valid) return;

    this.props.saveUser({
      email: this.state.email,
      password: this.state.password,
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      address: this.state.address,
      gender: this.state.gender,
      positionId: this.state.position,
      roleId: this.state.role,
      phoneNumber: this.state.phoneNumber,
      avatar: this.state.avatar,
    });

    this.toggleModal();
  };

  render() {
    const { genderArr, positionArr, roleArr, errors } = this.state;
    const { language, intl, ListVietNamProvinces } = this.props;

    return (
      <div className="user-redux-container text-center mt-4">
        <Button color="primary" onClick={this.toggleModal}>
          <i className="fa-solid fa-user-plus me-2"></i>
          <FormattedMessage id="user-manage.add" />
        </Button>

        <Modal
          isOpen={this.state.isModalOpen}
          toggle={this.toggleModal}
          size="lg"
          centered
          className="user-modal"
        >
          <ModalHeader toggle={this.toggleModal}>
            <i className="fa-solid fa-user me-2"></i>
            <FormattedMessage id="user-manage.add" />
          </ModalHeader>

          <ModalBody>
            <div className="row mb-3">
              <div className="col-md-6">
                <label>Email</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "input-error" : ""}`}
                  value={this.state.email}
                  onChange={(e) => this.handleChangeInput(e, "email")}
                />
                {errors.email && <div className="error-text">{errors.email}</div>}
              </div>

              <div className="col-md-6">
                <label>
                  <FormattedMessage id="user-manage.password" />
                </label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? "input-error" : ""
                    }`}
                  value={this.state.password}
                  onChange={(e) => this.handleChangeInput(e, "password")}
                />
                {errors.password && (
                  <div className="error-text">{errors.password}</div>
                )}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label>First Name</label>
                <input
                  type="text"
                  className={`form-control ${errors.firstName ? "input-error" : ""
                    }`}
                  value={this.state.firstName}
                  onChange={(e) => this.handleChangeInput(e, "firstName")}
                />
                {errors.firstName && (
                  <div className="error-text">{errors.firstName}</div>
                )}
              </div>
              <div className="col-md-6">
                <label>Last Name</label>
                <input
                  type="text"
                  className={`form-control ${errors.lastName ? "input-error" : ""
                    }`}
                  value={this.state.lastName}
                  onChange={(e) => this.handleChangeInput(e, "lastName")}
                />
                {errors.lastName && (
                  <div className="error-text">{errors.lastName}</div>
                )}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label>Phone</label>
                <input
                  type="text"
                  className={`form-control ${errors.phoneNumber ? "input-error" : ""
                    }`}
                  value={this.state.phoneNumber}
                  onChange={(e) => this.handleChangeInput(e, "phoneNumber")}
                />
                {errors.phoneNumber && (
                  <div className="error-text">{errors.phoneNumber}</div>
                )}
              </div>

              <div className="col-md-6">
                <label>Address</label>
                <select
                  className={`form-select ${errors.address ? "input-error" : ""
                    }`}
                  value={this.state.address}
                  onChange={(e) => this.handleChangeInput(e, "address")}
                >
                  <option value="">
                    {intl.formatMessage({ id: "user-manage.choose" })}
                  </option>
                  {ListVietNamProvinces.map((item, i) => (
                    <option key={i} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                {errors.address && (
                  <div className="error-text">{errors.address}</div>
                )}
              </div>
            </div>

            {/* Gender - Position - Role */}
            <div className="row mb-3">
              <div className="col-md-4">
                <label>Gender</label>
                <select
                  className="form-select"
                  value={this.state.gender}
                  onChange={(e) => this.handleChangeInput(e, "gender")}
                >
                  <option>
                    {intl.formatMessage({ id: "user-manage.choose" })}
                  </option>
                  {genderArr.map((item, index) => (
                    <option key={index} value={item.keyMap}>
                      {language === languages.VI
                        ? item.value_vi
                        : item.value_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label>Position</label>
                <select
                  className="form-select"
                  value={this.state.position}
                  onChange={(e) => this.handleChangeInput(e, "position")}
                >
                  <option>
                    {intl.formatMessage({ id: "user-manage.choose" })}
                  </option>
                  {positionArr.map((item, index) => (
                    <option key={index} value={item.keyMap}>
                      {language === languages.VI
                        ? item.value_vi
                        : item.value_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label>Role</label>
                <select
                  className="form-select"
                  value={this.state.role}
                  onChange={(e) => this.handleChangeInput(e, "role")}
                >
                  <option>
                    {intl.formatMessage({ id: "user-manage.choose" })}
                  </option>
                  {roleArr.map((item, index) => (
                    <option key={index} value={item.keyMap}>
                      {language === languages.VI
                        ? item.value_vi
                        : item.value_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Avatar */}
            <div className="row mb-4">
              <div className="col-md-12 text-start">
                <label className="mb-2">Avatar</label>
                <div className="d-flex align-items-center">
                  <div className="upload-btn-wrapper me-3">
                    <input
                      type="file"
                      id="avatar"
                      accept="image/*"
                      hidden
                      onChange={(e) => this.handleOnChangeImage(e)}
                    />
                    <label htmlFor="avatar" className="btn btn-outline-primary">
                      <FormattedMessage id="user-manage.choose-image" defaultMessage="Choose image" />
                      <i className="fa-solid fa-upload ms-2"></i>
                    </label>
                  </div>

                  {this.state.previewImg && (
                    <button
                      type="button"
                      className="btn btn-outline-danger me-3"
                      onClick={() =>
                        this.setState({ previewImg: "", avatar: "" })
                      }
                    >
                      <FormattedMessage id="user-manage.remove-image" defaultMessage="Remove" />
                      <i className="fa-solid fa-xmark ms-2"></i>
                    </button>
                  )}

                  <div
                    className="preview-image-container"
                    onClick={() =>
                      this.state.previewImg && this.setState({ isOpen: true })
                    }
                  >
                    {this.state.previewImg ? (
                      <img
                        src={this.state.previewImg}
                        alt="preview"
                        className="preview-image"
                      />
                    ) : (
                      <span className="text-muted">
                        <FormattedMessage id="user-manage.no-image" defaultMessage="No image" />
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button color="primary" onClick={this.handleSaveUser}>
              <FormattedMessage id="user-manage.save" />
            </Button>
            <Button color="secondary" onClick={this.toggleModal}>
              <FormattedMessage id="user-manage.cancel" />
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
  gender: state.admin.genderArr,
  position: state.admin.positionArr,
  role: state.admin.roleArr,
  ListUser: state.admin.user,
  ListVietNamProvinces: state.admin.vietnamProvinces,
});

const mapDispatchToProps = (dispatch) => ({
  getGender: () => dispatch(action.fetchGender()),
  getPosition: () => dispatch(action.fetchPosition()),
  getRole: () => dispatch(action.fetchRole()),
  saveUser: (data) => dispatch(action.saveUser(data)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(UserRedux));
