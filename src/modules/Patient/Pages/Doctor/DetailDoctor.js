import React, { Component } from "react";
import { connect } from "react-redux";
import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import "./DetailDoctor.scss";
import * as action from "../../../../store/actions";
import { languages } from "../../../../utils";
import DoctorSchdule from "./DoctorSchdule";
import DoctorExtendInfo from "./DoctorExtendInfo";
import BackToTop from "../../../../components/BackToTop/BackToTop";
import { getRelatedDoctorsService } from "../../../../services/userService";
import { withRouter } from "react-router";

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

class DetailDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      relatedDoctors: [],
    };
  }

  fetchRelatedDoctors = async (doctorId) => {
    let res = await getRelatedDoctorsService(doctorId);
    if (res && res.errCode === 0) {
      this.setState({
        relatedDoctors: res.data ? res.data : []
      });
    }
  }

  componentDidMount() {
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id
    ) {
      let id = this.props.match.params.id;
      this.props.GetDetailDoctor(id);
      this.fetchRelatedDoctors(id);
      // data:image/jpeg;base64,${item.image}`
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match && prevProps.match.params && this.props.match && this.props.match.params) {
      let prevId = prevProps.match.params.id;
      let currentId = this.props.match.params.id;
      if (prevId !== currentId) {
        this.props.GetDetailDoctor(currentId);
        this.fetchRelatedDoctors(currentId);
        window.scrollTo(0, 0);
      }
    }
  }

  handleViewDetailDoctor = (doctor) => {
    this.props.history.push(`/detail-doctor/${doctor.id}`);
  }

  render() {
    // const { id } = this.props.match.params;
    // TODO: fetch doctor detail by id
    let item = this.props.DetailDoctor;
    let language = this.props.language;

    return (
      <>
        <HomeHeader showBanner={false} />
        <BackToTop />
        <div className="doctor-detail-container">
          <div className="container">
            {/* Thông tin giới thiệu */}
            <div className="intro-doctor">
              <div className="content-left-doctor">
                <img
                  src={
                    item?.image && item.image !== "undefined"
                      ? `data:image/jpeg;base64,${item.image}`
                      : "/default-doctor.png"
                  }
                  alt="avatar"
                />            </div>
              <div className="content-right-doctor">
                <div className="content-up">
                  {language === languages.VI
                    ? `${item.positionVi},${item.firstName} ${item.lastName}`
                    : `${item.positionEn},${item.firstName} ${item.lastName}`}
                </div>
                <div className="content-down">{item && item.description}</div>
              </div>
            </div>

            {/* Lịch khám bệnh  */}
            <div className="schedule-doctor">
              <div className="content-left-schedule">
                <DoctorSchdule doctorId={item.id} doctorProfile={item} />
              </div>
              <div className="content-right-schedule">
                <DoctorExtendInfo doctorId={item.id} />
              </div>
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="detail-info-doctor">
            <div className="container">

              {item && item.contentHTML && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: item.contentHTML,
                  }}
                ></div>
              )}
            </div>

            {/* Đánh giá */}
            <div className="comment-doctor"></div>

            {/* Câu hỏi thường gặp */}
            <div className="faq-section">
              <div className="content-ques">
                <span>Bạn cần tìm hiểu thêm?</span>
                <a
                  href="https://bookingcare.vn/hoi-dap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="faq-link"
                >
                  Xem câu hỏi thường gặp
                </a>
              </div>
            </div>

            {/* Bác sĩ cùng khoa */}
            {this.state.relatedDoctors && this.state.relatedDoctors.length > 0 && (
              <div className="related-doctor-section">
                <div className="container">
                  <h2 className="title-section-related">Các bác sĩ cùng khoa</h2>
                  <div className="related-doctor-body">
                    <Swiper
                      spaceBetween={20}
                      slidesPerView={4}
                      autoplay={{ delay: 3000, disableOnInteraction: false }}
                      modules={[Autoplay]}
                      className="related-doctor-swiper"
                    >
                      {this.state.relatedDoctors.map((item, index) => {
                        let nameVi = `${item.firstName} ${item.lastName}`;
                        let nameEn = `${item.firstName} ${item.lastName}`;
                        return (
                          <SwiperSlide key={index}>
                            <div className="doctor-item" onClick={() => this.handleViewDetailDoctor(item)}>
                              <div className="img-wrapper">
                                <img
                                  src={
                                    item.image ? `data:image/jpeg;base64,${item.image}` : "/default-doctor.png"
                                  }
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
    language: state.app.language,
    systemMenuPath: state.app.systemMenuPath,
    isLoggedIn: state.patient.isLoggedIn,
    DetailDoctor: state.admin.DetailDoctor,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    GetDetailDoctor: (id) => dispatch(action.GetDetailDoctor(id)),
  };
};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DetailDoctor));
