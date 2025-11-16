import React, { Component } from 'react';
import { connect } from 'react-redux'; // kết nối như router
// Slider 
import Slider from "react-slick";
import "./Clinic.scss";

import * as action from "../../../store/actions";

import { withRouter } from "react-router";

class Clinic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ListSpecialty: [],
        }
    }
    handleViewDetailClinic = (clinic) => {
        this.props.history.push(`/detail_clinic/${clinic.id}`);
    }

    returnChoRay = () => {
        if (this.props.history) {
            this.props.history.push(`/ChoRay`);
        }
    };
    componentDidMount() {
        this.props.getAllClinic();
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.clinics !== this.props.clinics) {
            this.setState({
                ListSpecialty: this.props.clinics
            })
        }
    }
    render() {
        let { ListSpecialty } = this.state;
        return (
            <>
                <div className='section-share section-clinic'>
                    <div className='section-container'>
                        <div className='section-header'>
                            <span className='title-section'>Cơ sở ý tế</span>
                            <button className='btn-section'>Xem thêm</button>

                        </div>
                        <div className='section-body'>
                            <Slider {...this.props.settings}>
                                {/* <div className='image-customize'>
                                    <img src={doctoc_check} alt='' />
                                    <div className='title-img'>Doctor Check - Tầm kiểm soát bệnh để sống thọ hơn</div>
                                </div> */}
                                {/* <div className='image-customize' onClick={this.returnChoRay}>
                                    <img src={ChoRay} alt=''></img>
                                    <div className='title-img' >Bệnh viện chợ rẫy</div>
                                </div> */}
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
                    </div>
                </div>
            </>

        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.patient.isLoggedIn,
        language: state.app.language,
        clinics: state.admin.AllClinic
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getAllClinic: () => dispatch(action.GetAllClinic()),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Clinic));