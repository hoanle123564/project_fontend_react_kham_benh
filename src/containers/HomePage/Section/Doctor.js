import React, { Component } from 'react';
import { connect } from 'react-redux'; // kết nối như router
// Slider 
import Slider from "react-slick";
import BacSi from '../../../assets/doctor/anh-bs-2.png'



class Doctor extends Component {


    render() {
        return (
            <>
                <div className='section-share section-doctor'>
                    <div className='section-container'>
                        <div className='section-header'>
                            <span className='title-section'>Bác sĩ nổi bật</span>
                            <button className='btn-section'>Xem thêm</button>
                        </div>
                        <div className='section-body'>
                            <Slider {...this.props.settings}>
                                <div className='image-doctor'>
                                    <img src={BacSi} alt=''></img>
                                    <div className='title-img1'>Bác sĩ 1</div>
                                    <div className='title-img2'>Bác sĩ nội trú</div>
                                </div>
                                <div className='image-doctor'>
                                    <img src={BacSi} alt=''></img>
                                    <div className='title-img1'>Bác sĩ 2</div>
                                    <div className='title-img2'>Bác sĩ nội trú</div>
                                </div>
                                <div className='image-doctor'>
                                    <img src={BacSi} alt=''></img>
                                    <div className='title-img1'>Bác sĩ 3</div>
                                    <div className='title-img2'>Bác sĩ nội trú</div>
                                </div>
                                <div className='image-doctor'>
                                    <img src={BacSi} alt=''></img>
                                    <div className='title-img1'>Bác sĩ 4</div>
                                    <div className='title-img2'>Bác sĩ nội trú</div>
                                </div>
                                <div className='image-doctor'>
                                    <img src={BacSi} alt=''></img>
                                    <div className='title-img1'>Bác sĩ 5</div>
                                    <div className='title-img2'>Bác sĩ nội trú</div>
                                </div>
                                <div className='image-doctor'>
                                    <img src={BacSi} alt=''></img>
                                    <div className='title-img1'>Bác sĩ 6</div>
                                    <div className='title-img2'>Bác sĩ nội trú</div>
                                </div>
                            </Slider>
                        </div>
                    </div>
                </div >
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

export default connect(mapStateToProps, mapDispatchToProps)(Doctor);