import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from "connected-react-router";
import * as actions from "../../store/actions";
import './Login.scss';
// import { FormattedMessage } from 'react-intl';
import { handleLoginAPI } from '../../services/userService';
// import { error } from 'ajv/dist/vocabularies/applicator/dependencies';


class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            pass: '',
            ShowPass: false,
            errMessage: ''
        }
    }
    handleOnchangeName = (event) => {
        this.setState({
            email: event.target.value
        }
        )
        console.log(event.target.value);

    }

    handleOnchangePass = (event) => {
        this.setState({
            pass: event.target.value
        }
        )
        console.log(event.target.value);

    }

    handleOnClick = async () => {
        this.setState({
            errMessage: ''
        })
        try {
            const data = await handleLoginAPI(this.state.email, this.state.pass)
            if (data && data.errCode !== 0) {
                this.setState({
                    errMessage: data.message
                })

            } else {
                this.props.userLoginSuccess(data.user)
                this.setState({
                    errMessage: 'Login succeed !'
                })
            }
        } catch (error) {
            console.log('error>>', error);
            this.setState({
                errMessage: error.response.data.message
            })
        }
    }
    handleShowHidePass = () => {
        this.setState({
            ShowPass: !this.state.ShowPass
        })
    }
    render() {
        return (
            <>
                <div className='login-background'>
                    <div className='login-container'>
                        <div className='login-content row'>
                            <div className='col-12 text-center text-login'>Login</div>
                            <div className='col-12 form-group login-input'>
                                <label>Username : </label>
                                <input type='text' value={this.state.email}
                                    className='form-control' placeholder='Enter your name' onChange={(event) => this.handleOnchangeName(event)}></input>
                            </div>

                            <div className='col-12 form-group login-input'>
                                <label>Password : </label>
                                <div className='custom-input-pass'>
                                    <input type={this.state.ShowPass ? 'text' : 'password'} value={this.state.pass}
                                        className='form-control' placeholder='Enter your password' onChange={(event) => this.handleOnchangePass(event)}></input>
                                    <span onClick={(event) => this.handleShowHidePass()}><i className={this.state.ShowPass ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i></span>

                                </div>
                            </div>
                            <div className='col-12 ' style={{ color: 'red' }}>
                                {this.state.errMessage}
                            </div>
                            <div className='col-12 '>
                                <button className='btn-login' onClick={() => this.handleOnClick()}>Login</button>
                            </div>
                            <div className='col-12'>
                                <span className='forgot-password'>Forgot your password ?</span>
                            </div>
                            <div className='col-12 text-center'>
                                <span className='text-center'>Or login with:</span>
                            </div>
                            <div className='col-12 social-login'>
                                <i className="fa-brands fa-facebook-f facebook"></i>
                                <i className="fa-brands fa-google-plus-g google"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        lang: state.app.language,
        userInfo: state.user.userInfo
    };
};

const mapDispatchToProps = dispatch => {
    return {
        navigate: (path) => dispatch(push(path)),
        userLoginFail: () => dispatch(actions.userLoginFail()),
        userLoginSuccess: (userInfor) => dispatch(actions.userLoginSuccess(userInfor))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
