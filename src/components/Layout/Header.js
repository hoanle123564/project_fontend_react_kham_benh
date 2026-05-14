import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import './Header.scss';
import Breadcrumb from '../Breadcrumb/breadcrumb';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isDropdownOpen: false
        };
        this.dropdownRef = React.createRef();
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    handleClickOutside = (event) => {
        if (this.dropdownRef && !this.dropdownRef.current.contains(event.target)) {
            this.setState({ isDropdownOpen: false });
        }
    }

    toggleDropdown = () => {
        // có 2 cách viết
        // cách 1: khuyên dùng vì nó đảm bảo luôn lấy giá trị mới nhất
        this.setState(prevState => ({
            isDropdownOpen: !prevState.isDropdownOpen
        }));

        // cách 2: đôi khi sẽ bị sai, nó lấy giá trị c
        // this.setState({
        //     isDropdownOpen: !this.state.isDropdownOpen
        // })
    }

    handleLogout = () => {
        const path = window.location.pathname;
        // Chỉ logout đúng role đang dùng, tránh logout cả admin lẫn doctor cùng lúc
        if (path.includes("/system")) {
            this.props.adminLogout();
        } else if (path.includes("/doctor")) {
            this.props.doctorLogout();
        }
        this.props.history.push('/login');
    }

    goToProfile = () => {
        this.setState({ isDropdownOpen: false });
    }

    render() {
        const { isDropdownOpen } = this.state;
        const { adminInfo, doctorInfo, toggleSidebar } = this.props;

        const path = window.location.pathname;
        const isAdminPath = path.includes("/system");
        const isDocPath = path.includes("/doctor");

        // Lấy đúng thông tin user theo role đang active
        const currentInfo = isAdminPath ? adminInfo : isDocPath ? doctorInfo : null;

        let displayName = "User";
        if (isAdminPath && adminInfo) {
            displayName = `${adminInfo.firstName} ${adminInfo.lastName}`;
        } else if (isDocPath && doctorInfo) {
            displayName = `${doctorInfo.firstName} ${doctorInfo.lastName}`;
        }

        // Avatar dùng đúng info của role đang active
        const avatarSrc = currentInfo?.image
            ? `data:image/jpeg;base64,${currentInfo.image}`
            : "https://i.ibb.co/L5T1YhY/avatar.png";

        return (
            <>
                <header>
                    <div className="container">
                        <div className="header-container">
                            <div className="header-left">
                                <span className="toggle-btn" onClick={toggleSidebar}>
                                    <i className="fas fa-bars"></i>
                                </span>
                                {/* Breadcrumb — hiển thị đường dẫn ngay dưới header */}
                                <Breadcrumb variant={isAdminPath ? 'admin' : 'doctor'} />
                            </div>

                            <div className="header-right">
                                <div className="notification-icon">
                                    <i className="fas fa-bell"></i>
                                    {/* <span className="badge">3</span> */}
                                </div>

                                <div className="user-profile" ref={this.dropdownRef} onClick={this.toggleDropdown}>
                                    <span className="username">{displayName}</span>
                                    <img src={avatarSrc} alt="avatar" />
                                    {
                                        this.state.isDropdownOpen ?
                                            <i className="fas fa-chevron-up ChevronDown"></i> :
                                            <i className="fas fa-chevron-down ChevronDown"></i>
                                    }

                                    <div className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                                        <div className="dropdown-item" onClick={this.goToProfile}>
                                            <i className="fas fa-user fa-sm fa-fw"></i>
                                            Chỉnh sửa thông tin cá nhân
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <div className="dropdown-item" onClick={this.handleLogout}>
                                            <i className="fas fa-sign-out-alt fa-sm fa-fw" style={{ color: "red" }}></i>
                                            Đăng xuất
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>


            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        adminToken: state.adminAuth.token,
        doctorToken: state.doctor.token,
        adminInfo: state.adminAuth.adminInfo,
        doctorInfo: state.doctor.doctorInfo,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        adminLogout: () => dispatch({ type: "ADMIN_LOGOUT" }),
        doctorLogout: () => dispatch({ type: "DOCTOR_LOGOUT" }),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
