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
        }
    }

    loadInfo = async () => {
        const { doctorId } = this.props;
        if (doctorId) {
            let res = await getDetailDoctor(doctorId);
            console.log("getDetailDoctor", res);

            if (res) {
                this.setState({ info: res.data });
            }
        }
    };

    render() {
        const { info } = this.state;
        const { language } = this.props;

        const price =
            language === "vi"
                ? `${Number(info.priceVi || 0).toLocaleString("vi-VN")} VNĐ`
                : `${info.priceEn || 0} $`;

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
                    <span className="title">
                        <FormattedMessage id="detail-doctor.price" />:
                    </span>
                    <span className="price">{price}</span>
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