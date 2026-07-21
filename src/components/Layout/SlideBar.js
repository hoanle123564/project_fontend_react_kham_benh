import React, { Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { toast } from "react-toastify";

import { adminMenu, clinicManagerMenu, doctorClinicManagerMenu, doctorMenu } from "./menuApp";
import Navigator from "../Navigator";
import { getAllClinic } from "../../services/userService";
import "./SlideBar.scss";

import LifeCare from "../../assets/logo3.png";
import LifeCare_Collapse from "../../assets/Medical_Health_Logo.svg";

import { jwtDecode } from "jwt-decode";

class SlideBar extends Component {
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

  loadMenuByRole = async () => {
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
    if (roleId === "R4") menu = clinicManagerMenu;

    if (roleId === "R2") {
      this.setState({ menuApp: doctorMenu });

      try {
        const res = await getAllClinic({ managedOnly: true });
        if (this.props.doctorToken !== token || res?.errCode !== 0 || !Array.isArray(res.data)) {
          return;
        }

        if (res.data.length === 1 && res.data[0]?.id) {
          const clinicMenu = doctorClinicManagerMenu.map((group) => ({
            ...group,
            menus: group.menus.map((item) =>
              item.link === "/doctor/manage-clinic"
                ? { ...item, link: `/doctor/manage-clinic/${res.data[0].id}` }
                : item
            ),
          }));
          this.setState({ menuApp: [...doctorMenu, ...clinicMenu] });
          return;
        }

        if (res.data.length > 1) {
          toast.error(this.props.intl.formatMessage({
            id: "menu.clinic-manager.multiple-clinics-error",
            defaultMessage: "Your account is assigned to multiple clinics. Please choose a clinic from the list.",
          }));
          this.setState({ menuApp: [...doctorMenu, ...doctorClinicManagerMenu] });
        }
      } catch {
        this.setState({ menuApp: doctorMenu });
      }

      return;
    }

    this.setState({ menuApp: menu });
  };

  handleLogout = () => {
    const path = window.location.pathname;

    if (path.includes("/system") && this.props.adminToken) {
      this.props.adminLogout();
      return;
    }

    if (path.includes("/doctor") && this.props.doctorToken) {
      this.props.doctorLogout();
    }
  };

  render() {
    return (
      <div className={`sidebar-container ${this.props.isCollapsed ? 'collapsed' : ''}`}>
        <div className="container">
          <div className="sidebar-logo">
            <img src={this.props.isCollapsed ? LifeCare_Collapse : LifeCare} alt="logo" />
          </div>

          <div className="sidebar-menu">
            <Navigator menus={this.state.menuApp} />
          </div>

          {/* <div className="sidebar-footer">
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
        </div> */}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  adminToken: state.adminAuth.token,
  doctorToken: state.doctor.token,
});

const mapDispatchToProps = (dispatch) => ({
  changeLanguage: (lang) =>
    dispatch({ type: "CHANGE_LANGUAGE", language: lang }),

  adminLogout: () => dispatch({ type: "ADMIN_LOGOUT" }),
  doctorLogout: () => dispatch({ type: "DOCTOR_LOGOUT" }),
});

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(SlideBar));
