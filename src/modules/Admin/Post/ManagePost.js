import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { FormattedMessage } from "react-intl";
import { toast } from "react-toastify";
import moment from "moment";
import "moment/locale/vi";
import {
    ChangeStatusPost,
    DeletePost,
    getAllPost,
    getAllPostCategory,
    updatePostOrder,
} from "../../../services/userService";
import "./ManagePost.scss";

const clonePosts = (posts = []) => posts.map((item) => ({ ...item }));

class ManagePost extends Component {
    constructor(props) {
        super(props);
        this.state = {
            posts: [],
            originalPosts: [],
            categories: [],
            currentPage: 1,
            totalPages: 0,
            total: 0,
            limit: 10,
            keyword: "",
            categoryId: "",
            isActive: "",
            previewImg: "",
            isOpenPreview: false,
            isOrderChanged: false,
            draggedIndex: null,
        };
    }

    componentDidMount() {
        this.loadCategories();
        this.loadPosts(1);
    }

    loadCategories = async () => {
        try {
            const res = await getAllPostCategory();
            this.setState({
                categories: res?.data || [],
            });
        } catch (error) {
            console.log("loadCategories error", error);
            toast.error("Failed to load post categories.");
        }
    };

    loadPosts = async (page = this.state.currentPage) => {
        const { limit, keyword, categoryId, isActive } = this.state;

        try {
            const res = await getAllPost(page, limit, keyword, categoryId, isActive);
            const data = res?.data || {};

            this.setState({
                posts: data.posts || [],
                originalPosts: clonePosts(data.posts || []),
                total: data.total || 0,
                totalPages: data.totalPages || 0,
                currentPage: data.currentPage || page,
                isOrderChanged: false,
                draggedIndex: null,
            });
        } catch (error) {
            console.log("loadPosts error", error);
            toast.error("Failed to load posts.");
        }
    };

    handleFilterChange = (event, field) => {
        this.setState({
            [field]: event.target.value,
        });
    };

    handleSearch = async () => {
        if (!this.confirmDiscardOrderChanges()) {
            return;
        }
        await this.loadPosts(1);
    };

    handleReset = async () => {
        if (!this.confirmDiscardOrderChanges()) {
            return;
        }

        this.setState(
            {
                keyword: "",
                categoryId: "",
                isActive: "",
            },
            async () => {
                await this.loadPosts(1);
            }
        );
    };

    handlePageChange = async (pageNumber) => {
        if (!this.confirmDiscardOrderChanges()) {
            return;
        }
        await this.loadPosts(pageNumber);
    };

    confirmDiscardOrderChanges = () => {
        if (!this.state.isOrderChanged) {
            return true;
        }

        return window.confirm("Bạn có thay đổi thứ tự chưa lưu. Tiếp tục sẽ bỏ các thay đổi này, bạn có muốn tiếp tục không?");
    };

    canEnableDragDrop = () => {
        const { keyword, categoryId, isActive } = this.state;
        return !String(keyword || "").trim() && !categoryId && isActive === "";
    };

    openPreview = (img) => {
        this.setState({
            previewImg: img,
            isOpenPreview: true,
        });
    };

    closePreview = () => {
        this.setState({
            previewImg: "",
            isOpenPreview: false,
        });
    };

    getImageSrc = (image) => {
        if (!image) {
            return "";
        }

        return image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;
    };

    handleCreatePost = () => {
        this.props.history.push("/system/add-post");
    };

    handleEditPost = (post) => {
        this.props.history.push(`/system/edit-post/${post.id}`);
    };

    handleToggleStatus = async (post) => {
        const nextIsActive = Number(post.isActive) === 1 ? 0 : 1;
        const previousPosts = clonePosts(this.state.posts);
        const previousOriginalPosts = clonePosts(this.state.originalPosts);

        const nextPosts = this.state.posts.map((item) =>
            item.id === post.id ? { ...item, isActive: nextIsActive } : item
        );

        const nextOriginalPosts = this.state.originalPosts.map((item) =>
            item.id === post.id ? { ...item, isActive: nextIsActive } : item
        );

        this.setState({
            posts: nextPosts,
            originalPosts: nextOriginalPosts,
        });

        try {
            const res = await ChangeStatusPost({
                id: post.id,
                isActive: nextIsActive,
            });

            if (res && res.errCode === 0) {
                toast.success("Update post status successfully!");
            } else {
                this.setState({
                    posts: previousPosts,
                    originalPosts: previousOriginalPosts,
                });
                toast.error(res?.errMessage || "Failed to update post status.");
            }
        } catch (error) {
            console.log("handleToggleStatus error", error);
            this.setState({
                posts: previousPosts,
                originalPosts: previousOriginalPosts,
            });
            toast.error("Failed to update post status.");
        }
    };

