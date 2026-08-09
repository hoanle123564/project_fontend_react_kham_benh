import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './PatientReviews.scss';

const reviews = [
    {
        id: 1,
        patientName: "Nguyễn Hoàng Minh",
        avatar: null,
        doctorName: "PGS.TS Nguyễn Văn B",
        specialty: "Tim mạch",
        rating: 5,
        contentKey: "homepage.patient-reviews.review1",
        verified: true,
        date: "2026-08-01"
    },
    {
        id: 2,
        patientName: "Lê Thanh Hương",
        avatar: null,
        doctorName: "ThS.BS Trịnh Khải Mẫn",
        specialty: "Da liễu",
        rating: 5,
        contentKey: "homepage.patient-reviews.review2",
        verified: true,
        date: "2026-08-03"
    },
    {
        id: 3,
        patientName: "Phạm Minh Tuấn",
        avatar: null,
        doctorName: "BSCKII Vũ Hoài Nam",
        specialty: "Cơ xương khớp",
        rating: 5,
        contentKey: "homepage.patient-reviews.review3",
        verified: true,
        date: "2026-08-05"
    }
];

class PatientReviews extends Component {
    renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <i
                    key={i}
                    className={`fa-solid fa-star ${i < rating ? 'star-filled' : 'star-empty'}`}
                ></i>
            );
        }
        return stars;
    }

    getInitials = (name) => {
        if (!name) return "P";
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name[0].toUpperCase();
    }

    render() {
        const swiperBreakpoints = {
            0: {
                slidesPerView: 1,
                spaceBetween: 15
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 30
            }
        };

        return (
            <div className="patient-reviews-wrapper">
                <div className="container">
                    <div className="reviews-header">
                        <h2 className="reviews-title">
                            <FormattedMessage id="homepage.patient-reviews.title" />
                        </h2>
                        <p className="reviews-subtitle">
                            <FormattedMessage id="homepage.patient-reviews.subtitle" />
                        </p>
                    </div>

                    <div className="reviews-swiper-container">
                        <Swiper
                            modules={[Pagination]}
                            pagination={{ clickable: true }}
                            breakpoints={swiperBreakpoints}
                            className="reviews-swiper"
                        >
                            {reviews.map((review) => (
                                <SwiperSlide key={review.id}>
                                    <div className="review-card">
                                        <div className="card-header">
                                            <div className="patient-info">
                                                <div className="patient-avatar">
                                                    {review.avatar ? (
                                                        <img src={review.avatar} alt={review.patientName} />
                                                    ) : (
                                                        <span className="avatar-placeholder">
                                                            {this.getInitials(review.patientName)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="patient-meta">
                                                    <h4 className="patient-name">{review.patientName}</h4>
                                                    <div className="rating-container">
                                                        {this.renderStars(review.rating)}
                                                    </div>
                                                </div>
                                            </div>
                                            {review.verified && (
                                                <span className="verified-badge">
                                                    <i className="fa-solid fa-circle-check"></i>
                                                    <FormattedMessage id="homepage.patient-reviews.verified" />
                                                </span>
                                            )}
                                        </div>

                                        <div className="card-body">
                                            <p className="review-text">
                                                <FormattedMessage id={review.contentKey} />
                                            </p>
                                        </div>

                                        <div className="card-footer">
                                            <div className="visit-meta">
                                                <div className="doctor-badge">
                                                    <i className="fa-solid fa-user-doctor"></i>
                                                    <span>{review.doctorName}</span>
                                                </div>
                                                <div className="specialty-badge">
                                                    <i className="fa-solid fa-stethoscope"></i>
                                                    <span>{review.specialty}</span>
                                                </div>
                                            </div>
                                            <div className="visit-date">{review.date}</div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(null, null)(PatientReviews);
