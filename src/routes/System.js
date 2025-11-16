import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";
import TableManageUser from "../modules/Admin/ManageUser/TableManageUser";
import Header from "../components/Layout/Header";
import ManageDoctor from "../modules/Admin/ManageUser/ManageDoctor";
import ManageSpectialty from "../modules/Admin/Specialty/ManageSpecialty";
import ManageClinic from "../modules/Admin/Clinic/ManageClinic";
import ManageSchedule from "../modules/Doctor/ManageSchedule";
import AddClinic from "../modules/Admin/Clinic/AddClinic";
import EditClinic from "../modules/Admin/Clinic/EditClinic";
import AddSpecialty from "../modules/Admin/Specialty/AddSpecialty";
import EditSpecialty from "../modules/Admin/Specialty/EditSpecialty";
class System extends Component {
  render() {
    const { systemMenuPath, isLoggedIn } = this.props;
    return (
      <>
        {isLoggedIn && <Header />}
        <div className="system-container">
          <div className="system-list">
            <Switch>

              <Route path="/system/user-manage" component={TableManageUser} />
              <Route path="/system/manage-doctor" component={ManageDoctor} />
              <Route path="/system/manage-clinic" component={ManageClinic} />
              <Route path="/system/add-clinic" component={AddClinic} />
              <Route path="/system/edit-clinic/:id" component={EditClinic} />
              <Route path="/system/manage-schedule" component={ManageSchedule} />
              <Route path="/system/manage-specialty" component={ManageSpectialty} />
              <Route path="/system/add-specialty" component={AddSpecialty} />
              <Route path="/system/edit-specialty/:id" component={EditSpecialty} />
              <Route
                component={() => {
                  return <Redirect to={systemMenuPath} />;
                }}
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
    isLoggedIn: state.user.isLoggedIn,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(System);
