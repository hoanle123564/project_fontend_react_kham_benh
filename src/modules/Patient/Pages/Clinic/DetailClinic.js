import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import "./DetailClinic.scss";
import * as action from "../../../../store/actions";
import DoctorSchdule from "../Doctor/DoctorSchdule";
import DoctorExtendInfo from "../Doctor/DoctorExtendInfo";
import { getDetailClinicBySlug } from "../../../../services/userService";
import BackToTop from "../../../../components/BackToTop/BackToTop";

const getActiveSortedDoctors = (doctors = []) =>
    [...doctors]
        .filter((doctor) => Number(doctor.isActive) === 1)
        .sort((a, b) => {
            const orderA = Number(a.displayOrder) || 0;
            const orderB = Number(b.displayOrder) || 0;

            if (orderA !== orderB) return orderA - orderB;
            return Number(a.id) - Number(b.id);
        });

class DetailClinic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ListDoctor: [],
            DetailClinic: {},
            ListDoctorId: [],
            ListProvince: [],
        };
    }

    async componentDidMount() {
        this.props.fetchTopDoctor();
        await this.fetchClinicDetail("ALL");
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            prevProps.ListDoctor !== this.props.ListDoctor ||
            prevState.ListDoctorId !== this.state.ListDoctorId
        ) {
            const { ListDoctorId } = this.state;
            const { ListDoctor } = this.props;

            if (ListDoctorId.length > 0 && ListDoctor.length > 0) {
                const filterDoctors = getActiveSortedDoctors(
                    ListDoctor.filter((doc) => ListDoctorId.includes(doc.id))
                );

                if (filterDoctors !== this.state.ListDoctor) {
                    this.setState({
                        ListDoctor: filterDoctors,
                    });
                }
            }
        }
    }

    fetchClinicDetail = async (location) => {
        const slug = this.props.match?.params?.slug;
        if (!slug) return;

        const res = await getDetailClinicBySlug(slug, location);
        if (res && res.errCode === 0) {
            const data = res.data || [];
            const doctorClinic = data[0]?.doctorClinic || [];
            const arrDoctor = [];
            const arrProvince = [];

            doctorClinic.forEach((item) => {
                arrDoctor.push(item.doctorId);
                if (item.province) arrProvince.push(item.province);
            });

            const ListProvinceFormatted = [{ label: "Toàn quốc", value: "ALL" }];
            arrProvince.forEach((item) => {
                ListProvinceFormatted.push({
                    label: item,
                    value: item,
                });
            });

            this.setState({
                DetailClinic: data,
                ListDoctorId: arrDoctor,
                ListProvince: ListProvinceFormatted,
            });
        }
    };

    handleOnchange = async (event) => {
        await this.fetchClinicDetail(event.target.value);
    };

    handleViewDetailDoctor = (doctor) => {
        const targetSlug = doctor?.slug || doctor?.id;
        if (targetSlug) {
            this.props.history.push(`/detail-doctor/${targetSlug}`);
        }
    };

    render() {
        const { ListDoctor, DetailClinic } = this.state;

        return (
            <>
                <HomeHeader showBanner={false} />
                <BackToTop />
                <div className="clinic-detail-container">
                    <div className="description-specialty">
                        {DetailClinic &&
                            DetailClinic[0] &&
                            DetailClinic[0].descriptionHTML && (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: DetailClinic[0].descriptionHTML,
                                    }}
                                ></div>
                            )}
                        {/* <div className="filter-specialty">
                            <span>Chọn tỉnh thành:</span>
                            <select onChange={(event) => this.handleOnchange(event)}>
                                {this.state.ListProvince &&
                                    this.state.ListProvince.length > 0 &&
                                    this.state.ListProvince.map((item, index) => (
                                        <option key={index} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                            </select>
                        </div> */}
                    </div>

                    <div className="detail-specialty-body">
                        {ListDoctor &&
                            ListDoctor.length > 0 &&
                            ListDoctor.map((item, index) => (
                                <div className="each-doctor" key={index}>
                                    <div className="dt-content-left">
                                        <div className="doctor-image">
                                            <img
                                                src={
                                                    item.image
                                                        ? `data:image/jpeg;base64,${item.image}`
                                                        : "/default-doctor.png"
                                                }
                                                alt="avatar"
                                            />
                                        </div>
                                        <div className="doctor-info">
                                            <strong>
                                                {item.positionVi}, {item.firstName} {item.lastName}
                                            </strong>
                                            <div className="doctor-description">
                                                {item.description ||
                                                    "Bác sĩ có nhiều năm kinh nghiệm khám và điều trị."}
                                            </div>

                                            <div
                                                className="see-more"
                                                onClick={() => this.handleViewDetailDoctor(item)}
                                            >
                                                Xem thêm
                                            </div>
                                        </div>
                                    </div>

                                    <div className="dt-content-right">
                                        <DoctorSchdule doctorId={item.id} doctorProfile={item} />
                                        <DoctorExtendInfo doctorId={item.id} />
                                    </div>
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
    language: state.app.language,
    ListDoctor: state.admin.doctor,
});

const mapDispatchToProps = (dispatch) => ({
    fetchTopDoctor: () => dispatch(action.fetchTopDoctor()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DetailClinic));
