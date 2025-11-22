import React, { Component } from "react";
import { connect } from "react-redux";
import { Route, Switch } from "react-router-dom";
import Header from "../components/Layout/Header";
import ManagePatient from "../modules/Doctor/ManagePatient";
import ManageSchedulePrivate from "../modules/Doctor/ManageSchedulePrivate";
import ListAppointment from "../modules/Doctor/ListAppointment";
import { doctorIsAuthenticated } from "../hoc/authentication";
class Doctor extends Component {
  render() {
    const { isLoggedIn } = this.props;
    return (
      <>
        {isLoggedIn && <Header />}
        <div className="system-container">
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
      </>
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
