import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { FormattedMessage } from "react-intl";
import { toast } from "react-toastify";
import * as actions from "../../../store/actions";
import {
  ChangeStatusClinicDepartment,
  EditClinicDepartmentId,
  getClinicDepartment,
  postSaveClinicDepartment,
} from "../../../services/userService";
import ClinicDepartmentModal from "./ClinicDepartmentModal";
import "./ManageClinicDepartment.scss";

const MODAL_MODE = {
  CREATE: "CREATE",
  EDIT: "EDIT",
};

class ManageClinicDepartment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      departments: [],
      selectedClinicId: "",
      loading: false,
      isOpenModal: false,
      modalMode: MODAL_MODE.CREATE,
      currentDepartment: null,
      errors: {},
      formData: this.getResetFormData(""),
    };
  }

  componentDidMount() {
    this.props.GetAllClinic(this.getClinicRequestOptions());
    this.props.GetAllSpecialty();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.ListClinic !== this.props.ListClinic ||
      prevProps.adminInfo !== this.props.adminInfo ||
      prevProps.doctorInfo !== this.props.doctorInfo
    ) {
      const visibleClinics = this.getVisibleClinics();
      const hasSelectedClinic = visibleClinics.some(
        (clinic) => Number(clinic.id) === Number(this.state.selectedClinicId)
      );
      const nextClinicId = hasSelectedClinic
        ? this.state.selectedClinicId
        : visibleClinics[0]?.id || "";

      if (String(nextClinicId || "") !== String(this.state.selectedClinicId || "")) {
        this.setState(
          {
            selectedClinicId: nextClinicId ? String(nextClinicId) : "",
            formData: this.getResetFormData(nextClinicId ? String(nextClinicId) : ""),
          },
          () => {
            if (nextClinicId) {
              this.loadDepartments(nextClinicId);
            } else {
              this.setState({ departments: [] });
            }
          }
        );
      }
    }
  }

  getResetFormData = (clinicId) => ({
    clinicId: clinicId || "",
    specialtyId: "",
    isActive: 1,
  });

  isDoctorRoute = () => window.location.pathname.startsWith("/doctor");

  getCurrentActor = () =>
    this.isDoctorRoute() ? this.props.doctorInfo : this.props.adminInfo;

  isClinicManager = () => ["R2", "R4"].includes(this.getCurrentActor()?.roleId);

  getClinicRequestOptions = () =>
    this.isClinicManager() ? { managedOnly: true } : {};

  getVisibleClinics = () => {
    if (!this.isClinicManager()) {
      return this.props.ListClinic || [];
    }

    return (this.props.ListClinic || []).filter(
      (clinic) => Number(clinic.managerUserId) === Number(this.getCurrentActor()?.id)
    );
  };

  getClinicOptions = () =>
    this.getVisibleClinics().map((clinic) => ({
      value: clinic.id,
      label: clinic.name,
    }));

  getSpecialtyOptions = () =>
    (this.props.ListSpecialty || []).map((specialty) => ({
      value: specialty.id,
      label: specialty.name,
    }));

  getSelectedClinicName = () => {
    const clinic = this.getVisibleClinics().find(
      (item) => Number(item.id) === Number(this.state.selectedClinicId)
    );
    return clinic?.name || "";
  };

  loadDepartments = async (clinicId) => {
    if (!clinicId) {
      this.setState({ departments: [] });
      return;
    }

    this.setState({ loading: true });

    try {
      const res = await getClinicDepartment(clinicId);
      if (res?.errCode === 0) {
        this.setState({ departments: res.data || [] });
      } else {
        this.setState({ departments: [] });
        toast.error(res?.errMessage || "Không tải được danh sách khoa.");
      }
    } catch (error) {
      this.setState({ departments: [] });
      toast.error("Không tải được danh sách khoa.");
    } finally {
      this.setState({ loading: false });
    }
  };

  handleClinicChange = (event) => {
    const selectedClinicId = event.target.value;
    this.setState(
      {
        selectedClinicId,
        formData: this.getResetFormData(selectedClinicId),
      },
      () => {
        if (selectedClinicId) {
          this.loadDepartments(selectedClinicId);
        } else {
          this.setState({ departments: [] });
        }
      }
    );
  };

  openCreateModal = () => {
    if (!this.state.selectedClinicId) {
      toast.warning("Vui lòng chọn cơ sở trước khi tạo khoa.");
      return;
    }

    this.setState({
      isOpenModal: true,
      modalMode: MODAL_MODE.CREATE,
      currentDepartment: null,
      errors: {},
      formData: this.getResetFormData(this.state.selectedClinicId),
    });
  };

  openEditModal = (department) => {
    this.setState({
      isOpenModal: true,
      modalMode: MODAL_MODE.EDIT,
      currentDepartment: department,
      errors: {},
      formData: {
        clinicId: String(department.clinicId || ""),
        specialtyId: department.specialtyId ? String(department.specialtyId) : "",
        isActive: Number(department.isActive) === 1 ? 1 : 0,
      },
    });
  };

  closeModal = () => {
    this.setState({
      isOpenModal: false,
      currentDepartment: null,
      errors: {},
      formData: this.getResetFormData(this.state.selectedClinicId),
    });
  };

  handleFormChange = (field, value) => {
    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        [field]: value,
      },
      errors: {
        ...prevState.errors,
        [field]: "",
      },
    }));
  };

  validateForm = () => {
    const errors = {};

    if (!String(this.state.formData.clinicId || "").trim()) {
      errors.clinicId = "Vui lòng chọn cơ sở y tế.";
    }

    if (!String(this.state.formData.specialtyId || "").trim()) {
      errors.specialtyId = "Please select a specialty.";
      errors.specialtyId = "Please select a specialty.";
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  handleSubmitModal = async () => {
    if (!this.validateForm()) {
      return;
    }

    const payload = {
      clinicId: Number(this.state.formData.clinicId),
      specialtyId: Number(this.state.formData.specialtyId),
      isActive: Number(this.state.formData.isActive) === 1 ? 1 : 0,
    };

    try {
      if (this.state.modalMode === MODAL_MODE.CREATE) {
        const res = await postSaveClinicDepartment(payload);
        if (res?.errCode === 0) {
          toast.success("Tạo khoa thành công.");
          this.closeModal();
          await this.loadDepartments(payload.clinicId);
        } else {
          toast.error(res?.errMessage || "Tạo khoa thất bại.");
        }
        return;
      }

      const res = await EditClinicDepartmentId({
        ...payload,
        id: this.state.currentDepartment?.id,
      });

      if (res?.errCode === 0) {
        toast.success("Cập nhật khoa thành công.");
        this.closeModal();
        await this.loadDepartments(payload.clinicId);
      } else {
        toast.error(res?.errMessage || "Cập nhật khoa thất bại.");
      }
    } catch (error) {
      toast.error("Không thể lưu thông tin khoa.");
    }
  };

  handleToggleStatus = async (department) => {
    const nextIsActive = Number(department.isActive) === 1 ? 0 : 1;

    this.setState((prevState) => ({
      departments: prevState.departments.map((item) =>
        item.id === department.id ? { ...item, isActive: nextIsActive } : item
      ),
    }));

    try {
      const res = await ChangeStatusClinicDepartment({
        id: department.id,
        isActive: nextIsActive,
      });

      if (res?.errCode === 0) {
        toast.success("Cập nhật trạng thái khoa thành công.");
        return;
      }

      toast.error(res?.errMessage || "Cập nhật trạng thái khoa thất bại.");
      this.loadDepartments(this.state.selectedClinicId);
    } catch (error) {
      toast.error("Cập nhật trạng thái khoa thất bại.");
      this.loadDepartments(this.state.selectedClinicId);
    }
  };

  render() {
    const {
      departments,
      selectedClinicId,
      loading,
      isOpenModal,
      modalMode,
      formData,
      errors,
    } = this.state;
    const clinicOptions = this.getClinicOptions();
    const specialtyOptions = this.getSpecialtyOptions();

    return (
      <div className="manage-clinic-department-container">
        <div className="manage-clinic-department__header">
          <div>
            <h2>
              <FormattedMessage
                id="manage-clinic-department.title"
                defaultMessage="Manage Clinic Departments"
              />
            </h2>
            <p>Quản lý khoa theo từng cơ sở, gán chuyên khoa chung và trưởng khoa nếu cần.</p>
          </div>
          <Button color="primary" className="manage-clinic-department__add" onClick={this.openCreateModal}>
            <i className="fas fa-plus"></i>
            <span>Tạo khoa</span>
          </Button>
        </div>

        <div className="manage-clinic-department__toolbar">
          <div className="manage-clinic-department__filter">
            <label>Cơ sở y tế</label>
            <select
              className="manage-clinic-department__select"
              value={selectedClinicId}
              onChange={this.handleClinicChange}
              disabled={this.isClinicManager()}
            >
              <option value="">Chọn cơ sở y tế</option>
              {clinicOptions.map((clinic) => (
                <option key={clinic.value} value={clinic.value}>
                  {clinic.label}
                </option>
              ))}
            </select>
          </div>

          <div className="manage-clinic-department__summary">
            {selectedClinicId ? (
              <>
                <strong>{this.getSelectedClinicName()}</strong>
                <span>{departments.length} khoa</span>
              </>
            ) : (
              <span>Chọn cơ sở để xem danh sách khoa</span>
            )}
          </div>
        </div>

        <div className="manage-clinic-department__table-card">
          <div className="manage-clinic-department__table-scroll">
            <table className="manage-clinic-department__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên khoa</th>
                  <th>Hiển thị</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {!selectedClinicId ? (
                  <tr>
                    <td colSpan="4" className="manage-clinic-department__empty">
                      Vui lòng chọn cơ sở để tải danh sách khoa.
                    </td>
                  </tr>
                ) : loading ? (
                  <tr>
                    <td colSpan="4" className="manage-clinic-department__empty">
                      Đang tải danh sách khoa...
                    </td>
                  </tr>
                ) : departments.length > 0 ? (
                  departments.map((department) => (
                    <tr key={department.id}>
                      <td>{department.id}</td>
                      <td className="manage-clinic-department__name">{department.specialtyName}</td>
                      <td>
                        <div className="form-check form-switch d-inline-flex justify-content-center">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={Number(department.isActive) === 1}
                            onChange={() => this.handleToggleStatus(department)}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="manage-clinic-department__actions">
                          <button
                            type="button"
                            className="manage-clinic-department__action manage-clinic-department__action--edit"
                            aria-label="Edit department"
                            onClick={() => this.openEditModal(department)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="manage-clinic-department__empty">
                      Cơ sở này chưa có khoa nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ClinicDepartmentModal
          isOpen={isOpenModal}
          mode={modalMode}
          formData={formData}
          errors={errors}
          clinicOptions={clinicOptions}
          specialtyOptions={specialtyOptions}
          isClinicManager={this.isClinicManager()}
          onChange={this.handleFormChange}
          onSubmit={this.handleSubmitModal}
          onCancel={this.closeModal}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  ListClinic: state.admin.AllClinic,
  ListSpecialty: state.admin.specialty,
  adminInfo: state.adminAuth.adminInfo,
  doctorInfo: state.doctor.doctorInfo,
});

const mapDispatchToProps = (dispatch) => ({
  GetAllClinic: (options) => dispatch(actions.GetAllClinic(options)),
  GetAllSpecialty: () => dispatch(actions.GetAllSpecialty()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageClinicDepartment);
