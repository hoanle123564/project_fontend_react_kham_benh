import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Button } from "reactstrap";
import { toast } from "react-toastify";
import { FormattedMessage } from "react-intl";
import * as action from "../../../store/actions";
import {
    ChangeStatusSpecialty,
    DeleteSpecialty,
    updateSpecialtyOrder,
} from "../../../services/userService";
import PagePagination from "../../../components/Pagination/PagePagination";
import "./ManageSpecialty.scss";

const cloneSpecialties = (specialties = []) => specialties.map((item) => ({ ...item }));

const sortSpecialties = (specialties = []) =>
    cloneSpecialties(specialties).sort((a, b) => {
        const orderA = Number(a.displayOrder) || 0;
        const orderB = Number(b.displayOrder) || 0;
        if (orderA !== orderB) return orderA - orderB;
        return Number(a.id) - Number(b.id);
    });

class ManageSpecialty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ListSpecialty: [],
            originalSpecialties: [],
            specialtySearchQuery: "",
            isActive: "",
            isOpenPreview: false,
            previewImg: "",
            currentPage: 1,
            specialtiesPerPage: 10,
            isOrderChanged: false,
            draggedIndex: null,
        };
    }

    componentDidMount() {
        this.props.getAllSpecialty();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.specialtys !== this.props.specialtys) {
            const nextSpecialties = sortSpecialties(this.props.specialtys || []);
            this.setState({
                ListSpecialty: nextSpecialties,
                originalSpecialties: cloneSpecialties(nextSpecialties),
                currentPage: this.getClampedSpecialtyPage(nextSpecialties),
                isOrderChanged: false,
                draggedIndex: null,
            });
        }
    }

    getFilteredSpecialties = (specialties = this.state.ListSpecialty) => {
        const query = (this.state.specialtySearchQuery || "").trim().toLowerCase();
        const { isActive } = this.state;

        return specialties.filter((specialty) => {
            const matchesKeyword = !query || (specialty.name || "").toLowerCase().includes(query);
            const matchesStatus = isActive === "" || Number(specialty.isActive) === Number(isActive);
            return matchesKeyword && matchesStatus;
        });
    };

    getPaginatedSpecialties = () => {
        const { currentPage, specialtiesPerPage } = this.state;
        const filteredSpecialties = this.getFilteredSpecialties();
        const indexOfLastSpecialty = currentPage * specialtiesPerPage;
        const indexOfFirstSpecialty = indexOfLastSpecialty - specialtiesPerPage;

        return filteredSpecialties.slice(indexOfFirstSpecialty, indexOfLastSpecialty);
    };

    getClampedSpecialtyPage = (specialties = this.state.ListSpecialty) => {
        const { currentPage, specialtiesPerPage } = this.state;
        const filteredSpecialties = this.getFilteredSpecialties(specialties);
        const totalPages = Math.ceil(filteredSpecialties.length / specialtiesPerPage);

        if (currentPage < 1) return 1;
        return currentPage > totalPages ? (totalPages > 0 ? totalPages : 1) : currentPage;
    };

    confirmDiscardOrderChanges = () => {
        if (!this.state.isOrderChanged) {
            return true;
        }

        return window.confirm(
            "Bạn có thay đổi chưa lưu. Tiếp tục sẽ bỏ các thay đổi này, bạn có muốn tiếp tục không?"
        );
    };

    canEnableDragDrop = () => {
        const { specialtySearchQuery, isActive } = this.state;
        return !String(specialtySearchQuery || "").trim() && isActive === "";
    };

    handlePageChange = (pageNumber) => {
        if (!this.confirmDiscardOrderChanges()) {
            return;
        }
        this.setState({
            ListSpecialty: cloneSpecialties(this.state.originalSpecialties),
            currentPage: pageNumber,
            isOrderChanged: false,
            draggedIndex: null,
        });
    };

    handleSpecialtySearchChange = (event) => {
        if (!this.confirmDiscardOrderChanges()) {
            return;
        }
        this.setState({
            ListSpecialty: cloneSpecialties(this.state.originalSpecialties),
            specialtySearchQuery: event.target.value,
            currentPage: 1,
            isOrderChanged: false,
            draggedIndex: null,
        });
    };

    handleStatusFilterChange = (event) => {
        if (!this.confirmDiscardOrderChanges()) {
            return;
        }
        this.setState({
            ListSpecialty: cloneSpecialties(this.state.originalSpecialties),
            isActive: event.target.value,
            currentPage: 1,
            isOrderChanged: false,
            draggedIndex: null,
        });
    };

    handleResetFilter = () => {
        if (!this.confirmDiscardOrderChanges()) {
            return;
        }
        this.setState({
            ListSpecialty: cloneSpecialties(this.state.originalSpecialties),
            specialtySearchQuery: "",
            isActive: "",
            currentPage: 1,
            isOrderChanged: false,
            draggedIndex: null,
        });
    };

    handleEdit = (item) => {
        this.props.history.push(`/system/edit-specialty/${item.id}`, { clinicData: item });
    };

    handleDelete = async (id) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa chuyên khoa này không?");
        if (!confirmDelete) {
            return;
        }

        try {
            const res = await DeleteSpecialty(id);
            if (res && res.errCode === 0) {
                toast.success("Xóa chuyên khoa thành công!");
                this.props.getAllSpecialty();
            } else {
                toast.error(res?.errMessage || "Xóa chuyên khoa thất bại.");
            }
        } catch (error) {
            console.log("handleDelete specialty error", error);
            toast.error("Xóa chuyên khoa thất bại.");
        }
    };

    handleToggleStatus = async (specialty) => {
        const nextIsActive = Number(specialty.isActive) === 1 ? 0 : 1;
        const previousSpecialties = cloneSpecialties(this.state.ListSpecialty);
        const previousOriginalSpecialties = cloneSpecialties(this.state.originalSpecialties);

        const nextSpecialties = this.state.ListSpecialty.map((item) =>
            item.id === specialty.id ? { ...item, isActive: nextIsActive } : item
        );
        const nextOriginalSpecialties = this.state.originalSpecialties.map((item) =>
            item.id === specialty.id ? { ...item, isActive: nextIsActive } : item
        );

        this.setState({
            ListSpecialty: nextSpecialties,
            originalSpecialties: nextOriginalSpecialties,
        });

        try {
            const res = await ChangeStatusSpecialty({
                id: specialty.id,
                isActive: nextIsActive,
            });

            if (res && res.errCode === 0) {
                toast.success("Cập nhật trạng thái chuyên khoa thành công!");
            } else {
                this.setState({
                    ListSpecialty: previousSpecialties,
                    originalSpecialties: previousOriginalSpecialties,
                });
                toast.error(res?.errMessage || "Failed to update specialty status.");
            }
        } catch (error) {
            console.log("handleToggleStatus specialty error", error);
            this.setState({
                ListSpecialty: previousSpecialties,
                originalSpecialties: previousOriginalSpecialties,
            });
            toast.error("Failed to update specialty status.");
        }
    };

    handleDragStart = (visibleIndex) => (event) => {
        if (!this.canEnableDragDrop() || event.target.closest(".prevent-row-drag")) {
            event.preventDefault();
            return;
        }

        const globalIndex = (this.state.currentPage - 1) * this.state.specialtiesPerPage + visibleIndex;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(globalIndex));
        this.setState({ draggedIndex: globalIndex });
    };

    handleDragOver = (event) => {
        if (!this.canEnableDragDrop()) {
            return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    };

    handleDrop = (visibleDropIndex) => (event) => {
        if (!this.canEnableDragDrop()) {
            return;
        }

        event.preventDefault();
        const dropIndex = (this.state.currentPage - 1) * this.state.specialtiesPerPage + visibleDropIndex;
        const dragIndexFromData = Number(event.dataTransfer.getData("text/plain"));
        const draggedIndex = Number.isInteger(dragIndexFromData) ? dragIndexFromData : this.state.draggedIndex;

        if (!Number.isInteger(draggedIndex) || draggedIndex < 0 || draggedIndex === dropIndex) {
            this.setState({ draggedIndex: null });
            return;
        }

        const updatedSpecialties = cloneSpecialties(this.state.ListSpecialty);
        const [draggedItem] = updatedSpecialties.splice(draggedIndex, 1);
        updatedSpecialties.splice(dropIndex, 0, draggedItem);

        const recalculatedSpecialties = updatedSpecialties.map((item, index) => ({
            ...item,
            displayOrder: index + 1,
        }));

        this.setState({
            ListSpecialty: recalculatedSpecialties,
            isOrderChanged: true,
            draggedIndex: null,
        });
    };

    handleDragEnd = () => {
        this.setState({ draggedIndex: null });
    };

    handleResetOrder = () => {
        this.setState({
            ListSpecialty: cloneSpecialties(this.state.originalSpecialties),
            isOrderChanged: false,
            draggedIndex: null,
        });
    };

    handleSaveOrder = async () => {
        const confirmSave = window.confirm("Bạn có chắc chắn muốn lưu thứ tự hiện tại không?");
        if (!confirmSave) {
            return;
        }

        const items = this.state.ListSpecialty.map((item) => ({
            id: item.id,
            displayOrder: Number(item.displayOrder),
        }));

        try {
            const res = await updateSpecialtyOrder(items);
            if (res && res.errCode === 0) {
                toast.success("Cap nhat STT chuyen khoa thanh cong.");
                this.setState({
                    originalSpecialties: cloneSpecialties(this.state.ListSpecialty),
                    isOrderChanged: false,
                    draggedIndex: null,
                });
            } else {
                toast.error(res?.errMessage || "Failed to update specialty order.");
            }
        } catch (error) {
            console.log("handleSaveOrder specialty error", error);
            toast.error("Failed to update specialty order.");
        }
    };

    openPreview = (img) => {
        this.setState({ isOpenPreview: true, previewImg: img });
    };

    closePreview = () => {
        this.setState({ isOpenPreview: false, previewImg: "" });
    };

    handleAdd = () => {
        this.props.history.push("/system/add-specialty");
    };

    getImageSrc = (image) => {
        if (!image) return "";
        return String(image).startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;
    };

    renderStatusSwitch = (specialty) => {
        const isChecked = Number(specialty.isActive) === 1;

        return (
            <div className="form-check form-switch d-inline-flex justify-content-center prevent-row-drag">
                <input
                    className="form-check-input"
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => this.handleToggleStatus(specialty)}
                />
            </div>
        );
    };

    render() {
        const {
            isOpenPreview,
            previewImg,
            currentPage,
            specialtiesPerPage,
            specialtySearchQuery,
            isActive,
            isOrderChanged,
        } = this.state;
        const filteredSpecialties = this.getFilteredSpecialties();
        const currentSpecialties = this.getPaginatedSpecialties();
        const totalPages = Math.ceil(filteredSpecialties.length / specialtiesPerPage);
        const footerTotalPages = Math.max(totalPages, 1);
        const canDragDrop = this.canEnableDragDrop();

        return (
            <div className="manage-specialty-container">
                <div className="manage-specialty__inner">
                    <div className="manage-specialty__header">
                        <h3 className="manage-specialty__title">
                            <FormattedMessage id="manage-specialty.title" defaultMessage="Manage Specialties" />
                        </h3>

                        <div className="manage-specialty__header-actions">
                            <Button color="primary" onClick={this.handleAdd} className="manage-specialty__add-button">
                                <i className="fa-solid fa-user-plus"></i>
                                <FormattedMessage id="manage-specialty.add" defaultMessage="Add specialty" />
                            </Button>

                            {canDragDrop && isOrderChanged && (
                                <>
                                    <Button color="success" onClick={this.handleSaveOrder}>
                                        <FormattedMessage id="manage-specialty.save-order" defaultMessage="Save changes" />
                                    </Button>
                                    <Button color="secondary" onClick={this.handleResetOrder}>
                                        <FormattedMessage id="manage-specialty.cancel" defaultMessage="Cancel" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="manage-specialty__toolbar">
                        <FormattedMessage id="manage-specialty.search" defaultMessage="Search specialty by name...">
                            {(msg) => (
                                <div className="manage-specialty__search">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                    <input
                                        type="text"
                                        value={specialtySearchQuery}
                                        placeholder={msg}
                                        onChange={this.handleSpecialtySearchChange}
                                    />
                                </div>
                            )}
                        </FormattedMessage>

                        <select
                            className="manage-specialty__status-filter"
                            value={isActive}
                            onChange={this.handleStatusFilterChange}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="1">Đang hiện</option>
                            <option value="0">Đang ẩn</option>
                        </select>

                        <Button color="secondary" outline onClick={this.handleResetFilter}>
                            Đặt lại
                        </Button>

                        <div className="manage-specialty__total">
                            <FormattedMessage
                                id="manage-specialty.total"
                                defaultMessage="Total: {count} specialties"
                                values={{ count: filteredSpecialties.length }}
                            />
                        </div>
                    </div>

                    <div className="manage-specialty__table-card mt-4">
                        <div className="manage-specialty__table-scroll">
                            <table className="manage-specialty__table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>STT</th>
                                        <th><FormattedMessage id="manage-specialty.name" defaultMessage="Name" /></th>
                                        <th>Slug</th>
                                        <th><FormattedMessage id="manage-specialty.image" defaultMessage="Image" /></th>
                                        <th>Active</th>
                                        <th><FormattedMessage id="manage-specialty.action" defaultMessage="Action" /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentSpecialties && currentSpecialties.length > 0 ? (
                                        currentSpecialties.map((specialty, index) => {
                                            const imageSrc = this.getImageSrc(specialty.image);

                                            return (
                                                <tr
                                                    key={specialty.id}
                                                    draggable={canDragDrop}
                                                    onDragStart={this.handleDragStart(index)}
                                                    onDragOver={this.handleDragOver}
                                                    onDrop={this.handleDrop(index)}
                                                    onDragEnd={this.handleDragEnd}
                                                    className={canDragDrop ? "draggable-row" : ""}
                                                >
                                                    <td>{specialty.id}</td>
                                                    <td>{specialty.displayOrder}</td>
                                                    <td className="manage-specialty__name">{specialty.name}</td>
                                                    <td className="manage-specialty__slug" title={specialty.slug}>
                                                        {specialty.slug}
                                                    </td>
                                                    <td>
                                                        {imageSrc ? (
                                                            <img
                                                                className="manage-specialty__thumbnail prevent-row-drag"
                                                                src={imageSrc}
                                                                alt={specialty.name}
                                                                onClick={() => this.openPreview(imageSrc)}
                                                            />
                                                        ) : (
                                                            <span className="manage-specialty__muted">
                                                                <FormattedMessage
                                                                    id="manage-specialty.no-image"
                                                                    defaultMessage="No image"
                                                                />
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>{this.renderStatusSwitch(specialty)}</td>
                                                    <td className="prevent-row-drag">
                                                        <div className="manage-specialty__actions">
                                                            <button
                                                                type="button"
                                                                className="manage-specialty__action-button manage-specialty__action-button--edit"
                                                                aria-label="Edit specialty"
                                                                onClick={() => this.handleEdit(specialty)}
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="manage-specialty__action-button manage-specialty__action-button--delete"
                                                                aria-label="Delete specialty"
                                                                onClick={() => this.handleDelete(specialty.id)}
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
                                            <td colSpan="7" className="manage-specialty__empty">
                                                <FormattedMessage
                                                    id="manage-specialty.no-specialties"
                                                    defaultMessage="No specialties found."
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="manage-specialty__footer">
                            <span>Trang {currentPage} trên {footerTotalPages}</span>
                            <PagePagination
                                page={currentPage}
                                totalPages={footerTotalPages}
                                onChange={this.handlePageChange}
                                className="manage-specialty__pagination"
                                previousLabel="Trước"
                                nextLabel="Sau"
                                asList
                            />
                        </div>
                    </div>

                    {isOpenPreview && (
                        <div className="manage-specialty__preview-backdrop" onClick={this.closePreview}>
                            <img src={previewImg} alt="preview" />
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    specialtys: state.admin.specialty,
});

const mapDispatchToProps = (dispatch) => ({
    getAllSpecialty: () => dispatch(action.GetAllSpecialty()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ManageSpecialty));
