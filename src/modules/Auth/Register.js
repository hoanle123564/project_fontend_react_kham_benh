import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { languages } from "../../utils/constant";
import * as action from "../../store/actions";
import logoSrc from "../../assets/logo2.png";
import "./Register.scss";

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
            showPassword: false,
            errors: {},
            formError: "",
            isSubmitting: false,
        };
    }

    componentDidMount() {
        this.props.getGender();
    }

    handleChangeInput = (event, field) => {
        this.setState((prevState) => ({
            [field]: event.target.value,
            formError: "",
            errors: {
                ...prevState.errors,
                [field]: "",
            },
        }));
    };

    handleTogglePassword = () => {
        this.setState((prevState) => ({
            showPassword: !prevState.showPassword,
        }));
    };

    checkValidateInput = () => {
        const { email, password, firstName, lastName, phoneNumber, address, gender } = this.state;
        const errors = {};
        const { language } = this.props;

        if (!email || email.trim() === "") {
            errors.email = language === languages.VI ? "Vui lòng nhập email!" : "Please enter your email!";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            errors.email = language === languages.VI ? "Email không hợp lệ!" : "Invalid email!";
        }

        if (!password || password.trim() === "") {
            errors.password = language === languages.VI ? "Vui lòng nhập mật khẩu!" : "Please enter password!";
        }
        if (!firstName || firstName.trim() === "") {
            errors.firstName = language === languages.VI ? "Vui lòng nhập tên!" : "Please enter first name!";
        }
        if (!lastName || lastName.trim() === "") {
            errors.lastName = language === languages.VI ? "Vui lòng nhập họ!" : "Please enter last name!";
        }

        if (!phoneNumber || phoneNumber.trim() === "") {
            errors.phoneNumber = language === languages.VI ? "Vui lòng nhập số điện thoại!" : "Please enter phone!";
        } else if (!/^[0-9]{9,11}$/.test(phoneNumber.trim())) {
            errors.phoneNumber = language === languages.VI ? "Số điện thoại không hợp lệ!" : "Invalid phone!";
        }

        if (!address || address.trim() === "") {
            errors.address = language === languages.VI ? "Vui lòng nhập địa chỉ!" : "Please enter address!";
        }
        if (!gender) {
            errors.gender = language === languages.VI ? "Vui lòng chọn giới tính!" : "Please select gender!";
        }

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    };

    handleSubmit = async (event) => {
        event.preventDefault();

        if (this.state.isSubmitting) return;
        if (!this.checkValidateInput()) return;

        const {
            email,
            password,
            firstName,
            lastName,
            phoneNumber,
            address,
            gender,
        } = this.state;

        this.setState({
            formError: "",
            isSubmitting: true,
        });

        const data = {
            email: email.trim(),
            password: password.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phoneNumber: phoneNumber.trim(),
            address: address.trim(),
            gender,
            image: null,
            roleId: "R3",
        };

        const res = await this.props.registerPublicUser(data);

        if (res?.errCode === 0) {
            this.props.navigate("/login");
            return;
        }

        if (res?.errCode === 2) {
            this.setState((prevState) => ({
                isSubmitting: false,
                formError: "",
                errors: {
                    ...prevState.errors,
                    email: "Email đã tồn tại, vui lòng chọn email khác!",
                },
            }));
            return;
        }

        this.setState({
            isSubmitting: false,
            formError: res?.errMessage || "Đăng ký không thành công, vui lòng thử lại!",
        });
    };

    render() {
        const { gender } = this.props;
        const {
            email,
            password,
            firstName,
            lastName,
            phoneNumber,
            address,
            showPassword,
            gender: selectedGender,
            errors,
            formError,
            isSubmitting,
        } = this.state;

        return (
            <div className="register-page">
                <div className="container py-4 py-lg-5">
                    <div className="row justify-content-center align-items-center min-vh-100">
                        <div className="col-12 col-xl-9">
                            <div className="register-form-card mx-auto shadow-lg">
                                <div className="text-center mb-4">
                                    <img
                                        src={logoSrc}
                                        alt="LifeCare logo"
                                        className="brand-logo mb-3"
                                    />
                                    <h1 className="register-title">Đăng ký tài khoản</h1>
                                    <p className="register-subtitle mb-0">
                                        Tạo tài khoản LifeCare để quản lý lịch hẹn
                                        và theo dõi hành trình chăm sóc sức khỏe
                                        thuận tiện hơn.
                                    </p>
                                </div>

                                <form onSubmit={this.handleSubmit} noValidate>
                                    <div className="row g-3">
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="register-email" className="form-label">
                                                Email
                                            </label>
                                            <input
                                                id="register-email"
                                                type="email"
                                                className={`form-control register-input-field ${errors.email ? "input-error" : ""}`}
                                                value={email}
                                                onChange={(event) => this.handleChangeInput(event, "email")}
                                                placeholder="Nhập email"
                                                autoComplete="email"
                                                aria-invalid={!!errors.email}
                                                aria-describedby={errors.email ? "register-email-error" : undefined}
                                                autoFocus
                                            />
                                            {errors.email && (
                                                <div id="register-email-error" className="error-text">
                                                    {errors.email}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label htmlFor="register-password" className="form-label">
                                                Mật khẩu
                                            </label>
                                            <div className="input-group auth-password-group">
                                                <input
                                                    id="register-password"
                                                    type={showPassword ? "text" : "password"}
                                                    className={`form-control register-input-field ${errors.password ? "input-error" : ""}`}
                                                    value={password}
                                                    onChange={(event) => this.handleChangeInput(event, "password")}
                                                    placeholder="Nhập mật khẩu"
                                                    autoComplete="new-password"
                                                    aria-invalid={!!errors.password}
                                                    aria-describedby={errors.password ? "register-password-error" : undefined}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn auth-toggle-password"
                                                    onClick={this.handleTogglePassword}
                                                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                                >
                                                    <i
                                                        className={
                                                            showPassword
                                                                ? "fa-solid fa-eye-slash"
                                                                : "fa-solid fa-eye"
                                                        }
                                                    ></i>
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <div id="register-password-error" className="error-text">
                                                    {errors.password}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label htmlFor="register-last-name" className="form-label">
                                                Họ và tên lót
                                            </label>
                                            <input
                                                id="register-last-name"
                                                type="text"
                                                className={`form-control register-input-field ${errors.lastName ? "input-error" : ""}`}
                                                value={lastName}
                                                onChange={(event) => this.handleChangeInput(event, "lastName")}
                                                placeholder="Nhập họ và tên lót"
                                                autoComplete="family-name"
                                                aria-invalid={!!errors.lastName}
                                                aria-describedby={errors.lastName ? "register-last-name-error" : undefined}
                                            />
                                            {errors.lastName && (
                                                <div id="register-last-name-error" className="error-text">
                                                    {errors.lastName}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label htmlFor="register-first-name" className="form-label">
                                                Tên
                                            </label>
                                            <input
                                                id="register-first-name"
                                                type="text"
                                                className={`form-control register-input-field ${errors.firstName ? "input-error" : ""}`}
                                                value={firstName}
                                                onChange={(event) => this.handleChangeInput(event, "firstName")}
                                                placeholder="Nhập tên"
                                                autoComplete="given-name"
                                                aria-invalid={!!errors.firstName}
                                                aria-describedby={errors.firstName ? "register-first-name-error" : undefined}
                                            />
                                            {errors.firstName && (
                                                <div id="register-first-name-error" className="error-text">
                                                    {errors.firstName}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label htmlFor="register-phone" className="form-label">
                                                Số điện thoại
                                            </label>
                                            <input
                                                id="register-phone"
                                                type="tel"
                                                inputMode="numeric"
                                                className={`form-control register-input-field ${errors.phoneNumber ? "input-error" : ""}`}
                                                value={phoneNumber}
                                                onChange={(event) => this.handleChangeInput(event, "phoneNumber")}
                                                placeholder="Nhập số điện thoại"
                                                autoComplete="tel"
                                                aria-invalid={!!errors.phoneNumber}
                                                aria-describedby={errors.phoneNumber ? "register-phone-error" : undefined}
                                            />
                                            {errors.phoneNumber && (
                                                <div id="register-phone-error" className="error-text">
                                                    {errors.phoneNumber}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label htmlFor="register-gender" className="form-label">
                                                Giới tính
                                            </label>
                                            <select
                                                id="register-gender"
                                                className={`form-select register-input-field ${errors.gender ? "input-error" : ""}`}
                                                value={selectedGender}
                                                onChange={(event) => this.handleChangeInput(event, "gender")}
                                                aria-invalid={!!errors.gender}
                                                aria-describedby={errors.gender ? "register-gender-error" : undefined}
                                            >
                                                <option value="">-- Chọn giới tính --</option>
                                                {gender.map((item, index) => (
                                                    <option key={index} value={item.keyMap}>
                                                        {item.value_vi}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.gender && (
                                                <div id="register-gender-error" className="error-text">
                                                    {errors.gender}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="register-address" className="form-label">
                                                Địa chỉ
                                            </label>
                                            <input
                                                id="register-address"
                                                type="text"
                                                className={`form-control register-input-field ${errors.address ? "input-error" : ""}`}
                                                value={address}
                                                onChange={(event) => this.handleChangeInput(event, "address")}
                                                placeholder="Nhập địa chỉ"
                                                autoComplete="street-address"
                                                aria-invalid={!!errors.address}
                                                aria-describedby={errors.address ? "register-address-error" : undefined}
                                            />
                                            {errors.address && (
                                                <div id="register-address-error" className="error-text">
                                                    {errors.address}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {formError && (
                                        <div className="error-message" role="alert">
                                            {formError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn btn-register mt-4"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
                                    </button>
                                </form>

                                <div className="text-center mt-4 register-footer">
                                    <span>Bạn đã có tài khoản?</span>
                                    <button
                                        type="button"
                                        className="btn btn-link p-0 ms-1 register-link"
                                        onClick={() => this.props.navigate("/login")}
                                    >
                                        Đăng nhập
                                    </button>
                                </div>
                            </div>
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
    navigate: (path) => dispatch(push(path)),
    getGender: () => dispatch(action.fetchGender()),
    registerPublicUser: (data) => dispatch(action.registerPublicUser(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Register);
