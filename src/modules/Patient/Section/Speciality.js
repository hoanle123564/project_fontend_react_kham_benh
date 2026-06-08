import React, { Component } from 'react';
import { withRouter } from "react-router";
import { connect } from 'react-redux'; // kết nối như router
import * as action from "../../../store/actions";
import "./SectionShare.scss";
import { FormattedMessage } from 'react-intl';
// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const getActiveSortedSpecialties = (specialties = []) =>
    [...specialties]
        .filter((item) => Number(item.isActive) === 1)
        .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0) || a.id - b.id);

class Speciality extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ListSpecialty: [],
        }
    }

    handleViewDetailSpecialty = (clinic) => {
        if (clinic?.slug) {
            this.props.history.push(`/detail-specialty/${clinic.slug}`);
        }
    }

    componentDidMount() {
        this.props.getAllSpecialty();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.specialtys !== this.props.specialtys) {
            this.setState({
                ListSpecialty: getActiveSortedSpecialties(this.props.specialtys || [])
            })
        }
    }

    handleListSpecialty = () => {
        if (this.props.history) {
            this.props.history.push(`/list-specialty`);
        }
    };
    render() {
        let { ListSpecialty } = this.state;
        return (
            <>
                <section className='section-share section-specialty'>
                    <div className="container">
                        <div className='section-container'>
                            <div className='section-header'>
                                <span className='title-section'>
                                    <FormattedMessage id="banner.specialty-popular" />
                                </span>
                                <button className='btn-section' onClick={this.handleListSpecialty}>
                                    <FormattedMessage id="banner.see-more" />
                                </button>

                            </div>
                            <div className='section-body'>
                                <Swiper
                                    spaceBetween={20}
                                    slidesPerView={4}
                                    navigation={true}
                                    modules={[Navigation]}
                                    className="specialty-swiper"
                                >
                                    {
                                        ListSpecialty && ListSpecialty.length > 0 &&
                                        ListSpecialty.map((item, index) => {
                                            return (
                                                <SwiperSlide key={index} className='item-specialty' >
                                                    <div className='image-speciality'
                                                        onClick={() => this.handleViewDetailSpecialty(item)}
                                                    >
                                                        <div className="box-img">
                                                            <img src={`data:image/jpeg;base64,${item.image}`} alt='' />
                                                        </div>
                                                        <h4 className='title-img'>{item.name}</h4>
                                                    </div>
                                                </SwiperSlide>
                                            )
                                        })
                                    }
                                </Swiper>
                            </div>
                        </div >
                    </div >
                </section >
            </>

        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.patient.isLoggedIn,
        language: state.app.language,
        specialtys: state.admin.specialty
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getAllSpecialty: () => dispatch(action.GetAllSpecialty()),

    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Speciality));