    handleDeletePost = async (postId) => {
        const confirmDelete = window.confirm("Bạn có chắc muốn xóa bài viết này không?");
        if (!confirmDelete) {
            return;
        }

        try {
            const res = await DeletePost(postId);
            if (res && res.errCode === 0) {
                toast.success("Delete post successfully!");
                const nextPage = this.state.posts.length === 1 && this.state.currentPage > 1
                    ? this.state.currentPage - 1
                    : this.state.currentPage;
                await this.loadPosts(nextPage);
            } else {
                toast.error(res?.errMessage || "Failed to delete post.");
            }
        } catch (error) {
            console.log("handleDeletePost error", error);
            toast.error("Failed to delete post.");
        }
    };

    formatDate = (value) => {
        if (!value) {
            return "--";
        }

        return moment(value).format("DD/MM/YYYY HH:mm");
    };

    handleDragStart = (index) => (event) => {
        if (!this.canEnableDragDrop() || event.target.closest(".prevent-row-drag")) {
            event.preventDefault();
            return;
        }

        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(index));
        this.setState({ draggedIndex: index });
    };

    handleDragOver = (event) => {
        if (!this.canEnableDragDrop()) {
            return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    };

    handleDrop = (dropIndex) => (event) => {
        if (!this.canEnableDragDrop()) {
            return;
        }

        event.preventDefault();
        const dragIndexFromData = Number(event.dataTransfer.getData("text/plain"));
        const draggedIndex = Number.isInteger(dragIndexFromData) ? dragIndexFromData : this.state.draggedIndex;

        if (!Number.isInteger(draggedIndex) || draggedIndex < 0 || draggedIndex === dropIndex) {
            this.setState({ draggedIndex: null });
            return;
        }

        const updatedPosts = clonePosts(this.state.posts);
        const [draggedItem] = updatedPosts.splice(draggedIndex, 1);
        updatedPosts.splice(dropIndex, 0, draggedItem);

        const baseOrder = (this.state.currentPage - 1) * this.state.limit;
        const recalculatedPosts = updatedPosts.map((item, index) => ({
            ...item,
            displayOrder: baseOrder + index + 1,
        }));

        this.setState({
            posts: recalculatedPosts,
            isOrderChanged: true,
            draggedIndex: null,
        });
    };

    handleDragEnd = () => {
        this.setState({ draggedIndex: null });
    };

    handleResetOrder = () => {
        this.setState({
            posts: clonePosts(this.state.originalPosts),
            isOrderChanged: false,
            draggedIndex: null,
        });
    };

    handleSaveOrder = async () => {
        const items = this.state.posts.map((item) => ({
            id: item.id,
            displayOrder: Number(item.displayOrder),
        }));

        try {
            const res = await updatePostOrder(items);
            if (res && res.errCode === 0) {
                toast.success("Cập nhật vị trí bài viết thành công");
                this.setState({
                    originalPosts: clonePosts(this.state.posts),
                    isOrderChanged: false,
                });
            } else {
                toast.error(res?.errMessage || "Failed to update post order.");
            }
        } catch (error) {
            console.log("handleSaveOrder error", error);
            toast.error("Failed to update post order.");
        }
    };

    renderStatusSwitch = (post) => {
        const isActive = Number(post.isActive) === 1;
        return (
            <>
                <div className="form-check form-switch d-inline-flex justify-content-center prevent-row-drag">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        checked={isActive}
                        onChange={() => this.handleToggleStatus(post)}
                    />
                </div>
            </>
        );
    };

    render() {
        const {
            posts,
            categories,
            currentPage,
            totalPages,
            keyword,
            categoryId,
            isActive,
            previewImg,
            isOpenPreview,
            isOrderChanged,
        } = this.state;
        const canDragDrop = this.canEnableDragDrop();

        return (
            <div className="manage-post-container">
                <div className="manage-post__inner">
                    <div className="manage-post__header">
                        <h3 className="manage-post__title">
                            <FormattedMessage id="manage-post.title" defaultMessage="Post management" />
                        </h3>

                        <div className="manage-post__header-actions">
                            <Button color="primary" onClick={this.handleCreatePost} className="manage-post__add-button">
                                <i className="fa-solid fa-file-circle-plus"></i>
                                <FormattedMessage id="manage-post.create" defaultMessage="Add post" />
                            </Button>

                            {canDragDrop && isOrderChanged && (
                                <>
                                    <Button color="success" onClick={this.handleSaveOrder}>
                                        <FormattedMessage
                                            id="manage-post.update-order"
                                            defaultMessage="Update position"
                                        />
                                    </Button>
                                    <Button color="secondary" onClick={this.handleResetOrder}>
                                        <FormattedMessage
                                            id="manage-post.cancel-order"
                                            defaultMessage="Cancel changes"
                                        />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="filter-box manage-post__toolbar-card">
                        <div className="row g-3 align-items-end">
                            <div className="col-md-4">
                                <label className="form-label">
                                    <FormattedMessage id="manage-post.search" defaultMessage="Search" />
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nhập tên bài viết..."
                                    value={keyword}
                                    onChange={(event) => this.handleFilterChange(event, "keyword")}
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">
                                    <FormattedMessage id="manage-post.category" defaultMessage="Category" />
                                </label>
                                <select
                                    className="form-select"
                                    value={categoryId}
                                    onChange={(event) => this.handleFilterChange(event, "categoryId")}
                                >
                                    <option value="">
                                        {this.props.language === "en" ? "All categories" : "Tất cả danh mục"}
                                    </option>
                                    {categories.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">
                                    <FormattedMessage id="manage-post.status" defaultMessage="Visible" />
                                </label>
                                <select
                                    className="form-select"
                                    value={isActive}
                                    onChange={(event) => this.handleFilterChange(event, "isActive")}
                                >
                                    <option value="">
                                        {this.props.language === "en" ? "All statuses" : "Tất cả trạng thái"}
                                    </option>
                                    <option value="1">
                                        {this.props.language === "en" ? "Show" : "Hiện"}
                                    </option>
                                    <option value="0">
                                        {this.props.language === "en" ? "Hide" : "Ẩn"}
                                    </option>
                                </select>
                            </div>

                            <div className="col-md-2">
                                <div className="filter-buttons">
                                    <Button color="primary" onClick={this.handleSearch}>
                                        <FormattedMessage id="manage-post.search" defaultMessage="Search" />
                                    </Button>
                                    <Button color="secondary" outline onClick={this.handleReset}>
                                        <FormattedMessage id="manage-post.reset" defaultMessage="Reset" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="manage-post__table-card mt-4">
                        <div className="table-responsive">
                            <table className="manage-post__table">
                                <thead>
                                    <tr>
                                        <th><FormattedMessage id="manage-post.id" defaultMessage="ID" /></th>
                                        <th><FormattedMessage id="manage-post.display-order" defaultMessage="Display order" /></th>
                                        <th><FormattedMessage id="manage-post.name" defaultMessage="Post title" /></th>
                                        <th><FormattedMessage id="manage-post.image" defaultMessage="Thumbnail" /></th>
                                        <th><FormattedMessage id="manage-post.updated-at" defaultMessage="Updated at" /></th>
                                        <th><FormattedMessage id="manage-post.status" defaultMessage="Visible" /></th>
                                        <th><FormattedMessage id="manage-post.action" defaultMessage="Action" /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts && posts.length > 0 ? (
                                        posts.map((post, index) => {
                                            const imageSrc = this.getImageSrc(post.image);

                                            return (
                                                <tr
                                                    key={post.id}
                                                    draggable={canDragDrop}
                                                    onDragStart={this.handleDragStart(index)}
                                                    onDragOver={this.handleDragOver}
                                                    onDrop={this.handleDrop(index)}
                                                    onDragEnd={this.handleDragEnd}
                                                    className={canDragDrop ? "draggable-row" : ""}
                                                >
                                                    <td>{post.id}</td>
                                                    <td className="manage-post__order">{post.displayOrder}</td>
                                                    <td className="post-title-cell manage-post__name" title={post.title}>
                                                        <span className="post-title-text">{post.title}</span>
                                                    </td>
                                                    <td>
                                                        {imageSrc ? (
                                                            <img
                                                                src={imageSrc}
                                                                alt={post.title}
                                                                className="post-thumbnail manage-post__thumbnail prevent-row-drag"
                                                                onClick={() => this.openPreview(imageSrc)}
                                                            />
                                                        ) : (
                                                            <span className="manage-post__muted">No image</span>
                                                        )}
                                                    </td>
                                                    <td>{this.formatDate(post.updatedAt)}</td>
                                                    <td>{this.renderStatusSwitch(post)}</td>
                                                    <td className="prevent-row-drag post-action-cell">
                                                        <div className="manage-post__actions">
                                                            <button
                                                                type="button"
                                                                className="manage-post__action-button manage-post__action-button--edit"
                                                                onClick={() => this.handleEditPost(post)}
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="manage-post__action-button manage-post__action-button--delete"
                                                                onClick={() => this.handleDeletePost(post.id)}
                                                            >
                                                                <i className="fa-solid fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="manage-post__empty">
                                                <FormattedMessage id="manage-post.no-data" defaultMessage="No posts found." />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <nav className="manage-post__pagination">
                            <ul>
                                {Array.from({ length: totalPages }, (_, index) => (
                                    <li
                                        key={index}
                                        className={currentPage === index + 1 ? "active" : ""}
                                    >
                                        <button
                                            onClick={() => this.handlePageChange(index + 1)}
                                        >
                                            {index + 1}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}

                    {isOpenPreview && (
                        <div className="manage-post__preview-backdrop" onClick={this.closePreview}>
                            <img src={previewImg} alt="preview" />
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
});

export default connect(mapStateToProps)(ManagePost);
