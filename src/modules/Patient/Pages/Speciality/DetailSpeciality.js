import React, { Component } from "react";
import { connect } from "react-redux";
import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import "./DetailSpeciality.scss";
import * as action from "../../../../store/actions";
import DoctorSchdule from "../../Pages/Doctor/DoctorSchdule";
import DoctorExtendInfo from "../../Pages/Doctor/DoctorExtendInfo";
import { getDetailSpecialtyBySlug } from "../../../../services/userService";
import { withRouter } from "react-router-dom/cjs/react-router-dom.min";
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

class DetailSpeciality extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ListDoctor: [],
            dateDetailSpecialty: {},
            ListDoctorId: [],
            ListProvince: [],
        };
    }

    async componentDidMount() {
        this.props.fetchTopDoctor();
        if (
            this.props.match &&
            this.props.match.params &&
            this.props.match.params.slug
        ) {
            let slug = this.props.match.params.slug;
            let res = await getDetailSpecialtyBySlug(slug, "ALL");

            if (res && res.errCode === 0) {
                let data = res.data;
                let arrDoctorId = data[0].doctorSpecialty;
                let arrDoctor = [];
                let arrProvince = [];

                if (arrDoctorId && arrDoctorId.length > 0) {
                    arrDoctorId.forEach((item) => {
                        arrDoctor.push(item.doctorId);
                        arrProvince.push(item.province);

                    });
                }

                console.log("arrDoctorId", arrDoctor);
                console.log("arrProvince", arrProvince);

                let ListProvinceFormatted = [{ label: 'Toàn quốc', value: 'ALL' }];
                if (arrProvince && arrProvince.length > 0) {
                    arrProvince.map(item => (
                        ListProvinceFormatted.push({
                            label: item,
                            value: item,
                        })
                    ));
                }
                this.setState({
                    dateDetailSpecialty: res.data,
                    ListDoctorId: arrDoctor,
                    ListProvince: ListProvinceFormatted,
                });
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.ListDoctor !== this.props.ListDoctor ||
            prevState.ListDoctorId !== this.state.ListDoctorId) {

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

    handleOnchange = async (event) => {
        if (
            this.props.match &&
            this.props.match.params &&
            this.props.match.params.slug
        ) {
            let slug = this.props.match.params.slug;
            let location = event.target.value;
            let res = await getDetailSpecialtyBySlug(slug, location);

            if (res && res.errCode === 0) {
                let data = res.data;
                let arrDoctorId = data[0].doctorSpecialty;
                let arrDoctor = [];

                if (arrDoctorId && arrDoctorId.length > 0) {
                    arrDoctorId.forEach((item) => {
                        arrDoctor.push(item.doctorId);
                    });
                }

                this.setState({
                    dateDetailSpecialty: res.data,
                    ListDoctorId: arrDoctor,
                });
            }

        }
    }

    handleViewDetailDoctor = (doctor) => {
        const targetSlug = doctor?.slug || doctor?.id;
        if (targetSlug) {
            this.props.history.push(`/detail-doctor/${targetSlug}`);
        }
    }


    render() {
        const { ListDoctor, dateDetailSpecialty } = this.state;
        console.log("list doctor", ListDoctor);
        console.log("detail specialty", this.state.dateDetailSpecialty);
        return (
            <>
                <HomeHeader showBanner={false} />
                <BackToTop />
                <div className="speciality-detail-container">
                    <div className="container">
                        <div className="description-specialty">
                            {
                                dateDetailSpecialty &&
                                dateDetailSpecialty[0] &&
                                dateDetailSpecialty[0].descriptionHTML &&
                                (
                                    <>
                                        <img src={`data:image/jpeg;base64,${dateDetailSpecialty[0].image}`} alt="" className="backgorund-image" />
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: dateDetailSpecialty[0].descriptionHTML,
                                            }}
                                        ></div>
                                    </>
                                )
                            }
                            <div className="filter-specialty">
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
                            </div>
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
                                                    <button
                                                        type="button"
                                                        className="doctor-detail-link"
                                                        onClick={() => this.handleViewDetailDoctor(item)}
                                                    >
                                                        {item.positionVi}, {item.firstName} {item.lastName}
                                                    </button>
                                                </strong>
                                                <div className="doctor-description">
                                                    {item.description ||
                                                        "Bác sĩ có nhiều năm kinh nghiệm khám và điều trị."}
                                                </div>

                                                <div className="see-more" onClick={() => this.handleViewDetailDoctor(item)}>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DetailSpeciality));
