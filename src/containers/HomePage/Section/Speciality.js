import React, { Component } from 'react';
import { connect } from 'react-redux'; // kết nối như router
import './Speciality.scss'
// Slider 
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ThanKinh from '../../../assets/khoa/than-kinh.png'
import CoXuongKhop from '../../../assets/khoa/co-xuong-khop.png'
import CotSong from '../../../assets/khoa/cot-song.png'
import TaiMuiHong from '../../../assets/khoa/tai-mui-hong.png'
import TieuHoa from '../../../assets/khoa/tieu-hoa.png'
import TimMach from '../../../assets/khoa/tim-mach.png'
class Speciality extends Component {


    render() {
        let settings = {
            dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 3,
            slidesToScroll: 2
        };
        return (
            <>
                <div className='section-specialty'>
                    <div className='specialty-container'>
                        <div className='specialty-header'>
                            <span className='title-section'>Chuyên khoa phổ biến</span>
                            <button className='btn-section'>Xem thêm</button>

                        </div>
                        <div className='specialty-body'>
                            <Slider {...settings}>
                                <div className='image-customize   p-2 sm:p-5 border-[1.5px] '>
                                    <img src={ThanKinh} alt=''></img>
                                    <div className='title-img'>Khoa thần kinh</div>
                                </div>
                                <div className='image-customize'>
                                    <img src={CoXuongKhop} alt=''></img>
                                    <div className='title-img'>Khoa cơ xương khớp</div>
                                </div>
                                <div className='image-customize'>
                                    <img src={CotSong} alt=''></img>
                                    <div className='title-img'>Khoa cột Sống</div>
                                </div>
                                <div className='image-customize'>
                                    <img src={TaiMuiHong} alt=''></img>
                                    <div className='title-img'>Khoa tai mũi họng</div>
                                </div>
                                <div className='image-customize'>
                                    <img src={TieuHoa} alt=''></img>
                                    <div className='title-img'>Khoa tiêu hóa</div>
                                </div>
                                <div className='image-customize'>
                                    <img src={TimMach} alt=''></img>
                                    <div className='title-img'>Khoa tim mạch</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Speciality);