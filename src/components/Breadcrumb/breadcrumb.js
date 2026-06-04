import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import './breadcrumb.scss';

// ============================================================
// Bảng map pathname → label hiển thị (VI / EN)
// Hỗ trợ cả route tĩnh và route động (:id)
// ============================================================
const ROUTE_MAP = {
    // === PATIENT ===
    '/home': { vi: 'Trang chủ', en: 'Home' },
    '/list-doctor': { vi: 'Danh sách bác sĩ', en: 'Doctors' },
    '/list-specialty': { vi: 'Chuyên khoa', en: 'Specialties' },
    '/list-clinic': { vi: 'Cơ sở y tế', en: 'Clinics' },
    '/list-remote': { vi: 'Khám từ xa', en: 'Remote Exam' },
    '/patient-profile': { vi: 'Hồ sơ cá nhân', en: 'My Profile' },
    '/appointments': { vi: 'Lịch hẹn của tôi', en: 'My Appointments' },
    '/verify-booking': { vi: 'Xác nhận lịch hẹn', en: 'Verify Booking' },

    // Dynamic routes — phần ":id" sẽ bị strip
    '/detail-doctor': { vi: 'Thông tin bác sĩ', en: 'Doctor Detail' },
    '/detail-specialty': { vi: 'Chi tiết chuyên khoa', en: 'Specialty Detail' },
    '/detail-clinic': { vi: 'Chi tiết cơ sở y tế', en: 'Clinic Detail' },

    // === ADMIN (/system) ===
    '/system': { vi: 'Dashboard', en: 'Dashboard' },
    '/system/dashboard': { vi: 'Dashboard', en: 'Dashboard' },
    '/system/user-manage': { vi: 'Quản lý người dùng', en: 'Manage Users' },
    '/system/manage-doctor': { vi: 'Quản lý bác sĩ', en: 'Manage Doctors' },
    '/system/manage-specialty': { vi: 'Quản lý chuyên khoa', en: 'Manage Specialties' },
    '/system/add-specialty': { vi: 'Thêm chuyên khoa', en: 'Add Specialty' },
    '/system/manage-clinic': { vi: 'Quản lý cơ sở y tế', en: 'Manage Clinics' },
    '/system/add-clinic': { vi: 'Thêm cơ sở y tế', en: 'Add Clinic' },
    '/system/manage-post': { vi: 'Quản lý bài viết', en: 'Manage Posts' },
    '/system/add-post': { vi: 'Thêm bài viết', en: 'Add Post' },
    '/system/manage-post-category': { vi: 'Quản lý danh mục bài viết', en: 'Manage Post Categories' },
    '/system/manage-schedule': { vi: 'Quản lý lịch làm việc', en: 'Manage Schedule' },

    // Dynamic admin
    '/system/edit-clinic': { vi: 'Chỉnh sửa cơ sở y tế', en: 'Edit Clinic' },
    '/system/edit-specialty': { vi: 'Chỉnh sửa chuyên khoa', en: 'Edit Specialty' },
    '/system/edit-post': { vi: 'Chỉnh sửa bài viết', en: 'Edit Post' },

    // === DOCTOR (/doctor) ===
    '/doctor': { vi: 'Dashboard', en: 'Dashboard' },
    '/doctor/manage-schedule-private': { vi: 'Lịch làm việc của tôi', en: 'My Schedule' },
    '/doctor/manage-patient': { vi: 'Danh sách bệnh nhân', en: 'Patient List' },
    '/doctor/list-appointment': { vi: 'Tất cả lịch hẹn', en: 'All Appointments' },
};

// Root label cho từng nhóm
const ROOT_LABELS = {
    patient: { vi: 'Trang chủ', en: 'Home' },
    admin: { vi: 'Dashboard', en: 'Dashboard' },
    doctor: { vi: 'Dashboard', en: 'Dashboard' },
};

const ROOT_PATHS = {
    patient: '/home',
    admin: '/system/dashboard',
    doctor: '/doctor/manage-schedule-private',
};

// Tìm label từ bảng map, hỗ trợ route động (strip segment cuối nếu có id)
const getLabel = (pathname, lang) => {
    // Thử exact match trước
    if (ROUTE_MAP[pathname]) {
        return ROUTE_MAP[pathname][lang] || ROUTE_MAP[pathname]['vi'];
    }

    // Thử strip phần cuối (dành cho route động /detail-doctor/123 → /detail-doctor)
    const stripped = pathname.replace(/\/[^/]+$/, '');
    if (ROUTE_MAP[stripped]) {
        return ROUTE_MAP[stripped][lang] || ROUTE_MAP[stripped]['vi'];
    }

    // Fallback: capitalize segment cuối
    const last = pathname.split('/').filter(Boolean).pop() || '';
    return last.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

class Breadcrumb extends Component {

    // Xác định variant từ pathname
    getVariant(pathname) {
        if (pathname.startsWith('/system')) return 'admin';
        if (pathname.startsWith('/doctor')) return 'doctor';
        return 'patient';
    }

    // Tạo danh sách các crumb [{label, path, isActive}]
    buildCrumbs(pathname, lang) {
        const variant = this.getVariant(pathname);
        const rootPath = ROOT_PATHS[variant];
        const rootLabel = ROOT_LABELS[variant][lang] || ROOT_LABELS[variant]['vi'];

        // Nếu đang ở trang root → không hiện breadcrumb
        if (pathname === rootPath || pathname === '/home' || pathname === '/'
            || pathname === '/system' || pathname === '/doctor') {
            return null;
        }

        const currentLabel = getLabel(pathname, lang);

        return [
            { label: rootLabel, path: rootPath, isActive: false },
            { label: currentLabel, path: null, isActive: true },
        ];
    }

    render() {
        const { location, language, variant } = this.props;
        const pathname = location.pathname;
        const lang = language === 'en' ? 'en' : 'vi';

        const crumbs = this.buildCrumbs(pathname, lang);

        // Không hiện breadcrumb ở trang chủ / dashboard
        if (!crumbs) return null;

        return (
            <nav className={`breadcrumb-nav breadcrumb-${variant || this.getVariant(pathname)}`} aria-label="breadcrumb">
                <div className="container">
                    <ol className="breadcrumb-list">
                        {crumbs.map((crumb, index) => (
                            <li
                                key={index}
                                className={`breadcrumb-item ${crumb.isActive ? 'active' : ''}`}
                            >
                                {crumb.isActive ? (
                                    <span>{crumb.label}</span>
                                ) : (
                                    <>
                                        <Link to={crumb.path}>{crumb.label}</Link>
                                        {/* <i className="fas fa-chevron-right breadcrumb-sep" /> */}
                                    </>
                                )}
                            </li>
                        ))}
                    </ol>
                </div>
            </nav>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
});

export default withRouter(connect(mapStateToProps)(Breadcrumb));
