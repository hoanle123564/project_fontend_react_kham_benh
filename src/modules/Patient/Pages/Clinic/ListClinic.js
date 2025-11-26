// ListClinic.jsx
import React, { Component } from "react";
import { connect } from "react-redux";
import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import "./ListClinic.scss";
import * as action from "../../../../store/actions";
import { withRouter } from "react-router";

class ListClinic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clinicList: [],
        };
    }

    async componentDidMount() {
        await this.props.getAllClinic();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.clinics !== this.props.clinics) {
            this.setState({
                clinicList: this.props.clinics,
            });
        }
    }

    handleViewDetail = (clinic) => {
        if (this.props.history) {
            this.props.history.push(`/detail-clinic/${clinic.id}`);
        }
    };

    render() {
        let { clinicList } = this.state;
        let { language } = this.props;
        return (
            <>
                <HomeHeader showBanner={false} />

                <div className="list-clinic-container">
                    <div className="breadcrumb">
                        {language === "vi" ? "Cơ sở y tế" : "Clinics"}
                    </div>

                    <div className="grid-container">
                        {clinicList &&
                            clinicList.length > 0 &&
                            clinicList.map((item, index) => {
                                return (
                                    <div
                                        className="grid-item"
                                        key={index}
                                        onClick={() => this.handleViewDetail(item)}
                                    >
                                        <div className="image-box">
                                            <img
                                                src={
                                                    item.image
                                                        ? `data:image/jpeg;base64,${item.image}`
                                                        : "/default-image.png"
                                                }
                                                alt={item.name}
                                            />
                                        </div>
                                        <div className="title">{item.name}</div>
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
        clinics: state.admin.AllClinic,
        language: state.app.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getAllClinic: () => dispatch(action.GetAllClinic()),
    };
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ListClinic)
);
