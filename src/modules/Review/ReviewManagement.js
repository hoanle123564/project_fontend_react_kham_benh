import React, { Component } from "react";
import { injectIntl } from "react-intl";
import moment from "moment";
import { toast } from "react-toastify";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import PagePagination from "../../components/Pagination/PagePagination";
import { buildImageSrc } from "../../utils/imageUtils";
import userDefault from "../../assets/user_default.png";
import {
  createDoctorReviewReply,
  getAdminReviews,
  getDoctorReviews,
  getLookUp,
  updateAdminReviewVisibility,
  updateDoctorReviewReply,
} from "../../services/userService";
import "./ReviewManagement.scss";

const PAGE_SIZE = 10;
const STAR_VALUES = [5, 4, 3, 2, 1];
const REVIEW_TEXT_MAX = 1000;
const DATE_PRESETS = ["today", "yesterday", "last7", "last30", "thisMonth", "lastMonth"];

const emptySummary = () => ({
  averageRating: 0,
  totalReviews: 0,
  ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  ratingPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
});

class ReviewManagement extends Component {
  state = {
    reviews: [],
    statuses: [],
    summary: emptySummary(),
    pagination: { page: 1, limit: PAGE_SIZE, totalItems: 0, totalPages: 1 },
    loading: true,
    errorMessage: "",
    rating: "",
    status: "",
    search: "",
    dateFrom: "",
    dateTo: "",
    datePreset: "",
    dateError: "",
    focusedReviewId: "",
    editingReplyId: null,
    replyDraftById: {},
    savingReplyId: null,
    visibilityModal: null,
    visibilityReason: "",
    updatingVisibility: false,
  };

  componentDidMount() {
    const focusedReviewId = new URLSearchParams(this.props.location?.search || "").get("reviewId") || "";
    this.setState({ focusedReviewId }, () => {
      this.loadStatuses();
      this.loadReviews({ page: 1 });
    });
  }

  getText = (key, defaultMessage, values) =>
    this.props.intl.formatMessage(
      {
        id: `review-management.${key}`,
        defaultMessage,
      },
      values
    );

  isAdmin = () => Boolean(this.props.adminMode);

  loadStatuses = async () => {
    try {
      const response = await getLookUp("REVIEW_STATUS");
      if (response?.errCode === 0) {
        this.setState({ statuses: response.data || [] });
      }
    } catch (error) {
      this.setState({ statuses: [] });
    }
  };

  buildParams = (overrides = {}) => {
    const state = { ...this.state, ...overrides };
    const params = {
      page: state.page || state.pagination.page || 1,
      limit: PAGE_SIZE,
      rating: state.rating,
      status: state.status,
      dateFrom: state.dateFrom,
      dateTo: state.dateTo,
    };

    if (this.isAdmin()) {
      params.search = state.search;
    } else if (state.focusedReviewId) {
      params.reviewId = state.focusedReviewId;
    }

    return params;
  };

  validateDateRange = (dateFrom, dateTo) => {
    const today = moment().startOf("day");
    const from = dateFrom ? moment(dateFrom, "YYYY-MM-DD", true) : null;
    const to = dateTo ? moment(dateTo, "YYYY-MM-DD", true) : null;

    if ((dateFrom && !from.isValid()) || (dateTo && !to.isValid())) {
      return this.getText("invalidDate", "Invalid date range.");
    }
    if ((from && from.isAfter(today)) || (to && to.isAfter(today))) {
      return this.getText("futureDate", "Date range cannot include future dates.");
    }
    if (from && to) {
      if (from.isAfter(to)) {
        return this.getText("dateOrder", "Start date cannot be after end date.");
      }
      if (to.diff(from, "days") + 1 > 30) {
        return this.getText("dateTooLong", "Date range cannot exceed 30 days.");
      }
    }
    return "";
  };

