import React, { Component } from 'react';
import { connect } from 'react-redux'; // kết nối như router
// Swiper 
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import "./SectionShare.scss";

import * as action from "../../../store/actions";

import { withRouter } from "react-router";
import { FormattedMessage } from 'react-intl';

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

class Clinic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ListSpecialty: [],
        }
    }
    handleViewDetailClinic = (clinic) => {
        const targetSlug = clinic.slug || clinic.id;
        this.props.history.push(`/detail-clinic/${targetSlug}`);
    }

    returnChoRay = () => {
        if (this.props.history) {
            this.props.history.push(`/ChoRay`);
        }
    };
    componentDidMount() {
        this.props.getAllClinic();
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.clinics !== this.props.clinics) {
            this.setState({
                ListSpecialty: getActiveSortedClinics(this.props.clinics)
            })
        }
    }
    handleListClinic = () => {
        if (this.props.history) {
            this.props.history.push(`/list-clinic`);
        }
    };

    render() {
        let { ListSpecialty } = this.state;
        return (
            <>
                <div className='section-share section-clinic'>
                    <div className="container">
                        <div className='section-container'>
                            <div className='section-header'>
                                <span className='title-section'>
                                    <FormattedMessage id="banner.clinic-popular" />
                                </span>
                                <button className='btn-section' onClick={this.handleListClinic}>
                                    <FormattedMessage id="banner.see-more" />
                                </button>

                            </div>
                            <div className='section-body'>
                                <Swiper
                                    spaceBetween={20}
                                    slidesPerView={4}
                                    navigation={true}
                                    modules={[Navigation]}
                                    className="clinic-swiper"
                                >
                                    {
                                        ListSpecialty && ListSpecialty.length > 0 &&
                                        ListSpecialty.map((item, index) => {
                                            return (
                                                <SwiperSlide key={index} className='item-specialty'>
                                                    <div className='image-speciality'
                                                        onClick={() => this.handleViewDetailClinic(item)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <div className="box-img">
                                                            <img src={`data:image/jpeg;base64,${item.image}`} alt='' />
                                                        </div>
                                                        <h4 className='title-img'>
                                                            {item.name}
                                                        </h4>
                                                    </div>
                                                </SwiperSlide>
                                            )
                                        })
                                    }
                                </Swiper>
                            </div>
                        </div>
                    </div>
                </div>
            </>

        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.patient.isLoggedIn,
        language: state.app.language,
        clinics: state.admin.AllClinic
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getAllClinic: () => dispatch(action.GetAllClinic()),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Clinic));
