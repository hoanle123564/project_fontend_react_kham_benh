import React, { Component } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

class ClinicDepartmentModal extends Component {
  render() {
    const {
      isOpen,
      mode,
      formData,
      errors,
      clinicOptions,
      specialtyOptions,
      isClinicManager,
      onChange,
      onSubmit,
      onCancel,
    } = this.props;

    const title = mode === "EDIT" ? "Cập nhật khoa" : "Thêm khoa mới";

    return (
      <Modal isOpen={isOpen} toggle={onCancel} centered className="clinic-department-modal">
        <ModalHeader toggle={onCancel}>{title}</ModalHeader>
        <ModalBody>
          <div className="row">
            <div className="col-md-12 mb-3">
              <label className="form-label">Cơ sở y tế</label>
              <select
                className={`form-control ${errors.clinicId ? "input-error" : ""}`}
                value={formData.clinicId}
                onChange={(event) => onChange("clinicId", event.target.value)}
                disabled={mode === "EDIT" || isClinicManager}
              >
                <option value="">Chọn cơ sở y tế</option>
                {clinicOptions.map((clinic) => (
                  <option key={clinic.value} value={clinic.value}>
                    {clinic.label}
                  </option>
                ))}
              </select>
              {errors.clinicId && <div className="error-text">{errors.clinicId}</div>}
            </div>

            <div className="col-md-12 mb-3">
              <label className="form-label">Chuyên khoa</label>
              <select
                className={`form-control ${errors.specialtyId ? "input-error" : ""}`}
                value={formData.specialtyId}
                onChange={(event) => onChange("specialtyId", event.target.value)}
              >
                <option value="">Chọn chuyên khoa chung</option>
                {specialtyOptions.map((specialty) => (
                  <option key={specialty.value} value={specialty.value}>
                    {specialty.label}
                  </option>
                ))}
              </select>
              {errors.specialtyId && <div className="error-text">{errors.specialtyId}</div>}
            </div>


            <div className="col-md-12">
              <label className="form-label d-block">Hiển thị</label>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={Number(formData.isActive) === 1}
                  onChange={(event) => onChange("isActive", event.target.checked ? 1 : 0)}
                />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={onSubmit}>
            Lưu khoa
          </Button>
          <Button color="secondary" onClick={onCancel}>
            Hủy
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default ClinicDepartmentModal;
