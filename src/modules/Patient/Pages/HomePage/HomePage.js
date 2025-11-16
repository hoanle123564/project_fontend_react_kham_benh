import React, { Component } from "react";
import { connect } from "react-redux";
import HomeHeader from "../../Layout/HomeHeader";
import Speciality from "../../Section/Speciality";
import RemoteExam from "../../Section/RemoteExam";
import Doctor from "../../Section/Doctor";
import AboutUs from "../../Section/AboutUs";
import HomeFooter from "../../Layout/HomeFooter";
import Clinic from "../../Section/Clinic";
import "./HomePage.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
class HomePage extends Component {
  render() {
    let settings3 = {
      dots: false,
      infinite: true,
      speed: 500,
      slidesToShow: 3,
      slidesToScroll: 2,
    };
    let settings4 = {
      dots: false,
      infinite: true,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 2,
    };

    return (
      <>
        <HomeHeader showBanner={true} />
        <Speciality settings={settings3} />
        <RemoteExam settings={settings3} />
        <Clinic settings={settings3} />
        <Doctor settings={settings4} />
        <AboutUs />
        <HomeFooter />
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.patient.isLoggedIn,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
