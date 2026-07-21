import React, { Component } from "react";
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

export default DoctorExtendInfo;
