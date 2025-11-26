import React, { Component } from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import HomeHeader from "./Patient/Layout/HomeHeader";
import HomeFooter from "./Patient/Layout/HomeFooter";
import "./NotFound.scss";
import NotFoundImage from "../assets/NotFound.png";

class NotFound extends Component {
    handleBackHome = () => {
        this.props.history.push("/");
    };

    render() {
        return (
            <>
                <HomeHeader showBanner={false} />

                <div className="not-found-container">
                    <div className="content-left">
                        <img src={NotFoundImage} alt="Not Found" />
                    </div>

                    <div className="content-right">
                        <h1>
                            {this.props.language === 'vi'
                                ? 'Rất tiếc, trang bạn tìm không tồn tại!'
                                : 'Sorry, the page you are looking for does not exist!'}
                        </h1>
                        <p>
                            {this.props.language === 'vi'
                                ? 'Có vẻ như đường link bạn truy cập không chính xác hoặc trang này đã bị xoá. Đừng lo, chúng tôi vẫn ở đây để giúp bạn!'
                                : 'It seems like the link you accessed is incorrect or this page has been deleted. Don\'t worry, we\'re still here to help you!'}
                        </p>

                        <ul>
                            <li>
                                {this.props.language === 'vi'
                                    ? 'Quay lại Trang chủ để khám phá thêm.'
                                    : 'Go back to Home page to explore more.'}
                            </li>
                            <li>
                                {this.props.language === 'vi'
                                    ? 'Tìm kiếm thông tin trong thanh tìm kiếm.'
                                    : 'Search for information in the search bar.'}
                            </li>
                        </ul>

                        <button className="btn-home" onClick={this.handleBackHome}>
                            {this.props.language === 'vi' ? 'Quay về Trang chủ' : 'Back to Home'}
                        </button>
                    </div>
                </div>

                <HomeFooter />
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language
});

export default connect(mapStateToProps)(withRouter(NotFound));
