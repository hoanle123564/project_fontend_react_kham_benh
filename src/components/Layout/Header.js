import React, { Component } from "react";
import { connect } from "react-redux";

import { adminMenu, doctorMenu } from "./menuApp";
import Navigator from "../Navigator";
import "./Header.scss";

import vietnam from "../../assets/flag/vietnam.png";
import united from "../../assets/flag/united_kingdom.png";
import LifeCare from "../../assets/logo3.png";

import { jwtDecode } from "jwt-decode";
import { languages } from "../../utils/constant";
import { FormattedMessage } from "react-intl";

class Header extends Component {
  state = {
    menuApp: [],
  };

  componentDidMount() {
    this.loadMenuByRole();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.adminToken !== this.props.adminToken ||
      prevProps.doctorToken !== this.props.doctorToken
    ) {
      this.loadMenuByRole();
    }
  }

  loadMenuByRole = () => {
    const path = window.location.pathname;

    let token = null;

    if (path.includes("/system")) {
      token = this.props.adminToken;
    } else if (path.includes("/doctor")) {
      token = this.props.doctorToken;
    }

    if (!token) {
      this.setState({ menuApp: [] });
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (e) {
      console.log("Decode token error", e);
      return;
    }

    const { roleId } = decoded;

    let menu = [];
    if (roleId === "R1") menu = adminMenu;
    if (roleId === "R2") menu = doctorMenu;

    this.setState({ menuApp: menu });
  };

  handleLogout = () => {
    if (this.props.adminToken) {
      this.props.adminLogout();
      localStorage.removeItem("adminToken");
    }

    if (this.props.doctorToken) {
      this.props.doctorLogout();
      localStorage.removeItem("doctorToken");
    }
  };

  render() {
    const { language, adminInfo, doctorInfo } = this.props;

    const flagSrc = language === languages.VI ? vietnam : united;
    const path = window.location.pathname;

    let displayName = "";

    if (path.includes("/system") && adminInfo) {
      displayName = `${adminInfo.firstName} ${adminInfo.lastName}`;
    }

    if (path.includes("/doctor") && doctorInfo) {
      displayName = `${doctorInfo.firstName} ${doctorInfo.lastName}`;
    }

    return (
      <div className="sidebar-container">
        <div className="sidebar-logo">
          <img src={LifeCare} alt="logo" />
        </div>

        <div className="sidebar-menu">
          <Navigator menus={this.state.menuApp} />
        </div>

        <div className="sidebar-footer">
          <div className="footer-top">
            <span>
              <FormattedMessage id="home-header.welcome" />, {displayName}
            </span>
          </div>

          <div className="footer-bottom">
            <div
              className="flag"
              onClick={() =>
                this.props.changeLanguage(
                  language === languages.VI ? languages.EN : languages.VI
                )
              }
            >
              <img src={flagSrc} alt="flag" />
              <span>{language === languages.VI ? "VN" : "EN"}</span>
            </div>

            <div className="logout-btn" onClick={this.handleLogout}>
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

  adminToken: state.adminAuth.token,
  doctorToken: state.doctor.token,

  adminInfo: state.adminAuth.adminInfo,
  doctorInfo: state.doctor.doctorInfo,
});

const mapDispatchToProps = (dispatch) => ({
  changeLanguage: (lang) =>
    dispatch({ type: "CHANGE_LANGUAGE", language: lang }),

  adminLogout: () => dispatch({ type: "ADMIN_LOGOUT" }),
  doctorLogout: () => dispatch({ type: "DOCTOR_LOGOUT" }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
