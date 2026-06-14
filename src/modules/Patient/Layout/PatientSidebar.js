import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import { withRouter, NavLink } from "react-router-dom";
import { patientMenu } from "../../../components/Layout/menuApp";
import "./PatientSidebar.scss";

class PatientSidebar extends Component {
    render() {
        const menuGroup = patientMenu[0] || {};
        const navItems = menuGroup.menus || [];

        return (
            <aside className="patient-sidebar">
                <ul className="patient-sidebar-nav">
                    {navItems.map((item, index) => (
                        <li className="patient-sidebar-item" key={index}>
                            <NavLink
                                to={item.link}
                                exact
                                activeClassName="active"
                            >
                                <i className={item.icon}></i>
                                <span>
                                    <FormattedMessage id={item.name} />
                                </span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </aside>
        );
    }
}

export default withRouter(PatientSidebar);
