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
    };
  }

  componentDidMount() {
    const user = this.props.CurrentUser;
    if (user && !_.isEmpty(user)) {
      this.setState({
        ...user,
        previewImg: user.image ? `data:image/jpeg;base64,${user.image}` : "",
        avatar: user.image || "", //  thêm dòng này để giữ base64 cũ
      });
    }

    // Load dữ liệu từ redux
    this.props.getGender();
    this.props.getPosition();
    this.props.getRole();
  }

  componentDidUpdate(prevProps) {
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

  toggle = () => {
    this.props.toggleUser();
  };

  handleOnchange = (event, field) => {
    this.setState({
      [field]: event.target.value,
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
          avatar: reader.result.split(",")[1], // chỉ lấy phần Base64
        });
      };
      reader.readAsDataURL(file);
    }
  };

  checkValidateInput = () => {
    const requiredFields = [
      "email",
      "firstName",
      "lastName",
      "phoneNumber",
      "address",
      "gender",
      "positionId",
      "roleId",
    ];
    for (let i = 0; i < requiredFields.length; i++) {
      if (
        !this.state[requiredFields[i]] ||
        this.state[requiredFields[i]].trim() === ""
      ) {
        alert("Missing parameter: " + requiredFields[i]);
        return false;
      }
    }
    return true;
  };

  handleEditUser = async () => {
    const check = this.checkValidateInput();
    if (!check) {
      return;
    }
    console.log("edit user", this.state);

    this.props.getEditUser(this.state);

    this.toggle();
  };

  render() {
    const { genderArr, positionArr, roleArr, previewImg } = this.state;
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
                className="form-control"
                onChange={(e) => this.handleOnchange(e, "email")}
                value={this.state.email}
                disabled
              />
            </div>
            <div className="col-md-6">
              <label>Phone Number</label>
              <input
                type="text"
                className="form-control"
                onChange={(e) => this.handleOnchange(e, "phoneNumber")}
                value={this.state.phoneNumber}
              />
            </div>
          </div>

          {/* First + Last */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label>First Name</label>
              <input
                type="text"
                className="form-control"
                onChange={(e) => this.handleOnchange(e, "firstName")}
                value={this.state.firstName}
              />
            </div>
            <div className="col-md-6">
              <label>Last Name</label>
              <input
                type="text"
                className="form-control"
                onChange={(e) => this.handleOnchange(e, "lastName")}
                value={this.state.lastName}
              />
            </div>
          </div>

          {/* Address */}
          {/* <div className="row mb-3">
            <div className="col-md-12">
              <label>Address</label>
              <input
                type="text"
                className="form-control"
                onChange={(e) => this.handleOnchange(e, "address")}
                value={this.state.address}
              />
            </div>
          </div> */}
          {/* Address (City selection) */}
          <div className="row mb-3">
            <div className="col-md-12">
              <label>
                <FormattedMessage id="user-manage.address" />
              </label>
              <select
                className="form-select"
                value={this.state.address}
                onChange={(e) => this.handleOnchange(e, "address")}
              >
                <option value="">
                  {/* {formatMessage({ id: "user-manage.choose" })} */}
                  {/* <FormattedMessage id="user-manage.choose" /> */}
                </option>
                {this.props.ListVietNamProvinces.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>



          {/* Gender + Position + Role */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label>Gender</label>
              <select
                className="form-select"
                value={this.state.gender}
                onChange={(e) => this.handleOnchange(e, "gender")}
              >
                <option>Choose...</option>
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
              <label>Position</label>
              <select
                className="form-select"
                value={this.state.positionId}
                onChange={(e) => this.handleOnchange(e, "positionId")}
              >
                <option>Choose...</option>
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
              <label>Role</label>
              <select
                className="form-select"
                value={this.state.roleId}
                onChange={(e) => this.handleOnchange(e, "roleId")}
              >
                <option>Choose...</option>
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
              <label className="mb-2">Avatar</label>
              <div className="d-flex align-items-center">
                <div className="upload-btn-wrapper me-3">
                  <input
                    type="file"
                    id="avatar-edit"
                    accept="image/*"
                    hidden
                    onChange={(e) => this.handleOnChangeImage(e)}
                  />
                  <label
                    htmlFor="avatar-edit"
                    className="btn btn-outline-primary"
                  >
                    Chọn ảnh <i className="fa-solid fa-upload ms-2"></i>
                  </label>
                </div>

                <div
                  className="preview-image-container"
                  onClick={() => previewImg && this.setState({ isOpen: true })}
                >
                  {previewImg ? (
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
