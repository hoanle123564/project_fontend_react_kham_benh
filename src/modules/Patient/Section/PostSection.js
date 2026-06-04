import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Grid, Pagination } from "swiper/modules";
import moment from "moment";

import "swiper/css";
import "swiper/css/grid";
import "swiper/css/pagination";
import "./PostSection.scss";

import {
  buildImageSrc,
  getPublicPostCategories,
  getPublicPostsByCategory,
} from "../../../services/userService";
import { languages } from "../../../utils";

const HOME_POST_LIMIT = 1000;
const POST_SWIPER_BREAKPOINTS = {
  0: {
    slidesPerView: 1,
    grid: {
      rows: 2,
      fill: "row",
    },
  },
  768: {
    slidesPerView: 2,
    grid: {
      rows: 2,
      fill: "row",
    },
  },
  1200: {
    slidesPerView: 4,
    grid: {
      rows: 1,
      fill: "row",
    },
  },
};

const stripHtml = (value) =>
  String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

class PostSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      category: null,
      posts: [],
      isLoading: false,
      error: null,
      isLoaded: false,
    };
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    this.loadHomePosts();
  }

  componentWillUnmount() {
    this._isMounted = false;
  };

  loadHomePosts = async () => {
    if (!this._isMounted) {
      return;
    }

    this.setState({
      isLoading: true,
      error: null,
    });

    try {
      const categoryResponse = await getPublicPostCategories();
      const categories =
        categoryResponse?.errCode === 0 && Array.isArray(categoryResponse?.data)
          ? categoryResponse.data
          : [];

      const firstCategory = categories[0] || null;

      if (!firstCategory) {
        if (this._isMounted) {
          this.setState({
            category: null,
            posts: [],
            isLoading: false,
            error: null,
            isLoaded: true,
          });
        }
        return;
      }

      const postResponse = await getPublicPostsByCategory(firstCategory.slug, 1, HOME_POST_LIMIT);
      const postList =
        postResponse?.errCode === 0 && Array.isArray(postResponse?.data?.posts)
          ? postResponse.data.posts
          : [];

      if (this._isMounted) {
        this.setState({
          category: firstCategory,
          posts: postList,
          isLoading: false,
          error: null,
          isLoaded: true,
        });
      }
    } catch (error) {
      console.log("loadHomePosts error:", error);
      if (this._isMounted) {
        this.setState({
          category: null,
          posts: [],
          isLoading: false,
          error,
          isLoaded: true,
        });
      }
    }
  };

  handleViewCategory = () => {
    const { category } = this.state;

    if (category?.slug) {
      this.props.history.push(`/${category.slug}`);
    }
  };

  handleViewPost = (post) => {
    const { category } = this.state;
    const postCategories = Array.isArray(post?.categories) ? post.categories : [];
    const categorySlug = postCategories[0]?.slug || category?.slug;

    if (categorySlug && post?.slug) {
      this.props.history.push(`/${categorySlug}/${post.slug}`);
    }
  };

  renderSlides = () => {
    return this.state.posts.map((post) => {
      const imageSrc = buildImageSrc(post?.image);
      const publishedDate =
        post?.createdAt && moment(post.createdAt).isValid()
          ? moment(post.createdAt).format("DD/MM/YYYY")
          : "";
      const shortDescription = stripHtml(post?.shortDescription);

      return (
        <SwiperSlide key={post.id || post.slug}>
          <article className="post-card" onClick={() => this.handleViewPost(post)}>
            <div className={`post-card-media ${imageSrc ? "" : "is-fallback"}`}>
              {imageSrc ? (
                <img src={imageSrc} alt={post?.title || "post-thumbnail"} />
              ) : (
                <div className="post-card-fallback"></div>
              )}
              {publishedDate && (
                <div className="post-card-date">
                  <i className="far fa-calendar-alt"></i>
                  <span>{publishedDate}</span>
                </div>
              )}
            </div>

            <div className="post-card-content">
              <h3 className="post-card-title">{post?.title || ""}</h3>
              <p className="post-card-description">{shortDescription || ""}</p>
            </div>
          </article>
        </SwiperSlide>
      );
    });
  };

  render() {
    const { language } = this.props;
    const { category, posts, isLoading, isLoaded } = this.state;

    return (
      <section className="section-share section-posts">
        <div className="container section-container">
          <div className="section-header">
            <div className="title-section">
              {category?.name || (language === languages.VI ? "Danh mục bài viết" : "Post category")}
            </div>
            {category?.slug && (
              <button type="button" className="btn-section" onClick={this.handleViewCategory}>
                {language === languages.VI ? "Xem tất cả" : "View all"}
              </button>
            )}
          </div>

          <div className="post-section-body">
            {isLoading ? (
              <div className="post-empty-state">
                {language === languages.VI ? "Đang tải bài viết..." : "Loading posts..."}
              </div>
            ) : posts.length > 0 ? (
              <Swiper
                modules={[Grid, Pagination]}
                slidesPerView={1}
                grid={{
                  rows: 2,
                  fill: "row",
                }}
                spaceBetween={22}
                breakpoints={POST_SWIPER_BREAKPOINTS}
                pagination={{ clickable: true }}
                className="post-swiper"
              >
                {this.renderSlides()}
              </Swiper>
            ) : (
              <div className="post-empty-state">
                {isLoaded
                  ? language === languages.VI
                    ? "Không có bài viết nào để hiển thị"
                    : "No posts available"
                  : ""}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
});

export default withRouter(connect(mapStateToProps)(PostSection));
