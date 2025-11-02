import React, { Component } from "react";
import { connect } from "react-redux"; // kết nối như router
// Slider
import Slider from "react-slick";
import * as action from "../../../store/actions";
import { languages } from "../../../utils";
import "./Doctor.scss";
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
        DoctorArr: this.props.ListDoctor,
      });
    }
  };
  render() {
    let DoctorArr = this.state.DoctorArr;
    let language = this.props.language;
    console.log("DoctorArr", DoctorArr);

    return (
      <>
        <div className=" section-doctor">
          <div className="section-container">
            <div className="section-header">
              <span className="title-section">Bác sĩ nổi bật</span>
              <button className="btn-section">Xem thêm</button>
            </div>
            <div className="section-body">
              <Slider {...this.props.settings}>
                {DoctorArr &&
                  DoctorArr.length > 0 &&
                  DoctorArr.map((item, index) => {
                    let nameVi = `${item.positionVi},${item.firstName} ${item.lastName}`;
                    let nameEn = `${item.positionEn},${item.firstName} ${item.lastName}`;
                    return (
                      <div className="image-doctor">
                        <img
                          src={`data:image/jpeg;base64,${item.image}`}
                          alt=""
                        ></img>
                        <div className="title-img1">
                          {language === languages.VI ? nameVi : nameEn}
                        </div>
                        <div className="title-img2">Bác sĩ nội trú</div>
                      </div>
                    );
                  })}
              </Slider>
            </div>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
    ListDoctor: state.admin.doctor,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchTopDoctor: () => dispatch(action.fetchTopDoctor()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Doctor);
