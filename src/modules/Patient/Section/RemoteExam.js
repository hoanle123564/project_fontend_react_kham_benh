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
import * as action from "../../../store/actions";

class RemoteExam extends Component {
    componentDidMount() {
        this.props.getAllSpecialty();
    }

    getSpecialtyPathById = (specialtyId) => {
        const specialty = (this.props.specialtys || []).find(
            (item) => Number(item.id) === Number(specialtyId) && Number(item.isActive) === 1
        );

        return specialty?.slug ? `/detail-specialty/${specialty.slug}` : "/list-specialty";
    };

    handleRemoteSpecialty = (specialtyId) => {
        if (this.props.history) {
            this.props.history.push(this.getSpecialtyPathById(specialtyId));
        }
    };

    handleListRemote = () => {
        if (this.props.history) {
            this.props.history.push(`/list-remote`);
        }
    };
    handleCoXuong = () => {
        this.handleRemoteSpecialty(10);
    };
    handleTamLy = () => {
        this.handleRemoteSpecialty(19);
    };
    handleTamThan = () => {
        this.handleRemoteSpecialty(18);
    }
    handleTieuHoa = () => {
        this.handleRemoteSpecialty(12);
    }
    handleTimMach = () => {
        this.handleRemoteSpecialty(13);
    }
    handleDaLieu = () => {
        this.handleRemoteSpecialty(11);
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
        language: state.app.language,
        specialtys: state.admin.specialty
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getAllSpecialty: () => dispatch(action.GetAllSpecialty()),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RemoteExam));
