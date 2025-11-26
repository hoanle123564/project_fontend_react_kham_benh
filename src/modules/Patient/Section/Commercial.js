import React, { Component } from 'react';
import Slider from "react-slick";
import { connect } from 'react-redux';

import image1 from '../../../assets/AnhQC/20251126_1517_image.png';
import image2 from '../../../assets/AnhQC/20251126_1518_image.png';
import image3 from '../../../assets/AnhQC/20251126_1519_image.png';
import image4 from '../../../assets/AnhQC/20251126_1520_image.png';
import image5 from '../../../assets/AnhQC/20251126_1521_image.png';

import "./Commercial.scss";

class Commercial extends Component {

    constructor(props) {
        super(props);
        this.state = {
            nav1: null,
            nav2: null
        };
        this.slider1 = React.createRef();
        this.slider2 = React.createRef();
    }

    componentDidMount() {
        this.setState({
            nav1: this.slider1.current,
            nav2: this.slider2.current
        });
    }

    render() {

        const bannerList = [
            image2, image3, image4, image5, image1
        ];

        // Slider chính
        const mainSettings = {
            dots: false,
            infinite: true,
            speed: 700,
            autoplay: true,
            autoplaySpeed: 3000,
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
        };

        // Slider thumbnail
        const thumbSettings = {
            slidesToShow: 5,
            swipeToSlide: true,
            focusOnSelect: true,
            centerMode: true,
            arrows: false,
            centerPadding: "0px",
        };

        return (
            <div className="commercial-wrapper">

                {/* Slider ảnh lớn */}
                <Slider
                    {...mainSettings}
                    asNavFor={this.state.nav2}
                    ref={this.slider1}
                    className="main-slider"
                >
                    {bannerList.map((img, index) => (
                        <div className="main-slide" key={index}>
                            <img src={img} alt={`banner-${index}`} />
                        </div>
                    ))}
                </Slider>

                {/* Slider thumbnail điều hướng */}
                <Slider
                    {...thumbSettings}
                    asNavFor={this.state.nav1}
                    ref={this.slider2}
                    className="thumb-slider"
                >
                    {bannerList.map((img, index) => (
                        <div className="thumb-slide" key={index}>
                            <img src={img} alt={`thumb-${index}`} />
                        </div>
                    ))}
                </Slider>

            </div>
        );
    }
}

export default connect(null, null)(Commercial);
