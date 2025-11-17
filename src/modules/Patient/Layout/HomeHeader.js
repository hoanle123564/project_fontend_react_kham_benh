// ...existing code...
import React, { Component } from "react";
import { connect } from "react-redux"; // kết nối như router
import "./HomeHeader.scss";
// thêm các ảnh thừ assets
import logoSrc from "../../../assets/logo2.png";
import iconChuyenKhoa from "../../../assets/icon-khoa/iconkham-chuyen-khoa.png";
import iconNhaKhoa from "../../../assets/icon-khoa/iconkham-nha-khoa.png";
import iconCTongquat from "../../../assets/icon-khoa/iconkham-tong-quan.png";
import iconTuXa from "../../../assets/icon-khoa/iconkham-tu-xa.png";
import iconSuckhoeTinhthan from "../../../assets/icon-khoa/iconsuc-khoe-tinh-than.png";
import iconXetNghiep from "../../../assets/icon-khoa/iconxet-nghiem-y-hoc.png";
import vietnam from "../../../assets/flag/vietnam.png";
import united from "../../../assets/flag/united_kingdom.png";
import { FormattedMessage } from "react-intl"; // chuyển đổi ngôn ngữ
import { languages } from "../../../utils/constant";
import { changeLangguageApp } from "../../../store/actions/appActions";
import { withRouter } from "react-router";
import * as action from "../../../store/actions";

import user_default from "../../../assets/user_default_1.png";

class HomeHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      changeLanguage: true,
      searchQuery: "",      // giá trị input
      doctorList: [],       // danh sách bác sĩ
      filteredDoctors: [],  // danh sách gợi ý
    };
  }
  change = (language) => {
    this.props.changeLangguageAppRedux(language);
    // this.setState({
    //     changeLanguage: !this.state.changeLanguage
    // })
  };

  returnHome = () => {
    if (this.props.history) {
      this.props.history.push(`/home`);
    }
  };

  componentDidMount() {
    this.props.fetchTopDoctor();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.ListDoctor !== this.props.ListDoctor) {
      this.setState({
        doctorList: this.props.ListDoctor,
        filteredDoctors: this.props.ListDoctor,
      });
    }
  }

  // --- thêm các hàm xử lý tìm kiếm ---
  handleSearchChange = (e) => {
    const query = e.target.value || "";
    const q = query.trim().toLowerCase();

    if (!q) {
      // nếu rỗng thì hiện tất cả hoặc không hiển thị gợi ý
      this.setState({
        searchQuery: query,
        filteredDoctors: this.state.doctorList,
      });
      return;
    }

    const filtered = (this.state.doctorList || []).filter((d) => {
      const fname = `${d.firstName || ""} ${d.lastName || ""}`.toLowerCase();
      const lname = `${d.lastName || ""} ${d.firstName || ""}`.toLowerCase();
      const full = `${fname}`.toLowerCase();
      return (
        fname.includes(q) ||
        lname.includes(q) ||
        full.includes(q)
      );
    });

    this.setState({
      searchQuery: query,
      filteredDoctors: filtered,
    });
  };

  handleSelectDoctor = (doctor) => {
    if (!doctor) return;
    const id = doctor.id || doctor.userId || doctor.doctorId || doctor.DoctorId;
    if (this.props.history && id) {
      this.props.history.push(`/detail-doctor/${id}`);
    }
    // đóng gợi ý sau khi chọn
    this.setState({
      searchQuery: "",
      filteredDoctors: this.state.doctorList,
    });
  };

  render() {
    // let language = this.state.changeLanguage;

    // Lấy đường dẫn ảnh từ file message
    const { language, userInfo } = this.props;
    console.log('userInfo from header: ', userInfo);

    // chọn cờ dựa trên language1
    const flagSrc = language === languages.VI ? vietnam : united;

    return (
      <>
        <div className="home-header-container">
          <div className="home-header-content">
            <div className="left-content">
              <i className="fa-solid fa-bars"></i>
              <img src={logoSrc} alt="logo" onClick={() => this.returnHome()} />
              {/* <div className='header-logo'></div> */}
            </div>

            <div className="center-content">
              <div className="child-content">
                <div onClick={() => this.returnHome()}>
                  <b>
                    <FormattedMessage id="home-header.specility" />{" "}
                  </b>
                </div>
              </div>
              <div className="child-content">
                <div>
                  <b>
                    <FormattedMessage id="home-header.place_home" />{" "}
                  </b>
                </div>
              </div>
              <div className="child-content">
                <div>
                  <b>
                    <FormattedMessage id="home-header.place_hospital" />
                  </b>
                </div>
              </div>
              <div className="child-content">
                <div>
                  <b>
                    <FormattedMessage id="home-header.message" />
                  </b>
                </div>
              </div>
            </div>

            {/* content right */}
            <div className="right-content">
              <div className="support">
                <span>
                  <i className="fa-solid fa-circle-question"></i>
                  <FormattedMessage id="home-header.support" />
                </span>
              </div>
              {flagSrc ? (
                language === languages.VI ? (
                  <div
                    className="language-vi"
                    onClick={() => this.change(languages.EN)}
                  >
                    <img src={flagSrc} alt="vietnam" width="30" />{" "}
                    <FormattedMessage id="home-header.language" />
                  </div>
                ) : (
                  <div
                    className="language-en"
                    onClick={() => this.change(languages.VI)}
                  >
                    <img src={flagSrc} alt="united" width="30" />{" "}
                    <FormattedMessage id="home-header.language" />
                  </div>
                )
              ) : null}

              {/* NÚT LỊCH HẸN — chỉ hiện khi đã đăng nhập */}
              {this.props.isLoggedIn && (
                <div
                  className="menu-appointment"
                  onClick={() => this.props.history.push("/appointments")}
                >
                  <i className="fas fa-clock"></i>
                  <span>Lịch hẹn</span>
                </div>
              )}

              {/* NÚT LOGIN — chỉ hiện khi chưa đăng nhập */}
              {!this.props.isLoggedIn && (
                <div
                  className="menu-login"
                  onClick={() => this.props.history.push("/login")}
                >
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Đăng nhập</span>
                </div>
              )}

              {/* USER AVATAR — chỉ hiện khi đã đăng nhập */}
              {this.props.isLoggedIn && userInfo && (
                <div
                  className="header-user"
                  onClick={() => this.props.history.push("/patient-profile")}
                >
                  <img
                    src={userInfo?.image
                      ? `data:image/jpeg;base64,${userInfo.image}` : user_default}
                    alt="avatar"
                    className="header-avatar"
                  />
                  <span>{userInfo.lastName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* content down */}
        {this.props.showBanner === true && (
          <div className="home-header-banner ">
            <div className="content-up pt-5">
              <div className="title1">
                <FormattedMessage id="banner.title1" />
              </div>
              <div className="search ">
                <i className="fa-solid fa-magnifying-glass"></i>
                {/* liên kết input với state và xử lý onChange */}
                <input
                  type="text"
                  placeholder="Tìm bác sĩ ..."
                  value={this.state.searchQuery}
                  onChange={this.handleSearchChange}
                />

                {/* gợi ý kết quả */}
                {this.state.searchQuery && this.state.filteredDoctors && (
                  <div className="search-suggestions">
                    <ul>
                      {(this.state.filteredDoctors || [])
                        .slice(0, 7)
                        .map((doc) => {
                          const name = `${doc.firstName || ""} ${doc.lastName || ""
                            }`.trim();
                          const id =
                            doc.id || doc.userId || doc.doctorId || doc.DoctorId;
                          return (
                            <li
                              key={id || name}
                              onClick={() => this.handleSelectDoctor(doc)}
                            >
                              <span className="suggest-name">{name || "Bác sĩ"}</span>
                              {doc.positionData && doc.positionData.valueVi && (
                                <span className="suggest-position"> - {doc.positionData.valueVi}</span>
                              )}
                            </li>
                          );
                        })}
                      {this.state.filteredDoctors.length === 0 && (
                        <li className="no-result">Không tìm thấy kết quả</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="content-down">
              <div className="options">
                {/* Chuyên khoa */}
                <div className="option-child">
                  <div className="icon-child">
                    <img src={iconChuyenKhoa} alt="icon khám chuyên khoa" />
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child1" />
                  </div>
                </div>
                {/* Chuyên khoa */}
                <div className="option-child">
                  <div className="icon-child">
                    <img src={iconNhaKhoa} alt="icon khám nha khoa" />
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child2" />
                  </div>
                </div>
                {/* Chuyên khoa */}
                <div className="option-child">
                  <div className="icon-child">
                    <img src={iconCTongquat} alt="icon khám tổng quát" />
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child3" />
                  </div>
                </div>
                {/* Chuyên khoa */}
                <div className="option-child">
                  <div className="icon-child">
                    <img src={iconTuXa} alt="icon khám từ xa" />
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child4" />
                  </div>
                </div>
                {/* Chuyên khoa */}
                <div className="option-child">
                  <div className="icon-child">
                    <img
                      src={iconSuckhoeTinhthan}
                      alt="icon sức khỏe tinh thần"
                    />
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child5" />
                  </div>
                </div>
                {/* Chuyên khoa */}
                <div className="option-child">
                  <div className="icon-child">
                    <img src={iconXetNghiep} alt="icon xét ngiệm" />
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.patient.isLoggedIn,
    language: state.app.language,
    ListDoctor: state.admin.doctor,
    userInfo: state.patient.patientInfo
    // isLoggedIn: state.user.isLoggedIn,
    // userInfo: state.user.userInfo, // <-- thêm dòng này nếu cần hiển thị thông tin user

  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeLangguageAppRedux: (languages) =>
      dispatch(changeLangguageApp(languages)),
    fetchTopDoctor: () => dispatch(action.fetchTopDoctor()),

  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(HomeHeader)
);
