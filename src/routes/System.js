import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";

import TableManageUser from "../modules/Admin/ManageUser/TableManageUser";
import Header from "../components/Layout/Header";
import ManageDoctor from "../modules/Admin/ManageUser/ManageDoctor";
import ManageSpecialty from "../modules/Admin/Specialty/ManageSpecialty";
import ManageClinic from "../modules/Admin/Clinic/ManageClinic";
import ManageSchedule from "../modules/Doctor/ManageSchedule";
import AddClinic from "../modules/Admin/Clinic/AddClinic";
import EditClinic from "../modules/Admin/Clinic/EditClinic";
import AddSpecialty from "../modules/Admin/Specialty/AddSpecialty";
import EditSpecialty from "../modules/Admin/Specialty/EditSpecialty";
import DashBoard from "../modules/Admin/DashBoard";
import {
  adminIsAuthenticated,
} from "../hoc/authentication";
class System extends Component {
  render() {
    const { systemMenuPath, adminToken, isLoggedIn } = this.props;

    const shouldShowHeader = adminToken || isLoggedIn;

    return (
      <>
        {shouldShowHeader && <Header />}

        <div className="system-container">
          <div className="system-list">
            <Switch>
              <Route path="/system/dashboard" component={adminIsAuthenticated(DashBoard)} />
              <Route path="/system/user-manage" component={adminIsAuthenticated(TableManageUser)} />
              <Route path="/system/manage-doctor" component={adminIsAuthenticated(ManageDoctor)} />
              <Route path="/system/manage-clinic" component={adminIsAuthenticated(ManageClinic)} />
              <Route path="/system/add-clinic" component={adminIsAuthenticated(AddClinic)} />
              <Route path="/system/edit-clinic/:id" component={adminIsAuthenticated(EditClinic)} />
              <Route path="/system/manage-schedule" component={adminIsAuthenticated(ManageSchedule)} />
              <Route path="/system/manage-specialty" component={adminIsAuthenticated(ManageSpecialty)} />
              <Route path="/system/add-specialty" component={adminIsAuthenticated(AddSpecialty)} />
              <Route path="/system/edit-specialty/:id" component={adminIsAuthenticated(EditSpecialty)} />
              <Route component={() => <Redirect to={systemMenuPath} />} />
            </Switch>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  systemMenuPath: state.app.systemMenuPath,
  isLoggedIn: state.adminAuth.isLoggedIn,
  adminToken: state.adminAuth.token,
});

export default connect(mapStateToProps)(System);
