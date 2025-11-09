import React, { Component } from 'react';
import { connect } from 'react-redux'; // kết nối như router
// Slider 
import Slider from "react-slick";
import "./Clinic.scss";

import doctoc_check from '../../../assets/hospital/doctor-check.jpg'
import ChoRay from '../../../assets/hospital/logo-bvcr-moi.jpg'
import hung_viet from '../../../assets/hospital/logo-hung-viet.jpg'
import Med_Hanoi from '../../../assets/hospital/logo-med-tai-ha-noi.jpg'
import VietDuc from '../../../assets/hospital/logo-viet-duc.jpg'
import YDuoc from '../../../assets/hospital/logo-y-duoc.jpg'

import { withRouter } from "react-router";

class Clinic extends Component {

    returnChoRay = () => {
        if (this.props.history) {
            this.props.history.push(`/ChoRay`);
        }
    };
    render() {
        return (
            <>
                <div className='section-share section-clinic'>
                    <div className='section-container'>
                        <div className='section-header'>
                            <span className='title-section'>Cơ sở ý tế</span>
                            <button className='btn-section'>Xem thêm</button>

                        </div>
                        <div className='section-body'>
                            <Slider {...this.props.settings}>
                                <div className='image-customize'>
                                    <img src={doctoc_check} alt='' />
                                    <div className='title-img'>Doctor Check - Tầm kiểm soát bệnh để sống thọ hơn</div>
                                </div>
                                <div className='image-customize' onClick={this.returnChoRay}>
                                    <img src={ChoRay} alt=''></img>
                                    <div className='title-img' >Bệnh viện chợ rẫy</div>
                                </div>
                                <div className='image-customize'>
                                    <img src={hung_viet} alt=''></img>
                                    <div className='title-img'>Bệnh viện Ung Bứu Hưng việt</div>
                                </div>
                                <div className='image-customize'>
                                    <img src={Med_Hanoi} alt=''></img>
                                    <div className='title-img'>Hệ thống y tế MEDLATEC</div>
                                </div>
                                <div className='image-customize'>
                                    <img src={VietDuc} alt=''></img>
                                    <div className='title-img'>Bệnh viện Hữu nghị Việt Đức</div>
                                </div>
                                <div className='image-customize'>
                                    <img src={YDuoc} alt=''></img>
                                    <div className='title-img'>Phòng khám Bệnh viện Đại học Y Dược 1</div>
                                </div>
                            </Slider>
                        </div>
                    </div>
                </div>
            </>

        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        language: state.app.language
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Clinic));