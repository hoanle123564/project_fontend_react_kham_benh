import React, { Component } from "react";
import { connect } from "react-redux";
import { Route, Switch } from "react-router-dom";
import SlideBar from "../components/Layout/SlideBar";
import Header from "../components/Layout/Header";
import ManagePatient from "../modules/Doctor/ManagePatient";
import ManageSchedulePrivate from "../modules/Doctor/ManageSchedulePrivate";
import ListAppointment from "../modules/Doctor/ListAppointment";
import { doctorIsAuthenticated } from "../hoc/authentication";
class Doctor extends Component {
  state = {
    isSidebarCollapsed: false
  }

  toggleSidebar = () => {
    this.setState({
      isSidebarCollapsed: !this.state.isSidebarCollapsed
    });
  }

  render() {
    const { isLoggedIn } = this.props;
    return (
      <div className="main-app-layout">
        {isLoggedIn && <SlideBar isCollapsed={this.state.isSidebarCollapsed} />}
        <div className="system-container">
          <Header toggleSidebar={this.toggleSidebar} />
          <div className="system-list">
            <Switch>
              <Route path="/doctor/manage-patient"
                component={doctorIsAuthenticated(ManagePatient)}
              />
              <Route path="/doctor/manage-schedule-private"
                component={doctorIsAuthenticated(ManageSchedulePrivate)}
              />
              <Route path="/doctor/list-appointment"
                component={doctorIsAuthenticated(ListAppointment)}
              />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    systemMenuPath: state.app.systemMenuPath,
    isLoggedIn: state.doctor.isLoggedIn,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Doctor);
