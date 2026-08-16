import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { FormattedMessage } from "react-intl";
import ReactPaginate from "react-paginate";
import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import BackToTop from "../../../../components/BackToTop/BackToTop";
import { languages } from "../../../../utils";
import { getAllDoctor, getAllSpecialty, getLookUp } from "../../../../services/userService";
import { filterDoctors } from "../listPageFilterUtils";
import "../ListPageBanner.scss";
import "./ListDoctor.scss";

const ITEMS_PER_PAGE = 10;
const ALL_SPECIALTIES = "ALL";

const getActiveSortedDoctors = (doctors = []) =>
    [...doctors]
        .filter((doctor) => Number(doctor.isActive) === 1)
        .sort((a, b) => {
            const orderA = Number(a.displayOrder) || 0;
            const orderB = Number(b.displayOrder) || 0;

            if (orderA !== orderB) return orderA - orderB;
            return Number(a.id) - Number(b.id);
        });

const getActiveSortedSpecialties = (specialties = []) =>
    [...specialties]
        .filter((specialty) => Number(specialty.isActive) === 1)
        .sort((a, b) => {
            const orderA = Number(a.displayOrder) || 0;
            const orderB = Number(b.displayOrder) || 0;

            if (orderA !== orderB) return orderA - orderB;
            return Number(a.id) - Number(b.id);
        });

class ListDoctor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            doctorList: [],
            specialtyFilters: [],
            activeSpecialtyId: ALL_SPECIALTIES,
            provinceOptions: [],
            provinceCode: "",
            search: "",
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
            prevState.activeSpecialtyId !== this.state.activeSpecialtyId ||
            prevState.provinceCode !== this.state.provinceCode ||
            prevState.search !== this.state.search
        ) {
            const filteredDoctors = this.getFilteredDoctors();
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
            const [doctorRes, specialtyRes, provinceRes] = await Promise.all([
                getAllDoctor(),
                getAllSpecialty(),
                getLookUp("PROVINCE").catch(() => ({ data: [] })),
            ]);

            const doctorList =
                doctorRes && doctorRes.errCode === 0 && Array.isArray(doctorRes.data)
                    ? getActiveSortedDoctors(doctorRes.data)
                    : [];
            const specialtyList =
                specialtyRes && specialtyRes.errCode === 0 && Array.isArray(specialtyRes.data)
                    ? getActiveSortedSpecialties(specialtyRes.data)
                    : [];

            this.setState({
                doctorList,
                specialtyFilters: this.buildSpecialtyFilters(specialtyList, doctorList),
                provinceOptions: provinceRes?.errCode === 0 ? provinceRes.data || [] : [],
                activeSpecialtyId: ALL_SPECIALTIES,
                provinceCode: "",
                search: "",
                currentPage: 0,
                isLoading: false,
            });
        } catch (error) {
            console.log("loadDoctorAndSpecialtyData error:", error);
            this.setState({
                doctorList: [],
                specialtyFilters: [],
                provinceOptions: [],
                activeSpecialtyId: ALL_SPECIALTIES,
                provinceCode: "",
                search: "",
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

    getFilteredDoctors = () => filterDoctors(this.state.doctorList, {
        search: this.state.search,
        provinceCode: this.state.provinceCode,
        specialtyId: this.state.activeSpecialtyId,
        allSpecialties: ALL_SPECIALTIES,
    });

    handleViewDetailDoctor = (doctor) => {
        const targetSlug = doctor?.slug || doctor?.id;
        if (this.props.history && targetSlug) {
            this.props.history.push(`/detail-doctor/${targetSlug}`);
        }
    };

    handleSelectSpecialty = (specialtyId) => {
        this.setState({
            activeSpecialtyId: specialtyId,
            currentPage: 0,
        });
    };

    handleSearchChange = (event) => {
        this.setState({ search: event.target.value, currentPage: 0 });
    };

    handleProvinceChange = (event) => {
        this.setState({ provinceCode: event.target.value, currentPage: 0 });
    };

    handleSearchSubmit = (event) => {
        event.preventDefault();
        this.setState({ currentPage: 0 });
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
                        onClick={() => this.handleViewDetailDoctor(doctor)}
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
                            onClick={() => this.handleViewDetailDoctor(doctor)}
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
            specialtyFilters,
            activeSpecialtyId,
            provinceOptions,
            provinceCode,
            search,
            currentPage,
            isLoading,
        } = this.state;

        const filteredDoctors = this.getFilteredDoctors();
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
                <section className="list-page-banner">
                    <div className="list-page-banner__content">
                        <p className="list-page-banner__tagline">
                            <FormattedMessage id="list-page-banner.tagline" />
                        </p>
                        <h1 className="list-page-banner__title">
                            <FormattedMessage id="list-page-banner.doctors-title" />
                        </h1>
                        <div className="list-page-banner__controls list-page-banner__controls--with-filter">
                            <FormattedMessage id="list-page-banner.search-doctor">
                                {(placeholder) => (
                                    <form className="list-page-banner__search" onSubmit={this.handleSearchSubmit}>
                                        <input
                                            type="search"
                                            value={search}
                                            placeholder={placeholder}
                                            aria-label={placeholder}
                                            onChange={this.handleSearchChange}
                                        />
                                        <FormattedMessage id="list-page-banner.search-button">
                                            {(label) => (
                                                <button type="submit" className="list-page-banner__submit" aria-label={label}>
                                                    <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                                                </button>
                                            )}
                                        </FormattedMessage>
                                    </form>
                                )}
                            </FormattedMessage>
                            <FormattedMessage id="list-page-banner.choose-province">
                                {(label) => (
                                    <select
                                        className="list-page-banner__select"
                                        value={provinceCode}
                                        aria-label={label}
                                        onChange={this.handleProvinceChange}
                                    >
                                        <option value="">{label}</option>
                                        {provinceOptions.map((province) => (
                                            <option key={province.keyMap} value={province.keyMap}>
                                                {this.props.language === languages.VI ? province.value_vi : province.value_en}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </FormattedMessage>
                        </div>
                    </div>
                </section>
                <div className="list-doctor-container">
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
