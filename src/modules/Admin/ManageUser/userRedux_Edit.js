import React, { Component } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { connect } from "react-redux";
import _ from "lodash";

import { languages } from "../../../utils/constant";
import * as action from "../../../store/actions";
import { getLookUp } from "../../../services/userService";
import { readFileAsDataUrl } from "../../../utils/imageUtils";
import {
  getUserLocationFieldState,
  loadDistrictOptions,
  loadLocationOptions,
  loadWardOptions,
} from "./userFormUtils";

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
      provinceCode: "",
      districtCode: "",
      wardCode: "",
      gender: "",
      positionId: "",
      roleId: "",
      avatar: "",
      previewImg: "",
      isOpen: false,
      genderArr: [],
      positionArr: [],
      roleArr: [],
      provinceOptions: [],
      districtOptions: [],
      wardOptions: [],
      errors: {}, // lưu lỗi từng dòng
    };
  }

  async componentDidMount() {
    const user = this.props.CurrentUser;

    if (user && !_.isEmpty(user)) {
      this.setState({
        ...user,
        provinceCode: user.provinceCode || "",
        districtCode: user.districtCode || "",
        wardCode: user.wardCode || "",
        positionId: user.positionId || "",
        previewImg: user.image ? `data:image/jpeg;base64,${user.image}` : "",
        avatar: user.image || "",
      });
    }

    this.props.getGender();
    this.props.getPosition();
    this.props.getRole();
    await this.loadLocationOptions(user?.provinceCode || "", user?.districtCode || "");
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

  loadLocationOptions = async (provinceCode = "", districtCode = "") => {
    this.setState(await loadLocationOptions(getLookUp, provinceCode, districtCode));
  };

  loadDistrictOptions = async (provinceCode) => {
    this.setState(await loadDistrictOptions(getLookUp, provinceCode));
  };

  loadWardOptions = async (districtCode) => {
    this.setState(await loadWardOptions(getLookUp, districtCode));
  };

  handleOnchange = (event, field) => {
    const value = event.target.value;
    this.setState((prevState) => {
      const updatedState = {
        ...prevState,
        ...getUserLocationFieldState(field, value, "roleId", "positionId"),
        errors: { ...prevState.errors, [field]: "" },
      };
      return updatedState;
    }, () => {
      if (field === "provinceCode") {
        this.loadDistrictOptions(value);
      }
      if (field === "districtCode") {
        this.loadWardOptions(value);
      }
    });
  };

  handleOnChangeImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const dataUrl = await readFileAsDataUrl(file);
    this.setState({ previewImg: URL.createObjectURL(file), avatar: dataUrl.split(",")[1] || "" });
  };

  getText = (id, defaultMessage) =>
    this.props.intl.formatMessage({ id, defaultMessage });

  checkValidateInput = () => {
    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      address,
      provinceCode,
      districtCode,
      wardCode,
      gender,
      roleId,
    } = this.state;
    const errors = {};

    if (!email || email.trim() === "")
      errors.email = this.getText("user-manage.error-email-required", "Please enter your email!");

    if (!firstName || firstName.trim() === "")
      errors.firstName = this.getText("user-manage.error-first-name-required", "Please enter first name!");

    if (!lastName || lastName.trim() === "")
      errors.lastName = this.getText("user-manage.error-last-name-required", "Please enter last name!");

    if (!phoneNumber || phoneNumber.trim() === "")
      errors.phoneNumber = this.getText("user-manage.error-phone-required", "Please enter phone number!");
    else if (!/^[0-9]{9,11}$/.test(phoneNumber))
      errors.phoneNumber = this.getText("user-manage.error-phone-invalid", "Invalid phone number!");

    if (!address || address.trim() === "")
      errors.address = this.getText("user-manage.error-address-required", "Please enter your address!");

    if (!provinceCode)
      errors.provinceCode = this.getText("user-manage.error-province-required", "Please select province/city!");

    if (!districtCode)
      errors.districtCode = this.getText("user-manage.error-district-required", "Please select district!");

    if (!wardCode)
      errors.wardCode = this.getText("user-manage.error-ward-required", "Please select ward!");

    if (!gender)
      errors.gender = this.getText("user-manage.error-gender-required", "Please select gender!");

    if (!roleId)
      errors.roleId = this.getText("user-manage.error-role-required", "Please select role!");

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  handleEditUser = async () => {
    const valid = this.checkValidateInput();
    if (!valid) return;

    this.props.getEditUser({
      id: this.state.id,
      email: this.state.email,
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      address: this.state.address,
      provinceCode: this.state.provinceCode,
      districtCode: this.state.districtCode,
      wardCode: this.state.wardCode,
      gender: this.state.gender,
      positionId: this.state.positionId,
      roleId: this.state.roleId,
      phoneNumber: this.state.phoneNumber,
      image: this.state.avatar,
    });
    this.toggle();
  };

  render() {
    const {
      genderArr,
      positionArr,
      roleArr,
      provinceOptions,
      districtOptions,
      wardOptions,
      // previewImg,
      errors,
    } = this.state;
    const { language } = this.props;
    const chooseLabel = this.getText("user-manage.choose", "Choose...");

    return (
      <Modal isOpen={this.props.isOpen} toggle={this.toggle} size="lg" centered className="user-modal">
        <ModalHeader toggle={this.toggle}>
          <i className="fa-solid fa-user-pen me-2"></i>
          <FormattedMessage id="user-manage.edit-title" defaultMessage="Edit user" />
        </ModalHeader>

        <ModalBody>
          {/* Email + Phone */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label><FormattedMessage id="user-manage.email" /></label>
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
              <input
                type="text"
                className={`form-control ${errors.address ? "input-error" : ""}`}
                onChange={(e) => this.handleOnchange(e, "address")}
                value={this.state.address}
              />
              {errors.address && (
                <div className="error-text">{errors.address}</div>
              )}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label>
                <FormattedMessage id="user-manage.province" defaultMessage="Province/City" />
              </label>
              <select
                className={`form-select ${errors.provinceCode ? "input-error" : ""}`}
                value={this.state.provinceCode}
                onChange={(e) => this.handleOnchange(e, "provinceCode")}
              >
                <option value="">
                  <FormattedMessage id="user-manage.choose-province" defaultMessage="Choose province/city" />
                </option>
                {provinceOptions.map((item) => (
                  <option key={`${item.type}-${item.keyMap}`} value={item.keyMap}>
                    {language === languages.VI ? item.value_vi : item.value_en}
                  </option>
                ))}
              </select>
              {errors.provinceCode && <div className="error-text">{errors.provinceCode}</div>}
            </div>

            <div className="col-md-4">
              <label>
                <FormattedMessage id="user-manage.district" defaultMessage="District" />
              </label>
              <select
                className={`form-select ${errors.districtCode ? "input-error" : ""}`}
                value={this.state.districtCode}
                onChange={(e) => this.handleOnchange(e, "districtCode")}
                disabled={!this.state.provinceCode}
              >
                <option value="">
                  <FormattedMessage id="user-manage.choose-district" defaultMessage="Choose district" />
                </option>
                {districtOptions.map((item) => (
                  <option key={`${item.type}-${item.keyMap}`} value={item.keyMap}>
                    {language === languages.VI ? item.value_vi : item.value_en}
                  </option>
                ))}
              </select>
              {errors.districtCode && <div className="error-text">{errors.districtCode}</div>}
            </div>

            <div className="col-md-4">
              <label>
                <FormattedMessage id="user-manage.ward" defaultMessage="Ward" />
              </label>
              <select
                className={`form-select ${errors.wardCode ? "input-error" : ""}`}
                value={this.state.wardCode}
                onChange={(e) => this.handleOnchange(e, "wardCode")}
                disabled={!this.state.districtCode}
              >
                <option value="">
                  <FormattedMessage id="user-manage.choose-ward" defaultMessage="Choose ward" />
                </option>
                {wardOptions.map((item) => (
                  <option key={`${item.type}-${item.keyMap}`} value={item.keyMap}>
                    {language === languages.VI ? item.value_vi : item.value_en}
                  </option>
                ))}
              </select>
              {errors.wardCode && <div className="error-text">{errors.wardCode}</div>}
            </div>
          </div>

          {/* Gender + Position + Role */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label>
                <FormattedMessage id="user-manage.gender" />
              </label>
              <select
                className={`form-select ${errors.gender ? "input-error" : ""}`}
                value={this.state.gender}
                onChange={(e) => this.handleOnchange(e, "gender")}
              >
                <option value="">{chooseLabel}</option>
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
              <label><FormattedMessage id="user-manage.position" /></label>
              <select
                className={`form-select ${errors.positionId ? "input-error" : ""}`}
                value={this.state.positionId}
                onChange={(e) => this.handleOnchange(e, "positionId")}
                disabled={this.state.roleId !== "R2"} // ✅ chỉ bật nếu là bác sĩ
              >
                <option value="">{chooseLabel}</option>
                {positionArr.map((item, index) => (
                  <option key={index} value={item.keyMap}>
                    {language === languages.VI ? item.value_vi : item.value_en}
                  </option>
                ))}
              </select>
              {this.state.roleId !== "R2" && (
                <div className="text-muted small mt-1">
                  <FormattedMessage
                    id="user-manage.position-disabled"
                    defaultMessage="Chức danh chỉ áp dụng cho bác sĩ"
                  />
                </div>
              )}

              {errors.positionId && (
                <div className="error-text">{errors.positionId}</div>
              )}
            </div>


            <div className="col-md-4">
              <label><FormattedMessage id="user-manage.role" /></label>
              <select
                className={`form-select ${errors.roleId ? "input-error" : ""}`}
                value={this.state.roleId}
                onChange={(e) => this.handleOnchange(e, "roleId")}
              >
                <option value="">{chooseLabel}</option>
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

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(UserEdit));
