import React, { Component } from "react";
import { connect } from "react-redux";

import * as actions from "../../store/actions";
import Navigator from "../../components/Navigator";
import { adminMenu, doctorMenu } from "./menuApp";
import "./Header.scss";
import vietnam from "../../assets/flag/vietnam.png";
import united from "../../assets/flag/united_kingdom.png";
import { languages, USER_ROLE } from "../../utils/constant";
import { FormattedMessage } from "react-intl"; // chuyển đổi ngôn ngữ
import _ from "lodash";
import LifeCare from '../../assets/logo3.png';
class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      changeLanguage: true,
      menuApp: [],
    };
  }
  change = (language) => {
    this.props.changeLangguageAppRedux(language);
  };
  componentDidMount() {
    let { userInfo } = this.props;
    let menu = [];
    if (userInfo && _.isEmpty(userInfo) === false) {
      let { roleId } = userInfo;
      if (roleId === USER_ROLE.ADMIN) {
        menu = adminMenu;
      }
      if (roleId === USER_ROLE.DOCTOR) {
        menu = doctorMenu;
      }
      this.setState({
        menuApp: menu,
      });
    }
  }

  render() {
    const { processLogout, language, userInfo } = this.props;
    // chọn cờ dựa trên language
    const flagSrc = language === languages.VI ? vietnam : united;

    return (
      <div className="sidebar-container ">
        {/* Logo */}
        <div className="sidebar-logo">
          <img src={LifeCare} alt="logo" />
        </div>
        {/* Menu chính */}
        <div className="sidebar-menu">
          <Navigator menus={this.state.menuApp} />
        </div>

        {/* Footer: ngôn ngữ, chào mừng, logout */}
        <div className="sidebar-footer">
          <div className="footer-top">
            <span>
              <FormattedMessage id="home-header.welcome" />,{" "}
              {userInfo && userInfo.firstName && userInfo.lastName
                ? userInfo.firstName + " " + userInfo.lastName
                : ""}
            </span>
          </div>

          <div className="footer-bottom">
            <div
              className="flag"
              onClick={() =>
                this.change(
                  language === languages.VI ? languages.EN : languages.VI
                )
              }
            >
              <img src={flagSrc} alt="flag" />
              <span>{language === languages.VI ? "VN" : "EN"}</span>
            </div>
            <div className="logout-btn" onClick={processLogout}>
              <i className="fas fa-sign-out-alt"></i>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
    userInfo: state.user.userInfo.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    processLogout: () => dispatch(actions.processLogout()),
    changeLangguageAppRedux: (languages) =>
      dispatch(actions.changeLangguageApp(languages)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