  loadReviews = async (overrides = {}) => {
    const params = this.buildParams(overrides);
    const dateError = this.validateDateRange(params.dateFrom, params.dateTo);
    if (dateError) {
      this.setState({ dateError, loading: false });
      return;
    }

    this.setState({ loading: true, errorMessage: "", dateError: "" });
    try {
      const request = this.isAdmin() ? getAdminReviews : getDoctorReviews;
      const response = await request(params);
      const payload = response?.data || response || {};
      if (response?.errCode !== 0 && payload?.errCode !== 0) {
        this.setState({
          loading: false,
          errorMessage: response?.errMessage || payload?.errMessage || this.getText("loadError", "Could not load reviews."),
        });
        return;
      }

      this.setState({
        reviews: payload.reviews || [],
        summary: payload.summary || emptySummary(),
        pagination: payload.pagination || { page: params.page, limit: PAGE_SIZE, totalItems: 0, totalPages: 1 },
        loading: false,
      });
    } catch (error) {
      const data = error.response?.data;
      this.setState({
        loading: false,
        errorMessage: data?.errMessage || this.getText("loadError", "Could not load reviews."),
      });
    }
  };

  clearFocusedReview = () => {
    if (this.state.focusedReviewId) {
      this.setState({ focusedReviewId: "" });
    }
  };

  handleFilterChange = (field, value) => {
    this.setState(
      {
        [field]: value,
        focusedReviewId: "",
        pagination: { ...this.state.pagination, page: 1 },
      },
      () => this.loadReviews({ page: 1 })
    );
  };

  getPresetRange = (preset) => {
    const today = moment().startOf("day");
    switch (preset) {
      case "today":
        return { dateFrom: today.format("YYYY-MM-DD"), dateTo: today.format("YYYY-MM-DD") };
      case "yesterday": {
        const yesterday = today.clone().subtract(1, "day");
        return { dateFrom: yesterday.format("YYYY-MM-DD"), dateTo: yesterday.format("YYYY-MM-DD") };
      }
      case "last7":
        return { dateFrom: today.clone().subtract(6, "days").format("YYYY-MM-DD"), dateTo: today.format("YYYY-MM-DD") };
      case "last30":
        return { dateFrom: today.clone().subtract(29, "days").format("YYYY-MM-DD"), dateTo: today.format("YYYY-MM-DD") };
      case "thisMonth":
        return { dateFrom: today.clone().startOf("month").format("YYYY-MM-DD"), dateTo: today.format("YYYY-MM-DD") };
      case "lastMonth": {
        const start = today.clone().subtract(1, "month").startOf("month");
        const end = start.clone().endOf("month");
        return { dateFrom: start.format("YYYY-MM-DD"), dateTo: end.format("YYYY-MM-DD") };
      }
      default:
        return { dateFrom: "", dateTo: "" };
    }
  };

  handlePreset = (preset) => {
    const range = this.getPresetRange(preset);
    this.setState(
      {
        ...range,
        datePreset: preset,
        focusedReviewId: "",
        pagination: { ...this.state.pagination, page: 1 },
      },
      () => this.loadReviews({ page: 1 })
    );
  };

  resetFilters = () => {
    this.setState(
      {
        rating: "",
        status: "",
        search: "",
        dateFrom: "",
        dateTo: "",
        datePreset: "",
        dateError: "",
        focusedReviewId: "",
        pagination: { ...this.state.pagination, page: 1 },
      },
      () => this.loadReviews({ page: 1 })
    );
  };

  formatDate = (value) => {
    if (!value) return "-";
    const parsed = moment(value);
    return parsed.isValid() ? parsed.format("DD/MM/YYYY") : "-";
  };

  getAvatar = (image) => buildImageSrc(image) || userDefault;

  getStatusLabel = (review) => {
    const status = this.state.statuses.find((item) => item.keyMap === review.statusId);
    if (status) {
      return this.props.intl.locale === "vi" ? status.value_vi || review.statusId : status.value_en || review.statusId;
    }
    return review.isHidden
      ? this.getText("hidden", "Hidden")
      : this.getText("visible", "Visible");
  };

