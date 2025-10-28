import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { getAllCode } from '../../../services/userService';
import { languages } from '../../../utils/constant';
// import 'UserRedux.scss';
import { injectIntl } from 'react-intl';

class UserRedux extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            address: '',
            gender: '',
            position: '',
            role: '',
            avatar: '',
            genderArr: [],
            positionArr: [],
            roleArr: [],
        }
    }

    async componentDidMount() {
        try {
            const resGender = await getAllCode('GENDER');
            const resPosition = await getAllCode('POSITION');
            const resRole = await getAllCode('ROLE');

            if (
                resGender && resGender.errCode === 0 &&
                resPosition && resPosition.errCode === 0 &&
                resRole && resRole.errCode === 0
            ) {
                this.setState({
                    genderArr: resGender.data,
                    positionArr: resPosition.data,
                    roleArr: resRole.data,
                });
            }
        } catch (error) {
            console.log(error);

        }
    }
    handleChangeInput = (e, field) => {
        const value = e.target.value;
        this.setState({
            [field]: value
        });
    }

    render() {
        const { genderArr, positionArr, roleArr } = this.state;
        const { language, intl } = this.props;

        return (
            <div className="container mt-4 user-redux-container">
                <h3 className="text-center mb-4 text-primary">
                    <FormattedMessage id="user-manage.add" />
                </h3>

                <div className="row mb-3">
                    <div className="col-md-3">
                        <label>
                            <FormattedMessage id="user-manage.email" />
                        </label>
                        <input type="email" className="form-control"
                            value={this.state.email}
                            onChange={(e) => this.handleChangeInput(e, 'email')} />
                    </div>

                    <div className="col-md-3">
                        <label>
                            <FormattedMessage id="user-manage.password" />
                        </label>
                        <input type="password" className="form-control"
                            value={this.state.password}
                            onChange={(e) => this.handleChangeInput(e, 'password')} />
                    </div>

                    <div className="col-md-3">
                        <label>
                            <FormattedMessage id="user-manage.first-name" />
                        </label>
                        <input type="text" className="form-control"
                            value={this.state.firstName}
                            onChange={(e) => this.handleChangeInput(e, 'firstName')} />
                    </div>

                    <div className="col-md-3">
                        <label>
                            <FormattedMessage id="user-manage.last-name" />

                        </label>
                        <input type="text" className="form-control"
                            value={this.state.lastName}
                            onChange={(e) => this.handleChangeInput(e, 'lastName')} />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-3">
                        <label>
                            <FormattedMessage id="user-manage.phone" />
                        </label>
                        <input type="text" className="form-control"
                            value={this.state.phoneNumber}
                            onChange={(e) => this.handleChangeInput(e, 'phoneNumber')} />
                    </div>

                    <div className="col-md-3">
                        <label>
                            <FormattedMessage id="user-manage.address" />

                        </label>
                        <input type="text" className="form-control"
                            value={this.state.address}
                            onChange={(e) => this.handleChangeInput(e, 'address')} />
                    </div>

                    <div className="col-md-2">
                        <label>
                            <FormattedMessage id="user-manage.gender" />

                        </label>
                        <select className="form-select"
                            value={this.state.gender}
                            onChange={(e) => this.handleChangeInput(e, 'gender')}>
                            <option >
                                {intl.formatMessage({ id: 'user-manage.choose' })}
                            </option>
                            {genderArr && genderArr.length > 0 &&
                                genderArr.map((item, index) => (
                                    <option key={index} >
                                        {item.value_vi}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="col-md-2">
                        <label>
                            <FormattedMessage id="user-manage.position" />
                        </label>
                        <select className="form-select"
                            value={this.state.position}
                            onChange={(e) => this.handleChangeInput(e, 'position')}>
                            <option >
                                {intl.formatMessage({ id: 'user-manage.choose' })}
                            </option>
                            {positionArr && positionArr.length > 0 &&
                                positionArr.map((item, index) => (
                                    <option key={index} value={item.keyMap}>
                                        {item.value_vi}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="col-md-2">
                        <label>
                            <FormattedMessage id="user-manage.role" />
                        </label>
                        <select className="form-select"
                            onChange={(e) => this.handleChangeInput(e, 'role')}>
                            <option >
                                {intl.formatMessage({ id: 'user-manage.choose' })}
                            </option>
                            {roleArr && roleArr.length > 0 &&
                                roleArr.map((item, index) => (
                                    <option key={index} value={item.keyMap}>
                                        {language === languages.VI ? item.value_vi : item.value_en}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-md-3">
                        <label>
                            <FormattedMessage id="user-manage.avatar" />
                        </label>
                        <input type="text" className="form-control"
                            placeholder="Link ảnh..."
                            value={this.state.avatar}
                            onChange={(e) => this.handleChangeInput(e, 'avatar')} />
                    </div>
                </div>

                <div className="text-center">
                    <button className="btn btn-primary px-4"
                        onClick={this.handleSaveUser}>
                        <FormattedMessage id="user-manage.save" />
                    </button>
                </div>
            </div>
        );
    }

}

const mapStateToProps = state => {
    return {
        language: state.app.language
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(UserRedux));
