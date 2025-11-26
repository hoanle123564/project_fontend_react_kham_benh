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
                    <div className='section-container'>
                        <div className='section-header'>
                            <span className='title-section'>Khám từ xa</span>
                            <button className='btn-section' onClick={this.handleListRemote}>Xem thêm</button>
                        </div>
                        <div className='section-body'>
                            <Slider {...this.props.settings}>
                                <div className='image-customize' onClick={this.handleCoXuong}>
                                    <img src={CoXuongKhop} alt=''></img>
                                    <div className='title-img'>Bác sĩ Cơ-Xương-Khớp từ xa</div>
                                </div>
                                <div className='image-customize' onClick={this.handleTamLy}>
                                    <img src={TamLy} alt=''></img>
                                    <div className='title-img'>Tư vấn, trị liệu Tâm lý từ xa</div>
                                </div>
                                <div className='image-customize' onClick={this.handleTamThan}>
                                    <img src={TamThan} alt=''></img>
                                    <div className='title-img'>Sức khỏe tâm thần từ xa</div>
                                </div>
                                <div className='image-customize' onClick={this.handleTieuHoa}>
                                    <img src={TieuHoa} alt=''></img>
                                    <div className='title-img'>Bác sĩ Tiêu hóa từ xa</div>
                                </div>
                                <div className='image-customize' onClick={this.handleTimMach}>
                                    <img src={TimMach} alt=''></img>
                                    <div className='title-img'>Bác sĩ Tim mạch từ xa</div>
                                </div>
                                <div className='image-customize' onClick={this.handleDaLieu}>
                                    <img src={DaLieu} alt=''></img>
                                    <div className='title-img'>Bác sĩ Da liễu từ xa</div>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RemoteExam));