  renderStars = (rating) => (
    <span className="review-management__stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <i key={star} className="fas fa-star" aria-hidden="true" data-active={star <= Number(rating)}></i>
      ))}
    </span>
  );

  renderSummary = () => {
    const { summary, rating } = this.state;
    const average = Number(summary.averageRating || 0).toFixed(1);

    return (
      <section className="review-management__summary">
        <div className="review-management__score">
          <span>{this.getText("average", "Average rating")}</span>
          <strong>{average}/5</strong>
          <small>{this.getText("totalReviews", "{count} reviews", { count: summary.totalReviews || 0 })}</small>
        </div>
        <div className="review-management__distribution">
          {STAR_VALUES.map((star) => (
            <button
              type="button"
              key={star}
              className={Number(rating) === star ? "selected" : ""}
              onClick={() => this.handleFilterChange("rating", Number(rating) === star ? "" : star)}
            >
              <span>{this.getText("starFilter", "{count} stars", { count: star })}</span>
              <span className="review-management__bar">
                <span style={{ width: `${summary.ratingPercentages?.[star] || 0}%` }}></span>
              </span>
              <strong>{summary.ratingCounts?.[star] || 0}</strong>
            </button>
          ))}
        </div>
      </section>
    );
  };

  renderFilters = () => (
    <section className="review-management__filters" aria-label={this.getText("filters", "Review filters")}>
      {this.isAdmin() && (
        <label className="review-management__search">
          <span>{this.getText("search", "Search")}</span>
          <div>
            <i className="bi bi-search" aria-hidden="true"></i>
            <input
              value={this.state.search}
              name="reviewSearch"
              autoComplete="off"
              placeholder={this.getText("searchPlaceholder", "Patient or doctor name")}
              onChange={(event) => this.setState({ search: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === "Enter") this.handleFilterChange("search", this.state.search);
              }}
            />
          </div>
        </label>
      )}
      <label>
        <span>{this.getText("rating", "Rating")}</span>
        <select
          value={this.state.rating}
          name="reviewRating"
          onChange={(event) => this.handleFilterChange("rating", event.target.value)}
        >
          <option value="">{this.getText("allRatings", "All ratings")}</option>
          {STAR_VALUES.map((star) => (
            <option value={star} key={star}>
              {this.getText("starFilter", "{count} stars", { count: star })}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{this.getText("status", "Status")}</span>
        <select
          value={this.state.status}
          name="reviewStatus"
          onChange={(event) => this.handleFilterChange("status", event.target.value)}
        >
          <option value="">{this.getText("allStatuses", "All statuses")}</option>
          {this.state.statuses.map((status) => (
            <option value={status.keyMap} key={status.keyMap}>
              {this.props.intl.locale === "vi" ? status.value_vi : status.value_en}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{this.getText("dateFrom", "From")}</span>
        <input
          type="date"
          value={this.state.dateFrom}
          max={moment().format("YYYY-MM-DD")}
          onChange={(event) => {
            this.setState(
              {
                dateFrom: event.target.value,
                datePreset: "custom",
                focusedReviewId: "",
                pagination: { ...this.state.pagination, page: 1 },
              },
              () => this.loadReviews({ page: 1 })
            );
          }}
        />
      </label>
      <label>
        <span>{this.getText("dateTo", "To")}</span>
        <input
          type="date"
          value={this.state.dateTo}
          max={moment().format("YYYY-MM-DD")}
          onChange={(event) => {
            this.setState(
              {
                dateTo: event.target.value,
                datePreset: "custom",
                focusedReviewId: "",
                pagination: { ...this.state.pagination, page: 1 },
              },
              () => this.loadReviews({ page: 1 })
            );
          }}
        />
      </label>
      <div className="review-management__preset-list">
        {DATE_PRESETS.map((preset) => (
          <button
            type="button"
            key={preset}
            className={this.state.datePreset === preset ? "active" : ""}
            onClick={() => this.handlePreset(preset)}
          >
            {this.getText(`preset.${preset}`, preset)}
          </button>
        ))}
      </div>
      <button type="button" className="review-management__filter-action" onClick={() => this.loadReviews({ page: 1 })}>
        <i className="bi bi-search" aria-hidden="true"></i>
        {this.getText("applyFilters", "Apply")}
      </button>
      <button type="button" className="review-management__filter-action secondary" onClick={this.resetFilters}>
        <i className="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
        {this.getText("reset", "Reset")}
      </button>
      {this.state.dateError && <div className="review-management__filter-error">{this.state.dateError}</div>}
    </section>
  );

  openReplyEditor = (review) => {
    this.setState((state) => ({
      editingReplyId: review.id,
      replyDraftById: {
        ...state.replyDraftById,
        [review.id]: review.reply?.content || "",
      },
    }));
  };

  saveReply = async (review) => {
    const content = String(this.state.replyDraftById[review.id] || "").trim();
    if (!content) {
      this.setState({ errorMessage: this.getText("replyRequired", "Reply content is required.") });
      return;
    }

    this.setState({ savingReplyId: review.id, errorMessage: "" });
    try {
      const request = review.reply ? updateDoctorReviewReply : createDoctorReviewReply;
      const response = await request(review.id, { content });
      const updatedReview = response?.data || response;
      if (response?.errCode !== 0) {
        this.setState({
          savingReplyId: null,
          errorMessage: response?.errMessage || this.getText("replyError", "Could not save reply."),
        });
        return;
      }

      this.setState((state) => ({
        reviews: state.reviews.map((item) => (item.id === review.id ? updatedReview : item)),
        editingReplyId: null,
        savingReplyId: null,
      }));
      toast.success(this.getText("replySuccess", "Reply saved."));
    } catch (error) {
      const data = error.response?.data;
      this.setState({
        savingReplyId: null,
        errorMessage: data?.errMessage || this.getText("replyError", "Could not save reply."),
      });
    }
  };

  renderDoctorReviewCard = (review) => {
    const editing = this.state.editingReplyId === review.id;
    const draft = this.state.replyDraftById[review.id] || "";
    const highlighted = String(review.id) === String(this.state.focusedReviewId);

    return (
      <article
        className={`review-management__card ${highlighted ? "highlighted" : ""}`}
        key={review.id}
      >
        <img src={this.getAvatar(review.patientImage)} alt={review.patientName || ""} width="54" height="54" />
        <div className="review-management__card-body">
          <header>
            <div>
              <strong>{review.patientName || "-"}</strong>
              <time>{this.formatDate(review.createdAt)}</time>
            </div>
            <div className="review-management__card-meta">
              {this.renderStars(review.rating)}
              <span className={`review-management__status ${review.isHidden ? "hidden" : "visible"}`}>
                {this.getStatusLabel(review)}
              </span>
            </div>
          </header>
          <p>{review.comment}</p>
          {review.isHidden && review.hiddenReason && (
            <div className="review-management__hidden-note">
              {this.getText("hiddenReason", "Hidden reason")}: {review.hiddenReason}
            </div>
          )}
          {review.reply && (
            <div className="review-management__reply">
              <span>{this.getText("doctorReply", "Doctor reply")}</span>
              <p>{review.reply.content}</p>
            </div>
          )}
          {editing ? (
            <div className="review-management__reply-form">
              <textarea
                rows="4"
                maxLength={REVIEW_TEXT_MAX}
                value={draft}
                onChange={(event) =>
                  this.setState({
                    replyDraftById: {
                      ...this.state.replyDraftById,
                      [review.id]: event.target.value,
                    },
                  })
                }
              />
              <small>{this.getText("remaining", "{count} characters remaining", { count: REVIEW_TEXT_MAX - draft.length })}</small>
              <div>
                <button type="button" className="secondary" onClick={() => this.setState({ editingReplyId: null })}>
                  {this.getText("cancel", "Cancel")}
                </button>
                <button
                  type="button"
                  disabled={this.state.savingReplyId === review.id || !draft.trim()}
                  onClick={() => this.saveReply(review)}
                >
                  {this.state.savingReplyId === review.id
                    ? this.getText("saving", "Saving...")
                    : this.getText("saveReply", "Save reply")}
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="review-management__reply-button" onClick={() => this.openReplyEditor(review)}>
              <i className="bi bi-reply" aria-hidden="true"></i>
              {review.reply ? this.getText("editReply", "Edit reply") : this.getText("reply", "Reply")}
            </button>
          )}
        </div>
      </article>
    );
  };

  openVisibilityModal = (review, hidden) => {
    this.setState({
      visibilityModal: { review, hidden },
      visibilityReason: "",
      errorMessage: "",
    });
  };

  closeVisibilityModal = () => {
    if (this.state.updatingVisibility) return;
    this.setState({ visibilityModal: null, visibilityReason: "", errorMessage: "" });
  };

  confirmVisibility = async () => {
    const { visibilityModal, visibilityReason } = this.state;
    if (!visibilityModal) return;
    if (visibilityModal.hidden && !visibilityReason.trim()) {
      this.setState({ errorMessage: this.getText("reasonRequired", "Hidden reason is required.") });
      return;
    }

    this.setState({ updatingVisibility: true, errorMessage: "" });
    try {
      const response = await updateAdminReviewVisibility(visibilityModal.review.id, {
        hidden: visibilityModal.hidden,
        reason: visibilityReason.trim(),
      });
      if (response?.errCode !== 0) {
        this.setState({
          updatingVisibility: false,
          errorMessage: response?.errMessage || this.getText("visibilityError", "Could not update review."),
        });
        return;
      }

      toast.success(
        visibilityModal.hidden
          ? this.getText("hideSuccess", "Review hidden.")
          : this.getText("restoreSuccess", "Review restored.")
      );
      this.setState(
        { updatingVisibility: false, visibilityModal: null, visibilityReason: "" },
        () => this.loadReviews({ page: this.state.pagination.page })
      );
    } catch (error) {
      const data = error.response?.data;
      this.setState({
        updatingVisibility: false,
        errorMessage: data?.errMessage || this.getText("visibilityError", "Could not update review."),
      });
    }
  };

  renderAdminTable = () => {
    const startIndex = ((this.state.pagination.page || 1) - 1) * PAGE_SIZE;
    return (
      <div className="review-management__table-wrap">
        <table>
          <thead>
            <tr>
              <th>{this.getText("index", "No.")}</th>
              <th>{this.getText("patient", "Patient")}</th>
              <th>{this.getText("doctor", "Doctor")}</th>
              <th>{this.getText("review", "Review")}</th>
              <th>{this.getText("stars", "Stars")}</th>
              <th>{this.getText("date", "Date")}</th>
              <th>{this.getText("status", "Status")}</th>
              <th>{this.getText("actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {this.state.reviews.map((review, index) => (
              <tr key={review.id}>
                <td>{startIndex + index + 1}</td>
                <td>
                  <span className="review-management__person">
                    <img src={this.getAvatar(review.patientImage)} alt="" width="36" height="36" />
                    <span>{review.patientName || "-"}</span>
                  </span>
                </td>
                <td>
                  <span className="review-management__person">
                    <img src={this.getAvatar(review.doctorImage)} alt="" width="36" height="36" />
                    <span>
                      <strong>{review.doctorName || "-"}</strong>
                      <small>{review.specialtyName || "-"}</small>
                    </span>
                  </span>
                </td>
                <td className="review-management__clamped" title={review.comment}>{review.comment}</td>
                <td>
                  <span className="review-management__rating-number">{review.rating}</span>
                  {this.renderStars(review.rating)}
                </td>
                <td>{this.formatDate(review.createdAt)}</td>
                <td>
                  <span className={`review-management__status ${review.isHidden ? "hidden" : "visible"}`}>
                    {this.getStatusLabel(review)}
                  </span>
                </td>
                <td>
                  {review.isHidden ? (
                    <button type="button" className="review-management__restore" onClick={() => this.openVisibilityModal(review, false)}>
                      {this.getText("restore", "Restore")}
                    </button>
                  ) : (
                    <button type="button" className="review-management__hide" onClick={() => this.openVisibilityModal(review, true)}>
                      {this.getText("hide", "Hide")}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  renderVisibilityModal = () => {
    const { visibilityModal, visibilityReason, updatingVisibility } = this.state;
    const isHide = Boolean(visibilityModal?.hidden);
    return (
      <Modal isOpen={Boolean(visibilityModal)} toggle={this.closeVisibilityModal} centered>
        <ModalHeader toggle={this.closeVisibilityModal}>
          {isHide ? this.getText("hideTitle", "Hide review") : this.getText("restoreTitle", "Restore review")}
        </ModalHeader>
        <ModalBody>
          <p className="review-management__modal-copy">
            {isHide
              ? this.getText("hideCopy", "This review will be removed from the public doctor profile.")
              : this.getText("restoreCopy", "This review will be visible on the public doctor profile again.")}
          </p>
          {isHide && (
            <label className="review-management__modal-field">
              <span>{this.getText("reason", "Reason")}</span>
              <textarea
                rows="4"
                maxLength={REVIEW_TEXT_MAX}
                value={visibilityReason}
                onChange={(event) => this.setState({ visibilityReason: event.target.value, errorMessage: "" })}
              />
            </label>
          )}
          {this.state.errorMessage && <div className="review-management__alert">{this.state.errorMessage}</div>}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" type="button" onClick={this.closeVisibilityModal} disabled={updatingVisibility}>
            {this.getText("cancel", "Cancel")}
          </Button>
          <Button
            color={isHide ? "danger" : "primary"}
            type="button"
            onClick={this.confirmVisibility}
            disabled={updatingVisibility || (isHide && !visibilityReason.trim())}
          >
            {updatingVisibility
              ? this.getText("saving", "Saving...")
              : isHide
                ? this.getText("confirmHide", "Hide")
                : this.getText("confirmRestore", "Restore")}
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  renderContent = () => {
    const { loading, reviews, errorMessage } = this.state;
    if (loading && reviews.length === 0) {
      return <div className="review-management__state">{this.getText("loading", "Loading reviews...")}</div>;
    }
    if (errorMessage && reviews.length === 0) {
      return <div className="review-management__state error">{errorMessage}</div>;
    }
    if (!reviews.length) {
      return <div className="review-management__state">{this.getText("empty", "No reviews found.")}</div>;
    }
    return this.isAdmin() ? this.renderAdminTable() : reviews.map(this.renderDoctorReviewCard);
  };

  render() {
    const { pagination, errorMessage, loading } = this.state;
    const page = Math.min(pagination.page || 1, pagination.totalPages || 1);
    const title = this.isAdmin()
      ? this.getText("adminTitle", "Review management")
      : this.getText("doctorTitle", "Patient reviews");

    return (
      <div className="review-management">
        <div className="review-management__inner">
          <div className="review-management__header">
            <div>
              <span>{this.getText("eyebrow", "Care feedback")}</span>
              <h1>{title}</h1>
              <p>{this.getText("subtitle", "Track doctor ratings, replies, and moderation state.")}</p>
            </div>
            <button type="button" onClick={() => this.loadReviews({ page })}>
              <i className="bi bi-arrow-clockwise" aria-hidden="true"></i>
              {this.getText("refresh", "Refresh")}
            </button>
          </div>
          {this.renderSummary()}
          {this.renderFilters()}
          {errorMessage && this.state.reviews.length > 0 && (
            <div className="review-management__alert" role="alert">{errorMessage}</div>
          )}
          <section className={`review-management__content ${this.isAdmin() ? "admin" : "doctor"}`} aria-busy={loading}>
            {this.renderContent()}
          </section>
          {!loading && pagination.totalItems > 0 && (
            <footer className="review-management__footer">
              <span>
                {this.getText("page", "Page")} {page} {this.getText("of", "of")} {pagination.totalPages}
              </span>
              <PagePagination
                page={page}
                totalPages={pagination.totalPages}
                onChange={(nextPage) => this.loadReviews({ page: nextPage })}
                className="review-management__pagination"
                previousLabel={this.getText("previous", "Previous")}
                nextLabel={this.getText("next", "Next")}
              />
            </footer>
          )}
        </div>
        {this.renderVisibilityModal()}
      </div>
    );
  }
}

export default injectIntl(ReviewManagement);
