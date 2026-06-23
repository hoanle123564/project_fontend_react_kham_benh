import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { FormattedMessage } from "react-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { jwtDecode } from "jwt-decode";

import "./HomeHeader.scss";
import "swiper/css";
import "swiper/css/autoplay";

import logoSrc from "../../../assets/logo2.png";
import iconChuyenKhoa from "../../../assets/icon-khoa/iconkham-chuyen-khoa.png";
import iconNhaKhoa from "../../../assets/icon-khoa/iconkham-nha-khoa.png";
import iconTuXa from "../../../assets/icon-khoa/iconkham-tu-xa.png";
import vietnam from "../../../assets/flag/vietnam.png";
import united from "../../../assets/flag/united_kingdom.png";
import userDefault from "../../../assets/user_default_1.png";

import { languages } from "../../../utils/constant";
import { changeLangguageApp } from "../../../store/actions/appActions";
import * as action from "../../../store/actions";
import Breadcrumb from "../../../components/Breadcrumb/breadcrumb";
import { buildImageSrc, getPublicPostCategories } from "../../../services/userService";

const getActiveSortedSpecialties = (specialties = []) =>
  [...specialties]
    .filter((item) => Number(item.isActive) === 1)
    .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0) || a.id - b.id);

const getActiveSortedDoctors = (doctors = []) =>
  [...doctors]
    .filter((item) => Number(item.isActive) === 1)
    .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0) || a.id - b.id);

const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

class HomeHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      doctorList: [],
      filteredDoctors: [],
      specialtyList: [],
      postCategoryList: [],
      isDropdown: false,
    };

    this.dropdownRef = React.createRef();
  }

  async componentDidMount() {
    await Promise.all([
      this.props.fetchTopDoctor(),
      this.props.getAllSpecialty(),
      this.loadPublicPostCategories(),
    ]);

    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.ListDoctor !== this.props.ListDoctor) {
      const doctorList = getActiveSortedDoctors(this.props.ListDoctor || []);
      this.setState({
        doctorList,
        filteredDoctors: doctorList,
      });
    }

    if (prevProps.specialtys !== this.props.specialtys) {
      this.setState({
        specialtyList: getActiveSortedSpecialties(this.props.specialtys || []),
      });
    }
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  loadPublicPostCategories = async () => {
    try {
      const response = await getPublicPostCategories();
      const postCategoryList =
        response?.errCode === 0 && Array.isArray(response?.data)
          ? response.data
          : [];

      this.setState({ postCategoryList });
    } catch (error) {
      console.log("loadPublicPostCategories error:", error);
      this.setState({ postCategoryList: [] });
    }
  };

  change = (language) => {
    this.props.changeLangguageAppRedux(language);
  };

  returnHome = () => {
    if (this.props.history) {
      this.props.history.push("/home");
    }
  };

  handleClickOutside = (event) => {
    if (this.dropdownRef.current && !this.dropdownRef.current.contains(event.target)) {
      this.setState({ isDropdown: false });
    }
  };

  handleSearchChange = (event) => {
    const query = event.target.value || "";
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      this.setState({
        searchQuery: query,
        filteredDoctors: this.state.doctorList,
      });
      return;
    }

    const filteredDoctors = (this.state.doctorList || []).filter((doctor) => {
      const fullName = `${doctor.firstName || ""} ${doctor.lastName || ""}`.toLowerCase();
      const reverseName = `${doctor.lastName || ""} ${doctor.firstName || ""}`.toLowerCase();

      return fullName.includes(normalizedQuery) || reverseName.includes(normalizedQuery);
    });

    this.setState({
      searchQuery: query,
      filteredDoctors,
    });
  };

  handleLogout = () => {
    this.props.userLogout();
    this.props.history.push("/home");
  };

  handleSelectDoctor = (doctor) => {
    if (!doctor) return;

    const targetSlug = doctor.slug || doctor.id || doctor.userId || doctor.doctorId || doctor.DoctorId;
    if (this.props.history && targetSlug) {
      this.props.history.push(`/detail-doctor/${targetSlug}`);
    }

    this.setState({
      searchQuery: "",
      filteredDoctors: this.state.doctorList,
    });
  };

  handleViewDetailSpecialty = (item) => {
    if (this.props.history && item?.slug) {
      this.props.history.push(`/detail-specialty/${item.slug}`);
    }
  };

  handleViewPostCategory = (category) => {
    if (this.props.history && category?.slug) {
      this.props.history.push(`/${category.slug}`);
    }
  };

  handleListDoctor = () => {
    if (this.props.history) {
      this.props.history.push("/list-doctor");
    }
  };

  handleListClinic = () => {
    if (this.props.history) {
      this.props.history.push("/list-clinic");
    }
  };

  handleListSpecialty = () => {
    if (this.props.history) {
      this.props.history.push("/list-specialty");
    }
  };

  handleDestist = () => {
    if (this.props.history) {
      const dentistSpecialty = this.state.specialtyList.find((item) => Number(item.id) === 16);
      this.props.history.push(
        dentistSpecialty?.slug ? `/detail-specialty/${dentistSpecialty.slug}` : "/list-specialty"
      );
    }
  };

  handleRemote = () => {
    if (this.props.history) {
      this.props.history.push("/list-remote");
    }
  };

  handleDropdown = () => {
    this.setState((prevState) => ({
      isDropdown: !prevState.isDropdown,
    }));
  };

  preventDefaultAndRun = (event, callback) => {
    if (event) {
      event.preventDefault();
    }

    if (typeof callback === "function") {
      callback();
    }
  };

  render() {
    const { language, userInfo, hideBreadcrumb, showBanner } = this.props;
    const { specialtyList, postCategoryList, filteredDoctors, searchQuery, isDropdown } = this.state;
    const flagSrc = language === languages.VI ? vietnam : united;

    return (
      <>
        <header>
          <div className="container">
            <div className="home-header-content d-flex align-items-center justify-content-center">
              <div className="col-lg-2">
                <div className="left-content">
                  <a
                    href="/home"
                    onClick={(event) => this.preventDefaultAndRun(event, this.returnHome)}
                  >
                    <img src={logoSrc} alt="logo" />
                  </a>
                </div>
              </div>

              <div className="col-lg-6">
                <ul className="list-content gap-5">
                  <li className="child-content">
                    <a href="/home" onClick={(event) => this.preventDefaultAndRun(event, this.returnHome)}>
                      <FormattedMessage id="home-header.all" />
                    </a>
                  </li>

                  <li className="child-content">
                    <a
                      href="/list-specialty"
                      onClick={(event) => this.preventDefaultAndRun(event, this.handleListSpecialty)}
                    >
                      <FormattedMessage id="home-header.specialty" />
                      <i className="fa-solid fa-sort-down"></i>
                    </a>

                    {specialtyList.length > 0 && (
                      <div className="specialty-warp dropdown-panel">
                        <ul className="list-specialty">
                          {specialtyList.map((item) => (
                            <li className="item-specialty" key={item.id}>
                              <a
                                href={`/detail-specialty/${item.slug}`}
                                onClick={(event) =>
                                  this.preventDefaultAndRun(event, () => this.handleViewDetailSpecialty(item))
                                }
                              >
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>

                  <li className="child-content">
                    <a
                      href="/list-clinic"
                      onClick={(event) => this.preventDefaultAndRun(event, this.handleListClinic)}
                    >
                      <FormattedMessage id="home-header.facility" />
                    </a>
                  </li>

                  <li className="child-content">
                    <a
                      href="/list-doctor"
                      onClick={(event) => this.preventDefaultAndRun(event, this.handleListDoctor)}
                    >
                      <FormattedMessage id="home-header.doctor" />
                    </a>
                  </li>

                  <li className="child-content">
                    <a href="/tin-tuc" onClick={(event) => event.preventDefault()}>
                      {language === languages.VI ? "Tin tức" : "News"}
                      <i className="fa-solid fa-sort-down"></i>
                    </a>

                    <div className="news-warp dropdown-panel">
                      {postCategoryList.length > 0 ? (
                        <ul className="list-specialty news-list">
                          {postCategoryList.map((item) => (
                            <li className="item-specialty item-news" key={item.id}>
                              <a
                                href={`/${item.slug}`}
                                onClick={(event) =>
                                  this.preventDefaultAndRun(event, () => this.handleViewPostCategory(item))
                                }
                              >
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="news-empty">
                          {language === languages.VI
                            ? "Chưa có danh mục bài viết"
                            : "No post categories"}
                        </div>
                      )}
                    </div>
                  </li>
                </ul>
              </div>

              <div className="col-lg-4">
                <div className="right-content">
                  <div className="support">
                    <span>
                      <i className="fa-solid fa-circle-question"></i>
                      <FormattedMessage id="home-header.support" />
                    </span>
                  </div>

                  {flagSrc ? (
                    language === languages.VI ? (
                      <div className="language-vi" onClick={() => this.change(languages.EN)}>
                        <img src={flagSrc} alt="vietnam" width="30" />
                        <FormattedMessage id="home-header.language" />
                      </div>
                    ) : (
                      <div className="language-en" onClick={() => this.change(languages.VI)}>
                        <img src={flagSrc} alt="united" width="30" />
                        <FormattedMessage id="home-header.language" />
                      </div>
                    )
                  ) : null}

                  {this.props.isLoggedIn && userInfo ? (
                    <div
                      className="header-user"
                      onClick={this.handleDropdown}
                      ref={this.dropdownRef}
                    >
                      <span>
                        {userInfo.firstName} {userInfo.lastName}
                      </span>
                      <img
                        src={buildImageSrc(userInfo?.image) || userDefault}
                        alt="avatar"
                        className="header-avatar"
                      />
                      {isDropdown ? (
                        <i className="fas fa-chevron-up ChevronDown"></i>
                      ) : (
                        <i className="fas fa-chevron-down ChevronDown"></i>
                      )}

                      <div className={`dropdown-menu ${isDropdown ? "show" : ""}`}>
                        <div
                          className="dropdown-item"
                          onClick={() => this.props.history.push("/patient-profile")}
                        >
                          <i className="fas fa-user fa-sm fa-fw"></i>
                          <span>
                            <FormattedMessage id="menu.patient.profile" />
                          </span>
                        </div>
                        <div
                          className="dropdown-item"
                          onClick={() => this.props.history.push("/appointments")}
                        >
                          <i className="fas fa-clock"></i>
                          <span>
                            <FormattedMessage id="home-header.appointment" />
                          </span>
                        </div>
                        <div className="dropdown-item" onClick={this.handleLogout}>
                          <i className="fas fa-sign-out-alt fa-sm fa-fw"></i>
                          <FormattedMessage id="home-header.logout" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="menu-login"
                      onClick={() => this.props.history.push("/login")}
                    >
                      <i className="fas fa-sign-in-alt"></i>
                      <span>{language === languages.VI ? "Đăng nhập" : "Login"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="campus-warp">
            <Swiper
              modules={[Autoplay]}
              slidesPerView="auto"
              spaceBetween={20}
              loop={true}
              speed={10000}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
              }}
              className="section-campus"
            >
              <SwiperSlide style={{ width: "auto" }}>
                <div className="campus-item">
                  Đặt Giúp Việc Cá Nhân hướng dẫn, hỗ trợ bạn đi khám từ lúc vào viện đến khi kết thúc khám. Gọi ngay 1900 2267!
                </div>
              </SwiperSlide>
              <SwiperSlide style={{ width: "auto" }}>
                <div className="campus-item">
                  Đặt Giúp Việc Cá Nhân hướng dẫn, hỗ trợ bạn đi khám từ lúc vào viện đến khi kết thúc khám. Gọi ngay 1900 2267!
                </div>
              </SwiperSlide>
              <SwiperSlide style={{ width: "auto" }}>
                <div className="campus-item">
                  Đặt Giúp Việc Cá Nhân hướng dẫn, hỗ trợ bạn đi khám từ lúc vào viện đến khi kết thúc khám. Gọi ngay 1900 2267!
                </div>
              </SwiperSlide>
              <SwiperSlide style={{ width: "auto" }}>
                <div className="campus-item">
                  Đặt Giúp Việc Cá Nhân hướng dẫn, hỗ trợ bạn đi khám từ lúc vào viện đến khi kết thúc khám. Gọi ngay 1900 2267!
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </header>

        {showBanner !== true && !hideBreadcrumb && <Breadcrumb variant="patient" />}

        {showBanner === true && (
          <div className="home-header-banner">
            <div className="content-up pt-5">
              <div className="title1">
                <FormattedMessage id="banner.title1" />
              </div>
              <div className="search">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="Tìm bác sĩ ..."
                  value={searchQuery}
                  onChange={this.handleSearchChange}
                />

                {searchQuery && filteredDoctors && (
                  <div className="search-suggestions">
                    <ul>
                      {(filteredDoctors || []).slice(0, 7).map((doctor) => {
                        const doctorName = `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim();
                        const doctorKey =
                          doctor.slug || doctor.id || doctor.userId || doctor.doctorId || doctor.DoctorId;

                        return (
                          <li key={doctorKey || doctorName} onClick={() => this.handleSelectDoctor(doctor)}>
                            <span className="suggest-name">{doctorName || "Bác sĩ"}</span>
                            {doctor.positionData?.valueVi && (
                              <span className="suggest-position"> - {doctor.positionData.valueVi}</span>
                            )}
                          </li>
                        );
                      })}

                      {filteredDoctors.length === 0 && (
                        <li className="no-result">Không tìm thấy kết quả</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="content-down">
              <div className="options">
                <div className="option-child" onClick={this.handleListSpecialty}>
                  <div className="icon-child">
                    <img src={iconChuyenKhoa} alt="icon kham chuyen khoa" />
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child1" />
                  </div>
                </div>

                <div className="option-child" onClick={this.handleDestist}>
                  <div className="icon-child">
                    <img src={iconNhaKhoa} alt="icon kham nha khoa" />
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child2" />
                  </div>
                </div>

                <div className="option-child" onClick={this.handleRemote}>
                  <div className="icon-child">
                    <img src={iconTuXa} alt="icon kham tu xa" />
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child4" />
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
  const tokenValid = isTokenValid(state.patient.token);

  return {
    isLoggedIn: state.patient.isLoggedIn && tokenValid,
    language: state.app.language,
    ListDoctor: state.admin.doctor,
    userInfo: tokenValid ? state.patient.patientInfo : null,
    specialtys: state.admin.specialty,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeLangguageAppRedux: (language) => dispatch(changeLangguageApp(language)),
    fetchTopDoctor: () => dispatch(action.fetchTopDoctor()),
    getAllSpecialty: () => dispatch(action.GetAllSpecialty()),
    userLogout: () => dispatch({ type: "PATIENT_LOGOUT" }),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomeHeader));
