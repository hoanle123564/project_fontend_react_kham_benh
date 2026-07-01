import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { handleLoginAPI } from "../../services/userService";
import logoSrc from "../../assets/logo2.png";
import "./Login.scss";

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            pass: "",
            showPass: false,
            emailError: "",
            passError: "",
            formError: "",
            isSubmitting: false,
        };
    }

    handleOnchangeName = (event) => {
        this.setState({
            email: event.target.value,
            emailError: "",
            formError: "",
        });
    };

    handleOnchangePass = (event) => {
        this.setState({
            pass: event.target.value,
            passError: "",
            formError: "",
        });
    };

    handleSubmit = async (event) => {
        event.preventDefault();

        const { email, pass, isSubmitting } = this.state;

        if (isSubmitting) return;

        const trimmedEmail = email.trim();
        const trimmedPass = pass.trim();

        let emailError = "";
        let passError = "";

        if (!trimmedEmail) emailError = "Vui lòng nhập Email!";
        if (!trimmedPass) passError = "Vui lòng nhập Mật khẩu!";

        if (emailError || passError) {
            this.setState({
                emailError,
                passError,
                formError: "",
            });
            return;
        }

        this.setState({
            emailError: "",
            passError: "",
            formError: "",
            isSubmitting: true,
        });

        try {
            const data = await handleLoginAPI(trimmedEmail, trimmedPass);

            if (!data || data.errCode !== 0 || !data.user) {
                this.setState({
                    formError: data?.errMessage || "Đăng nhập không thành công!",
                    isSubmitting: false,
                });
                return;
            }

            const authPayload = {
                user: data.user,
                token: data.token,
            };

            if (data.user.roleId === "R1") {
                this.props.adminLoginSuccess(authPayload);
                this.props.navigate("/system");
                return;
            }

            if (data.user.roleId === "R4") {
                this.props.adminLoginSuccess(authPayload);
                this.props.navigate("/system/manage-clinic");
                return;
            }

            if (data.user.roleId === "R2") {
                this.props.doctorLoginSuccess(authPayload);
                this.props.navigate("/doctor/dashboard");
                return;
            }

            if (data.user.roleId === "R3") {
                this.props.patientLoginSuccess(authPayload);
                this.props.navigate("/home");
                return;
            }

            this.setState({
                formError: "Không xác định được quyền truy cập của tài khoản này!",
                isSubmitting: false,
            });
        } catch (error) {
            this.setState({
                formError: error.response?.data?.message || "Lỗi kết nối đến máy chủ!",
                isSubmitting: false,
            });
        }
    };

    handleShowHidePass = () => {
        this.setState((prevState) => ({
            showPass: !prevState.showPass,
        }));
    };

    render() {
        const {
            email,
            pass,
            showPass,
            emailError,
            passError,
            formError,
            isSubmitting,
        } = this.state;

        return (
            <div className="login-page">
                <div className="container py-4 py-lg-5">
                    <div className="row justify-content-center">
                        <div className="col-12 col-xl-10">
                            <div className="login-shell shadow-lg overflow-hidden">
                                <div className="row g-0">
                                    <div className="col-lg-6 d-none d-lg-block">
                                        <div className="login-visual">
                                            <div className="login-visual-copy">
                                                <span className="visual-badge">
                                                    LifeCare
                                                </span>
                                                <h2 className="visual-title">
                                                    Đồng hành cùng sức khỏe gia
                                                    đình mỗi ngày
                                                </h2>
                                                <p className="visual-text">
                                                    Kết nối người bệnh với bác sĩ
                                                    và dịch vụ y tế thuận tiện
                                                    hơn trong một không gian
                                                    thân thiện, hiện đại.
                                                </p>
                                            </div>

                                            {/* <div className="login-visual-figure">
                                                <img
                                                    src={familyImage}
                                                    alt="Gia đình tại trường học"
                                                    className="img-fluid login-visual-image"
                                                />
                                            </div> */}
                                        </div>
                                    </div>

                                    <div className="col-12 col-lg-6">
                                        <div className="login-panel d-flex align-items-center justify-content-center h-100">
                                            <div className="login-form-card w-100">
                                                <div className="text-center mb-4">
                                                    <img
                                                        src={logoSrc}
                                                        alt="LifeCare logo"
                                                        className="brand-logo mb-3"
                                                    />
                                                    <div className="brand-name">
                                                        LifeCare
                                                    </div>
                                                    <h1 className="login-title">
                                                        Đăng nhập
                                                    </h1>
                                                    <p className="login-subtitle mb-0">
                                                        Truy cập hệ thống để
                                                        quản lý lịch hẹn và chăm
                                                        sóc sức khỏe thuận tiện
                                                        hơn.
                                                    </p>
                                                </div>

                                                <form
                                                    onSubmit={
                                                        this.handleSubmit
                                                    }
                                                    noValidate
                                                >
                                                    <div className="mb-3">
                                                        <label
                                                            htmlFor="email-input"
                                                            className="form-label"
                                                        >
                                                            Email
                                                        </label>
                                                        <input
                                                            id="email-input"
                                                            type="email"
                                                            value={email}
                                                            className={`form-control login-input-field ${emailError ? "input-error" : ""}`}
                                                            placeholder="Nhập email"
                                                            autoComplete="email"
                                                            aria-invalid={
                                                                !!emailError
                                                            }
                                                            aria-describedby={
                                                                emailError
                                                                    ? "email-error"
                                                                    : undefined
                                                            }
                                                            onChange={
                                                                this.handleOnchangeName
                                                            }
                                                            autoFocus
                                                        />
                                                        {emailError && (
                                                            <div
                                                                id="email-error"
                                                                className="error-text"
                                                            >
                                                                {emailError}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mb-3">
                                                        <label
                                                            htmlFor="password-input"
                                                            className="form-label"
                                                        >
                                                            Mật khẩu
                                                        </label>
                                                        <div className="input-group auth-password-group">
                                                            <input
                                                                id="password-input"
                                                                type={
                                                                    showPass
                                                                        ? "text"
                                                                        : "password"
                                                                }
                                                                value={pass}
                                                                className={`form-control login-input-field ${passError ? "input-error" : ""}`}
                                                                placeholder="Nhập mật khẩu"
                                                                autoComplete="current-password"
                                                                aria-invalid={
                                                                    !!passError
                                                                }
                                                                aria-describedby={
                                                                    passError
                                                                        ? "password-error"
                                                                        : undefined
                                                                }
                                                                onChange={
                                                                    this.handleOnchangePass
                                                                }
                                                            />
                                                            <button
                                                                type="button"
                                                                className="btn auth-toggle-password"
                                                                onClick={
                                                                    this.handleShowHidePass
                                                                }
                                                                aria-label={
                                                                    showPass
                                                                        ? "Ẩn mật khẩu"
                                                                        : "Hiện mật khẩu"
                                                                }
                                                            >
                                                                <i
                                                                    className={
                                                                        showPass
                                                                            ? "fa-solid fa-eye-slash"
                                                                            : "fa-solid fa-eye"
                                                                    }
                                                                ></i>
                                                            </button>
                                                        </div>
                                                        {passError && (
                                                            <div
                                                                id="password-error"
                                                                className="error-text"
                                                            >
                                                                {passError}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {formError && (
                                                        <div
                                                            className="error-message"
                                                            role="alert"
                                                        >
                                                            {formError}
                                                        </div>
                                                    )}

                                                    <button
                                                        type="submit"
                                                        className="btn btn-login w-100 mt-2"
                                                        disabled={isSubmitting}
                                                    >
                                                        {isSubmitting
                                                            ? "Đang đăng nhập..."
                                                            : "Đăng nhập"}
                                                    </button>
                                                </form>

                                                <div className="text-center mt-4 login-footer">
                                                    <span>
                                                        Bạn chưa có tài khoản?
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-link p-0 ms-1 login-link"
                                                        onClick={() =>
                                                            this.props.navigate(
                                                                "/register"
                                                            )
                                                        }
                                                    >
                                                        Đăng ký ngay
                                                    </button>
                                                </div>
                                            </div>
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

const mapDispatchToProps = (dispatch) => ({
    navigate: (path) => dispatch(push(path)),
    adminLoginSuccess: (data) =>
        dispatch({ type: "ADMIN_LOGIN_SUCCESS", data }),
    doctorLoginSuccess: (data) =>
        dispatch({ type: "DOCTOR_LOGIN_SUCCESS", data }),
    patientLoginSuccess: (data) =>
        dispatch({ type: "PATIENT_LOGIN_SUCCESS", data }),
});

export default connect(null, mapDispatchToProps)(Login);
