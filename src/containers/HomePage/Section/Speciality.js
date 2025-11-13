import React, { Component } from 'react';
import { withRouter } from "react-router";
import { connect } from 'react-redux'; // kết nối như router
import * as action from "../../../store/actions";
import "./Speciality.scss";
// Slider 
import Slider from "react-slick";

class Speciality extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ListSpecialty: [],
        }
    }

    handleViewDetailClinic = (clinic) => {
        console.log("Detail clinic", clinic);
        this.props.history.push(`/detail_specialty/${clinic.id}`);
    }

    componentDidMount() {
        this.props.getAllSpecialty();
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.specialtys !== this.props.specialtys) {
            this.setState({
                ListSpecialty: this.props.specialtys
            })
        }
    }

    render() {
        let { ListSpecialty } = this.state;
        return (
            <>
                <div className='section-share section-specialty'>
                    <div className='section-container'>
                        <div className='section-header'>
                            <span className='title-section'>Chuyên khoa phổ biến</span>
                            <button className='btn-section'>Xem thêm</button>

                        </div>
                        <div className='section-body'>
                            <Slider {...this.props.settings}>
                                {
                                    ListSpecialty && ListSpecialty.length > 0 &&
                                    ListSpecialty.map((item, index) => {
                                        return (
                                            <div className='image-speciality'
                                                key={index}
                                                onClick={() => this.handleViewDetailClinic(item)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <img src={`data:image/jpeg;base64,${item.image}`} alt='' />
                                                <div className='title-img'>{item.name}</div>
                                            </div>
                                        )
                                    })
                                }
                            </Slider>
                        </div>
                    </div >
                </div >
            </>

        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        language: state.app.language,
        specialtys: state.admin.specialty
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getAllSpecialty: () => dispatch(action.GetAllSpecialty()),

    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Speciality));