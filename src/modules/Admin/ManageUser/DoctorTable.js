import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Button } from "reactstrap";
import { toast } from "react-toastify";
import * as actions from "../../../store/actions";
import {
  buildImageSrc,
  changeStatusDoctorInfo,
  updateDoctorInfoOrder,
} from "../../../services/userService";
import "./DoctorTable.scss";

const getDoctorName = (doctor = {}) =>
  `${doctor.positionVi || ""} ${doctor.firstName || ""} ${doctor.lastName || ""}`
    .replace(/\s+/g, " ")
    .trim();

const cloneDoctors = (doctors = []) =>
  doctors.map((doctor) => ({
    ...doctor,
    isActive: Number(doctor.isActive) === 1 ? 1 : 0,
    displayOrder: Number(doctor.displayOrder) || 0,
  }));

const sortDoctors = (doctors = []) =>
  cloneDoctors(doctors).sort((a, b) => {
    const orderA = Number(a.displayOrder) || Number.MAX_SAFE_INTEGER;
    const orderB = Number(b.displayOrder) || Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) return orderA - orderB;
    return Number(a.id) - Number(b.id);
  });

class DoctorTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ListDoctor: [],
      originalDoctors: [],
      doctorSearchQuery: "",
      specialtyFilter: "",
      currentPage: 1,
      doctorsPerPage: 10,
      isOrderChanged: false,
      draggedIndex: null,
    };
  }

  componentDidMount() {
    this.props.fetchAllDoctor();
    this.props.GetAllSpecialty();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.ListDoctor !== this.props.ListDoctor) {
      const sortedDoctors = sortDoctors(this.props.ListDoctor);
      this.setState({
        ListDoctor: sortedDoctors,
        originalDoctors: cloneDoctors(sortedDoctors),
        isOrderChanged: false,
        draggedIndex: null,
      });
    }
  }

  getFilteredDoctors = () => {
    const { ListDoctor, doctorSearchQuery, specialtyFilter } = this.state;
    const searchValue = doctorSearchQuery.trim().toLowerCase();

    return ListDoctor.filter((doctor) => {
      const doctorName = getDoctorName(doctor).toLowerCase();
      const email = (doctor.email || "").toLowerCase();
      const matchesSearch =
        !searchValue ||
        doctorName.includes(searchValue) ||
        email.includes(searchValue);
      const matchesSpecialty =
        !specialtyFilter || Number(doctor.specialtyId) === Number(specialtyFilter);

      return matchesSearch && matchesSpecialty;
    });
  };

  getPaginatedDoctors = () => {
    const { currentPage, doctorsPerPage } = this.state;
    const indexOfLastDoctor = currentPage * doctorsPerPage;
    const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;

    return this.getFilteredDoctors().slice(indexOfFirstDoctor, indexOfLastDoctor);
  };

  getTotalPages = () => {
    const total = Math.ceil(
      this.getFilteredDoctors().length / this.state.doctorsPerPage
    );
    return total || 1;
  };

  canEnableDragDrop = () =>
    !this.state.doctorSearchQuery.trim() && !this.state.specialtyFilter;


  confirmDiscardOrderChanges = () => {
    if (!this.state.isOrderChanged) return true;

    return window.confirm(
      "Bạn có thay đổi thứ tự chưa lưu. Tiếp tục sẽ bỏ các thay đổi này, bạn có muốn tiếp tục không?"
    );
  };

  resetOrderChanges = (extraState = {}) => {
    this.setState({
      ListDoctor: cloneDoctors(this.state.originalDoctors),
      isOrderChanged: false,
      draggedIndex: null,
      ...extraState,
    });
  };

  handleSearchChange = (event) => {
    const value = event.target.value;
    if (!this.confirmDiscardOrderChanges()) return;

    this.resetOrderChanges({
      doctorSearchQuery: value,
      currentPage: 1,
    });
  };

  handleSpecialtyChange = (event) => {
    const value = event.target.value;
    if (!this.confirmDiscardOrderChanges()) return;

    this.resetOrderChanges({
      specialtyFilter: value,
      currentPage: 1,
    });
  };

  handleResetFilter = () => {
    if (!this.confirmDiscardOrderChanges()) return;

    this.resetOrderChanges({
      doctorSearchQuery: "",
      specialtyFilter: "",
      currentPage: 1,
    });
  };

  handlePageChange = (page) => {
    if (page < 1 || page > this.getTotalPages()) return;
    if (!this.confirmDiscardOrderChanges()) return;

    this.resetOrderChanges({ currentPage: page });
  };

  handleEditDoctor = (doctor) => {
    this.props.history.push("/system/manage-doctor", {
      selectedDoctorId: doctor.id,
    });
  };

  handleToggleStatus = async (doctor) => {
    if (!doctor.doctorInfoId) {
      toast.warning("Vui lòng lưu thông tin bác sĩ trước khi đổi trạng thái hiển thị.");
      return;
    }

    const nextStatus = Number(doctor.isActive) === 1 ? 0 : 1;
    const currentDoctors = cloneDoctors(this.state.ListDoctor);

    this.setState((prevState) => ({
      ListDoctor: prevState.ListDoctor.map((item) =>
        item.id === doctor.id ? { ...item, isActive: nextStatus } : item
      ),
    }));

    try {
      const res = await changeStatusDoctorInfo({
        id: doctor.doctorInfoId,
        isActive: nextStatus,
      });

      if (res?.errCode === 0) {
        toast.success("Cập nhật trạng thái bác sĩ thành công!");
        this.props.fetchAllDoctor();
        return;
      }

      toast.error(res?.errMessage || "Cập nhật trạng thái bác sĩ thất bại.");
      this.setState({ ListDoctor: currentDoctors });
    } catch (error) {
      toast.error("Cập nhật trạng thái bác sĩ thất bại.");
      this.setState({ ListDoctor: currentDoctors });
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

    const { draggedIndex, ListDoctor } = this.state;
    if (draggedIndex === null || draggedIndex === dropIndex) {
      this.setState({ draggedIndex: null });
      return;
    }

    const updatedDoctors = cloneDoctors(ListDoctor);
    const [draggedDoctor] = updatedDoctors.splice(draggedIndex, 1);
    updatedDoctors.splice(dropIndex, 0, draggedDoctor);
    const reorderedDoctors = updatedDoctors.map((doctor, index) => ({
      ...doctor,
      displayOrder: index + 1,
    }));

    this.setState({
      ListDoctor: reorderedDoctors,
      isOrderChanged: true,
      draggedIndex: null,
      currentPage: 1,
    });
  };

  handleSaveOrder = async () => {
    if (!this.state.isOrderChanged) return;
    if (!window.confirm("Bạn có chắc muốn lưu thứ tự hiện tại không?")) return;

    const items = this.state.ListDoctor.filter((doctor) => doctor.doctorInfoId).map(
      (doctor) => ({
        id: doctor.doctorInfoId,
        displayOrder: doctor.displayOrder,
      })
    );

    if (items.length === 0) {
      toast.warning("Chưa có bác sĩ nào có thông tin chi tiết để lưu STT.");
      return;
    }

    try {
      const res = await updateDoctorInfoOrder(items);

      if (res?.errCode === 0) {
        toast.success("Cập nhật STT bác sĩ thành công.");
        this.props.fetchAllDoctor();
        return;
      }

      toast.error(res?.errMessage || "Cập nhật STT bác sĩ thất bại.");
    } catch (error) {
      toast.error("Cập nhật STT bác sĩ thất bại.");
    }
  };

  handleCancelOrderChanges = () => {
    this.resetOrderChanges();
  };

  renderPagination = () => {
    const totalPages = this.getTotalPages();
    const { currentPage } = this.state;

    if (totalPages <= 1) return null;

    return (
      <div className="doctor-table__pagination">
        <button
          type="button"
          onClick={() => this.handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Trước
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            type="button"
            className={page === currentPage ? "active" : ""}
            onClick={() => this.handlePageChange(page)}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => this.handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
      </div>
    );
  };

  render() {
    const {
      doctorSearchQuery,
      specialtyFilter,
      isOrderChanged,
      ListDoctor,
    } = this.state;
    const { ListSpecialty } = this.props;
    const filteredDoctors = this.getFilteredDoctors();
    const paginatedDoctors = this.getPaginatedDoctors();
    const canDragDrop = this.canEnableDragDrop();

    return (
      <div className="doctor-table-container">
        <div className="doctor-table__header">
          <div>
            <h2>Danh sách bác sĩ</h2>
            <p>Quản lý hiển thị, chuyên khoa và STT của thông tin bác sĩ.</p>
          </div>
          <div className="doctor-table__header-actions">
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
            <Button
              color="primary"
              className="doctor-table__manage-button"
              onClick={() => this.props.history.push("/system/manage-doctor")}
            >
              <i className="fas fa-edit"></i>
              <span>Quản lý thông tin bác sĩ</span>
            </Button>
          </div>
        </div>

        <div className="doctor-table__toolbar">
          <div className="doctor-table__search">
            <i className="fas fa-search"></i>
            <input
              type="text"
              value={doctorSearchQuery}
              onChange={this.handleSearchChange}
              placeholder="Tìm kiếm theo tên hoặc email"
            />
          </div>
          <select
            className="doctor-table__specialty-filter"
            value={specialtyFilter}
            onChange={this.handleSpecialtyChange}
          >
            <option value="">Tất cả chuyên khoa</option>
            {ListSpecialty &&
              ListSpecialty.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </option>
              ))}
          </select>
          <Button color="secondary" outline onClick={this.handleResetFilter}>
            Đặt lại
          </Button>
          <div className="doctor-table__total">{filteredDoctors.length} bác sĩ</div>
        </div>

        <div className="doctor-table__table-wrapper mt-4">
          <table className="doctor-table__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>STT</th>
                <th>Thông tin bác sĩ</th>
                <th>Thành phố</th>
                <th>Chuyên khoa</th>
                <th>Hiển thị</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDoctors.length > 0 ? (
                paginatedDoctors.map((doctor) => {
                  const globalIndex = ListDoctor.findIndex(
                    (item) => item.id === doctor.id
                  );
                  const imageSrc = buildImageSrc(doctor.image);
                  const doctorName = getDoctorName(doctor);

                  return (
                    <tr
                      key={doctor.id}
                      draggable={canDragDrop}
                      onDragStart={() => this.handleDragStart(globalIndex)}
                      onDragOver={this.handleDragOver}
                      onDrop={() => this.handleDrop(globalIndex)}
                      className={canDragDrop ? "doctor-table__row--draggable" : ""}
                    >
                      <td className="doctor-table__id">{doctor.id}</td>
                      <td className="doctor-table__order">
                        {doctor.displayOrder || globalIndex + 1}
                      </td>
                      <td>
                        <div className="doctor-table__doctor">
                          <div className="doctor-table__avatar">
                            {imageSrc ? (
                              <img src={imageSrc} alt={doctorName || "doctor"} />
                            ) : (
                              <span>{doctor.lastName?.charAt(0) || "B"}</span>
                            )}
                          </div>
                          <div>
                            <div className="doctor-table__name">
                              {doctorName || "Chưa có tên bác sĩ"}
                            </div>
                            <div className="doctor-table__meta">{doctor.email}</div>
                            <div className="doctor-table__slug">
                              {doctor.slug || "Chưa có slug"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="doctor-table__city">
                        {doctor.province || "Chưa chọn tỉnh thành"}
                      </td>
                      <td>{doctor.specialtyName || "Chưa chọn chuyên khoa"}</td>
                      <td>
                        {doctor.doctorInfoId ? (
                          <div className="form-check form-switch prevent-row-drag">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              checked={Number(doctor.isActive) === 1}
                              onChange={() => this.handleToggleStatus(doctor)}
                            />
                          </div>
                        ) : (
                          <span className="doctor-table__status-note">
                            Chưa có thông tin
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="doctor-table__edit-button prevent-row-drag"
                          onClick={() => this.handleEditDoctor(doctor)}
                          title="Sửa thông tin bác sĩ"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="doctor-table__empty">
                    Không có bác sĩ phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {this.renderPagination()}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  ListDoctor: state.admin.AllDoctor,
  ListSpecialty: state.admin.specialty,
});

const mapDispatchToProps = (dispatch) => ({
  fetchAllDoctor: () => dispatch(actions.fetchAllDoctor()),
  GetAllSpecialty: () => dispatch(actions.GetAllSpecialty()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DoctorTable));
