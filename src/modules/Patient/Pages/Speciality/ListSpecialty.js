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

    getFilteredSpecialties = () => {
        const query = this.state.search.trim().toLowerCase();
        if (!query) return this.state.specialtyList;

        return this.state.specialtyList.filter((item) =>
            String(item.name || "").toLowerCase().includes(query)
        );
    };

    render() {
        let { search } = this.state;
        let { language } = this.props;
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
                <div className="list-specialty-container">
                    <div className="container">

                        <h1 className="breadcrumb">
                            {language === "vi" ? "Khám chuyên khoa" : "Specialties"}
                        </h1>

                        <FormattedMessage id="manage-specialty.search" defaultMessage="Search specialty by name...">
                            {(placeholder) => (
                                <label className="list-specialty-search">
                                    <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                                    <input
                                        type="search"
                                        value={search}
                                        placeholder={placeholder}
                                        aria-label={placeholder}
                                        onChange={this.handleSearchChange}
                                    />
                                </label>
                            )}
                        </FormattedMessage>

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
