// ListSpecialty.jsx
import React, { Component } from "react";
import { connect } from "react-redux";
import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import "./ListSpecialty.scss";
import * as action from "../../../../store/actions";
import { withRouter } from "react-router";

class ListSpecialty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            specialtyList: [],
        };
    }

    async componentDidMount() {
        await this.props.getAllSpecialty();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.specialtys !== this.props.specialtys) {
            this.setState({
                specialtyList: this.props.specialtys,
            });
        }
    }

    handleViewDetail = (item) => {
        if (this.props.history) {
            this.props.history.push(`/detail-specialty/${item.id}`);
        }
    };

    render() {
        let { specialtyList } = this.state;
        let { language } = this.props;
        return (
            <>
                <HomeHeader showBanner={false} />

                <div className="list-specialty-container">
                    <div className="breadcrumb">
                        {language === "vi" ? "Khám chuyên khoa" : "Specialties"}
                    </div>

                    <div className="grid-container">
                        {specialtyList &&
                            specialtyList.length > 0 &&
                            specialtyList.map((item, index) => {
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
        specialtys: state.admin.specialty,
        language: state.app.language,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getAllSpecialty: () => dispatch(action.GetAllSpecialty()),
    };
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(ListSpecialty)
);
