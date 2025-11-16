import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";
import TableManageUser from "../containers/System/Admin/TableManageUser";
import Header from "../containers/Header/Header";
import ManageDoctor from "../containers/System/Admin/ManageDoctor";
import ManageSpectialty from "../containers/System/Specialty/ManageSpecialty";
import ManageClinic from "../containers/System/Clinic/ManageClinic";
import ManageSchedule from "../containers/System/Doctor/ManageSchedule";
import AddClinic from "../containers/System/Clinic/AddClinic";
import EditClinic from "../containers/System/Clinic/EditClinic";
import AddSpecialty from "../containers/System/Specialty/AddSpecialty";
import EditSpecialty from "../containers/System/Specialty/EditSpecialty";
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
