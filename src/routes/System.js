import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";

import TableManageUser from "../modules/Admin/ManageUser/TableManageUser";
import SlideBar from "../components/Layout/SlideBar";
import Header from "../components/Layout/Header";
import DoctorTable from "../modules/Admin/ManageUser/DoctorTable";
import ManageDoctor from "../modules/Admin/ManageUser/ManageDoctor";
import ManageSpecialty from "../modules/Admin/Specialty/ManageSpecialty";
import ManageClinic from "../modules/Admin/Clinic/ManageClinic";
import ManageClinicDepartment from "../modules/Admin/ClinicDepartment/ManageClinicDepartment";
import ManageSchedule from "../modules/Doctor/ManageSchedule";
import ListAppointment from "../modules/Doctor/ListAppointment";
import AddClinic from "../modules/Admin/Clinic/AddClinic";
import EditClinic from "../modules/Admin/Clinic/EditClinic";
import AddSpecialty from "../modules/Admin/Specialty/AddSpecialty";
import EditSpecialty from "../modules/Admin/Specialty/EditSpecialty";
import DashBoard from "../modules/Admin/DashBoard";
import ManagePostCategory from "../modules/Admin/PostCategory/ManagePostCategory";
import ManagePost from "../modules/Admin/Post/ManagePost";
import AddPost from "../modules/Admin/Post/AddPost";
import EditPost from "../modules/Admin/Post/EditPost";
import EditProfile from "../modules/Admin/ManageUser/EditProfile";
import DoctorMedicalRecords from "../modules/Doctor/MedicalRecords/DoctorMedicalRecords";

class System extends Component {
  state = {
    isSidebarCollapsed: false
  }

  toggleSidebar = () => {
    this.setState({
      isSidebarCollapsed: !this.state.isSidebarCollapsed
    });
  }

  render() {
    const { systemMenuPath, adminToken, isLoggedIn } = this.props;

    const showSlideBar = adminToken || isLoggedIn;

    return (
      <div className="main-app-layout">
        {showSlideBar && <SlideBar isCollapsed={this.state.isSidebarCollapsed} />}

        <div className="system-container">
          <Header toggleSidebar={this.toggleSidebar} />
          <div className="system-list">
            <Switch>
              <Route path="/system/dashboard" component={DashBoard} />
              <Route path="/system/user-manage" component={TableManageUser} />
              <Route path="/system/doctor-table" component={DoctorTable} />
              <Route path="/system/manage-doctor" component={ManageDoctor} />
              <Route path="/system/manage-clinic" component={ManageClinic} />
              <Route path="/system/manage-clinic-department" component={ManageClinicDepartment} />
              <Route path="/system/add-clinic" component={AddClinic} />
              <Route path="/system/edit-clinic/:id" component={EditClinic} />
              <Route path="/system/manage-schedule" component={ManageSchedule} />
              <Route path="/system/list-appointment" component={ListAppointment} />
              <Route
                path="/system/medical-record/:bookingId"
                render={(props) => <DoctorMedicalRecords {...props} adminMode />}
              />
              <Route
                exact
                path="/system/medical-record"
                render={(props) => <DoctorMedicalRecords {...props} adminMode />}
              />
              <Route path="/system/manage-specialty" component={ManageSpecialty} />
              <Route path="/system/add-specialty" component={AddSpecialty} />
              <Route path="/system/edit-specialty/:id" component={EditSpecialty} />
              <Route path="/system/manage-post" component={ManagePost} />
              <Route path="/system/add-post" component={AddPost} />
              <Route path="/system/edit-post/:id" component={EditPost} />
              <Route path="/system/manage-post-category" component={ManagePostCategory} />
              <Route path="/system/edit-profile" component={EditProfile} />
              <Redirect to={systemMenuPath} />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  systemMenuPath: state.app.systemMenuPath,
  isLoggedIn: state.adminAuth.isLoggedIn,
  adminToken: state.adminAuth.token,
});

export default connect(mapStateToProps)(System);
