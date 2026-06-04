import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import ReactPaginate from "react-paginate";
import moment from "moment";

import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import BackToTop from "../../../../components/BackToTop/BackToTop";
import NotFound from "../../../NotFound";
import PostHeroHeader from "./PostHeroHeader";
import "./PostCategoryPage.scss";

import {
  buildImageSrc,
  getPublicPostCategories,
  getPublicPostsByCategory,
} from "../../../../services/userService";
import { languages } from "../../../../utils";

const CATEGORY_PAGE_LIMIT = 7;

const stripHtml = (value) =>
  String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

class PostCategoryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      category: null,
      categories: [],
      posts: [],
      page: 1,
      limit: CATEGORY_PAGE_LIMIT,
      total: 0,
      totalPages: 0,
      currentPage: 1,
      isLoading: false,
      error: null,
      notFound: false,
    };
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    this.loadCategories();
    this.loadPostsByCategory(this.getCategorySlug(), this.state.page);
  }

  componentDidUpdate(prevProps, prevState) {
    const prevCategorySlug = prevProps.match?.params?.categorySlug;
    const currentCategorySlug = this.getCategorySlug();

    if (prevCategorySlug !== currentCategorySlug) {
      if (this.state.page !== 1) {
        this.setState({
          page: 1,
          category: null,
          posts: [],
          total: 0,
          totalPages: 0,
          currentPage: 1,
          notFound: false,
          error: null,
          isLoading: true,
        });
        return;
      }

      this.loadPostsByCategory(currentCategorySlug, 1);
      return;
    }

    if (prevState.page !== this.state.page) {
      this.loadPostsByCategory(currentCategorySlug, this.state.page);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getCategorySlug = () => this.props.match?.params?.categorySlug || "";

  loadCategories = async () => {
    try {
      const response = await getPublicPostCategories();
      const categories =
        response?.errCode === 0 && Array.isArray(response?.data) ? response.data : [];

      if (this._isMounted) {
        this.setState({ categories });
      }
    } catch (error) {
      console.log("loadCategories error:", error);
      if (this._isMounted) {
        this.setState({ categories: [] });
      }
    }
  };

  loadPostsByCategory = async (categorySlug, page) => {
    if (!categorySlug || !this._isMounted) {
      return;
    }

    this.setState({
      isLoading: true,
      error: null,
      notFound: false,
      category: null,
      posts: [],
      total: 0,
      totalPages: 0,
      currentPage: page,
    });

    try {
      const response = await getPublicPostsByCategory(categorySlug, page, this.state.limit);

      if (!this._isMounted) {
        return;
      }

      if (response?.errCode !== 0) {
        this.setState({
          category: null,
          posts: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
          isLoading: false,
          error: response?.errMessage || "Failed to load posts",
          notFound: true,
        });
        return;
      }

      const data = response?.data || {};

      this.setState({
        category: data.category || null,
        posts: Array.isArray(data.posts) ? data.posts : [],
        total: Number(data.total) || 0,
        totalPages: Number(data.totalPages) || 0,
        currentPage: Number(data.currentPage) || page,
        isLoading: false,
        error: null,
        notFound: false,
      });
    } catch (error) {
      console.log("loadPostsByCategory error:", error);
      if (this._isMounted) {
        this.setState({
          category: null,
          posts: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
          isLoading: false,
          error,
          notFound: true,
        });
      }
    }
  };

  handlePageClick = (event) => {
    const nextPage = Number(event?.selected) + 1;

    if (nextPage > 0 && nextPage !== this.state.page) {
      this.setState({ page: nextPage });
    }
  };

  handleViewCategory = (slug) => {
    if (slug) {
      this.props.history.push(`/${slug}`);
    }
  };

  handleViewPost = (post) => {
    const currentCategorySlug = this.getCategorySlug();
    const postCategories = Array.isArray(post?.categories) ? post.categories : [];
    const targetCategorySlug = currentCategorySlug || postCategories[0]?.slug;

    if (targetCategorySlug && post?.slug) {
      this.props.history.push(`/${targetCategorySlug}/${post.slug}`);
    }
  };

  renderPostList = () => {
    const { posts } = this.state;

    return posts.map((post) => {
      const imageSrc = buildImageSrc(post?.image);
      const publishedDate =
        post?.createdAt && moment(post.createdAt).isValid()
          ? moment(post.createdAt).format("DD/MM/YYYY")
          : "";

      return (
        <article className="post-list-item" key={post.id || post.slug}>
          <button
            type="button"
            className={`post-item-image ${imageSrc ? "" : "is-fallback"}`}
            onClick={() => this.handleViewPost(post)}
          >
            {imageSrc ? (
              <img src={imageSrc} alt={post?.title || "post-thumbnail"} />
            ) : (
              <div className="post-image-fallback">
                <span>{publishedDate || "..."}</span>
              </div>
            )}
          </button>

          <div className="post-item-content">
            {publishedDate && (
              <div className="post-item-date">
                <i className="far fa-calendar-alt"></i>
                <span>{publishedDate}</span>
              </div>
            )}

            <button
              type="button"
              className="post-item-title"
              onClick={() => this.handleViewPost(post)}
            >
              {post?.title || ""}
            </button>

            <p className="post-item-description">{stripHtml(post?.shortDescription)}</p>
          </div>
        </article>
      );
    });
  };

  render() {
    const { language } = this.props;
    const { category, categories, posts, page, totalPages, isLoading, notFound } = this.state;
    const categorySlug = this.getCategorySlug();

    if (notFound && !isLoading) {
      return <NotFound />;
    }

    return (
      <>
        <HomeHeader showBanner={false} hideBreadcrumb={true} />
        <BackToTop />

        <div className="post-category-page">
          <PostHeroHeader
            title={category?.name || (language === languages.VI ? "Danh mục bài viết" : "Post category")}
          />

          <section className="post-category-content">
            <div className="container">
              <div className="row">
                <div className="col-lg-8">
                  <div className="post-list-panel">
                    {isLoading ? (
                      <div className="post-empty-state">
                        {language === languages.VI ? "Đang tải bài viết..." : "Loading posts..."}
                      </div>
                    ) : posts.length > 0 ? (
                      <>
                        <div className="post-list">{this.renderPostList()}</div>

                        {totalPages > 1 && (
                          <ReactPaginate
                            breakLabel="..."
                            nextLabel=">"
                            onPageChange={this.handlePageClick}
                            pageRangeDisplayed={3}
                            marginPagesDisplayed={1}
                            pageCount={totalPages}
                            previousLabel="<"
                            forcePage={Math.max(page - 1, 0)}
                            containerClassName="post-pagination"
                            pageClassName="pagination-page"
                            pageLinkClassName="pagination-link"
                            previousClassName="pagination-page pagination-prev"
                            nextClassName="pagination-page pagination-next"
                            previousLinkClassName="pagination-link"
                            nextLinkClassName="pagination-link"
                            breakClassName="pagination-break"
                            breakLinkClassName="pagination-link"
                            activeClassName="active"
                            disabledClassName="disabled"
                          />
                        )}
                      </>
                    ) : (
                      <div className="post-empty-state">Không có bài viết nào để hiển thị</div>
                    )}
                  </div>
                </div>

                <div className="col-lg-4">
                  <aside className="post-sidebar">
                    <div className="sidebar-card">
                      <div className="sidebar-title">
                        {language === languages.VI ? "Danh mục" : "Categories"}
                      </div>

                      <div className="sidebar-list">
                        {categories.map((item) => {
                          const isActive = item.slug === categorySlug;

                          return (
                            <button
                              type="button"
                              key={item.id}
                              className={`sidebar-item ${isActive ? "active" : ""}`}
                              onClick={() => this.handleViewCategory(item.slug)}
                            >
                              {item.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
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

export default withRouter(connect(mapStateToProps)(PostCategoryPage));
