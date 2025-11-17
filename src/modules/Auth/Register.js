import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage, injectIntl } from "react-intl";
import { languages } from "../../utils/constant";
import * as action from "../../store/actions";
import "./Register.scss";
import { withRouter } from "react-router";
class Register extends Component {
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
            avatar: "",
            previewImg: "",
            genderArr: [],

            errors: {}
        };
    }

    async componentDidMount() {
        this.props.getGender();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.gender !== this.props.gender) {
            this.setState({ genderArr: this.props.gender });
        }
    }

    handleChangeInput = (e, field) => {
        this.setState({
            [field]: e.target.value,
            errors: { ...this.state.errors, [field]: "" }
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

    // Validate
    checkValidateInput = () => {
        const { email, password, firstName, lastName, phoneNumber, address, gender } = this.state;
        const errors = {};
        const { language } = this.props;

        if (!email || email.trim() === "") {
            errors.email = language === languages.VI ? "Vui lòng nhập email!" : "Please enter your email!";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = language === languages.VI ? "Email không hợp lệ!" : "Invalid email!";
        }

        if (!password) errors.password = language === languages.VI ? "Vui lòng nhập mật khẩu!" : "Please enter password!";
        if (!firstName) errors.firstName = language === languages.VI ? "Vui lòng nhập tên!" : "Please enter first name!";
        if (!lastName) errors.lastName = language === languages.VI ? "Vui lòng nhập họ!" : "Please enter last name!";

        if (!phoneNumber) {
            errors.phoneNumber = language === languages.VI ? "Vui lòng nhập số điện thoại!" : "Please enter phone!";
        } else if (!/^[0-9]{9,11}$/.test(phoneNumber)) {
            errors.phoneNumber = language === languages.VI ? "Số điện thoại không hợp lệ!" : "Invalid phone!";
        }

        if (!address) errors.address = language === languages.VI ? "Vui lòng nhập địa chỉ!" : "Please enter address!";
        if (!gender) errors.gender = language === languages.VI ? "Vui lòng chọn giới tính!" : "Please select gender!";

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    };

    handleRegister = async () => {
        if (!this.checkValidateInput()) return;

        const data = {
            email: this.state.email,
            password: this.state.password,
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            phoneNumber: this.state.phoneNumber,
            address: this.state.address,
            gender: this.state.gender,
            image: this.state.avatar,
            roleId: "R3", // bệnh nhân
        };

        let res = await this.props.saveUser(data);
        if (res && res.errCode === 0) {
            this.props.history.push("/login");
        }
    };

    render() {
        const { errors, genderArr } = this.state;

        return (
            <div className="register-background">
                <div className="register-container">
                    <div className="register-content">
                        <h2 className="text-register text-center mb-4">Đăng ký tài khoản</h2>

                        {/* Email - Password */}
                        <div className="row mb-3">
                            <div className="col-md-6 form-group register-input">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className={`form-control ${errors.email ? "input-error" : ""}`}
                                    value={this.state.email}
                                    onChange={(e) => this.handleChangeInput(e, "email")}
                                />
                                {errors.email && <div className="error-text">{errors.email}</div>}
                            </div>

                            <div className="col-md-6 form-group register-input">
                                <label>Mật khẩu</label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.password ? "input-error" : ""}`}
                                    value={this.state.password}
                                    onChange={(e) => this.handleChangeInput(e, "password")}
                                />
                                {errors.password && <div className="error-text">{errors.password}</div>}
                            </div>
                        </div>

                        {/* Last Name - First Name */}
                        <div className="row mb-3">
                            <div className="col-md-6 form-group register-input">
                                <label>Họ và tên lót</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.firstName ? "input-error" : ""}`}
                                    value={this.state.firstName}
                                    onChange={(e) => this.handleChangeInput(e, "firstName")}
                                />
                                {errors.firstName && <div className="error-text">{errors.firstName}</div>}
                            </div>

                            <div className="col-md-6 form-group register-input">
                                <label>Tên</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.lastName ? "input-error" : ""}`}
                                    value={this.state.lastName}
                                    onChange={(e) => this.handleChangeInput(e, "lastName")}
                                />
                                {errors.lastName && <div className="error-text">{errors.lastName}</div>}
                            </div>
                        </div>

                        {/* Phone - Address */}
                        <div className="row mb-3">
                            <div className="col-md-6 form-group register-input">
                                <label>Số điện thoại</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.phoneNumber ? "input-error" : ""}`}
                                    value={this.state.phoneNumber}
                                    onChange={(e) => this.handleChangeInput(e, "phoneNumber")}
                                />
                                {errors.phoneNumber && <div className="error-text">{errors.phoneNumber}</div>}
                            </div>

                            <div className="col-md-6 form-group register-input">
                                <label>Địa chỉ</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.address ? "input-error" : ""}`}
                                    value={this.state.address}
                                    onChange={(e) => this.handleChangeInput(e, "address")}
                                />
                                {errors.address && <div className="error-text">{errors.address}</div>}
                            </div>
                        </div>

                        {/* Gender - Avatar */}
                        <div className="row mb-3">
                            {/* Gender */}
                            <div className="col-md-6 form-group register-input">
                                <label>Giới tính</label>
                                <select
                                    className={`form-select ${errors.gender ? "input-error" : ""}`}
                                    value={this.state.gender}
                                    onChange={(e) => this.handleChangeInput(e, "gender")}
                                >
                                    <option value="">-- Chọn giới tính --</option>

                                    {genderArr.map((item, index) => (
                                        <option key={index} value={item.keyMap}>
                                            {item.value_vi}
                                        </option>
                                    ))}
                                </select>
                                {errors.gender && <div className="error-text">{errors.gender}</div>}
                            </div>

                            {/* Avatar đẹp */}
                            <div className="col-md-6 form-group register-input">
                                <label>Ảnh đại diện</label>
                                <div className="upload-btn-wrapper">
                                    <input
                                        type="file"
                                        id="avatar"
                                        accept="image/*"
                                        hidden
                                        onChange={this.handleOnChangeImage}
                                    />
                                    <label htmlFor="avatar" className="btn-upload">
                                        Chọn ảnh <i className="fa-solid fa-upload"></i>
                                    </label>
                                </div>

                                {this.state.previewImg && (
                                    <img
                                        src={this.state.previewImg}
                                        className="preview-img mt-2"
                                        alt="avatar preview"
                                    />
                                )}
                            </div>
                        </div>


                        {/* Button */}
                        <button className="btn-register" onClick={this.handleRegister}>
                            Đăng ký
                        </button>

                        <div className="text-center mt-3">
                            <span>Bạn đã có tài khoản?</span>
                            <button
                                className="btn btn-link p-0 ms-1"
                                onClick={() => this.props.history.push("/login")}
                            >
                                Đăng nhập
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


}

const mapStateToProps = (state) => ({
    language: state.app.language,
    gender: state.admin.genderArr,
});

const mapDispatchToProps = (dispatch) => ({
    getGender: () => dispatch(action.fetchGender()),
    saveUser: (data) => dispatch(action.saveUser(data)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(injectIntl(Register)));
