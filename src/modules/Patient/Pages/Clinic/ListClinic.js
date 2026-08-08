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
        };
        this.swiper = null;
    }

    async componentDidMount() {
        await this.props.getAllClinic();
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

    getFilteredClinics = () => {
        const query = this.state.search.trim().toLowerCase();
        if (!query) return this.state.clinicList;

        return this.state.clinicList.filter((clinic) =>
            String(clinic.name || "").toLowerCase().includes(query)
        );
    };

    render() {
        let { search } = this.state;
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
                <div className="list-clinic-container">
                    <div className="container">

                        <h1 className="breadcrumb">
                            {language === "vi" ? "Cơ sở y tế" : "Clinics"}
                        </h1>

                        <FormattedMessage id="clinic-manage.search" defaultMessage="Search clinic by name...">
                            {(placeholder) => (
                                <label className="list-clinic-search">
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
