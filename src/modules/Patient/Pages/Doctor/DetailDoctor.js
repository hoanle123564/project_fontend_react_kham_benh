import React, { Component } from "react";
import { connect } from "react-redux";
import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import "./DetailDoctor.scss";
import * as action from "../../../../store/actions";
import { languages } from "../../../../utils";
import DoctorSchdule from "./DoctorSchdule";
import DoctorExtendInfo from "./DoctorExtendInfo";
class DetailDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id
    ) {
      let id = this.props.match.params.id;
      this.props.GetDetailDoctor(id);
      // data:image/jpeg;base64,${item.image}`
    }
  }

  render() {
    // const { id } = this.props.match.params;
    // TODO: fetch doctor detail by id
    let item = this.props.DetailDoctor;
    let language = this.props.language;

    return (
      <>
        <HomeHeader showBanner={false} />
        <div className="doctor-detail-container">
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

          {/* Thông tin chi tiết */}
          <div className="detail-info-doctor">
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
    isLoggedIn: state.user.isLoggedIn,
    DetailDoctor: state.admin.DetailDoctor,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    GetDetailDoctor: (id) => dispatch(action.GetDetailDoctor(id)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(DetailDoctor);
