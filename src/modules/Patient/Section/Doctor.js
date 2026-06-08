import React, { Component } from "react";
import { connect } from "react-redux"; // kết nối như router
// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import * as action from "../../../store/actions";
import { languages } from "../../../utils";
import "./Doctor.scss";
import { withRouter } from "react-router";
import { FormattedMessage } from "react-intl";
import bg_doctor from '../../../assets/bg_section_doctor.jpg'

const getActiveSortedDoctors = (doctors = []) =>
  [...doctors]
    .filter((doctor) => Number(doctor.isActive) === 1)
    .sort((a, b) => {
      const orderA = Number(a.displayOrder) || 0;
      const orderB = Number(b.displayOrder) || 0;

      if (orderA !== orderB) return orderA - orderB;
      return Number(a.id) - Number(b.id);
    });

class Doctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      DoctorArr: [],
    };
  }
  componentDidMount = () => {
    this.props.fetchTopDoctor();
  };
  componentDidUpdate = (prevProps) => {
    if (prevProps.ListDoctor !== this.props.ListDoctor) {
      this.setState({
        DoctorArr: getActiveSortedDoctors(this.props.ListDoctor || []),
      });
    }
  };
  handleViewDetailDoctor = (doctor) => {
    const targetSlug = doctor?.slug || doctor?.id;
    if (targetSlug) {
      this.props.history.push(`/detail-doctor/${targetSlug}`);
    }
  }
  hendleListDoctor = () => {
    this.props.history.push(`/list-doctor`);
  }
  render() {
    let DoctorArr = this.state.DoctorArr;
    let language = this.props.language;
    console.log("List doctor: ", DoctorArr);

    return (
      <>
        <div className=" section-doctor">
          <div className="container-fluid">
            <div className="section-container">
              <div className="section-header position-relative">
                <img src={bg_doctor} alt="bg_doctor" className="bg_doctor" />
                <div className="container">
                  <div className="doctor-content">
                    <div className="d-flex justify-content-between align-items-center py-5">
                      <span className="title-section">
                        <FormattedMessage id="banner.doctor-popular" />
                      </span>
                      <button className="btn-section" onClick={this.hendleListDoctor}>
                        <FormattedMessage id="banner.see-more" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="section-body">
                <Swiper
                  spaceBetween={20}
                  slidesPerView={5}
                  // navigation={true}
                  // modules={[Navigation]}
                  className="doctor-swiper"
                >
                  {DoctorArr &&
                    DoctorArr.length > 0 &&
                    DoctorArr.map((item, index) => {
                      let nameVi = `${item.firstName} ${item.lastName}`;
                      let nameEn = `${item.firstName} ${item.lastName}`;
                      return (
                        <SwiperSlide key={index}>
                          <div className="doctor-item" onClick={() => this.handleViewDetailDoctor(item)}>
                            <div className="img-wrapper">
                              <img
                                src={item.image ? `data:image/jpeg;base64,${item.image}` : "/default-doctor.png"}
                                alt="image_doctor"
                                loading="lazy"
                              />
                            </div>
                            <div className="doctor-info">
                              <div className="title-img1">
                                {language === languages.VI ? nameVi : nameEn}
                              </div>
                              <div className="title-img2">
                                {language === languages.VI ? item.positionVi : item.positionEn}
                              </div>
                              <div className="location">
                                <i className="fas fa-map-marker-alt"></i>{item.address}
                              </div>
                            </div>
                          </div>
                        </SwiperSlide>
                      );
                    })}
                </Swiper>
              </div>
            </div>
          </div>
        </div >
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.patient.isLoggedIn,
    language: state.app.language,
    ListDoctor: state.admin.doctor,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchTopDoctor: () => dispatch(action.fetchTopDoctor()),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Doctor));
