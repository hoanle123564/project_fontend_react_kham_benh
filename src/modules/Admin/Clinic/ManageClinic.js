import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import { withRouter } from "react-router";
import { Button } from "reactstrap";
import { toast } from "react-toastify";
import * as actions from "../../../store/actions";
import {
  ChangeStatusClinic,
  DeleteClinic,
  updateClinicOrder,
} from "../../../services/userService";
import PagePagination from "../../../components/Pagination/PagePagination";
import "./ManageClinic.scss";

const cloneClinics = (clinics = []) =>
  clinics.map((clinic) => ({
    ...clinic,
    displayOrder: Number(clinic.displayOrder) || 0,
    isActive: Number(clinic.isActive) === 1 ? 1 : 0,
  }));

const sortClinics = (clinics = []) =>
  cloneClinics(clinics).sort((a, b) => {
    const orderA = Number(a.displayOrder) || 0;
    const orderB = Number(b.displayOrder) || 0;

    if (orderA !== orderB) return orderA - orderB;
    return Number(a.id) - Number(b.id);
  });

class ManageClinic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ListClinic: [],
      originalClinics: [],
      clinicSearchQuery: "",
      isActive: "",
      isOpenPreview: false,
      previewImg: "",
      currentPage: 1,
      clinicsPerPage: 10,
      isOrderChanged: false,
      draggedIndex: null,
    };
  }

  componentDidMount() {
    this.props.getAllClinic(this.getClinicRequestOptions());
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.clinics !== this.props.clinics ||
      prevProps.adminInfo !== this.props.adminInfo ||
      prevProps.doctorInfo !== this.props.doctorInfo
    ) {
      const sortedClinics = sortClinics(this.getVisibleClinics(this.props.clinics));
      this.setState({
        ListClinic: sortedClinics,
        originalClinics: cloneClinics(sortedClinics),
        isOrderChanged: false,
        draggedIndex: null,
      });
    }
  }

  getImageSrc = (image) => {
    if (!image) return "";

    if (typeof image === "string" && image.startsWith("data:image")) {
      return image;
    }

    return `data:image/jpeg;base64,${image}`;
  };

  isDoctorRoute = () => window.location.pathname.startsWith("/doctor");

  getCurrentActor = () =>
    this.isDoctorRoute() ? this.props.doctorInfo : this.props.adminInfo;

  isClinicManager = () => ["R2", "R4"].includes(this.getCurrentActor()?.roleId);

  getClinicRequestOptions = () =>
    this.isClinicManager() ? { managedOnly: true } : {};

  getVisibleClinics = (clinics = []) => {
    if (!this.isClinicManager()) {
      return clinics || [];
    }

    return (clinics || []).filter(
      (clinic) => Number(clinic.managerUserId) === Number(this.getCurrentActor()?.id)
    );
  };

  getFilteredClinics = () => {
    const { ListClinic, clinicSearchQuery, isActive } = this.state;
    const searchValue = clinicSearchQuery.trim().toLowerCase();

    return ListClinic.filter((clinic) => {
      const name = (clinic.name || "").toLowerCase();
      const slug = (clinic.slug || "").toLowerCase();
      const matchesSearch =
        !searchValue ||
        name.includes(searchValue) ||
        slug.includes(searchValue);
      const matchesStatus =
        isActive === "" || Number(clinic.isActive) === Number(isActive);

      return matchesSearch && matchesStatus;
    });
  };

  getPaginatedClinics = () => {
    const { currentPage, clinicsPerPage } = this.state;
    const filteredClinics = this.getFilteredClinics();
    const indexOfLastClinic = currentPage * clinicsPerPage;
    const indexOfFirstClinic = indexOfLastClinic - clinicsPerPage;

    return filteredClinics.slice(indexOfFirstClinic, indexOfLastClinic);
  };

  getTotalPages = () => {
    const total = Math.ceil(this.getFilteredClinics().length / this.state.clinicsPerPage);
    return total || 1;
  };

  canEnableDragDrop = () =>
    !this.isClinicManager() &&
    !this.state.clinicSearchQuery.trim() &&
    this.state.isActive === "";

  confirmDiscardOrderChanges = () => {
    if (!this.state.isOrderChanged) return true;

    return window.confirm(
      "Bạn có thay đổi thứ tự chưa lưu. Tiếp tục sẽ bỏ các thay đổi này, bạn có muốn tiếp tục không?"
    );
  };

  resetOrderChanges = (extraState = {}) => {
    const originalClinics = cloneClinics(this.state.originalClinics);
    this.setState({
      ListClinic: originalClinics,
      isOrderChanged: false,
      draggedIndex: null,
      ...extraState,
    });
  };

  handleSearchChange = (event) => {
    const value = event.target.value;
    if (!this.confirmDiscardOrderChanges()) return;

    this.resetOrderChanges({
      clinicSearchQuery: value,
      currentPage: 1,
    });
  };

  handleStatusChange = (event) => {
    const value = event.target.value;
    if (!this.confirmDiscardOrderChanges()) return;

    this.resetOrderChanges({
      isActive: value,
      currentPage: 1,
    });
  };

  handleResetFilter = () => {
    if (!this.confirmDiscardOrderChanges()) return;

    this.resetOrderChanges({
      clinicSearchQuery: "",
      isActive: "",
      currentPage: 1,
    });
  };

  handlePageChange = (page) => {
    if (page < 1 || page > this.getTotalPages()) return;
    if (!this.confirmDiscardOrderChanges()) return;

    this.resetOrderChanges({ currentPage: page });
  };

  handleEdit = (clinic) => {
    if (this.props.history) {
      const editPath = this.isDoctorRoute()
        ? `/doctor/manage-clinic/${clinic.id}`
        : `/system/edit-clinic/${clinic.id}`;

      this.props.history.push(editPath, {
        clinicData: clinic,
      });
    }
  };

  handleDelete = async (clinic) => {
    if (!window.confirm("Bạn có chắc muốn xóa phòng khám này không?")) return;

    try {
      const res = await DeleteClinic(clinic.id);
      if (res?.errCode === 0) {
        toast.success("Xóa phòng khám thành công!");
        this.props.getAllClinic(this.getClinicRequestOptions());
        return;
      }

      toast.error(res?.errMessage || "Xóa phòng khám thất bại.");
    } catch (error) {
      toast.error("Xóa phòng khám thất bại.");
    }
  };

  handleToggleStatus = async (clinic) => {
    const nextStatus = Number(clinic.isActive) === 1 ? 0 : 1;
    const currentClinics = cloneClinics(this.state.ListClinic);

    this.setState((prevState) => ({
      ListClinic: prevState.ListClinic.map((item) =>
        item.id === clinic.id ? { ...item, isActive: nextStatus } : item
      ),
    }));

    try {
      const res = await ChangeStatusClinic({
        id: clinic.id,
        isActive: nextStatus,
      });

      if (res?.errCode === 0) {
        toast.success("Cập nhật trạng thái phòng khám thành công!");
        this.props.getAllClinic(this.getClinicRequestOptions());
        return;
      }

      toast.error(res?.errMessage || "Cập nhật trạng thái phòng khám thất bại.");
      this.setState({ ListClinic: currentClinics });
    } catch (error) {
      toast.error("Cập nhật trạng thái phòng khám thất bại.");
      this.setState({ ListClinic: currentClinics });
    }
  };

  handleDragStart = (index) => {
    if (!this.canEnableDragDrop()) return;
    this.setState({ draggedIndex: index });
  };

  handleDragOver = (event) => {
    if (!this.canEnableDragDrop()) return;
    event.preventDefault();
  };

  handleDrop = (dropIndex) => {
    if (!this.canEnableDragDrop()) return;

    const { draggedIndex, ListClinic } = this.state;
    if (draggedIndex === null || draggedIndex === dropIndex) {
      this.setState({ draggedIndex: null });
      return;
    }

    const updatedClinics = cloneClinics(ListClinic);
    const [draggedClinic] = updatedClinics.splice(draggedIndex, 1);
    updatedClinics.splice(dropIndex, 0, draggedClinic);
    const reorderedClinics = updatedClinics.map((clinic, index) => ({
      ...clinic,
      displayOrder: index + 1,
    }));

    this.setState({
      ListClinic: reorderedClinics,
      isOrderChanged: true,
      draggedIndex: null,
      currentPage: 1,
    });
  };

  handleSaveOrder = async () => {
    if (!this.state.isOrderChanged) return;
    if (!window.confirm("Bạn có chắc muốn lưu thứ tự hiện tại không?")) return;

    try {
      const items = this.state.ListClinic.map((clinic) => ({
        id: clinic.id,
        displayOrder: clinic.displayOrder,
      }));
      const res = await updateClinicOrder(items);

      if (res?.errCode === 0) {
        toast.success("Cập nhật STT phòng khám thành công.");
        this.props.getAllClinic(this.getClinicRequestOptions());
        return;
      }

      toast.error(res?.errMessage || "Cập nhật STT phòng khám thất bại.");
    } catch (error) {
      toast.error("Cập nhật STT phòng khám thất bại.");
    }
  };

  handleCancelOrderChanges = () => {
    this.resetOrderChanges();
  };

  openPreview = (image) => {
    const previewImg = this.getImageSrc(image);
    if (!previewImg) return;

    this.setState({
      isOpenPreview: true,
      previewImg,
    });
  };

  closePreview = () => {
    this.setState({
      isOpenPreview: false,
      previewImg: "",
    });
  };

  renderPagination = () => {
    const totalPages = this.getTotalPages();
    const { currentPage } = this.state;

    return <PagePagination page={currentPage} totalPages={totalPages} onChange={this.handlePageChange} className="manage-clinic__pagination" previousLabel="Trước" nextLabel="Sau" />;
  };

  renderFooter = () => {
    const totalPages = this.getTotalPages();
    const { currentPage } = this.state;

    return (
      <div className="manage-clinic__footer">
        <span>Trang {currentPage} trên {totalPages}</span>
        {this.renderPagination()}
      </div>
    );
  };

  render() {
    const {
      clinicSearchQuery,
      isActive,
      isOpenPreview,
      previewImg,
      isOrderChanged,
    } = this.state;
    const filteredClinics = this.getFilteredClinics();
    const paginatedClinics = this.getPaginatedClinics();
    const canDragDrop = this.canEnableDragDrop();
    const isClinicManager = this.isClinicManager();

    return (
      <div className="manage-clinic-container">
        <div className="manage-clinic__header">
          <h2>
            <FormattedMessage id="manage-clinic.title" defaultMessage="Manage Clinics" />
          </h2>
          <div className="manage-clinic__header-actions">
            {canDragDrop && isOrderChanged && (
              <>
                <Button color="primary" onClick={this.handleSaveOrder}>
                  Lưu thứ tự
                </Button>
                <Button color="secondary" onClick={this.handleCancelOrderChanges}>
                  Hủy thay đổi
                </Button>
              </>
            )}
            {!isClinicManager && (
              <Button
                color="primary"
                className="btn-add"
                onClick={() => this.props.history.push("/system/add-clinic")}
              >
                <i className="fas fa-plus"></i>
                <span>
                  <FormattedMessage
                    id="manage-clinic.add"
                    defaultMessage="Add Clinic"
                  />
                </span>
              </Button>
            )}
          </div>
        </div>

        <div className="manage-clinic__toolbar">
          <div className="manage-clinic__search">
            <i className="fas fa-search"></i>
            <input
              type="text"
              value={clinicSearchQuery}
              onChange={this.handleSearchChange}
              placeholder="Tìm kiếm theo tên hoặc slug"
            />
          </div>
          <select
            className="manage-clinic__status-filter"
            value={isActive}
            onChange={this.handleStatusChange}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang hiện</option>
            <option value="0">Đang ẩn</option>
          </select>
          <Button color="secondary" outline onClick={this.handleResetFilter}>
            Đặt lại
          </Button>
          <div className="manage-clinic__total">
            {filteredClinics.length} phòng khám
          </div>
        </div>

        <div className="manage-clinic__table-wrapper mt-4">
          <div className="manage-clinic__table-scroll">
          <table className="manage-clinic__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>STT</th>
                <th>Tên phòng khám</th>
                <th>Slug</th>
                <th>Địa chỉ</th>
                <th>Ảnh</th>
                <th>Hiển thị</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClinics.length > 0 ? (
                paginatedClinics.map((clinic) => {
                  const globalIndex = this.state.ListClinic.findIndex(
                    (item) => item.id === clinic.id
                  );
                  const imageSrc = this.getImageSrc(clinic.image);

                  return (
                    <tr
                      key={clinic.id}
                      draggable={canDragDrop}
                      onDragStart={() => this.handleDragStart(globalIndex)}
                      onDragOver={this.handleDragOver}
                      onDrop={() => this.handleDrop(globalIndex)}
                      className={canDragDrop ? "manage-clinic__row--draggable" : ""}
                    >
                      <td>{clinic.id}</td>
                      <td className="manage-clinic__order">
                        {clinic.displayOrder || globalIndex + 1}
                      </td>
                      <td className="manage-clinic__name">{clinic.name}</td>
                      <td className="manage-clinic__slug">{clinic.slug || "-"}</td>
                      <td className="manage-clinic__address">
                        {clinic.address || "-"}
                      </td>
                      <td>
                        {imageSrc ? (
                          <button
                            type="button"
                            className="manage-clinic__image prevent-row-drag"
                            aria-label="Preview clinic image"
                            onClick={() => this.openPreview(clinic.image)}
                          >
                            <img src={imageSrc} alt={clinic.name || "clinic"} />
                          </button>
                        ) : (
                          <span className="manage-clinic__empty-image">Chưa có ảnh</span>
                        )}
                      </td>
                      <td>
                        <div className="form-check form-switch prevent-row-drag">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            disabled={isClinicManager}
                            checked={Number(clinic.isActive) === 1}
                            onChange={() => this.handleToggleStatus(clinic)}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="manage-clinic__actions prevent-row-drag">
                          <button
                            type="button"
                            className="btn-action btn-edit"
                            aria-label="Edit clinic"
                            onClick={() => this.handleEdit(clinic)}
                            title="Sửa phòng khám"
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          {!isClinicManager && (
                          <button
                            type="button"
                            className="btn-action btn-delete"
                            aria-label="Delete clinic"
                            onClick={() => this.handleDelete(clinic)}
                            title="Xóa phòng khám"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="manage-clinic__empty">
                    Không có phòng khám phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
          {this.renderFooter()}
        </div>

        {isOpenPreview && (
          <div className="manage-clinic__preview" onClick={this.closePreview}>
            <div
              className="manage-clinic__preview-inner"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="manage-clinic__preview-close"
                onClick={this.closePreview}
              >
                &times;
              </button>
              <img src={previewImg} alt="clinic preview" />
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  clinics: state.admin.AllClinic,
  adminInfo: state.adminAuth.adminInfo,
  doctorInfo: state.doctor.doctorInfo,
});

const mapDispatchToProps = (dispatch) => ({
  getAllClinic: (options) => dispatch(actions.GetAllClinic(options)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ManageClinic));
