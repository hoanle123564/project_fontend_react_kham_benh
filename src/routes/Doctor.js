import React, { Component } from "react";
import { connect } from "react-redux";
import { Route, Switch } from "react-router-dom";
import SlideBar from "../components/Layout/SlideBar";
import Header from "../components/Layout/Header";
import DoctorMedicalRecords from "../modules/Doctor/MedicalRecords/DoctorMedicalRecords";
import DoctorQueue from "../modules/Doctor/DoctorQueue/DoctorQueue";
import ManagePatient from "../modules/Doctor/ManagePatient";
import ManageSchedulePrivate from "../modules/Doctor/ManageSchedulePrivate";
import ListAppointment from "../modules/Doctor/ListAppointment";
import EditProfile from "../modules/Admin/ManageUser/EditProfile";

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
              <Route path="/doctor/medical-record/:bookingId" component={DoctorMedicalRecords} />
              <Route exact path="/doctor/medical-record" component={DoctorMedicalRecords} />
              <Route path="/doctor/manage-patient/:patientId" component={ManagePatient} />
              <Route exact path="/doctor/manage-patient" component={ManagePatient} />
              <Route path="/doctor/appointment/:bookingId" component={DoctorQueue} />
              <Route exact path="/doctor/appointment" component={DoctorQueue} />
              <Route path="/doctor/manage-schedule-private" component={ManageSchedulePrivate} />
              <Route path="/doctor/list-appointment" component={ListAppointment} />
              <Route path="/doctor/edit-profile" component={EditProfile} />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.doctor.isLoggedIn,
  };
};

export default connect(mapStateToProps)(Doctor);
