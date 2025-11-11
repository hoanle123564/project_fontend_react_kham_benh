import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Route, Switch } from "react-router-dom";
import { ConnectedRouter as Router } from "connected-react-router";
import { history } from "../redux";
// toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  userIsAuthenticated,
  userIsNotAuthenticated,
} from "../hoc/authentication";

import { path } from "../utils";
import HomePage from "./HomePage/HomePage";
import Admin from "../routes/Admin";
import Login from "../containers/Auth/Login";
import System from "../routes/System";
import Doctor from "../routes/Doctor";
import DetailDoctor from "./Patient/Doctor/DetailDoctor";
import ChoRay from "./Patient/Clinic/ChoRay";
import VerifyEmailBooking from "./Patient/VerifyEmailBooking";
class App extends Component {
  handlePersistorState = () => {
    const { persistor } = this.props;
    let { bootstrapped } = persistor.getState();
    if (bootstrapped) {
      if (this.props.onBeforeLift) {
        Promise.resolve(this.props.onBeforeLift())
          .then(() => this.setState({ bootstrapped: true }))
          .catch(() => this.setState({ bootstrapped: true }));
      } else {
        this.setState({ bootstrapped: true });
      }
    }
  };

  componentDidMount() {
    this.handlePersistorState();
  }

  render() {
    return (
      <Fragment>
        <Router history={history}>
          <div className="main-container">
            <span className="content-container">
              <Switch>
                <Route path={path.HOME} exact component={Admin} />
                <Route
                  path={path.LOGIN}
                  component={userIsNotAuthenticated(Login)}
                />

                <Route
                  path={path.SYSTEM}
                  component={userIsAuthenticated(System)}
                />
                <Route path={path.DOCTOR} component={userIsAuthenticated(Doctor)} />

                <Route path={path.VERIFY_BOOKING} component={VerifyEmailBooking} />
                <Route path={path.CHORAY} component={ChoRay} />
                <Route path={path.HOMEPAGE} component={HomePage} />
                <Route path={path.DETAIL_DOCTOR} component={DetailDoctor} />
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
    isLoggedIn: state.user.isLoggedIn,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
