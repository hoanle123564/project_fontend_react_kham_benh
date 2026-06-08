import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import * as action from "../../../store/actions";
import "./ManageDoctor.scss";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Select from "react-select";
import { toast } from "react-toastify";
import { buildImageSrc } from "../../../services/userService";

const editorModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link", "image"],
    ["clean"],
  ],
};

const editorFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "blockquote",
  "code-block",
  "link",
  "image",
];

const generateSlug = (value = "") => {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const hasVisibleEditorContent = (value) => {
  if (!value) return false;

  const plainText = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();

  return plainText.length > 0;
};

class ManageDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contentMarkdown: "",
      contentHTML: "",

      selectDoctor: "",
      selectPrice: "",
      selectPayment: "",
      selectprovince: "",
      selectClinic: "",
      selectSpecialty: "",

      ListProvinces: [],
      ListDoctor: [],
      ListPrice: [],
      ListPayment: [],
      ListSpecialty: [],
      ListClinic: [],
      description: "",
      slug: "",
      isActive: 1,
      displayOrder: 1,
      image: "",
      previewImg: "",
      didSelectRouteDoctor: false,
    };
  }

  componentDidMount() {
    this.props.fetchAllDoctor();
    this.props.GetDAllRequire();
    this.props.GetAllSpecialty();
    this.props.getAllClinic();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.ListDoctor !== this.props.ListDoctor) {
      const List = this.buildDataSelect(this.props.ListDoctor, "USERS");
      this.setState({ ListDoctor: List }, this.selectDoctorFromRoute);
    }

    const shouldRebuildOptions =
      prevProps.AllRequire !== this.props.AllRequire ||
      prevProps.ListSpecialty !== this.props.ListSpecialty ||
      prevProps.ListClinic !== this.props.ListClinic ||
      prevProps.ListVietNamProvinces !== this.props.ListVietNamProvinces ||
      prevProps.language !== this.props.language;

    if (shouldRebuildOptions) {
      this.rebuildOptions();
    }
  }

  selectDoctorFromRoute = () => {
    const selectedDoctorId = this.props.location?.state?.selectedDoctorId;
    if (
      !selectedDoctorId ||
      this.state.didSelectRouteDoctor ||
      !this.state.ListDoctor.length
    ) {
      return;
    }

    const selectedDoctor = this.state.ListDoctor.find(
      (item) => Number(item.value) === Number(selectedDoctorId)
    );

    if (selectedDoctor) {
      this.setState({ didSelectRouteDoctor: true }, () => {
        this.handleChangeSelect(selectedDoctor, { name: "selectDoctor" });
      });
    }
  };

  rebuildOptions = () => {
    const ListPri = this.buildDataSelect(this.props.AllRequire?.ResPri, "PRICE");
    const ListPay = this.buildDataSelect(this.props.AllRequire?.ResPay, "PAYMENT");
    const ListSpec = this.buildDataSelect(this.props.ListSpecialty, "SPECIALTY");
    const ListClin = this.buildDataSelect(this.props.ListClinic, "CLINIC");
    const ListProvinceFormatted = (this.props.ListVietNamProvinces || []).map(
      (item) => ({
        label: item,
        value: item,
      })
    );

    const selectedPrice = ListPri.find(
      (item) => item.value === this.state.selectPrice?.value
    );
    const selectedPayment = ListPay.find(
      (item) => item.value === this.state.selectPayment?.value
    );
    const selectedSpecialty = ListSpec.find(
      (item) => item.value === this.state.selectSpecialty?.value
    );
    const selectedClinic = ListClin.find(
      (item) => item.value === this.state.selectClinic?.value
    );
    const selectedProvince = ListProvinceFormatted.find(
      (item) => item.value === this.state.selectprovince?.value
    );

    this.setState(
      {
        ListPrice: ListPri,
        ListPayment: ListPay,
        ListProvinces: ListProvinceFormatted,
        ListSpecialty: ListSpec,
        ListClinic: ListClin,
        selectPrice: selectedPrice || this.state.selectPrice,
        selectPayment: selectedPayment || this.state.selectPayment,
        selectSpecialty: selectedSpecialty || this.state.selectSpecialty,
        selectClinic: selectedClinic || this.state.selectClinic,
        selectprovince: selectedProvince || this.state.selectprovince,
      },
      () => {
        if (this.state.selectDoctor?.value) {
          this.handleChangeSelect(this.state.selectDoctor, { name: "selectDoctor" });
        }
      }
    );
  };

  buildDataSelect = (inputData = [], type) => {
    const result = [];

    inputData.forEach((item) => {
      if (type === "USERS") {
        result.push({
          label: `${item.firstName || ""} ${item.lastName || ""}`.trim(),
          value: item.id,
        });
      }

      if (type === "PRICE") {
        result.push({
          label:
            this.props.language === "vi"
              ? `${item.value_vi} VNĐ`
              : `${item.value_en} USD`,
          value: item.keyMap,
        });
      }

      if (type === "PAYMENT") {
        result.push({
          label: this.props.language === "vi" ? item.value_vi : item.value_en,
          value: item.keyMap,
        });
      }

      if (type === "SPECIALTY") {
        result.push({
          label: item.name,
          value: item.id,
        });
      }

      if (type === "CLINIC") {
        result.push({
          label: item.name,
          value: item.id,
        });
      }
    });

    return result;
  };

  getNextDisplayOrder = () => {
    const maxOrder = (this.props.ListDoctor || []).reduce((maxValue, item) => {
      const order = Number(item.displayOrder) || 0;
      return order > maxValue ? order : maxValue;
    }, 0);

    return maxOrder + 1;
  };

  handleEditorChange = (value) => {
    this.setState({
      contentHTML: value,
      contentMarkdown: value,
    });
  };

  handleChangeSelect = async (option, meta) => {
    if (!meta?.name) return;

    this.setState({ [meta.name]: option });

    if (meta.name !== "selectDoctor" || !option?.value) return;

    const res = await this.props.GetDetailDoctor(option.value);
    const { ListPayment, ListPrice, ListSpecialty, ListProvinces, ListClinic } =
      this.state;
    const findPayment = ListPayment.find((item) => item.value === res?.paymentId);
    const findPrice = ListPrice.find((item) => item.value === res?.priceId);
    const findSpecialty = ListSpecialty.find(
      (item) => item.value === res?.specialtyId
    );
    const findProvince = ListProvinces.find((item) => item.label === res?.province);
    const findClinic = ListClinic.find((item) => item.value === res?.clinicId);

    this.setState({
      contentHTML: res?.contentHTML || "",
      contentMarkdown: res?.contentMarkdown || res?.contentHTML || "",
      description: res?.description || "",
      selectPrice: findPrice || "",
      selectPayment: findPayment || "",
      selectprovince: findProvince || "",
      selectSpecialty: findSpecialty || "",
      selectClinic: findClinic || "",
      slug: res?.slug || generateSlug(option.label),
      isActive: Number(res?.isActive) === 0 ? 0 : 1,
      displayOrder: Number(res?.displayOrder) || this.getNextDisplayOrder(),
      image: res?.image || "",
      previewImg: buildImageSrc(res?.image),
    });
  };

  handleOnChangeText = (event, id) => {
    this.setState({
      [id]: event.target.value,
    });
  };

  handleToggleActive = (event) => {
    this.setState({
      isActive: event.target.checked ? 1 : 0,
    });
  };

  handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      const base64Image = String(result).split(",")[1] || "";

      this.setState({
        image: base64Image,
        previewImg: result,
      });
    };
    reader.readAsDataURL(file);
  };

  handleRemoveImage = () => {
    this.setState({
      image: "",
      previewImg: "",
    });
  };

  validateForm = () => {
    if (!this.state.selectDoctor?.value) {
      toast.error("Vui lòng chọn bác sĩ.");
      return false;
    }

    if (!this.state.slug.trim()) {
      toast.error("Vui lòng nhập slug.");
      return false;
    }

    if (!Number(this.state.displayOrder) || Number(this.state.displayOrder) < 1) {
      toast.error("STT tự động chưa hợp lệ.");
      return false;
    }

    if (!this.state.description.trim()) {
      toast.error("Vui lòng nhập phần giới thiệu bác sĩ.");
      return false;
    }

    if (!this.state.selectPrice?.value) {
      toast.error("Vui lòng chọn giá khám.");
      return false;
    }

    if (!this.state.selectPayment?.value) {
      toast.error("Vui lòng chọn phương thức thanh toán.");
      return false;
    }

    if (!this.state.selectprovince?.value) {
      toast.error("Vui lòng chọn tỉnh thành.");
      return false;
    }

    if (!this.state.selectSpecialty?.value) {
      toast.error("Vui lòng chọn chuyên khoa.");
      return false;
    }

    if (!this.state.selectClinic?.value) {
      toast.error("Vui lòng chọn phòng khám.");
      return false;
    }

    if (!hasVisibleEditorContent(this.state.contentHTML)) {
      toast.error("Vui lòng nhập thông tin chi tiết bác sĩ.");
      return false;
    }

    return true;
  };

  handleSaveContent = async () => {
    if (!this.validateForm()) return;

    const res = await this.props.SaveDetailDoctor({
      contentHTML: this.state.contentHTML,
      contentMarkdown: this.state.contentMarkdown,
      description: this.state.description,
      doctorId: this.state.selectDoctor.value,
      priceId: this.state.selectPrice.value,
      paymentId: this.state.selectPayment.value,
      province: this.state.selectprovince.label,
      specialtyId: this.state.selectSpecialty.value,
      clinicId: this.state.selectClinic.value,
      slug: this.state.slug,
      isActive: this.state.isActive,
      displayOrder: Number(this.state.displayOrder),
      image: this.state.image,
    });

    if (res?.errCode === 0) {
      const selectedDoctor = this.state.selectDoctor;
      this.props.fetchAllDoctor();
      await this.handleChangeSelect(selectedDoctor, { name: "selectDoctor" });
    }
  };

  render() {
    const { language } = this.props;
    const {
      contentHTML,
      selectDoctor,
      selectPrice,
      selectPayment,
      selectprovince,
      selectClinic,
      selectSpecialty,
      description,
      slug,
      isActive,
      displayOrder,
      previewImg,
    } = this.state;

    return (
      <div className="manage-doctor-container">
        <div className="manage-doctor__header">
          <div>
            <h2>Quản lý thông tin bác sĩ</h2>
            <p>Cập nhật hồ sơ, chuyên khoa, trạng thái hiển thị và ảnh bác sĩ.</p>
          </div>
          <button
            type="button"
            className="manage-doctor__back-button"
            onClick={() => this.props.history.push("/system/doctor-table")}
          >
            Quay lại danh sách
          </button>
        </div>

        <div className="manage-doctor__content">
          <div className="manage-doctor__main">
            <div className="manage-doctor__section">
              <div className="manage-doctor__grid manage-doctor__grid--top row">
                <div className="form-group col-5">
                  <label>Chọn bác sĩ</label>
                  <Select
                    value={selectDoctor}
                    onChange={this.handleChangeSelect}
                    name="selectDoctor"
                    options={this.state.ListDoctor}
                    placeholder={
                      language === "vi" ? "Chọn bác sĩ ..." : "Select doctor ..."
                    }
                  />
                </div>
                <div className="manage-doctor__meta-row row mt-3">
                  <div className="form-group col-5">
                    <label>Slug</label>
                    <input
                      className="form-control"
                      value={slug}
                      onChange={(event) => this.handleOnChangeText(event, "slug")}
                      placeholder="vi-du-bac-si"
                    />
                  </div>
                  <div className="manage-doctor__active-field col-3">
                    <label>Hiển thị</label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        checked={Number(isActive) === 1}
                        onChange={this.handleToggleActive}
                      />
                      <span>{Number(isActive) === 1 ? "Đang hiện" : "Đang ẩn"}</span>
                    </div>
                  </div>
                </div>

                <div className="form-group col-12 mt-3">
                  <label>Giới thiệu bác sĩ</label>
                  <textarea
                    className="form-control"
                    placeholder={
                      language === "vi"
                        ? "Giới thiệu bác sĩ ..."
                        : "Introduce the doctor ..."
                    }
                    rows={4}
                    value={description}
                    onChange={(event) =>
                      this.handleOnChangeText(event, "description")
                    }
                  />
                </div>
              </div>


            </div>

            <div className="manage-doctor__section">
              <div className="manage-doctor__grid manage-doctor__grid--three">
                <div className="form-group">
                  <label>Giá khám</label>
                  <Select
                    value={selectPrice}
                    onChange={this.handleChangeSelect}
                    name="selectPrice"
                    options={this.state.ListPrice}
                    placeholder={
                      language === "vi"
                        ? "Chọn giá khám ..."
                        : "Select examination fee ..."
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Phương thức thanh toán</label>
                  <Select
                    value={selectPayment}
                    onChange={this.handleChangeSelect}
                    name="selectPayment"
                    options={this.state.ListPayment}
                    placeholder={
                      language === "vi"
                        ? "Chọn phương thức ..."
                        : "Select payment method ..."
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Tỉnh thành</label>
                  <Select
                    value={selectprovince}
                    onChange={this.handleChangeSelect}
                    name="selectprovince"
                    options={this.state.ListProvinces}
                    placeholder={
                      language === "vi"
                        ? "Chọn tỉnh thành ..."
                        : "Select province ..."
                    }
                  />
                </div>
              </div>

              <div className="manage-doctor__grid manage-doctor__grid--two">
                <div className="form-group">
                  <label>Chuyên khoa</label>
                  <Select
                    value={selectSpecialty}
                    onChange={this.handleChangeSelect}
                    name="selectSpecialty"
                    options={this.state.ListSpecialty}
                    placeholder={
                      language === "vi"
                        ? "Chọn chuyên khoa ..."
                        : "Select specialty ..."
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Phòng khám</label>
                  <Select
                    value={selectClinic}
                    onChange={this.handleChangeSelect}
                    name="selectClinic"
                    options={this.state.ListClinic}
                    placeholder={
                      language === "vi"
                        ? "Chọn phòng khám ..."
                        : "Select clinic ..."
                    }
                  />
                </div>
              </div>
            </div>

            <div className="manage-doctor__section manage-doctor__editor">
              <label className="editor-label">
                {language === "vi"
                  ? "Thông tin chi tiết bác sĩ"
                  : "Doctor detailed information"}
              </label>
              <ReactQuill
                theme="snow"
                value={contentHTML}
                onChange={this.handleEditorChange}
                modules={editorModules}
                formats={editorFormats}
                placeholder={
                  language === "vi"
                    ? "Nhập thông tin chi tiết của bác sĩ..."
                    : "Enter doctor detailed information..."
                }
              />
            </div>

            <button
              type="button"
              className="save-content-doctor"
              onClick={this.handleSaveContent}
            >
              Lưu thông tin bác sĩ
            </button>
          </div>

          <aside className="manage-doctor__side">
            <div className="manage-doctor__photo-card">
              <div className="manage-doctor__photo-header">
                <h3>Ảnh bác sĩ</h3>
                <span>Lưu vào hồ sơ người dùng</span>
              </div>

              <div className="manage-doctor__photo-preview">
                {previewImg ? (
                  <img src={previewImg} alt="Xem trước ảnh bác sĩ" />
                ) : (
                  <div>Chưa có ảnh</div>
                )}
              </div>

              <div className="manage-doctor__photo-actions">
                <label htmlFor="doctor-image-upload">Chọn ảnh</label>
                <input
                  id="doctor-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={this.handleImageChange}
                />
                {previewImg && (
                  <button type="button" onClick={this.handleRemoveImage}>
                    Xóa ảnh
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    ListDoctor: state.admin.AllDoctor,
    DetailDoctor: state.admin.DetailDoctor,
    AllRequire: state.admin.AllRequire,
    ListVietNamProvinces: state.admin.vietnamProvinces,
    ListSpecialty: state.admin.specialty,
    ListClinic: state.admin.AllClinic,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllDoctor: () => dispatch(action.fetchAllDoctor()),
    SaveDetailDoctor: (data) => dispatch(action.SaveDetailDoctor(data)),
    GetDetailDoctor: (id) => dispatch(action.GetDetailDoctor(id)),
    GetDAllRequire: () => dispatch(action.GetDAllRequire()),
    GetAllSpecialty: () => dispatch(action.GetAllSpecialty()),
    getAllClinic: () => dispatch(action.GetAllClinic()),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ManageDoctor));
