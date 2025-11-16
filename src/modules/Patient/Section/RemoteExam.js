import React, { Component } from 'react';
import { connect } from 'react-redux'; // kết nối như router
// Slider 
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import DaLieu from '../../../assets/remote/da-lieu-tu--xa.png'
import CoXuongKhop from '../../../assets/remote/cxk-tu--xa.png'
import TamLy from '../../../assets/remote/tam-ly-tu-xa.png'
import TamThan from '../../../assets/remote/tam-than-tu-xa-1.png'
import TieuHoa from '../../../assets/remote/tieu-hoa-tu--xa.png'
import TimMach from '../../../assets/remote/tim-mach-tu--xa.png'
class RemoteExam extends Component {


    render() {
        return (
            <>
                <div className='section-share section-remote'>
                    <div className='section-container'>
                        <div className='section-header'>
                            <span className='title-section'>Khám từ xa</span>
                            <button className='btn-section'>Xem thêm</button>
                        </div>
                        <div className='section-body'>
                            <Slider {...this.props.settings}>
                                <div className='image-customize'>
                                    <img src={DaLieu} alt=''></img>
                                    <div className='title-img'>Bác sĩ Da liễu từ xa</div>
                                </div>
                                <div className='image-customize'>
                                    <img src={CoXuongKhop} alt=''></img>
                                    <div className='title-img'>Bác sĩ Cơ-Xương-Khớp từ xa</div>
                                </div>
                                <div className='image-customize'>
                                    <img src={TamLy} alt=''></img>
                                    <div className='title-img'>Tư vấn, trị liệu Tâm lý từ xa</div>
                                </div>
                                <div className='image-customize'>
                                    <img src={TamThan} alt=''></img>
                                    <div className='title-img'>Sức khỏe tâm thần từ xa</div>
                                </div>
                                <div className='image-customize'>
                                    <img src={TieuHoa} alt=''></img>
                                    <div className='title-img'>Bác sĩ Tiêu hóa từ xa</div>
                                </div>
                                <div className='image-customize'>
                                    <img src={TimMach} alt=''></img>
                                    <div className='title-img'>Bác sĩ Tim mạch từ xa</div>
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
        isLoggedIn: state.patient.isLoggedIn,
        language: state.app.language
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(RemoteExam);