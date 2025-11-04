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
    // chọn cờ dựa trên language1
    const flagSrc = language === languages.VI ? vietnam : united;

    return (
      <div className="header-container">
        {/* thanh navigator */}
        <div className="header-tabs-container">
          <Navigator menus={this.state.menuApp} />
        </div>

        {/* chuyển đổi ngôn ngữ */}
        <div className="language ">
          <span className="welcome">
            <FormattedMessage id="home-header.welcome" />,{" "}
            {userInfo && userInfo.firstName && userInfo.lastName
              ? userInfo.firstName + " " + userInfo.lastName
              : ""}
          </span>
          {flagSrc ? (
            language === languages.VI ? (
              <div
                className="language-vi"
                onClick={() => this.change(languages.EN)}
              >
                <img src={flagSrc} alt="vietnam" width="30" />{" "}
                <FormattedMessage id="home-header.language" />
              </div>
            ) : (
              <div
                className="language-en"
                onClick={() => this.change(languages.VI)}
              >
                <img src={flagSrc} alt="united" width="30" />{" "}
                <FormattedMessage id="home-header.language" />
              </div>
            )
          ) : null}

          {/* nút logout */}
          <div className="btn btn-logout" onClick={processLogout}>
            <i className="fas fa-sign-out-alt"></i>
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
