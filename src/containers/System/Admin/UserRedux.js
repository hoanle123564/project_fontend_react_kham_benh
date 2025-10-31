import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import { connect } from "react-redux";
// Light Box
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";

import { languages } from "../../../utils/constant";
import "./UserRedux.scss";
import { injectIntl } from "react-intl";
import * as action from "../../../store/actions";

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

    // cách 2: gọi thẳng API để thực hiện
    // try {
    //     const resGender = await getAllCode('GENDER');
    //     const resPosition = await getAllCode('POSITION');
    //     const resRole = await getAllCode('ROLE');
    //     if (
    //         resGender && resGender.errCode === 0 &&
    //         resPosition && resPosition.errCode === 0 &&
    //         resRole && resRole.errCode === 0
    //     ) {
    //         this.setState({
    //             genderArr: resGender.data,
    //             positionArr: resPosition.data,
    //             roleArr: resRole.data,
    //         });
    //     }
    // } catch (error) {
    //     console.log(error);
    // }
  }
  handleChangeInput = (e, field) => {
    const value = e.target.value;

    this.setState({
      [field]: value,
    });
  };

  handleOnChangeImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      this.setState({
        previewImg: objectUrl,
        avatar: file, // bạn có thể gửi file này khi save user
      });
    }
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    // render => didupdate
    // quá khứ (prevProps) và hiện tại (this)
    // [0]  [3]
    if (prevProps.gender !== this.props.gender) {
      let ArrGender = this.props.gender;
      this.setState({
        genderArr: this.props.gender,
        gender: ArrGender && ArrGender.length > 0 ? ArrGender[0].keyMap : "",
      });
    }

    if (prevProps.position !== this.props.position) {
      let ArrPosition = this.props.position;

      this.setState({
        positionArr: this.props.position,
        position:
          ArrPosition && ArrPosition.length > 0 ? ArrPosition[0].keyMap : "",
      });
    }

    if (prevProps.role !== this.props.role) {
      let ArrRole = this.props.role;

      this.setState({
        roleArr: this.props.role,
        role: ArrRole && ArrRole.length > 0 ? ArrRole[0].keyMap : "",
      });
    }
    console.log("prevProps", prevProps);
  }

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

  handleSaveUser = async () => {
    let check = this.checkValidateInput();
    if (!check) {
      return;
    }

    let res = this.props.saveUser({
      email: this.state.email,
      password: this.state.password,
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      address: this.state.address,
      gender: this.state.gender,
      position: this.state.position,
      role: this.state.role,
      phoneNumber: this.state.phoneNumber,
    });
    console.log("check saveUser", res);
  };
  render() {
    const { genderArr, positionArr, roleArr } = this.state;
    const { language, intl } = this.props;

    return (
      <div className="container mt-4 user-redux-container  ">
        <h3 className="text-center mb-4 text-primary">
          <FormattedMessage id="user-manage.add" />
        </h3>

        {/* Email */}
        <div className="row mb-3 d-flex justify-content-center">
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

        {/*  Password + Phone */}
        <div className="row mb-3 d-flex justify-content-center">
          <div className="col-md-3">
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
          <div className="col-md-3">
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

        {/*  First + Last */}
        <div className="row mb-3 d-flex justify-content-center">
          <div className="col-md-3">
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
          <div className="col-md-3">
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

        {/*  Address */}
        <div className="row mb-3 d-flex justify-content-center">
          <div className="col-md-6">
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
        <div className="row mb-3 d-flex justify-content-center">
          <div className="col-md-2">
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
                genderArr.length > 0 &&
                genderArr.map((item, index) => (
                  <option key={index} value={item.keyMap}>
                    {language === languages.VI ? item.value_vi : item.value_en}
                  </option>
                ))}
            </select>
          </div>

          <div className="col-md-2 ">
            <label>
              <FormattedMessage id="user-manage.position" />
            </label>
            <select
              className="form-select"
              value={this.state.position}
              onChange={(e) => this.handleChangeInput(e, "position")}
            >
              <option>
                {this.props.intl.formatMessage({ id: "user-manage.choose" })}
              </option>
              {positionArr &&
                positionArr.length > 0 &&
                positionArr.map((item, index) => (
                  <option key={index} value={item.keyMap}>
                    {language === languages.VI ? item.value_vi : item.value_en}
                  </option>
                ))}
            </select>
          </div>

          <div className="col-md-2">
            <label>
              <FormattedMessage id="user-manage.role" />
            </label>
            <select
              className="form-select"
              value={this.state.role}
              onChange={(e) => this.handleChangeInput(e, "role")}
            >
              <option>
                {this.props.intl.formatMessage({ id: "user-manage.choose" })}
              </option>
              {roleArr &&
                roleArr.length > 0 &&
                roleArr.map((item, index) => (
                  <option key={index} value={item.keyMap}>
                    {language === languages.VI ? item.value_vi : item.value_en}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Avatar */}
        <div className="row mb-4 d-flex justify-content-center">
          <div className="col-md-6 ">
            <label className="mb-2">
              <FormattedMessage id="user-manage.avatar" />
            </label>

            {/* Nút chọn ảnh */}
            <div className="d-flex">
              <div className="upload-btn-wrapper mb-3">
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

              {/* Ảnh preview */}
              <div
                className="preview-image-container mx-auto"
                onClick={() =>
                  this.state.previewImg && this.setState({ isOpen: true })
                }
              >
                {this.state.previewImg ? (
                  <img
                    src={this.state.previewImg}
                    alt="preview"
                    className="preview-image"
                    // style={{ width: "400px" }}
                  />
                ) : (
                  <span className="text-muted">Chưa có ảnh</span>
                )}
              </div>

              {/* Lightbox xem ảnh to */}
              {this.state.isOpen && (
                <Lightbox
                  mainSrc={this.state.previewImg}
                  onCloseRequest={() => this.setState({ isOpen: false })}
                />
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            className="btn btn-primary px-4"
            onClick={this.handleSaveUser}
          >
            <FormattedMessage id="user-manage.save" />
          </button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    gender: state.admin.genderArr,
    position: state.admin.positionArr,
    role: state.admin.roleArr,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getGender: () => dispatch(action.fetchGender()),
    getPosition: () => dispatch(action.fetchPosition()),
    getRole: () => dispatch(action.fetchRole()),
    saveUser: (data) => dispatch(action.saveUser(data)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(UserRedux));
