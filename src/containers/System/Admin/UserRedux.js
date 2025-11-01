import React, { Component } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import { connect } from "react-redux";
// Light Box
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
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
      isOpen: false,
      isModalOpen: false,
      genderArr: [],
      positionArr: [],
      roleArr: [],
    };
  }

  async componentDidMount() {
    // cách 1: thực hiện thông qua redux
    this.props.getGender();
    this.props.getPosition();
    this.props.getRole();
  }

  // Change input handler
  handleChangeInput = (e, field) => {
    const value = e.target.value;
    this.setState({
      [field]: value,
    });
  };

  // Image preview handler
  handleOnChangeImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      this.setState({
        previewImg: objectUrl,
        avatar: file,
      });
    }
  };

  componentDidUpdate(prevProps) {
    // render => didupdate
    // quá khứ (prevProps) và hiện tại (this)
    // [0]  [3]
    if (prevProps.gender !== this.props.gender) {
      this.setState({
        genderArr: this.props.gender,
      });
    }

    if (prevProps.position !== this.props.position) {
      this.setState({
        positionArr: this.props.position,
      });
    }

    if (prevProps.role !== this.props.role) {
      this.setState({
        roleArr: this.props.role,
      });
    }

    if (prevProps.ListUser !== this.props.ListUser) {
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
      });
    }
  }

  // Toggle Modal
  toggleModal = () => {
    this.setState({
      isModalOpen: !this.state.isModalOpen,
    });
  };

  // Validate input
  checkValidateInput = () => {
    const requiredFields = [
      "email",
      "password",
      "firstName",
      "lastName",
      "phoneNumber",
      "address",
    ];

    for (let i = 0; i < requiredFields.length; i++) {
      const field = requiredFields[i];
      if (!this.state[field] || this.state[field].trim() === "") {
        alert(`Vui lòng nhập đầy đủ thông tin: ${field}`);
        return false;
      }
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.state.email)) {
      alert("Email không hợp lệ!");
      return false;
    }

    // Kiểm tra số điện thoại (ít nhất 9 chữ số)
    const phoneRegex = /^[0-9]{9,11}$/;
    if (!phoneRegex.test(this.state.phoneNumber)) {
      alert("Số điện thoại không hợp lệ!");
      return false;
    }

    return true;
  };

  // Save user
  handleSaveUser = async () => {
    let check = this.checkValidateInput();
    if (!check) return;
    console.log("check state:", this.state);

    let res = this.props.saveUser({
      email: this.state.email,
      password: this.state.password,
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      address: this.state.address,
      gender: this.state.gender,
      positionId: this.state.position,
      roleId: this.state.role,
      phoneNumber: this.state.phoneNumber,
    });

    console.log("check saveUser", res);
    this.toggleModal(); // Đóng modal sau khi lưu
  };

  render() {
    const { genderArr, positionArr, roleArr } = this.state;
    const { language, intl } = this.props;

    return (
      <div className="user-redux-container text-center mt-4">
        <Button color="primary" onClick={this.toggleModal}>
          <i className="fa-solid fa-user-plus me-2"></i>
          <FormattedMessage id="user-manage.add" />
        </Button>

        {/* MODAL */}
        <Modal
          isOpen={this.state.isModalOpen}
          toggle={this.toggleModal}
          size="lg"
          centered
          className="user-modal"
        >
          <ModalHeader toggle={this.toggleModal}>
            <i className="fa-solid fa-user"></i>
            <FormattedMessage id="user-manage.add" />
          </ModalHeader>

          <ModalBody>
            {/* Email */}
            <div className="row mb-6 ">
              <div className="col-md-6">
                <label>
                  <FormattedMessage id="user-manage.email" />
                </label>
                <input
                  type="email"
                  className="form-control"
                  value={this.state.email}
                  onChange={(e) => this.handleChangeInput(e, "email")}
                />
              </div>
            </div>

            {/* Password + Phone */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label>
                  <FormattedMessage id="user-manage.password" />
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={this.state.password}
                  onChange={(e) => this.handleChangeInput(e, "password")}
                />
              </div>
              <div className="col-md-6">
                <label>
                  <FormattedMessage id="user-manage.phone" />
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={this.state.phoneNumber}
                  onChange={(e) => this.handleChangeInput(e, "phoneNumber")}
                />
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
                  className="form-control"
                  value={this.state.firstName}
                  onChange={(e) => this.handleChangeInput(e, "firstName")}
                />
              </div>
              <div className="col-md-6">
                <label>
                  <FormattedMessage id="user-manage.last-name" />
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={this.state.lastName}
                  onChange={(e) => this.handleChangeInput(e, "lastName")}
                />
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
                  className="form-control"
                  value={this.state.address}
                  onChange={(e) => this.handleChangeInput(e, "address")}
                />
              </div>
            </div>

            {/* Gender + Position + Role */}
            <div className="row mb-3">
              <div className="col-md-4">
                <label>
                  <FormattedMessage id="user-manage.gender" />
                </label>
                <select
                  className="form-select"
                  value={this.state.gender}
                  onChange={(e) => this.handleChangeInput(e, "gender")}
                >
                  <option>
                    {intl.formatMessage({ id: "user-manage.choose" })}
                  </option>
                  {genderArr &&
                    genderArr.map((item, index) => (
                      <option key={index} value={item.keyMap}>
                        {language === languages.VI
                          ? item.value_vi
                          : item.value_en}
                      </option>
                    ))}
                </select>
              </div>

              <div className="col-md-4">
                <label>
                  <FormattedMessage id="user-manage.position" />
                </label>
                <select
                  className="form-select"
                  value={this.state.position}
                  onChange={(e) => this.handleChangeInput(e, "position")}
                >
                  <option>
                    {intl.formatMessage({ id: "user-manage.choose" })}
                  </option>
                  {positionArr &&
                    positionArr.map((item, index) => (
                      <option key={index} value={item.keyMap}>
                        {language === languages.VI
                          ? item.value_vi
                          : item.value_en}
                      </option>
                    ))}
                </select>
              </div>

              <div className="col-md-4">
                <label>
                  <FormattedMessage id="user-manage.role" />
                </label>
                <select
                  className="form-select"
                  value={this.state.role}
                  onChange={(e) => this.handleChangeInput(e, "role")}
                >
                  <option>
                    {intl.formatMessage({ id: "user-manage.choose" })}
                  </option>
                  {roleArr &&
                    roleArr.map((item, index) => (
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
                <label className="mb-2">
                  <FormattedMessage id="user-manage.avatar" />
                </label>
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
                      Chọn ảnh <i className="fa-solid fa-upload ms-2"></i>
                    </label>
                  </div>

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
                      <span className="text-muted">Chưa có ảnh</span>
                    )}
                  </div>
                </div>

                {this.state.isOpen && (
                  <Lightbox
                    mainSrc={this.state.previewImg}
                    onCloseRequest={() => this.setState({ isOpen: false })}
                  />
                )}
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            {/* save user */}
            <Button color="primary" onClick={this.handleSaveUser}>
              <FormattedMessage id="user-manage.save" />
            </Button>
            {/* cancel */}
            <Button color="secondary" onClick={this.toggleModal}>
              <FormattedMessage
                id="user-manage.cancel"
                defaultMessage="Cancel"
              />
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

// Redux connect
const mapStateToProps = (state) => ({
  language: state.app.language,
  gender: state.admin.genderArr,
  position: state.admin.positionArr,
  role: state.admin.roleArr,
  ListUser: state.admin.user,
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
