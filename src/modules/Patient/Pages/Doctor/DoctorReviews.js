import React, { Component } from "react";
import { injectIntl } from "react-intl";
import moment from "moment";
import PagePagination from "../../../../components/Pagination/PagePagination";
import { buildImageSrc } from "../../../../utils/imageUtils";
import userDefault from "../../../../assets/user_default.png";
import { getPublicDoctorReviews } from "../../../../services/userService";
import "./DoctorReviews.scss";

const PAGE_SIZE = 10;
const STAR_VALUES = [5, 4, 3, 2, 1];

const emptySummary = () => ({
  averageRating: 0,
  totalReviews: 0,
  ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  ratingPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
});

class DoctorReviews extends Component {
  state = {
    summary: emptySummary(),
    reviews: [],
    pagination: { page: 1, limit: PAGE_SIZE, totalItems: 0, totalPages: 1 },
    rating: "",
    loading: false,
    errorMessage: "",
  };

  listRef = React.createRef();

  componentDidMount() {
    this.loadReviews(1, "");
  }

  componentDidUpdate(prevProps) {
    if (prevProps.doctorId !== this.props.doctorId && this.props.doctorId) {
      this.loadReviews(1, "");
    }
  }

  getText = (key, defaultMessage, values) =>
    this.props.intl.formatMessage(
      {
        id: `doctor-reviews.${key}`,
        defaultMessage,
      },
      values
    );

  loadReviews = async (page = 1, rating = this.state.rating, shouldScroll = false) => {
    if (!this.props.doctorId) return;
    this.setState({ loading: true, errorMessage: "" });

    try {
      const response = await getPublicDoctorReviews(this.props.doctorId, {
        page,
        limit: PAGE_SIZE,
        rating,
      });
      const payload = response?.data || response || {};
      if (response?.errCode !== 0 && payload?.errCode !== 0) {
        this.setState({
          loading: false,
          errorMessage: response?.errMessage || payload?.errMessage || this.getText("loadError", "Could not load reviews."),
        });
        return;
      }

      this.setState(
        {
          summary: payload.summary || emptySummary(),
          reviews: payload.reviews || [],
          pagination: payload.pagination || { page, limit: PAGE_SIZE, totalItems: 0, totalPages: 1 },
          rating,
          loading: false,
        },
        () => {
          if (shouldScroll && this.listRef.current) {
            this.listRef.current.scrollIntoView({ block: "start", behavior: "smooth" });
          }
        }
      );
    } catch (error) {
      this.setState({
        loading: false,
        errorMessage: this.getText("loadError", "Could not load reviews."),
      });
    }
  };

  handleRatingFilter = (rating) => {
    const nextRating = Number(this.state.rating) === Number(rating) ? "" : rating;
    this.loadReviews(1, nextRating, true);
  };

