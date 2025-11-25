import React, { Component } from "react";
import { withRouter } from "react-router";
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
                        <h1>Rất tiếc, trang bạn tìm không tồn tại!</h1>
                        <p>
                            Có vẻ như đường link bạn truy cập không chính xác hoặc trang này đã bị xoá.
                            Đừng lo, chúng tôi vẫn ở đây để giúp bạn!
                        </p>

                        <ul>
                            <li>👉 Quay lại Trang chủ để khám phá thêm.</li>
                            <li>Tìm kiếm thông tin trong thanh tìm kiếm.</li>
                        </ul>

                        <button className="btn-home" onClick={this.handleBackHome}>
                            Quay về Trang chủ
                        </button>
                    </div>
                </div>

                <HomeFooter />
            </>
        );
    }
}

export default withRouter(NotFound);
