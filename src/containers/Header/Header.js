import React, { Component } from 'react';
import { connect } from 'react-redux';

import * as actions from "../../store/actions";
import Navigator from '../../components/Navigator';
import { adminMenu } from './menuApp';
import './Header.scss';
import vietnam from '../../assets/flag/vietnam.png'
import united from '../../assets/flag/united_kingdom.png'
import { languages } from '../../utils/constant';
// import { changeLangguageApp } from '../../store/actions/appActions';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            changeLanguage: true
        }
    }
    change = (language) => {
        this.props.changeLangguageAppRedux(language);
        this.setState({
            changeLanguage: !this.state.changeLanguage
        })
    }

    render() {
        const { processLogout } = this.props;
        let language = this.state.changeLanguage;

        return (
            <div className="header-container">
                {/* thanh navigator */}
                <div className="header-tabs-container">
                    <Navigator menus={adminMenu} />
                </div>
                {/* chuyển đổi ngôn ngữ */}

                <div className='language '>
                    {language ?
                        <div className='language-vi'
                            onClick={() => this.change(languages.EN)}>
                            <img src={vietnam} alt='vietnam' width={'30px'} /> VN</div> :
                        <div className='language-en'
                            onClick={() => this.change(languages.VI)}>
                            <img src={united} alt='united' width={'30px'} /> EN</div>
                    }

                    {/* nút logout */}
                    <div className="btn btn-logout" onClick={processLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                    </div>
                </div>
            </div>
        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        language: state.app.language

    };
};

const mapDispatchToProps = dispatch => {
    return {
        processLogout: () => dispatch(actions.processLogout()),
        changeLangguageAppRedux: (languages) => dispatch(actions.changeLangguageApp(languages))

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