  renderStars = (rating, className = "") => {
    const rounded = Math.round(Number(rating) || 0);
    return (
      <span className={`doctor-reviews__stars ${className}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className="fas fa-star"
            aria-hidden="true"
            data-active={star <= rounded}
          ></i>
        ))}
      </span>
    );
  };

  formatDate = (value) => {
    if (!value) return "";
    const parsed = moment(value);
    return parsed.isValid() ? parsed.format("DD/MM/YYYY") : "";
  };

  getPatientImage = (review = {}) => buildImageSrc(review.patientImage) || userDefault;

  renderSummary = () => {
    const { summary, rating } = this.state;
    const average = Number(summary.averageRating || 0).toFixed(1);

    return (
      <div className="doctor-reviews__summary">
        <div className="doctor-reviews__score-card">
          <strong>{average}</strong>
          {this.renderStars(summary.averageRating, "doctor-reviews__stars--large")}
          <span>
            {summary.totalReviews
              ? this.getText("basedOn", "Based on {count} reviews", { count: summary.totalReviews })
              : this.getText("noSummary", "No reviews yet")}
          </span>
        </div>
        <div className="doctor-reviews__distribution">
          {STAR_VALUES.map((star) => {
            const count = summary.ratingCounts?.[star] || 0;
            const percent = summary.ratingPercentages?.[star] || 0;
            const selected = Number(rating) === star;
            return (
              <button
                type="button"
                key={star}
                className={selected ? "selected" : ""}
                onClick={() => this.handleRatingFilter(star)}
                aria-pressed={selected}
              >
                <span className="doctor-reviews__bar">
                  <span style={{ width: `${percent}%` }}></span>
                </span>
                <span className="doctor-reviews__rating-label">
                  {this.getText("starsLabel", "{count} stars", { count: star })} ({count})
                </span>
              </button>
            );
          })}
          {rating && (
            <button
              type="button"
              className="doctor-reviews__all-filter"
              onClick={() => this.loadReviews(1, "", true)}
            >
              {this.getText("allReviews", "All reviews")}
            </button>
          )}
        </div>
      </div>
    );
  };

  renderReviewItem = (review) => (
    <article className="doctor-reviews__item" key={review.id}>
      <img
        src={this.getPatientImage(review)}
        alt={review.patientName || ""}
        className="doctor-reviews__avatar"
        width="52"
        height="52"
      />
      <div className="doctor-reviews__body">
        <header>
          <div>
            <strong>{review.patientName || this.getText("anonymous", "Patient")}</strong>
            <time>{this.formatDate(review.createdAt)}</time>
          </div>
          {this.renderStars(review.rating)}
        </header>
        <p>{review.comment}</p>
        {review.reply && (
          <div className="doctor-reviews__reply">
            <span>{this.getText("doctorReply", "Reply from doctor")}</span>
            <p>{review.reply.content}</p>
          </div>
        )}
      </div>
    </article>
  );

  renderList = () => {
    const { loading, reviews, errorMessage, rating } = this.state;

    if (loading && reviews.length === 0) {
      return <div className="doctor-reviews__state">{this.getText("loading", "Loading reviews...")}</div>;
    }

    if (errorMessage && reviews.length === 0) {
      return (
        <div className="doctor-reviews__state doctor-reviews__state--error">
          <p>{errorMessage}</p>
          <button type="button" onClick={() => this.loadReviews(1, rating)}>
            {this.getText("retry", "Retry")}
          </button>
        </div>
      );
    }

    if (!reviews.length) {
      return (
        <div className="doctor-reviews__state">
          {rating
            ? this.getText("emptyRating", "No {rating}-star reviews", { rating })
            : this.getText("empty", "No reviews yet")}
        </div>
      );
    }

    return reviews.map(this.renderReviewItem);
  };

  render() {
    const { pagination, loading, rating } = this.state;
    const page = Math.min(pagination.page || 1, pagination.totalPages || 1);

    return (
      <section className="doctor-reviews" ref={this.listRef}>
        <div className="container">
          <div className="doctor-reviews__header">
            <h2>{this.getText("title", "Patient reviews")}</h2>
            {rating && (
              <span>{this.getText("filtering", "Showing {rating}-star reviews", { rating })}</span>
            )}
          </div>
          {this.renderSummary()}
          <div className="doctor-reviews__list" aria-busy={loading}>
            {this.renderList()}
          </div>
          {!loading && pagination.totalItems > 0 && (
            <footer className="doctor-reviews__footer">
              <span>
                {this.getText("page", "Page")} {page} {this.getText("of", "of")} {pagination.totalPages}
              </span>
              <PagePagination
                page={page}
                totalPages={pagination.totalPages}
                onChange={(nextPage) => this.loadReviews(nextPage, rating, true)}
                className="doctor-reviews__pagination"
                previousLabel={this.getText("previous", "Previous")}
                nextLabel={this.getText("next", "Next")}
              />
            </footer>
          )}
        </div>
      </section>
    );
  }
}

export default injectIntl(DoctorReviews);
