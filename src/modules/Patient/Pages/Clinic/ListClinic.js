// ListClinic.jsx
import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import "./ListClinic.scss";
import * as action from "../../../../store/actions";
import { withRouter } from "react-router";
import BackToTop from "../../../../components/BackToTop/BackToTop";
import { languages } from "../../../../utils";
import { getLookUp } from "../../../../services/userService";
import { filterClinics } from "../listPageFilterUtils";
import "../ListPageBanner.scss";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Grid, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/pagination';

const getActiveSortedClinics = (clinics = []) => {
    return [...clinics]
        .filter((clinic) => Number(clinic.isActive) === 1)
        .sort((a, b) => {
            const orderA = Number(a.displayOrder) || 0;
            const orderB = Number(b.displayOrder) || 0;

            if (orderA !== orderB) return orderA - orderB;
            return Number(a.id) - Number(b.id);
        });
};

class ListClinic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clinicList: [],
            search: "",
            provinceOptions: [],
            provinceCode: "",
        };
        this.swiper = null;
    }

    async componentDidMount() {
        const [provinceRes] = await Promise.all([
            getLookUp("PROVINCE").catch(() => ({ data: [] })),
            this.props.getAllClinic(),
        ]);
        this.setState({ provinceOptions: provinceRes?.errCode === 0 ? provinceRes.data || [] : [] });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.clinics !== this.props.clinics) {
            this.setState({
                clinicList: getActiveSortedClinics(this.props.clinics),
            });
        }
    }

    handleViewDetail = (clinic) => {
        if (this.props.history) {
            const targetSlug = clinic.slug || clinic.id;
            this.props.history.push(`/detail-clinic/${targetSlug}`);
        }
    };

    handleSearchChange = (event) => {
        this.setState({ search: event.target.value }, () => {
            if (this.swiper) this.swiper.slideTo(0);
        });
    };

    handleProvinceChange = (event) => {
        this.setState({ provinceCode: event.target.value }, () => {
            if (this.swiper) this.swiper.slideTo(0);
        });
    };

    handleSearchSubmit = (event) => {
        event.preventDefault();
        if (this.swiper) this.swiper.slideTo(0);
    };

    getFilteredClinics = () => {
        return filterClinics(this.state.clinicList, this.state);
    };

    render() {
        let { search, provinceOptions, provinceCode } = this.state;
        let { language } = this.props;
        const clinicList = this.getFilteredClinics();
        const pagination = {
            el: '.custom-pagination',
            clickable: true,
            renderBullet: function (index, className) {
                return '<span class="' + className + '">' + (index + 1) + '</span>';
            },
        };
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
                            <FormattedMessage id="list-page-banner.clinics-title" />
                        </h1>
                        <div className="list-page-banner__controls list-page-banner__controls--with-filter">
                            <FormattedMessage id="list-page-banner.search-clinic">
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
                                                {language === languages.VI ? province.value_vi : province.value_en}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </FormattedMessage>
                        </div>
                    </div>
                </section>
                <div className="list-clinic-container">
                    <div className="container">

                        {clinicList.length > 0 ? (
                            <Swiper
                                slidesPerView={4}
                                slidesPerGroup={4}
                                grid={{
                                    rows: 2,
                                    fill: 'row'
                                }}
                                navigation={{
                                    prevEl: '.custom-prev',
                                    nextEl: '.custom-next',
                                }}
                                spaceBetween={20}
                                pagination={pagination}
                                modules={[Grid, Pagination, Navigation]}
                                className="grid-container"
                                onSwiper={(swiper) => { this.swiper = swiper; }}
                            >
                                {clinicList.map((item, index) => {
                                    return (
                                        <SwiperSlide
                                            className="swiper-item"
                                            key={index}
                                            onClick={() => this.handleViewDetail(item)}
                                        >
                                            <div className="image-box">
                                                <img
                                                    src={
                                                        item.image
                                                            ? `data:image/jpeg;base64,${item.image}`
                                                            : "/default-image.png"
                                                    }
                                                    alt={item.name}
                                                />
                                            </div>
                                            <h4 className="title">{item.name}</h4>
                                        </SwiperSlide>
                                    );
                                })}

                                <div className="custom-control-bar">
                                    <button className="custom-prev">&#10094;</button>
                                    <div className="custom-pagination"></div>
                                    <button className="custom-next">&#10095;</button>
                                </div>
                            </Swiper>
                        ) : (
                            <div className="list-clinic-empty">
                                <FormattedMessage
                                    id="clinic-manage.no-clinics"
                                    defaultMessage="No clinics found."
                                />
                            </div>
                        )}
                    </div>
                </div>

                <HomeFooter />
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        clinics: state.admin.AllClinic,
        language: state.app.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getAllClinic: () => dispatch(action.GetAllClinic()),
    };
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ListClinic)
);
