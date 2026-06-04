import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import moment from "moment";

import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import BackToTop from "../../../../components/BackToTop/BackToTop";
import NotFound from "../../../NotFound";
import PostHeroHeader from "./PostHeroHeader";
import "./PostDetailPage.scss";

import {
  buildImageSrc,
  getPublicPostCategories,
  getPublicPostDetail,
  getPublicRelatedPosts,
} from "../../../../services/userService";
import { languages } from "../../../../utils";

class PostDetailPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      post: null,
      categories: [],
      relatedPosts: [],
      isLoading: false,
      error: null,
      notFound: false,
    };
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    this.loadPostPageData();
  }

  componentDidUpdate(prevProps) {
    const prevCategorySlug = prevProps.match?.params?.categorySlug;
    const prevPostSlug = prevProps.match?.params?.postSlug;
    const { categorySlug, postSlug } = this.getRouteParams();

    if (prevCategorySlug !== categorySlug || prevPostSlug !== postSlug) {
      this.loadPostPageData();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getRouteParams = () => ({
    categorySlug: this.props.match?.params?.categorySlug || "",
    postSlug: this.props.match?.params?.postSlug || "",
  });

  loadPostPageData = async () => {
    const { categorySlug, postSlug } = this.getRouteParams();

    if (!categorySlug || !postSlug || !this._isMounted) {
      return;
    }

    this.setState({
      post: null,
      relatedPosts: [],
      isLoading: true,
      error: null,
      notFound: false,
    });

    try {
      const [postResponse, categoryResponse, relatedResponse] = await Promise.all([
        getPublicPostDetail(categorySlug, postSlug),
        getPublicPostCategories().catch((error) => {
          console.log("load detail categories error:", error);
          return null;
        }),
        getPublicRelatedPosts(categorySlug, postSlug, 7).catch((error) => {
          console.log("load related posts error:", error);
          return null;
        }),
      ]);

      if (!this._isMounted) {
        return;
      }

      if (postResponse?.errCode !== 0 || !postResponse?.data) {
        this.setState({
          post: null,
          categories: [],
          relatedPosts: [],
          isLoading: false,
          error: postResponse?.errMessage || "Failed to load post detail",
          notFound: true,
        });
        return;
      }

      this.setState({
        post: postResponse.data,
        categories:
          categoryResponse?.errCode === 0 && Array.isArray(categoryResponse?.data)
            ? categoryResponse.data
            : [],
        relatedPosts:
          relatedResponse?.errCode === 0 && Array.isArray(relatedResponse?.data)
            ? relatedResponse.data
            : [],
        isLoading: false,
        error: null,
        notFound: false,
      });
    } catch (error) {
      console.log("loadPostPageData error:", error);
      if (this._isMounted) {
        this.setState({
          post: null,
          categories: [],
          relatedPosts: [],
          isLoading: false,
          error,
          notFound: true,
        });
      }
    }
  };

  handleViewCategory = (slug) => {
    if (slug) {
      this.props.history.push(`/${slug}`);
    }
  };

  handleViewRelatedPost = (relatedPost) => {
    const { categorySlug } = this.getRouteParams();
    const postCategories = Array.isArray(relatedPost?.categories) ? relatedPost.categories : [];
    const preferredCategory =
      postCategories.find((item) => item.slug === categorySlug) || postCategories[0];

    if (preferredCategory?.slug && relatedPost?.slug) {
      this.props.history.push(`/${preferredCategory.slug}/${relatedPost.slug}`);
    }
  };

  renderRelatedPosts = () => {
    const { language } = this.props;
    const { relatedPosts } = this.state;

    if (relatedPosts.length === 0) {
      return (
        <div className="related-empty">
          {language === languages.VI ? "Chưa có bài viết liên quan" : "No related posts"}
        </div>
      );
    }

    return relatedPosts.map((relatedPost) => {
      const imageSrc = buildImageSrc(relatedPost?.image);
      const relatedDate =
        relatedPost?.createdAt && moment(relatedPost.createdAt).isValid()
          ? moment(relatedPost.createdAt).format("DD/MM/YYYY")
          : "";

      return (
        <button
          type="button"
          className="related-item"
          key={relatedPost.id || relatedPost.slug}
          onClick={() => this.handleViewRelatedPost(relatedPost)}
        >
          <span className={`related-thumb ${imageSrc ? "" : "is-fallback"}`}>
            {imageSrc && <img src={imageSrc} alt={relatedPost?.title || "related-post"} />}
          </span>
          <span className="related-info">
            <span className="related-title">{relatedPost?.title || ""}</span>
            {relatedDate && <span className="related-date">{relatedDate}</span>}
          </span>
        </button>
      );
    });
  };

  render() {
    const { language } = this.props;
    const { categorySlug } = this.getRouteParams();
    const { post, categories, isLoading, notFound } = this.state;
    const contentHTML = post?.contentHTML || "";
    const publishedDate =
      post?.createdAt && moment(post.createdAt).isValid()
        ? moment(post.createdAt).format("DD/MM/YYYY")
        : "";

    if (notFound && !isLoading) {
      return <NotFound />;
    }

    return (
      <>
        <HomeHeader showBanner={false} hideBreadcrumb={true} />
        <BackToTop />

        <div className="post-detail-page">
          <PostHeroHeader
            title={post?.title || (language === languages.VI ? "Chi tiết bài viết" : "Post detail")}
            date={post?.createdAt}
            bannerImage={post?.bannerImage}
          />

          <section className="post-detail-content">
            <div className="container">
              {isLoading ? (
                <div className="post-detail-card post-empty-state">
                  {language === languages.VI ? "Đang tải bài viết..." : "Loading post..."}
                </div>
              ) : (
                <div className="row">
                  <div className="col-lg-8">
                    <div className="post-detail-card">
                      <h2 className="post-detail-title">{post?.title || ""}</h2>
                      {publishedDate && (
                        <div className="post-detail-meta">
                          <i className="far fa-calendar-alt"></i>
                          <span>{publishedDate}</span>
                        </div>
                      )}

                      <div
                        className="post-html-content"
                        dangerouslySetInnerHTML={{ __html: contentHTML }}
                      />

                      {post?.currentCategory?.slug && (
                        <button
                          type="button"
                          className="back-category-button"
                          onClick={() => this.handleViewCategory(post.currentCategory.slug)}
                        >
                          {language === languages.VI ? "Quay về danh mục" : "Back to category"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-4">
                    <aside className="post-detail-sidebar">
                      <div className="sidebar-card related-card">
                        <div className="sidebar-title">
                          {language === languages.VI ? "Bài viết liên quan" : "Related posts"}
                        </div>
                        <div className="related-list">{this.renderRelatedPosts()}</div>
                      </div>
                    </aside>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <HomeFooter />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
});

export default withRouter(connect(mapStateToProps)(PostDetailPage));
