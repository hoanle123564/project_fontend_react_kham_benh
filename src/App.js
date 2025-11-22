import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Route, Switch } from "react-router-dom";
import { ConnectedRouter as Router } from "connected-react-router";
import { history } from "./redux";
// toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  doctorIsAuthenticated,
  adminIsAuthenticated,
  patientIsAuthenticated,
} from "./hoc/authentication";

import { path } from "./utils";
import HomePage from "./modules/Patient/Pages/HomePage/HomePage";
// import Admin from "./routes/Admin";
import Login from "./modules/Auth/Login";
import System from "./routes/System";
import Doctor from "./routes/Doctor";
import DetailDoctor from "./modules/Patient/Pages/Doctor/DetailDoctor";
import DetailSpeciality from "./modules/Patient/Pages/Speciality/DetailSpeciality";
import DetailClinic from "./modules/Patient/Pages/Clinic/DetailClinic";
import VerifyEmailBooking from "./modules/Patient/Pages/VerifyEmailBooking";
import PatientProfile from "./modules/Patient/Pages/Profile/PatientProfile";
import Appointments from "./modules/Patient/Pages/Appointment/Appointments";
import Register from "./modules/Auth/Register";
import ListDoctor from "./modules/Patient/Pages/Doctor/ListDoctor";
import ListClinic from "./modules/Patient/Pages/Clinic/ListClinic";
import ListSpecialty from "./modules/Patient/Pages/Speciality/ListSpecialty";
class App extends Component {

  state = {
    appReady: false,   // <--- Thêm state này
  };

  componentDidMount() {
    const { persistor } = this.props;

    persistor.subscribe(() => {
      const { bootstrapped } = persistor.getState();
      if (bootstrapped && !this.state.appReady) {
        this.setState({ appReady: true });
      }
    });
  }




  render() {
    if (!this.state.appReady) {
      return <div />; // hoặc loading spinner
    }
    return (
      <Fragment>
        <Router history={history}>
          <div className="main-container">
            <span className="content-container">
              <Switch>
                <Route path={path.HOME} exact component={HomePage} />
                <Route path={path.LOGIN} component={Login} />
                <Route path={path.REGISTER} component={Register} />

                <Route path={path.SYSTEM} component={adminIsAuthenticated(System)} />
                <Route path={path.DOCTOR} component={doctorIsAuthenticated(Doctor)} />
                <Route path={path.VERIFY_BOOKING} component={VerifyEmailBooking} />
                <Route path={path.PROFILE_PATIENT} component={patientIsAuthenticated(PatientProfile)} />
                <Route path={path.APPOINTMENTS} component={patientIsAuthenticated(Appointments)} />
                <Route path={path.HOMEPAGE} component={HomePage} />

                <Route path={path.LIST_DOCTOR} component={ListDoctor} />
                <Route path={path.LIST_CLINIC} component={ListClinic} />
                <Route path={path.LIST_SPECIALTY} component={ListSpecialty} />
                <Route path={path.DETAIL_DOCTOR} component={DetailDoctor} />
                <Route path={path.DETAIL_SPECIALTY} component={DetailSpeciality} />
                <Route path={path.DETAIL_CLINIC} component={DetailClinic} />
              </Switch>
            </span>

            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    started: state.app.started,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
