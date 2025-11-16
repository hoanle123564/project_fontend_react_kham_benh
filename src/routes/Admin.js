import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

class Admin extends Component {

    render() {
        const { isLoggedIn, userInfo } = this.props;
        // let linkToRedirect = isLoggedIn ? '/system/user-manage' : '/login';

        let linkToRedirect = "/login";
        if (isLoggedIn === undefined || userInfo === null) {
            return null; // hoặc Loading...
        }
        // Nếu là admin → vào system
        if (isLoggedIn && userInfo.roleId === "R1") {
            linkToRedirect = "/system/user-manage";
        }

        // Nếu là doctor → vào trang doctor
        if (isLoggedIn && userInfo.roleId === "R2") {
            linkToRedirect = "/doctor/manage-schedule-private";
        }
        return (<
            Redirect to={linkToRedirect}
        />
        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn
        , userInfo: state.user?.userInfo?.user || null
    };
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
