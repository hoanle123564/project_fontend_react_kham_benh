import React, { Component } from "react";
import { connect } from "react-redux";

import * as actions from "../../store/actions";
import Navigator from "../../components/Navigator";
import { adminMenu, doctorMenu } from "./menuApp";
import "./Header.scss";
import vietnam from "../../assets/flag/vietnam.png";
import united from "../../assets/flag/united_kingdom.png";
import { languages } from "../../utils/constant";
import { FormattedMessage } from "react-intl";
import _ from "lodash";
import LifeCare from '../../assets/logo3.png';
import { jwtDecode } from "jwt-decode";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuApp: [],
      userDisplayName: "",
    };
  }

  componentDidMount() {
    this.loadMenuByToken();
  }

  componentDidUpdate(prevProps) {
    // Cập nhật menu nếu token thay đổi
    if (prevProps.token !== this.props.token) {
      this.loadMenuByToken();
    }
  }

  loadMenuByToken = () => {
    const token = this.props.token || localStorage.getItem("token");

    if (!token) return;

    let decoded = {};
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.log("Decode JWT failed: ", err);
      return;
    }

    let { roleId, firstName, lastName } = decoded;
    let menu = [];

    if (roleId === "R1") menu = adminMenu;
    if (roleId === "R2") menu = doctorMenu;

    this.setState({
      menuApp: menu,
      userDisplayName: `${firstName || ""} ${lastName || ""}`,
    });
  };

  change = (language) => {
    this.props.changeLangguageAppRedux(language);
  };

  processLogout = () => {
    this.props.processLogout();
    localStorage.removeItem("token");
  };

  render() {
    const { language, userInfo } = this.props;

    // chọn cờ dựa trên language
    const flagSrc = language === languages.VI ? vietnam : united;

    return (
      <div className="sidebar-container">

        {/* Logo */}
        <div className="sidebar-logo">
          <img src={LifeCare} alt="logo" />
        </div>

        {/* Menu chính */}
        <div className="sidebar-menu">
          <Navigator menus={this.state.menuApp} />
        </div>

        {/* Footer */}
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

            <div className="logout-btn" onClick={this.processLogout}>
              <i className="fas fa-sign-out-alt"></i>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
  token: state.user.token, // lấy token từ redux
  userInfo: state.user.userInfo.user,
});

const mapDispatchToProps = (dispatch) => ({
  processLogout: () => dispatch(actions.processLogout()),
  changeLangguageAppRedux: (languages) =>
    dispatch(actions.changeLangguageApp(languages)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
