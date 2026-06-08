// Remote.jsx
import React, { Component } from "react";
import { connect } from "react-redux";
import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import "./Remote.scss";
import { withRouter } from "react-router";
import * as action from "../../../../store/actions";

import DaLieu from '../../../../assets/remote/da-lieu-tu--xa.png';
import CoXuongKhop from '../../../../assets/remote/cxk-tu--xa.png';
import TamLy from '../../../../assets/remote/tam-ly-tu-xa.png';
import TamThan from '../../../../assets/remote/tam-than-tu-xa-1.png';
import TieuHoa from '../../../../assets/remote/tieu-hoa-tu--xa.png';
import TimMach from '../../../../assets/remote/tim-mach-tu--xa.png';

class Remote extends Component {
    componentDidMount() {
        this.props.getAllSpecialty();
    }

    getSpecialtyPathById = (specialtyId) => {
        const specialty = (this.props.specialtys || []).find(
            (item) => Number(item.id) === Number(specialtyId) && Number(item.isActive) === 1
        );

        return specialty?.slug ? `/detail-specialty/${specialty.slug}` : "/list-specialty";
    };

    handleViewDetail = (path) => {
        if (this.props.history && path) {
            this.props.history.push(path);
        }
    };

    render() {

        const staticRemoteList = [
            { img: CoXuongKhop, title: "Bác sĩ Cơ-Xương-Khớp từ xa", link: this.getSpecialtyPathById(10) },
            { img: TamLy, title: "Tư vấn, trị liệu Tâm lý từ xa", link: this.getSpecialtyPathById(19) },
            { img: TamThan, title: "Sức khỏe tâm thần từ xa", link: this.getSpecialtyPathById(18) },
            { img: TieuHoa, title: "Bác sĩ Tiêu hóa từ xa", link: this.getSpecialtyPathById(12) },
            { img: TimMach, title: "Bác sĩ Tim mạch từ xa", link: this.getSpecialtyPathById(13) },
            { img: DaLieu, title: "Bác sĩ Da liễu từ xa", link: "/remote/da-lieu" },
        ];

        return (
            <>
                <HomeHeader showBanner={false} />

                <div className="list-remote-container">
                    <div className="breadcrumb">Khám từ xa</div>

                    <div className="grid-container">
                        {staticRemoteList.map((item, index) => (
                            <div
                                className="grid-item"
                                key={index}
                                onClick={() => this.handleViewDetail(item.link)}
                            >
                                <div className="image-box">
                                    <img src={item.img} alt={item.title} />
                                </div>
                                <div className="title">{item.title}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <HomeFooter />
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    specialtys: state.admin.specialty,
});

const mapDispatchToProps = (dispatch) => ({
    getAllSpecialty: () => dispatch(action.GetAllSpecialty()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Remote));
