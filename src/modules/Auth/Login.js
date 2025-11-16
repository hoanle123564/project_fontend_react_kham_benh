import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import * as actions from "../../store/actions";
import { KeyCodeUtils } from "../../utils";
import { handleLoginAPI } from "../../services/userService";
import "./Login.scss";

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            pass: "",
            ShowPass: false,
            emailError: "",
            passError: "",
        };
    }

    handleOnchangeName = (event) => {
        this.setState({
            email: event.target.value,
            emailError: "", // xóa lỗi khi người dùng nhập lại
        });
    };

    handleOnchangePass = (event) => {
        this.setState({
            pass: event.target.value,
            passError: "",
        });
    };

    handlerKeyDown = (event) => {
        const keyCode = event.which || event.keyCode;
        if (keyCode === KeyCodeUtils.ENTER) {
            this.handleOnClick();
        }
    };

    handleOnClick = async () => {
        const { email, pass } = this.state;

        let emailError = "";
        let passError = "";

        if (!email) emailError = "Vui lòng nhập Email!";
        if (!pass) passError = "Vui lòng nhập Mật khẩu!";

        if (emailError || passError) {
            this.setState({ emailError, passError });
            return;
        }

        try {

            const data = await handleLoginAPI(email, pass);
            console.log('handleLoginAPI data', data);

            if (data && data.errCode !== 0) {
                this.setState({
                    passError: data.message,
                });
            } else {
                if (data.user.roleId === "R1") {
                    // Admin
                    this.props.adminLoginSuccess({
                        user: data.user,
                        token: data.token
                    });
                    this.props.navigate("/system");
                }

                else if (data.user.roleId === "R2") {
                    // Doctor
                    this.props.doctorLoginSuccess({
                        user: data.user,
                        token: data.token
                    });
                    this.props.navigate("/doctor/manage-schedule-private");
                }

                else if (data.user.roleId === "R3") {
                    // Patient
                    this.props.patientLoginSuccess({
                        user: data.user,
                        token: data.token
                    });
                    this.props.navigate("/home");
                }

                // localStorage.setItem("token", data.token); // lưu token vào localStorage

            }
        } catch (error) {
            this.setState({
                passError: error.response?.data?.message || "Lỗi kết nối đến máy chủ!",
            });
        }
    };

    handleShowHidePass = () => {
        this.setState({
            ShowPass: !this.state.ShowPass,
        });
    };

    render() {
        const { emailError, passError } = this.state;

        return (
            <div className="login-background">
                <div className="login-container">
                    <div className="login-content row">
                        <div className="col-12 text-center text-login">Login</div>

                        {/* Email */}
                        <div className="col-12 form-group login-input">
                            <label>Username :</label>
                            <input
                                type="text"
                                value={this.state.email}
                                className={`form-control ${emailError ? "input-error" : ""}`}
                                placeholder="Enter your name"
                                onChange={this.handleOnchangeName}
                            />
                            {emailError && <div className="error-text">{emailError}</div>}
                        </div>

                        {/* Password */}
                        <div className="col-12 form-group login-input">
                            <label>Password :</label>
                            <div className="custom-input-pass">
                                <input
                                    type={this.state.ShowPass ? "text" : "password"}
                                    value={this.state.pass}
                                    className={`form-control ${passError ? "input-error" : ""}`}
                                    placeholder="Enter your password"
                                    onChange={this.handleOnchangePass}
                                    onKeyDown={this.handlerKeyDown}
                                />
                                <span onClick={this.handleShowHidePass}>
                                    <i
                                        className={
                                            this.state.ShowPass
                                                ? "fa-solid fa-eye-slash"
                                                : "fa-solid fa-eye"
                                        }
                                    ></i>
                                </span>
                            </div>
                            {passError && <div className="error-text">{passError}</div>}
                        </div>

                        {/* Button */}
                        <div className="col-12">
                            <button
                                className="btn-login"
                                onClick={() => this.handleOnClick()}
                            >
                                Login
                            </button>
                        </div>

                        <div className="col-12 text-center">
                            <span>Or login with:</span>
                        </div>

                        <div className="col-12 social-login">
                            <div className="social-btn facebook-btn">
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png"
                                    alt="facebook"
                                />
                            </div>
                            <div className="social-btn google-btn">
                                <img
                                    src="https://cdn-icons-png.flaticon.com/512/300/300221.png"
                                    alt="google"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    lang: state.app.language,
});

const mapDispatchToProps = (dispatch) => ({
    navigate: (path) => dispatch(push(path)),
    adminLoginSuccess: (data) =>
        dispatch({ type: "ADMIN_LOGIN_SUCCESS", data }),

    doctorLoginSuccess: (data) =>
        dispatch({ type: "DOCTOR_LOGIN_SUCCESS", data }),

    patientLoginSuccess: (data) =>
        dispatch({ type: "PATIENT_LOGIN_SUCCESS", data }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
