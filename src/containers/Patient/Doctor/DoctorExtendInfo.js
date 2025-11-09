import React, { Component } from "react";
import { connect } from "react-redux";
import "./DoctorExtendInfo.scss";
import { FormattedMessage } from "react-intl";
import * as action from "../../../store/actions";

class DoctorExtendInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        console.log('detail doctor', this.props.DetailDoctor);
        const { DetailDoctor, language } = this.props;
        return (
            <>
                <div className="doctor-extend-info-container">
                    {/* ===== Địa chỉ khám ===== */}
                    <div className="clinic-address-block">
                        <div className="title">
                            <FormattedMessage id="detail-doctor.address-clinic" />
                        </div>
                        <div className="clinic-name">{DetailDoctor.nameClinic}</div>
                        <div className="clinic-address">{DetailDoctor.addressClinic}</div>

                        <div className="promotion-line">
                            <i className="fas fa-bolt"></i>
                            <span className="promo-text">
                                <FormattedMessage id="detail-doctor.applyed-promo" />

                            </span>
                            <button className="link" >
                                <FormattedMessage id="detail-doctor.see-detail" />
                            </button>
                        </div>
                    </div>

                    <div className="line"></div>

                    {/* ===== Giá khám ===== */}
                    <div className="price-block">
                        <span className="title">
                            <FormattedMessage id="detail-doctor.price" />:
                        </span>
                        <span className="price">
                            {language === 'vi'
                                ? `${Number(DetailDoctor.priceVi).toLocaleString('vi-VN')} VNĐ`
                                : `${Number(DetailDoctor.priceEn).toLocaleString('en-US')} $`}
                        </span>
                        <button className="link" >
                            <FormattedMessage id="detail-doctor.see-detail" />
                        </button>
                    </div>

                    <div className="line"></div>

                    {/* ===== Bảo hiểm ===== */}
                    <div className="insurance-block">
                        <span className="title">
                            <FormattedMessage id="detail-doctor.applyed-promo" />:
                        </span>
                        <button className="link" >
                            <FormattedMessage id="detail-doctor.see-detail" />
                        </button>
                    </div>
                </div>
            </>

        );
    }
}
const mapStateToProps = (state) => {
    return {
        language: state.app.language,
        isLoggedIn: state.user.isLoggedIn,

    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        GetDetailDoctor: (id) => dispatch(action.GetDetailDoctor(id)),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(DoctorExtendInfo);
