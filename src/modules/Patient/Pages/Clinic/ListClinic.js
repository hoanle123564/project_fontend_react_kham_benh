// ListClinic.jsx
import React, { Component } from "react";
import { connect } from "react-redux";
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
class ListClinic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clinicList: [],
        };
    }

    async componentDidMount() {
        await this.props.getAllClinic();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.clinics !== this.props.clinics) {
            this.setState({
                clinicList: this.props.clinics,
            });
        }
    }

    handleViewDetail = (clinic) => {
        if (this.props.history) {
            this.props.history.push(`/detail-clinic/${clinic.id}`);
        }
    };

    render() {
        let { clinicList } = this.state;
        let { language } = this.props;
        return (
            <>
                <HomeHeader showBanner={false} />
                <BackToTop />
                <div className="list-clinic-container">
                    <div className="container">

                        <h1 className="breadcrumb">
                            {language === "vi" ? "Cơ sở y tế" : "Clinics"}
                        </h1>

                        <Swiper
                            slidesPerView={4}
                            grid={{
                                rows: 2,
                                fill: 'row'
                            }}
                            navigation={{
                                prevEl: '.custom-prev',
                                nextEl: '.custom-next',
                            }}
                            spaceBetween={20}
                            pagination={Pagination}
                            modules={[Grid, Pagination, Navigation]}
                            className="grid-container"
                        >
                            {clinicList &&
                                clinicList.length > 0 &&
                                clinicList.map((item, index) => {
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
