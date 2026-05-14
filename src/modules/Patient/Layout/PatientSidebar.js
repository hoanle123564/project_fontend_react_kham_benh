import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter, NavLink } from "react-router-dom";
import "./PatientSidebar.scss";

class PatientSidebar extends Component {
    render() {
        const { language } = this.props;
        const isVI = language === "vi";

        const navItems = [
            {
                icon: "fas fa-user-circle",
                labelVI: "Hồ sơ cá nhân",
                labelEN: "My Profile",
                path: "/patient-profile",
            },
            {
                icon: "fas fa-calendar-alt",
                labelVI: "Lịch hẹn của tôi",
                labelEN: "My Appointments",
                path: "/appointments",
            },
        ];

        return (
            <aside className="patient-sidebar">
                <ul className="patient-sidebar-nav">
                    {navItems.map((item, index) => (
                        <li className="patient-sidebar-item" key={index}>
                            <NavLink
                                to={item.path}
                                exact
                                activeClassName="active"
                            >
                                <i className={item.icon}></i>
                                <span>{isVI ? item.labelVI : item.labelEN}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </aside>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
});

export default withRouter(connect(mapStateToProps)(PatientSidebar));
