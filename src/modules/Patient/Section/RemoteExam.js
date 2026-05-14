import React, { Component } from 'react';
import { connect } from 'react-redux'; // kết nối như router
// Swiper 
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import "./SectionShare.scss";
import DaLieu from '../../../assets/remote/da-lieu-tu--xa.png'
import CoXuongKhop from '../../../assets/remote/cxk-tu--xa.png'
import TamLy from '../../../assets/remote/tam-ly-tu-xa.png'
import TamThan from '../../../assets/remote/tam-than-tu-xa-1.png'
import TieuHoa from '../../../assets/remote/tieu-hoa-tu--xa.png'
import TimMach from '../../../assets/remote/tim-mach-tu--xa.png'
import { withRouter } from "react-router";

class RemoteExam extends Component {

    handleListRemote = () => {
        if (this.props.history) {
            this.props.history.push(`/list-remote`);
        }
    };
    handleCoXuong = () => {
        if (this.props.history) {
            this.props.history.push(`/detail-specialty/10`);
        }
    };
    handleTamLy = () => {
        if (this.props.history) {
            this.props.history.push(`/detail-specialty/19`);
        }
    };
    handleTamThan = () => {
        if (this.props.history) {
            this.props.history.push(`/detail-specialty/18`);
        }
    }
    handleTieuHoa = () => {
        if (this.props.history) {
            this.props.history.push(`/detail-specialty/12`);
        }
    }
    handleTimMach = () => {
        if (this.props.history) {
            this.props.history.push(`/detail-specialty/13`);
        }
    }
    render() {
        return (
            <>
                <div className='section-share section-remote'>
                    <div className="container">
                        <div className='section-container'>
                            <div className='section-header'>
                                <span className='title-section'>Khám từ xa</span>
                                <button className='btn-section' onClick={this.handleListRemote}>Xem thêm</button>
                            </div>
                            <div className='section-body'>
                                <Swiper
                                    spaceBetween={20}
                                    slidesPerView={4}
                                    navigation={true}
                                    modules={[Navigation]}
                                    className="remote-swiper"
                                >
                                    <SwiperSlide className='item-specialty'>
                                        <div className='image-customize' onClick={this.handleCoXuong}>
                                            <div className="box-img">
                                                <img src={CoXuongKhop} alt=''></img>
                                            </div>
                                            <div className='title-img'>Bác sĩ Cơ-Xương-Khớp từ xa</div>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide className='item-specialty'>
                                        <div className='image-customize' onClick={this.handleTamLy}>
                                            <div className="box-img">
                                                <img src={TamLy} alt=''></img>
                                            </div>
                                            <div className='title-img'>Tư vấn, trị liệu Tâm lý từ xa</div>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide className='item-specialty'>
                                        <div className='image-customize' onClick={this.handleTamThan}>
                                            <div className="box-img">
                                                <img src={TamThan} alt=''></img>
                                            </div>
                                            <div className='title-img'>Sức khỏe tâm thần từ xa</div>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide className='item-specialty'>
                                        <div className='image-customize' onClick={this.handleTieuHoa}>
                                            <div className="box-img">
                                                <img src={TieuHoa} alt=''></img>
                                            </div>
                                            <div className='title-img'>Bác sĩ Tiêu hóa từ xa</div>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide className='item-specialty'>
                                        <div className='image-customize' onClick={this.handleTimMach}>
                                            <div className="box-img">
                                                <img src={TimMach} alt=''></img>
                                            </div>
                                            <div className='title-img'>Bác sĩ Tim mạch từ xa</div>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide className='item-specialty'>
                                        <div className='image-customize' onClick={this.handleDaLieu}>
                                            <div className="box-img">
                                                <img src={DaLieu} alt=''></img>
                                            </div>
                                            <div className='title-img'>Bác sĩ Da liễu từ xa</div>
                                        </div>
                                    </SwiperSlide>
                                </Swiper>
                            </div>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RemoteExam));