// ListDoctor.jsx
import React, { Component } from "react";
import { connect } from "react-redux";
import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import "./ListDoctor.scss";
import * as action from "../../../../store/actions";
import { withRouter } from "react-router";
class ListDoctor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            doctorList: [],
        };
    }

    async componentDidMount() {
        await this.props.fetchTopDoctor();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.ListDoctor !== this.props.ListDoctor) {
            this.setState({
                doctorList: this.props.ListDoctor,
            });
        }
    }

    handleViewDetailDoctor = (doctor) => {
        if (this.props.history) {
            this.props.history.push(`/detail_doctor/${doctor.id}`);
        }
    };

    render() {
        let { doctorList } = this.state;
        console.log("list doctor", doctorList);

        return (
            <>
                <HomeHeader showBanner={false} />
                <div className="list-doctor-container">
                    <div className="list-doctor-header">Danh sách bác sĩ</div>

                    <div className="list-doctor-body">
                        {doctorList && doctorList.length > 0 &&
                            doctorList.map((item, index) => {
                                return (
                                    <div
                                        className="doctor-card"
                                        key={index}
                                        onClick={() => this.handleViewDetailDoctor(item)}
                                    >
                                        <div className="doctor-avatar">
                                            <img
                                                src={`data:image/jpeg;base64,${item.image}`}

                                                alt="avatar" />
                                        </div>
                                        <div className="doctor-info">
                                            <div className="doctor-name">
                                                {item.positionData?.value_vi}{item.firstName}  {item.lastName}
                                            </div>
                                            <div className="doctor-specialty">
                                                {item.specialtyName || "Chưa cập nhật chuyên khoa"}
                                            </div>
                                            <div className="doctor-description">
                                                {item.description
                                                    ? item.description.substring(0, 120) + "..."
                                                    : "Bác sĩ chưa cập nhật mô tả"}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
                <HomeFooter />
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        ListDoctor: state.admin.doctor,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetchTopDoctor: () => dispatch(action.fetchTopDoctor()),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ListDoctor));
