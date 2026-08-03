import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";

import SlideBar from "../components/Layout/SlideBar";
import Header from "../components/Layout/Header";
import DoctorTable from "../modules/Admin/ManageUser/DoctorTable";
import ManageDoctor from "../modules/Admin/ManageUser/ManageDoctor";
import ManageClinic from "../modules/Admin/Clinic/ManageClinic";
import ManageClinicDepartment from "../modules/Admin/ClinicDepartment/ManageClinicDepartment";
import EditClinic from "../modules/Admin/Clinic/EditClinic";
import EditProfile from "../modules/Admin/ManageUser/EditProfile";
import BookingManagement from "../modules/Booking/BookingManagement";
import ManagePatient from "../modules/Doctor/ManagePatient";
import ManageSchedule from "../modules/Doctor/ManageSchedule";

class ClinicManager extends Component {
  state = {
    isSidebarCollapsed: false,
  };

  toggleSidebar = () => {
    this.setState((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }));
  };

  render() {
    if (!this.props.isLoggedIn) return null;

    return (
      <div className="main-app-layout">
        <SlideBar isCollapsed={this.state.isSidebarCollapsed} />
        <div className="system-container">
          <Header toggleSidebar={this.toggleSidebar} />
          <div className="system-list">
            <Switch>
              <Route path="/clinic-manager/manage-patient/:patientId" component={ManagePatient} />
              <Route exact path="/clinic-manager/manage-patient" component={ManagePatient} />
              <Route path="/clinic-manager/doctor-table" component={DoctorTable} />
              <Route path="/clinic-manager/manage-doctor" component={ManageDoctor} />
              <Route path="/clinic-manager/manage-clinic-department" component={ManageClinicDepartment} />
              <Route path="/clinic-manager/edit-clinic/:id" component={EditClinic} />
              <Route path="/clinic-manager/manage-clinic" component={ManageClinic} />
              <Route path="/clinic-manager/manage-schedule" component={ManageSchedule} />
              <Route path="/clinic-manager/list-appointment" render={(props) => <BookingManagement {...props} clinicManagerMode />} />
              <Route path="/clinic-manager/edit-profile" component={EditProfile} />
              <Redirect to="/clinic-manager/manage-clinic" />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state) => ({
  isLoggedIn: state.clinicManagerAuth?.isLoggedIn,
}))(ClinicManager);
