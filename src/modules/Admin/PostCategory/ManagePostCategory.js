import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { FormattedMessage, injectIntl } from "react-intl";
import { toast } from "react-toastify";
import {
    changeStatusPostCategory,
    DeletePostCategory,
    EditPostCategoryId,
    getAllPostCategory,
    postSavePostCategory,
    updatePostCategoryOrder,
} from "../../../services/userService";
import PostCategoryModal from "./PostCategoryModal";
import { buildSlug } from "../../../utils/textUtils";
import "./ManagePostCategory.scss";

const MODAL_MODE = {
    CREATE: "CREATE",
    EDIT: "EDIT",
};

const sortCategories = (categories = []) => {
    return [...categories].sort((a, b) => {
        const displayOrderA = Number(a.displayOrder) || 0;
        const displayOrderB = Number(b.displayOrder) || 0;

        if (displayOrderA !== displayOrderB) {
            return displayOrderA - displayOrderB;
        }

        return (Number(a.id) || 0) - (Number(b.id) || 0);
    });
};

const cloneCategories = (categories = []) => categories.map((item) => ({ ...item }));

class ManagePostCategory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            originalCategories: [],
            isOpenModal: false,
            modalMode: MODAL_MODE.CREATE,
            currentCategory: null,
            isOrderChanged: false,
            errors: {},
            formData: {
                name: "",
                slug: "",
                isActive: 1,
            },
            slugTouched: false,
            draggedIndex: null,
        };
    }

    componentDidMount() {
        this.loadPostCategories();
    }

    getText = (id, defaultMessage) => {
        return this.props.intl.formatMessage({ id, defaultMessage });
    };

    loadPostCategories = async () => {
        try {
            const res = await getAllPostCategory();
            const sortedCategories = sortCategories(res?.data || []);

            this.setState({
                categories: cloneCategories(sortedCategories),
                originalCategories: cloneCategories(sortedCategories),
                isOrderChanged: false,
                draggedIndex: null,
            });
        } catch (error) {
            console.log("loadPostCategories error", error);
            toast.error("Failed to load post categories.");
        }
    };

    getNextDisplayOrder = () => {
        const maxDisplayOrder = this.state.categories.reduce((maxValue, item) => {
            const currentValue = Number(item.displayOrder) || 0;
            return currentValue > maxValue ? currentValue : maxValue;
        }, 0);

        return maxDisplayOrder + 1;
    };

    resetFormState = () => ({
        name: "",
        slug: "",
        isActive: 1,
    });

    openCreateModal = () => {
        this.setState({
            isOpenModal: true,
            modalMode: MODAL_MODE.CREATE,
            currentCategory: null,
            errors: {},
            slugTouched: false,
            formData: this.resetFormState(),
        });
    };

    openEditModal = (category) => {
        this.setState({
            isOpenModal: true,
            modalMode: MODAL_MODE.EDIT,
            currentCategory: { ...category },
            errors: {},
            slugTouched: false,
            formData: {
                name: category.name || "",
                slug: category.slug || "",
                isActive: Number(category.isActive) === 1 ? 1 : 0,
            },
        });
    };

    closeModal = () => {
        this.setState({
            isOpenModal: false,
            currentCategory: null,
            errors: {},
            slugTouched: false,
            formData: this.resetFormState(),
        });
    };

    handleFormChange = (field, value) => {
        if (field === "name") {
            this.setState((prevState) => ({
                formData: {
                    ...prevState.formData,
                    name: value,
                    slug: prevState.slugTouched ? prevState.formData.slug : buildSlug(value),
                },
                errors: { ...prevState.errors, name: "", slug: "" },
            }));
            return;
        }

        if (field === "slug") {
            this.setState((prevState) => ({
                formData: {
                    ...prevState.formData,
                    slug: buildSlug(value),
                },
                slugTouched: true,
                errors: { ...prevState.errors, slug: "" },
            }));
            return;
        }

        this.setState((prevState) => ({
            formData: {
                ...prevState.formData,
                [field]: value,
            },
            errors: { ...prevState.errors, [field]: "" },
        }));
    };

    validateForm = () => {
        const errors = {};
        const name = String(this.state.formData.name || "").trim();
        const slug = String(this.state.formData.slug || "").trim();

        if (!name) {
            errors.name = this.getText(
                "manage-post-category.name-required",
                "Category name is required."
            );
        }

        if (!slug) {
            errors.slug = this.getText(
                "manage-post-category.slug-required",
                "Slug is required."
            );
        }

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    };

    handleSubmitModal = async () => {
        if (!this.validateForm()) {
            return;
        }

        const name = String(this.state.formData.name || "").trim();
        const slug = String(this.state.formData.slug || "").trim();
        const isActive = Number(this.state.formData.isActive) === 1 ? 1 : 0;

        try {
            if (this.state.modalMode === MODAL_MODE.CREATE) {
                const res = await postSavePostCategory({
                    name,
                    slug,
                    isActive,
                    displayOrder: this.getNextDisplayOrder(),
                });

                if (res && res.errCode === 0) {
                    toast.success("Create post category successfully!");
                    this.closeModal();
                    await this.loadPostCategories();
                } else {
                    toast.error(res?.errMessage || "Failed to create post category.");
                }

                return;
            }

            const currentCategory = this.state.currentCategory;
            const res = await EditPostCategoryId({
                id: currentCategory.id,
                name,
                slug,
                isActive,
                displayOrder: Number(currentCategory.displayOrder),
            });

            if (res && res.errCode === 0) {
                toast.success("Update post category successfully!");
                this.closeModal();
                await this.loadPostCategories();
            } else {
                toast.error(res?.errMessage || "Failed to update post category.");
            }
        } catch (error) {
            console.log("handleSubmitModal error", error);
            toast.error("Failed to save post category.");
        }
    };

    handleDelete = async (id) => {
        const confirmDelete = window.confirm("Bạn có chắc muốn xóa danh mục bài viết này không?");
        if (!confirmDelete) {
            return;
        }

        try {
            const res = await DeletePostCategory(id);
            if (res && res.errCode === 0) {
                toast.success("Delete post category successfully!");
                await this.loadPostCategories();
            } else {
                toast.error(res?.errMessage || "Failed to delete post category.");
            }
        } catch (error) {
            console.log("handleDelete error", error);
            toast.error("Failed to delete post category.");
        }
    };

    handleToggleStatus = async (category) => {
        const nextIsActive = Number(category.isActive) === 1 ? 0 : 1;
        const previousCategories = cloneCategories(this.state.categories);
        const previousOriginalCategories = cloneCategories(this.state.originalCategories);

        const nextCategories = this.state.categories.map((item) =>
            item.id === category.id ? { ...item, isActive: nextIsActive } : item
        );

        const nextOriginalCategories = this.state.originalCategories.map((item) =>
            item.id === category.id ? { ...item, isActive: nextIsActive } : item
        );

        this.setState({
            categories: nextCategories,
            originalCategories: nextOriginalCategories,
        });

        try {
            const res = await changeStatusPostCategory({
                id: category.id,
                isActive: nextIsActive,
            });

            if (res && res.errCode === 0) {
                toast.success("Update post category status successfully!");
            } else {
                this.setState({
                    categories: previousCategories,
                    originalCategories: previousOriginalCategories,
                });
                toast.error(res?.errMessage || "Failed to update post category status.");
            }
        } catch (error) {
            console.log("handleToggleStatus error", error);
            this.setState({
                categories: previousCategories,
                originalCategories: previousOriginalCategories,
            });
            toast.error("Failed to update post category status.");
        }
    };

    handleDragStart = (index) => (event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(index));
        this.setState({ draggedIndex: index });
    };

    handleDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    };

    handleDrop = (dropIndex) => (event) => {
        event.preventDefault();
        const dragIndexFromData = Number(event.dataTransfer.getData("text/plain"));
        const draggedIndex = Number.isInteger(dragIndexFromData) ? dragIndexFromData : this.state.draggedIndex;

        if (!Number.isInteger(draggedIndex) || draggedIndex < 0 || draggedIndex === dropIndex) {
            this.setState({ draggedIndex: null });
            return;
        }

        const updatedCategories = cloneCategories(this.state.categories);
        const [draggedItem] = updatedCategories.splice(draggedIndex, 1);
        updatedCategories.splice(dropIndex, 0, draggedItem);

        const recalculatedCategories = updatedCategories.map((item, index) => ({
            ...item,
            displayOrder: index + 1,
        }));

        this.setState({
            categories: recalculatedCategories,
            isOrderChanged: true,
            draggedIndex: null,
        });
    };

    handleDragEnd = () => {
        this.setState({ draggedIndex: null });
    };

    handleResetOrder = () => {
        this.setState({
            categories: cloneCategories(this.state.originalCategories),
            isOrderChanged: false,
            draggedIndex: null,
        });
    };

    handleSaveOrder = async () => {
        const items = this.state.categories.map((item) => ({
            id: item.id,
            displayOrder: Number(item.displayOrder),
        }));

        try {
            const res = await updatePostCategoryOrder(items);
            if (res && res.errCode === 0) {
                toast.success("Cập nhật vị trí thành công");
                this.setState({
                    originalCategories: cloneCategories(this.state.categories),
                    isOrderChanged: false,
                });
            } else {
                toast.error(res?.errMessage || "Failed to update post category order.");
            }
        } catch (error) {
            console.log("handleSaveOrder error", error);
            toast.error("Failed to update post category order.");
        }
    };

    renderStatusSwitch = (category) => {
        const isChecked = Number(category.isActive) === 1;

        return (
            <div className="form-check form-switch d-inline-flex justify-content-center">
                <input
                    className="form-check-input"
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => this.handleToggleStatus(category)}
                />
            </div>
        );
    };

    render() {
        const { categories, isOpenModal, modalMode, formData, errors, isOrderChanged } = this.state;

        return (
            <div className="manage-post-category-container">
                <div className="manage-post-category__inner">
                    <div className="manage-post-category__header">
                        <h3 className="manage-post-category__title">
                            <FormattedMessage id="manage-post-category.title" defaultMessage="Manage Post Categories" />
                        </h3>

                        <div className="manage-post-category__header-actions">
                            <Button color="primary" onClick={this.openCreateModal} className="manage-post-category__add-button">
                                <i className="fa-solid fa-folder-plus"></i>
                                <FormattedMessage id="manage-post-category.create" defaultMessage="Create new" />
                            </Button>

                            {isOrderChanged && (
                                <>
                                    <Button color="success" onClick={this.handleSaveOrder}>
                                        <FormattedMessage id="manage-post-category.update-order" defaultMessage="Update position" />
                                    </Button>
                                    <Button color="secondary" onClick={this.handleResetOrder}>
                                        <FormattedMessage id="manage-post-category.cancel-order" defaultMessage="Cancel changes" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="manage-post-category__table-card">
                        <div className="manage-post-category__table-scroll">
                        <table className="manage-post-category__table">
                            <thead>
                                <tr>
                                    <th><FormattedMessage id="manage-post-category.display-order" defaultMessage="Display order" /></th>
                                    <th><FormattedMessage id="manage-post-category.name" defaultMessage="Category name" /></th>
                                    <th><FormattedMessage id="manage-post-category.slug" defaultMessage="Slug" /></th>
                                    <th><FormattedMessage id="manage-post-category.is-active" defaultMessage="Visible" /></th>
                                    <th><FormattedMessage id="manage-post-category.action" defaultMessage="Action" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories && categories.length > 0 ? (
                                    categories.map((category, index) => (
                                        <tr
                                            key={category.id}
                                            onDragOver={this.handleDragOver}
                                            onDrop={this.handleDrop(index)}
                                            onDragStart={this.handleDragStart(index)}
                                            onDragEnd={this.handleDragEnd}
                                            draggable
                                            className="draggable-row"
                                        >
                                            <td className="manage-post-category__order">{category.displayOrder}</td>
                                            <td className="manage-post-category__name">{category.name}</td>
                                            <td className="manage-post-category__slug" title={category.slug}>{category.slug}</td>
                                            <td>{this.renderStatusSwitch(category)}</td>
                                            <td>
                                                <div className="manage-post-category__actions">
                                                    <button
                                                        type="button"
                                                        className="manage-post-category__action-button manage-post-category__action-button--edit"
                                                        aria-label="Edit post category"
                                                        onClick={() => this.openEditModal(category)}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="manage-post-category__action-button manage-post-category__action-button--delete"
                                                        aria-label="Delete post category"
                                                        onClick={() => this.handleDelete(category.id)}
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="manage-post-category__empty">
                                            <FormattedMessage id="manage-post-category.no-data" defaultMessage="No post categories found." />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>

                <PostCategoryModal
                    isOpen={isOpenModal}
                    mode={modalMode}
                    formData={formData}
                    errors={errors}
                    onChange={this.handleFormChange}
                    onSubmit={this.handleSubmitModal}
                    onCancel={this.closeModal}
                />
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
});

export default connect(mapStateToProps)(injectIntl(ManagePostCategory));
