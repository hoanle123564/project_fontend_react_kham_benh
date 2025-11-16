import React, { Component } from "react";
import { connect } from "react-redux";
import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import "./DetailClinic.scss";
import * as action from "../../../../store/actions";
import DoctorSchdule from "../Doctor/DoctorSchdule";
import DoctorExtendInfo from "../Doctor/DoctorExtendInfo";
import { getDetailClinicById } from "../../../../services/userService";
import { withRouter } from "react-router-dom/cjs/react-router-dom.min";
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
        if (
            this.props.match &&
            this.props.match.params &&
            this.props.match.params.id
        ) {
            let id = this.props.match.params.id;
            let res = await getDetailClinicById(id, "ALL");

            if (res && res.errCode === 0) {
                let data = res.data;
                let arrDoctorId = data[0].doctorClinic;
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
                    DetailClinic: res.data,
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

                const filterDoctors = ListDoctor.filter((doc) =>
                    ListDoctorId.includes(doc.id)
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
            this.props.match.params.id
        ) {
            let id = this.props.match.params.id;
            let location = event.target.value;
            let res = await getDetailClinicById(id, location);

            if (res && res.errCode === 0) {
                let data = res.data;
                let arrDoctorId = data[0].doctorClinic;
                let arrDoctor = [];

                if (arrDoctorId && arrDoctorId.length > 0) {
                    arrDoctorId.forEach((item) => {
                        arrDoctor.push(item.doctorId);
                    });
                }

                this.setState({
                    DetailClinic: res.data,
                    ListDoctorId: arrDoctor,
                });
            }

        }
    }

    handleViewDetailDoctor = (doctor) => {
        this.props.history.push(`/detail_doctor/${doctor.id}`);
    }


    render() {
        const { ListDoctor, DetailClinic } = this.state;
        console.log("list doctor", ListDoctor);
        console.log("detail specialty", this.state.DetailClinic);
        return (
            <>
                <HomeHeader showBanner={false} />
                <div className="speciality-detail-container">
                    <div className="description-specialty">
                        {
                            DetailClinic && DetailClinic[0] && DetailClinic[0].descriptionHTML &&
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: DetailClinic[0].descriptionHTML,
                                }}
                            ></div>
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
                                                {item.positionVi}, {item.firstName} {item.lastName}
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
