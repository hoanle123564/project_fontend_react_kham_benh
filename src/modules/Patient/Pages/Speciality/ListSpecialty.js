// ListSpecialty.jsx
import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import "./ListSpecialty.scss";
import * as action from "../../../../store/actions";
import { withRouter } from "react-router";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Grid, Pagination, Navigation } from 'swiper/modules';
import BackToTop from "../../../../components/BackToTop/BackToTop";
import { filterSpecialties } from "../listPageFilterUtils";
import "../ListPageBanner.scss";
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/pagination';

const getActiveSortedSpecialties = (specialties = []) =>
    [...specialties]
        .filter((item) => Number(item.isActive) === 1)
        .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0) || a.id - b.id);

class ListSpecialty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            specialtyList: [],
            search: "",
        };
        this.swiper = null;
    }

    async componentDidMount() {
        await this.props.getAllSpecialty();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.specialtys !== this.props.specialtys) {
            this.setState({
                specialtyList: getActiveSortedSpecialties(this.props.specialtys || []),
            });
        }
    }

    handleViewDetail = (item) => {
        if (this.props.history && item?.slug) {
            this.props.history.push(`/detail-specialty/${item.slug}`);
        }
    };

    handleSearchChange = (event) => {
        this.setState({ search: event.target.value }, () => {
            if (this.swiper) this.swiper.slideTo(0);
        });
    };

    handleSearchSubmit = (event) => {
        event.preventDefault();
        if (this.swiper) this.swiper.slideTo(0);
    };

    getFilteredSpecialties = () => {
        return filterSpecialties(this.state.specialtyList, this.state.search);
    };

    render() {
        let { search } = this.state;
        const specialtyList = this.getFilteredSpecialties();
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
                            <FormattedMessage id="list-page-banner.specialties-title" />
                        </h1>
                        <div className="list-page-banner__controls">
                            <FormattedMessage id="list-page-banner.search-specialty">
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
                        </div>
                    </div>
                </section>
                <div className="list-specialty-container">
                    <div className="container">

                        {specialtyList.length > 0 ? (
                            <Swiper
                                slidesPerView={4}
                                grid={{
                                    rows: 3,
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
                                {specialtyList.map((item, index) => {
                                    return (
                                        <SwiperSlide
                                            className="grid-item"
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
                                            <div className="title">{item.name}</div>
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
                            <div className="list-specialty-empty">
                                <FormattedMessage
                                    id="manage-specialty.no-specialties"
                                    defaultMessage="No specialties found."
                                />
                            </div>
                        )}

                        {/* <div className="grid-container">
                            {specialtyList &&
                                specialtyList.length > 0 &&
                                specialtyList.map((item, index) => {
                                    return (
                                        <div
                                            className="grid-item"
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
                                            <div className="title">{item.name}</div>
                                        </div>
                                    );
                                })}
                        </div> */}
                    </div>
                </div>

                <HomeFooter />
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        specialtys: state.admin.specialty,
        language: state.app.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getAllSpecialty: () => dispatch(action.GetAllSpecialty()),
    };
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ListSpecialty)
);
