import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import moment from 'moment';
import './Header.scss';
import Breadcrumb from '../Breadcrumb/breadcrumb';
import { getDoctorNotifications, markDoctorNotificationsRead } from '../../services/doctorNotificationService';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isDropdownOpen: false,
            isNotificationsOpen: false,
            notifications: [],
            isNotificationLoading: false,
        };
        this.actionsRef = React.createRef();
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
        if (this.isDoctorPath()) {
            this.loadNotifications();
            this.notificationTimer = window.setInterval(this.loadNotifications, 30000);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
        window.clearInterval(this.notificationTimer);
    }

    componentDidUpdate(prevProps) {
        const wasDoctor = prevProps.location?.pathname?.includes('/doctor');
        const isDoctor = this.isDoctorPath();
        if (!wasDoctor && isDoctor) {
            this.loadNotifications();
            this.notificationTimer = window.setInterval(this.loadNotifications, 30000);
        }
        if (wasDoctor && !isDoctor) window.clearInterval(this.notificationTimer);
    }

    handleClickOutside = (event) => {
        if (this.actionsRef.current && !this.actionsRef.current.contains(event.target)) {
            this.setState({ isDropdownOpen: false, isNotificationsOpen: false });
        }
    }

    isDoctorPath = () => this.props.location?.pathname?.includes('/doctor');

    getText = (key, values) => this.props.intl.formatMessage({
        id: `notifications.${key}`,
        defaultMessage: key,
    }, values);

    loadNotifications = async () => {
        if (!this.isDoctorPath()) return;
        this.setState({ isNotificationLoading: true });
        try {
            const response = await getDoctorNotifications();
            if (response?.errCode === 0) {
                this.setState({ notifications: response.data || [], isNotificationLoading: false });
                return;
            }
        } catch (error) {
            // Keep the last successful list visible while the next lightweight poll retries.
        }
        this.setState({ isNotificationLoading: false });
    }

    toggleNotifications = () => {
        this.setState(prevState => ({
            isNotificationsOpen: !prevState.isNotificationsOpen,
            isDropdownOpen: false,
        }), () => {
            if (this.state.isNotificationsOpen) this.loadNotifications();
        });
    }

    markNotificationsRead = async () => {
        try {
            await markDoctorNotificationsRead();
            this.setState(prevState => ({
                notifications: prevState.notifications.map(item => ({ ...item, isRead: true })),
            }));
        } catch (error) {
            // A failed read marker is retried by the next explicit user action.
        }
    }

    openNotification = async (notification) => {
        if (!notification) return;
        this.setState({ isNotificationsOpen: false });
        if (!notification.isRead) {
            this.setState(prevState => ({
                notifications: prevState.notifications.map(item =>
                    item.id === notification.id ? { ...item, isRead: true } : item
                ),
            }));
            markDoctorNotificationsRead(notification.id).catch(() => this.loadNotifications());
        }
        if (notification.type === 'NEW_MESSAGE' && notification.chatRoomId) {
            this.props.history.push(`/doctor/message/${encodeURIComponent(notification.chatRoomId)}`);
            return;
        }
        if (notification.type === 'NEW_REVIEW' && notification.reviewId) {
            this.props.history.push(`/doctor/reviews?reviewId=${encodeURIComponent(notification.reviewId)}`);
            return;
        }
        if (notification.bookingId) this.props.history.push('/doctor/manage-booking');
    }

    toggleDropdown = () => {
        // có 2 cách viết
        // cách 1: khuyên dùng vì nó đảm bảo luôn lấy giá trị mới nhất
        this.setState(prevState => ({
            isDropdownOpen: !prevState.isDropdownOpen,
            isNotificationsOpen: false,
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
        const path = window.location.pathname;
        if (path.includes("/system")) {
            this.props.history.push('/system/edit-profile');
        } else if (path.includes("/doctor")) {
            this.props.history.push('/doctor/edit-profile');
        }
    }

    render() {
        const { isDropdownOpen, isNotificationsOpen, notifications, isNotificationLoading } = this.state;
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
        const unreadCount = notifications.filter(item => !item.isRead).length;

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

                            <div className="header-right" ref={this.actionsRef}>
                                {isDocPath && <div className="notification-area">
                                    <button
                                        type="button"
                                        className="notification-icon"
                                        aria-label={this.getText('open')}
                                        title={this.getText('open')}
                                        aria-expanded={isNotificationsOpen}
                                        onClick={this.toggleNotifications}
                                    >
                                    <i className="fas fa-bell"></i>
                                    {unreadCount > 0 && <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                                    </button>
                                    {isNotificationsOpen && <div className="notification-menu" role="dialog" aria-label={this.getText('title')}>
                                        <div className="notification-menu__header">
                                            <h3>{this.getText('title')}</h3>
                                            <button type="button" onClick={this.markNotificationsRead}>{this.getText('markAll')}</button>
                                        </div>
                                        <div className="notification-menu__items">
                                            {isNotificationLoading && notifications.length === 0 ? <p>{this.getText('loading')}</p> :
                                                notifications.length === 0 ? <p>{this.getText('empty')}</p> : notifications.map(item => {
                                                    const name = `${item.patientFirstName || ''} ${item.patientLastName || ''}`.trim() || '-';
                                                    const title = item.type === 'NEW_MESSAGE'
                                                        ? this.getText('messageTitle')
                                                        : item.type === 'NEW_REVIEW'
                                                            ? this.getText('reviewTitle')
                                                            : this.getText('appointmentTitle');
                                                    const detail = item.type === 'NEW_MESSAGE'
                                                        ? item.content || this.getText('messageDescription', { name })
                                                        : item.type === 'NEW_REVIEW'
                                                            ? item.content || this.getText('reviewDescription', { name })
                                                            : this.getText('appointmentDescription', { name });
                                                    const image = item.patientImage ? `data:image/jpeg;base64,${item.patientImage}` : null;
                                                    return <button type="button" key={item.id} className={`notification-menu__item ${item.isRead ? '' : 'unread'}`} onClick={() => this.openNotification(item)}>
                                                        {image ? <img src={image} alt="" /> : <span className="notification-menu__avatar">{name.slice(0, 1).toUpperCase()}</span>}
                                                        <span><strong>{title}</strong><small>{detail}</small><time>{item.createdAt ? moment(item.createdAt).locale(this.props.language === 'vi' ? 'vi' : 'en').fromNow() : ''}</time></span>
                                                    </button>;
                                                })}
                                        </div>
                                    </div>}
                                </div>
                                }

                                <div className="user-profile" onClick={this.toggleDropdown}>
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
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        adminLogout: () => dispatch({ type: "ADMIN_LOGOUT" }),
        doctorLogout: () => dispatch({ type: "DOCTOR_LOGOUT" }),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(injectIntl(Header)));
