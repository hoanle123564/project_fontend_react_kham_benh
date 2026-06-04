import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import ReactPaginate from "react-paginate";
import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import BackToTop from "../../../../components/BackToTop/BackToTop";
import { languages } from "../../../../utils";
import { getAllDoctor, getAllSpecialty } from "../../../../services/userService";
import "./ListDoctor.scss";

const ITEMS_PER_PAGE = 10;
const ALL_SPECIALTIES = "ALL";

class ListDoctor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            doctorList: [],
            specialtyFilters: [],
            activeSpecialtyId: ALL_SPECIALTIES,
            currentPage: 0,
            isLoading: false,
        };
    }

    async componentDidMount() {
        await this.loadDoctorAndSpecialtyData();
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            prevState.doctorList !== this.state.doctorList ||
            prevState.activeSpecialtyId !== this.state.activeSpecialtyId
        ) {
            const filteredDoctors = this.getFilteredDoctors(
                this.state.doctorList,
                this.state.activeSpecialtyId
            );
            const maxPage = Math.max(
                Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE) - 1,
                0
            );

            if (this.state.currentPage > maxPage) {
                this.setState({ currentPage: maxPage });
            }
        }
    }

    loadDoctorAndSpecialtyData = async () => {
        this.setState({ isLoading: true });

        try {
            const [doctorRes, specialtyRes] = await Promise.all([
                getAllDoctor(),
                getAllSpecialty(),
            ]);

            const doctorList =
                doctorRes && doctorRes.errCode === 0 && Array.isArray(doctorRes.data)
                    ? doctorRes.data
                    : [];
            const specialtyList =
                specialtyRes && specialtyRes.errCode === 0 && Array.isArray(specialtyRes.data)
                    ? specialtyRes.data
                    : [];

            this.setState({
                doctorList,
                specialtyFilters: this.buildSpecialtyFilters(specialtyList, doctorList),
                activeSpecialtyId: ALL_SPECIALTIES,
                currentPage: 0,
                isLoading: false,
            });
        } catch (error) {
            console.log("loadDoctorAndSpecialtyData error:", error);
            this.setState({
                doctorList: [],
                specialtyFilters: [],
                activeSpecialtyId: ALL_SPECIALTIES,
                currentPage: 0,
                isLoading: false,
            });
        }
    };

    buildSpecialtyFilters = (specialtyList, doctorList) => {
        const specialtyFilters = specialtyList.map((specialty) => {
            const doctorCount = doctorList.filter(
                (doctor) => String(doctor.specialtyId || "") === String(specialty.id)
            ).length;

            return {
                id: specialty.id,
                name: specialty.name,
                doctorCount,
            };
        });

        return [
            {
                id: ALL_SPECIALTIES,
                name: "Tất cả chuyên khoa",
                doctorCount: doctorList.length,
            },
            ...specialtyFilters,
        ];
    };

    getFilteredDoctors = (doctorList, activeSpecialtyId) => {
        if (activeSpecialtyId === ALL_SPECIALTIES) {
            return doctorList;
        }

        return doctorList.filter(
            (doctor) => String(doctor.specialtyId || "") === String(activeSpecialtyId)
        );
    };

    handleViewDetailDoctor = (doctorId) => {
        if (this.props.history && doctorId) {
            this.props.history.push(`/detail-doctor/${doctorId}`);
        }
    };

    handleSelectSpecialty = (specialtyId) => {
        this.setState({
            activeSpecialtyId: specialtyId,
            currentPage: 0,
        });
    };

    handlePageClick = (event) => {
        this.setState({
            currentPage: event.selected,
        });
    };

    getDoctorName = (doctor) => {
        const { language } = this.props;
        const position =
            language === languages.VI ? doctor.positionVi : doctor.positionEn;

        return [position, `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim()]
            .filter(Boolean)
            .join(", ");
    };

    renderDoctorCard = (doctor) => {
        const doctorName = this.getDoctorName(doctor);
        const clinicAddress = doctor.clinicAddress || "Chưa cập nhật địa chỉ";
        const specialtyName = doctor.specialtyName || "Chưa cập nhật chuyên khoa";
        const description = doctor.description
            ? `${doctor.description.substring(0, 140)}${doctor.description.length > 140 ? "..." : ""}`
            : "Bác sĩ chưa cập nhật mô tả";

        return (
            <div className="doctor-card" key={doctor.id}>
                <div className="doctor-avatar">
                    <img
                        src={
                            doctor.image
                                ? `data:image/jpeg;base64,${doctor.image}`
                                : "/default-doctor.png"
                        }
                        alt={doctorName || "doctor-avatar"}
                    />
                </div>

                <div className="doctor-info">
                    <button
                        type="button"
                        className="doctor-name"
                        onClick={() => this.handleViewDetailDoctor(doctor.id)}
                    >
                        {doctorName || "Bác sĩ chưa cập nhật tên"}
                    </button>

                    <div className="doctor-specialty">{specialtyName}</div>

                    <div className="doctor-address">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{clinicAddress}</span>
                    </div>

                    <div className="doctor-description">{description}</div>

                    <div className="doctor-actions">
                        <button
                            type="button"
                            className="booking-button"
                            onClick={() => this.handleViewDetailDoctor(doctor.id)}
                        >
                            Đặt lịch khám
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    render() {
        const {
            doctorList,
            specialtyFilters,
            activeSpecialtyId,
            currentPage,
            isLoading,
        } = this.state;

        const filteredDoctors = this.getFilteredDoctors(doctorList, activeSpecialtyId);
        const pageCount = Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE);
        const safeCurrentPage =
            pageCount > 0 ? Math.min(currentPage, pageCount - 1) : 0;
        const pageStart = safeCurrentPage * ITEMS_PER_PAGE;
        const visibleDoctors = filteredDoctors.slice(
            pageStart,
            pageStart + ITEMS_PER_PAGE
        );

        return (
            <>
                <HomeHeader showBanner={false} />
                <BackToTop />
                <div className="list-doctor-container">
                    <div className="list-doctor-header">
                        <h1>
                            {this.props.language === languages.VI
                                ? "Danh sách bác sĩ"
                                : "List of doctors"}
                        </h1>
                    </div>

                    <div className="list-doctor-layout">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-3">
                                    <aside className="doctor-sidebar">
                                        <div className="sidebar-card">
                                            <div className="sidebar-title">Chuyên khoa</div>

                                            <div className="specialty-list">
                                                {specialtyFilters.map((specialty) => {
                                                    const isActive =
                                                        String(activeSpecialtyId) === String(specialty.id);

                                                    return (
                                                        <button
                                                            type="button"
                                                            key={specialty.id}
                                                            className={`specialty-item ${isActive ? "active" : ""}`}
                                                            onClick={() =>
                                                                this.handleSelectSpecialty(specialty.id)
                                                            }
                                                        >
                                                            <span className="specialty-name">
                                                                {specialty.name}
                                                            </span>
                                                            <span className="specialty-count">
                                                                {specialty.doctorCount} bác sĩ
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </aside>
                                </div>
                                <div className="col-lg-9">
                                    <div className="doctor-content">
                                        {isLoading ? (
                                            <div className="doctor-empty-state">Đang tải danh sách bác sĩ...</div>
                                        ) : visibleDoctors.length > 0 ? (
                                            <>
                                                <div className="list-doctor-body">
                                                    {visibleDoctors.map(this.renderDoctorCard)}
                                                </div>

                                                {pageCount > 1 && (
                                                    <ReactPaginate
                                                        breakLabel="..."
                                                        nextLabel=">"
                                                        onPageChange={this.handlePageClick}
                                                        pageRangeDisplayed={3}
                                                        marginPagesDisplayed={1}
                                                        pageCount={pageCount}
                                                        previousLabel="<"
                                                        forcePage={safeCurrentPage}
                                                        containerClassName="doctor-pagination"
                                                        pageClassName="pagination-page"
                                                        pageLinkClassName="pagination-link"
                                                        previousClassName="pagination-page pagination-prev"
                                                        nextClassName="pagination-page pagination-next"
                                                        previousLinkClassName="pagination-link"
                                                        nextLinkClassName="pagination-link"
                                                        breakClassName="pagination-break"
                                                        breakLinkClassName="pagination-link"
                                                        activeClassName="active"
                                                        disabledClassName="disabled"
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            <div className="doctor-empty-state">
                                                Không tìm thấy bác sĩ thuộc chuyên khoa này.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                <HomeFooter />
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        language: state.app.language,
    };
};

export default withRouter(connect(mapStateToProps)(ListDoctor));
