import React, { Component } from "react";
import { connect } from "react-redux";
import HomeHeader from "../HomePage/HomeHeader";
import HomeFooter from "../HomePage/HomeFooter";
import { VerifyPatientBooking } from "../../services/userService";
import "./VerifyEmailBooking.scss";
class VerifyEmailBooking extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ResponseVerify: "",
        };
    }

    async componentDidMount() {
        console.log("check props", this.props);
        if (this.props.location && this.props.location.search) {
            const urlParams = new URLSearchParams(this.props.location.search);
            const token = urlParams.get("token");
            const doctorId = urlParams.get("doctorId");
            console.log("check token", token);
            console.log("check doctorId", doctorId);
            let res = await VerifyPatientBooking({
                token: token,
                doctorId: doctorId,
            })
            this.setState({
                ResponseVerify: res,
            });
        }
    }

    render() {
        const { ResponseVerify } = this.state;
        console.log('ResponseVerify', this.state.ResponseVerify);


        return (
            <>
                <HomeHeader />
                {
                    ResponseVerify && ResponseVerify.errCode === 0 ? (
                        <div className="verify-email-booking-container">
                            Xác nhận lịch hẹn thành công
                        </div>
                    ) : (
                        <div className="verify-email-booking-container">
                            Lịch hẹn không tồn tại hoặc đã được xác nhận
                        </div>
                    )
                }
                <HomeFooter />
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        language: state.app.language,
        isLoggedIn: state.user.isLoggedIn,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(VerifyEmailBooking);
