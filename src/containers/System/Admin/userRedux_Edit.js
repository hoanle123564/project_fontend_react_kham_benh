import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { connect } from "react-redux";
import _ from "lodash";

import { languages } from "../../../utils/constant";
import * as action from "../../../store/actions";

class UserEdit extends Component {
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
      positionId: "",
      roleId: "",
      avatar: "",
      previewImg: "",
      isOpen: false,
      genderArr: [],
      positionArr: [],
      roleArr: [],
      errors: {}, // lưu lỗi từng dòng
    };
  }

  componentDidMount() {
    const user = this.props.CurrentUser;
    if (user && !_.isEmpty(user)) {
      this.setState({
        ...user,
        previewImg: user.image ? `data:image/jpeg;base64,${user.image}` : "",
        avatar: user.image || "",
      });
    }

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
  }

  toggle = () => {
    this.props.toggleUser();
  };

  handleOnchange = (event, field) => {
    this.setState({
      [field]: event.target.value,
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

  // ✅ Kiểm tra và gán lỗi song ngữ
  checkValidateInput = () => {
    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      address,
      gender,
      positionId,
      roleId,
    } = this.state;
    const { language } = this.props;
    const errors = {};

    if (!email || email.trim() === "")
      errors.email =
        language === languages.VI
          ? "Vui lòng nhập Email!"
          : "Please enter your email!";

    if (!firstName || firstName.trim() === "")
      errors.firstName =
        language === languages.VI
          ? "Vui lòng nhập tên!"
          : "Please enter first name!";

    if (!lastName || lastName.trim() === "")
      errors.lastName =
        language === languages.VI
          ? "Vui lòng nhập họ!"
          : "Please enter last name!";

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

    if (!address || address.trim() === "")
      errors.address =
        language === languages.VI
          ? "Vui lòng chọn địa chỉ!"
          : "Please select an address!";

    if (!gender)
      errors.gender =
        language === languages.VI
          ? "Vui lòng chọn giới tính!"
          : "Please select gender!";

    if (!positionId)
      errors.positionId =
        language === languages.VI
          ? "Vui lòng chọn chức vụ!"
          : "Please select position!";

    if (!roleId)
      errors.roleId =
        language === languages.VI
          ? "Vui lòng chọn vai trò!"
          : "Please select role!";

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  handleEditUser = async () => {
    const valid = this.checkValidateInput();
    if (!valid) return;

    this.props.getEditUser(this.state);
    this.toggle();
  };

  render() {
    const {
      genderArr,
      positionArr,
      roleArr,
      previewImg,
      errors,
    } = this.state;
    const { language } = this.props;

    return (
      <Modal isOpen={this.props.isOpen} toggle={this.toggle} size="lg" centered>
        <ModalHeader toggle={this.toggle}>
          <i className="fa-solid fa-user-pen me-2"></i>
          Edit User
        </ModalHeader>

        <ModalBody>
          {/* Email + Phone */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label>Email</label>
              <input
                type="email"
                className={`form-control ${errors.email ? "input-error" : ""}`}
                onChange={(e) => this.handleOnchange(e, "email")}
                value={this.state.email}
                disabled
              />
              {errors.email && <div className="error-text">{errors.email}</div>}
            </div>

            <div className="col-md-6">
              <label>
                <FormattedMessage id="user-manage.phone" />
              </label>
              <input
                type="text"
                className={`form-control ${errors.phoneNumber ? "input-error" : ""
                  }`}
                onChange={(e) => this.handleOnchange(e, "phoneNumber")}
                value={this.state.phoneNumber}
              />
              {errors.phoneNumber && (
                <div className="error-text">{errors.phoneNumber}</div>
              )}
            </div>
          </div>

          {/* First + Last */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label>
                <FormattedMessage id="user-manage.first-name" />
              </label>
              <input
                type="text"
                className={`form-control ${errors.firstName ? "input-error" : ""
                  }`}
                onChange={(e) => this.handleOnchange(e, "firstName")}
                value={this.state.firstName}
              />
              {errors.firstName && (
                <div className="error-text">{errors.firstName}</div>
              )}
            </div>

            <div className="col-md-6">
              <label>
                <FormattedMessage id="user-manage.last-name" />
              </label>
              <input
                type="text"
                className={`form-control ${errors.lastName ? "input-error" : ""
                  }`}
                onChange={(e) => this.handleOnchange(e, "lastName")}
                value={this.state.lastName}
              />
              {errors.lastName && (
                <div className="error-text">{errors.lastName}</div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="row mb-3">
            <div className="col-md-12">
              <label>
                <FormattedMessage id="user-manage.address" />
              </label>
              <select
                className={`form-select ${errors.address ? "input-error" : ""
                  }`}
                value={this.state.address}
                onChange={(e) => this.handleOnchange(e, "address")}
              >
                <option value="">
                  <FormattedMessage id="user-manage.choose" />
                </option>
                {this.props.ListVietNamProvinces.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {errors.address && (
                <div className="error-text">{errors.address}</div>
              )}
            </div>
          </div>

          {/* Gender + Position + Role */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label>Gender</label>
              <select
                className={`form-select ${errors.gender ? "input-error" : ""}`}
                value={this.state.gender}
                onChange={(e) => this.handleOnchange(e, "gender")}
              >
                <option value="">Choose...</option>
                {genderArr.map((item, index) => (
                  <option key={index} value={item.keyMap}>
                    {language === languages.VI
                      ? item.value_vi
                      : item.value_en}
                  </option>
                ))}
              </select>
              {errors.gender && (
                <div className="error-text">{errors.gender}</div>
              )}
            </div>

            <div className="col-md-4">
              <label>Position</label>
              <select
                className={`form-select ${errors.positionId ? "input-error" : ""
                  }`}
                value={this.state.positionId}
                onChange={(e) => this.handleOnchange(e, "positionId")}
              >
                <option value="">Choose...</option>
                {positionArr.map((item, index) => (
                  <option key={index} value={item.keyMap}>
                    {language === languages.VI
                      ? item.value_vi
                      : item.value_en}
                  </option>
                ))}
              </select>
              {errors.positionId && (
                <div className="error-text">{errors.positionId}</div>
              )}
            </div>

            <div className="col-md-4">
              <label>Role</label>
              <select
                className={`form-select ${errors.roleId ? "input-error" : ""}`}
                value={this.state.roleId}
                onChange={(e) => this.handleOnchange(e, "roleId")}
              >
                <option value="">Choose...</option>
                {roleArr.map((item, index) => (
                  <option key={index} value={item.keyMap}>
                    {language === languages.VI
                      ? item.value_vi
                      : item.value_en}
                  </option>
                ))}
              </select>
              {errors.roleId && (
                <div className="error-text">{errors.roleId}</div>
              )}
            </div>
          </div>

          {/* Avatar */}
          <div className="row mb-4">
            <div className="col-md-12 text-start">
              <label className="mb-2">
                <FormattedMessage id="user-manage.avatar" defaultMessage="Avatar" />
              </label>

              <div className="d-flex align-items-center">
                {/* Nút chọn ảnh */}
                <div className="upload-btn-wrapper me-3">
                  <input
                    type="file"
                    id="avatar-edit"
                    accept="image/*"
                    hidden
                    onChange={(e) => this.handleOnChangeImage(e)}
                  />
                  <label htmlFor="avatar-edit" className="btn btn-outline-primary">
                    <FormattedMessage
                      id="user-manage.choose-image"
                      defaultMessage="Choose image"
                    />
                    <i className="fa-solid fa-upload ms-2"></i>
                  </label>
                </div>

                {/* Nút bỏ ảnh */}
                {this.state.previewImg && (
                  <button
                    type="button"
                    className="btn btn-outline-danger me-3"
                    onClick={() =>
                      this.setState({ previewImg: "", avatar: "" })
                    }
                  >
                    <FormattedMessage
                      id="user-manage.remove-image"
                      defaultMessage="Remove image"
                    />
                    <i className="fa-solid fa-xmark ms-2"></i>
                  </button>
                )}

                {/* Ảnh xem trước */}
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
                      <FormattedMessage
                        id="user-manage.no-image"
                        defaultMessage="No image"
                      />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </ModalBody>

        <ModalFooter>
          <Button
            color="primary"
            className="px-4"
            onClick={this.handleEditUser}
          >
            <i className="fa-solid fa-floppy-disk me-2"></i>
            <FormattedMessage id="user-manage.save_change" />
          </Button>
          <Button color="secondary" className="px-4" onClick={this.toggle}>
            <i className="fa-solid fa-xmark me-2"></i>
            <FormattedMessage id="user-manage.cancel" />
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
  gender: state.admin.genderArr,
  position: state.admin.positionArr,
  role: state.admin.roleArr,
  ListVietNamProvinces: state.admin.vietnamProvinces,
});

const mapDispatchToProps = (dispatch) => ({
  getGender: () => dispatch(action.fetchGender()),
  getPosition: () => dispatch(action.fetchPosition()),
  getRole: () => dispatch(action.fetchRole()),
  getEditUser: (User) => dispatch(action.fetchEditUser(User)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserEdit);
