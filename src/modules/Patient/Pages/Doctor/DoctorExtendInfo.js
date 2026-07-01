import React, { Component } from "react";
import { connect } from "react-redux";
import "./DoctorExtendInfo.scss";
import { FormattedMessage } from "react-intl";
import { getDetailDoctor } from "../../../../services/userService";

class DoctorExtendInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            info: {},
        };
    }

    async componentDidMount() {
        await this.loadInfo();
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.doctorId !== this.props.doctorId) {
            await this.loadInfo();
        } else if (prevProps.doctorProfile !== this.props.doctorProfile && this.props.doctorProfile) {
            this.setState({ info: this.props.doctorProfile });
        }
    }

    loadInfo = async () => {
        const { doctorId, doctorProfile } = this.props;
        if (doctorProfile) {
            this.setState({ info: doctorProfile });
            return;
        }

        if (doctorId) {
            let res = await getDetailDoctor(doctorId);
            if (res) {
                this.setState({ info: res.data });
            }
        }
    };

    getTypeLabel = () => {
        const isOnline = this.props.appointmentTypeId === "AT2";
        if (this.props.language === "vi") {
            return isOnline ? "Khám online" : "Khám tại cơ sở";
        }

        return isOnline ? "Online" : "In-person";
    };

    getPrice = () => {
        const { info } = this.state;
        const isOnline = this.props.appointmentTypeId === "AT2";
        const priceVi = isOnline ? info.onlinePriceVi : info.priceVi;
        const priceEn = isOnline ? info.onlinePriceEn : info.priceEn;

        if (this.props.language === "vi") {
            return `${Number(priceVi || 0).toLocaleString("vi-VN")} VNĐ`;
        }

        return `${priceEn || 0} $`;
    };

    render() {
        const { info } = this.state;

        return (
            <div className="doctor-extend-info-container">
                <div className="clinic-address-block">
                    <div className="title">
                        <FormattedMessage id="detail-doctor.address-clinic" />
                    </div>
                    <div className="clinic-name">{info.clinicName || "—"}</div>
                    <div className="clinic-address">{info.clinicAddress || "—"}</div>

                    <div className="promotion-line">
                        <i className="fas fa-bolt"></i>
                        <span className="promo-text">
                            <FormattedMessage id="detail-doctor.applyed-promo" />
                        </span>
                        <button className="link">
                            <FormattedMessage id="detail-doctor.see-detail" />
                        </button>
                    </div>
                </div>

                <div className="line"></div>

                <div className="price-block">
                    <div>
                        <span className="title">
                            <FormattedMessage id="detail-doctor.price" />:
                        </span>
                        <span className="appointment-type-label">{this.getTypeLabel()}</span>
                    </div>
                    <span className="price">{this.getPrice()}</span>
                    <button className="link">
                        <FormattedMessage id="detail-doctor.see-detail" />
                    </button>
                </div>

                <div className="line"></div>

                <div className="insurance-block">
                    <span className="title">
                        <FormattedMessage id="detail-doctor.applyed-promo" />:
                    </span>
                    <button className="link">
                        <FormattedMessage id="detail-doctor.see-detail" />
                    </button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
});

export default connect(mapStateToProps)(DoctorExtendInfo);
