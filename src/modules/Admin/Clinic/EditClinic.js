import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import {
    ChangeStatusClinicContentSection,
    DeleteClinicContentSection,
    EditClinicContentSection,
    EditClinicId,
    getAllUser,
    getClinicContentSections,
    getDetailClinicById,
    getLookUp,
    postSaveClinicContentSection,
    updateClinicContentSectionOrder,
} from "../../../services/userService";
import { buildImageSrc, readFileAsDataUrl } from "../../../utils/imageUtils";
import { editorFormats, editorModules } from "../../../utils/richTextUtils";
import ClinicForm from "./ClinicForm";
import {
    buildClinicPayload,
    buildLookupOptions,
    buildManagerOptions,
    getDefaultClinicFormData,
    mapClinicToFormData,
    updateClinicFormField,
    validateClinicForm,
} from "./clinicFormUtils";
import "./EditClinic.scss";

const getDefaultSectionForm = (overrides = {}) => ({
    id: null,
    title: "",
    contentHTML: "",
    isActive: "1",
    displayOrder: "",
    ...overrides,
});

const cloneSections = (sections = []) =>
    sections.map((section) => ({
        ...section,
        displayOrder: Number(section.displayOrder) || 0,
        isActive: Number(section.isActive) === 1 ? 1 : 0,
    }));

const sortSections = (sections = []) =>
    cloneSections(sections).sort((a, b) => {
        const orderA = Number(a.displayOrder) || 0;
        const orderB = Number(b.displayOrder) || 0;

        if (orderA !== orderB) return orderA - orderB;
        return Number(a.id) - Number(b.id);
    });

class EditClinic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clinicId: null,
            formData: getDefaultClinicFormData(),
            clinicTypeOptions: [],
            managerOptions: [],
            provinceOptions: [],
            districtOptions: [],
            wardOptions: [],
            previewImg: "",
            previewBannerImg: "",
            slugTouched: false,
            errors: {},
            isSubmitting: false,
            contentSections: [],
            originalContentSections: [],
            sectionForm: getDefaultSectionForm(),
            sectionErrors: {},
            editingSectionId: null,
            isSectionSubmitting: false,
            isSectionOrderChanged: false,
            draggedSectionIndex: null,
        };
    }

    componentDidMount() {
        this.loadClinic();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.language !== this.props.language) {
            this.loadFormOptions(this.state.formData.provinceCode, this.state.formData.districtCode);
        }
    }

    isDoctorRoute = () => window.location.pathname.startsWith("/doctor");

    getCurrentActor = () =>
        this.isDoctorRoute() ? this.props.doctorInfo : this.props.adminInfo;

    isScopedManager = () => ["R2", "R4"].includes(this.getCurrentActor()?.roleId);

    loadFormOptions = async (provinceCode = "", districtCode = "") => {
        try {
            const currentActor = this.getCurrentActor();
            const userRequest = this.isDoctorRoute()
                ? Promise.resolve({ users: currentActor ? [currentActor] : [] })
                : getAllUser("ALL");
            const [clinicTypeRes, provinceRes, userRes, districtRes, wardRes] = await Promise.all([
                getLookUp("CLINIC_TYPE"),
                getLookUp("PROVINCE"),
                userRequest,
                provinceCode ? getLookUp("DISTRICT", provinceCode) : Promise.resolve({ data: [] }),
                districtCode ? getLookUp("WARD", districtCode) : Promise.resolve({ data: [] }),
            ]);

            this.setState({
                clinicTypeOptions: buildLookupOptions(clinicTypeRes?.data || [], this.props.language),
                provinceOptions: buildLookupOptions(provinceRes?.data || [], this.props.language),
                managerOptions: buildManagerOptions(userRes?.users || []),
                districtOptions: buildLookupOptions(districtRes?.data || [], this.props.language),
                wardOptions: buildLookupOptions(wardRes?.data || [], this.props.language),
            });
        } catch (error) {
            console.log("load clinic edit form options error", error);
        }
    };

    loadDistrictOptions = async (provinceCode) => {
        if (!provinceCode) {
            this.setState({ districtOptions: [], wardOptions: [] });
            return;
        }

        const res = await getLookUp("DISTRICT", provinceCode);
        this.setState({
            districtOptions: buildLookupOptions(res?.data || [], this.props.language),
            wardOptions: [],
        });
    };

    loadWardOptions = async (districtCode) => {
        if (!districtCode) {
            this.setState({ wardOptions: [] });
            return;
        }

        const res = await getLookUp("WARD", districtCode);
        this.setState({
            wardOptions: buildLookupOptions(res?.data || [], this.props.language),
        });
    };

    loadClinic = async () => {
        const routeId = this.props.match?.params?.id;
        const stateItem = this.props.location?.state?.clinicData;
        let clinicData = this.isScopedManager() ? null : stateItem || null;

        if (!clinicData && routeId) {
            try {
                const res = await getDetailClinicById(routeId, "ALL", {
                    managedOnly: this.isScopedManager(),
                });
                if (res && res.errCode === 0) {
                    clinicData = Array.isArray(res.data) ? res.data[0] : res.data;
                }
            } catch (error) {
                console.log("loadClinic detail error", error);
            }
        }

        if (!clinicData) {
            toast.error("Không tìm thấy cơ sở y tế.");
            this.handleBack();
            return;
        }

        const clinicId = clinicData.id || routeId;
        this.setState({
            clinicId,
            previewImg: buildImageSrc(clinicData.image),
            previewBannerImg: buildImageSrc(clinicData.banner_img),
            formData: mapClinicToFormData(clinicData),
            slugTouched: false,
        }, () => {
            this.loadFormOptions(clinicData.provinceCode || "", clinicData.districtCode || "");
            this.loadContentSections(clinicId);
        });
    };

    handleInputChange = (event, field) => {
        const value = event.target.value;

        this.setState((prevState) => {
            const nextState = updateClinicFormField(
                prevState.formData,
                field,
                value,
                prevState.slugTouched
            );

            return {
                formData: nextState.formData,
                slugTouched: nextState.slugTouched,
                errors: {
                    ...prevState.errors,
                    [field]: "",
                },
            };
        });

        if (field === "provinceCode") {
            this.loadDistrictOptions(value);
        }

        if (field === "districtCode") {
            this.loadWardOptions(value);
        }
    };

    handleImageChange = async (event, field = "image", previewField = "previewImg") => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const result = await readFileAsDataUrl(file);
            this.setState((prevState) => ({
                [previewField]: result,
                formData: {
                    ...prevState.formData,
                    [field]: String(result).split(",")[1] || "",
                },
                errors: {
                    ...prevState.errors,
                    [field]: "",
                },
            }));
        } catch (error) {
            console.log("handle clinic image error", error);
        }
    };

    handleRemoveImage = (field = "image", previewField = "previewImg") => {
        this.setState((prevState) => ({
            [previewField]: "",
            formData: {
                ...prevState.formData,
                [field]: "",
            },
        }));
    };

    validateForm = () => {
        const errors = validateClinicForm(this.state.formData);
        this.setState({ errors });
        return Object.keys(errors).length === 0;
    };

    handleSaveContent = async () => {
        if (!this.validateForm() || this.state.isSubmitting) {
            return;
        }

        this.setState({ isSubmitting: true });

        try {
            const res = await EditClinicId(buildClinicPayload(this.state.formData, this.state.clinicId));

            if (res && res.errCode === 0) {
                toast.success("Cập nhật cơ sở y tế thành công!");
                this.handleBack();
            } else {
                toast.error(res?.errMessage || "Cập nhật cơ sở y tế thất bại.");
            }
        } catch (error) {
            console.error("EditClinicId error", error);
            toast.error("Có lỗi xảy ra khi lưu cơ sở y tế.");
        } finally {
            this.setState({ isSubmitting: false });
        }
    };

    handleBack = () => {
        this.props.history.push(
            this.isDoctorRoute() ? "/doctor/manage-clinic" : "/system/manage-clinic"
        );
    };

    getNextSectionDisplayOrder = () =>
        this.state.contentSections.reduce((maxValue, section) => {
            const currentValue = Number(section.displayOrder) || 0;
            return currentValue > maxValue ? currentValue : maxValue;
        }, 0) + 1;

    loadContentSections = async (clinicId = this.state.clinicId) => {
        if (!clinicId) return;

        try {
            const res = await getClinicContentSections(clinicId);
            if (!res || res.errCode !== 0) {
                toast.error(res?.errMessage || "Không tải được section.");
                return;
            }

            const sections = sortSections(res.data || []);
            this.setState({
                contentSections: sections,
                originalContentSections: cloneSections(sections),
                sectionForm: getDefaultSectionForm({
                    displayOrder: sections.reduce(
                        (maxValue, item) => Math.max(maxValue, Number(item.displayOrder) || 0),
                        0
                    ) + 1,
                }),
                editingSectionId: null,
                isSectionOrderChanged: false,
                draggedSectionIndex: null,
            });
        } catch (error) {
            console.log("loadContentSections error", error);
            toast.error("Không tải được section.");
        }
    };

    handleSectionInputChange = (event, field) => {
        const value = event.target.value;

        this.setState((prevState) => {
            const nextForm = {
                ...prevState.sectionForm,
                [field]: value,
            };

            return {
                sectionForm: nextForm,
                sectionErrors: {
                    ...prevState.sectionErrors,
                    [field]: "",
                },
            };
        });
    };

    handleSectionEditorChange = (value) => {
        this.setState((prevState) => ({
            sectionForm: {
                ...prevState.sectionForm,
                contentHTML: value,
            },
        }));
    };

    validateSectionForm = () => {
        const errors = {};

        if (!String(this.state.sectionForm.title || "").trim()) {
            errors.title = "Vui lòng nhập tiêu đề section.";
        }

        this.setState({ sectionErrors: errors });
        return Object.keys(errors).length === 0;
    };

    resetSectionForm = () => {
        this.setState({
            sectionForm: getDefaultSectionForm({ displayOrder: this.getNextSectionDisplayOrder() }),
            sectionErrors: {},
            editingSectionId: null,
        });
    };

    handleSaveSection = async () => {
        if (!this.validateSectionForm() || this.state.isSectionSubmitting) {
            return;
        }

        const payload = {
            ...this.state.sectionForm,
            clinicId: Number(this.state.clinicId),
            isActive: Number(this.state.sectionForm.isActive),
            displayOrder: Number(this.state.sectionForm.displayOrder) || this.getNextSectionDisplayOrder(),
        };

        this.setState({ isSectionSubmitting: true });

        try {
            const res = this.state.editingSectionId
                ? await EditClinicContentSection({ ...payload, id: this.state.editingSectionId })
                : await postSaveClinicContentSection(payload);

            if (res && res.errCode === 0) {
                toast.success("Lưu section thành công.");
                await this.loadContentSections(this.state.clinicId);
                return;
            }

            toast.error(res?.errMessage || "Lưu section thất bại.");
        } catch (error) {
            console.log("handleSaveSection error", error);
            toast.error("Lưu section thất bại.");
        } finally {
            this.setState({ isSectionSubmitting: false });
        }
    };

    handleEditSection = (section) => {
        this.setState({
            editingSectionId: section.id,
            sectionForm: getDefaultSectionForm({
                id: section.id,
                title: section.title || "",
                contentHTML: section.contentHTML || "",
                isActive: String(section.isActive ?? 1),
                displayOrder: section.displayOrder || 1,
            }),
            sectionErrors: {},
        });
    };

    handleSectionRowKeyDown = (section) => (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        this.handleEditSection(section);
    };

    handleDeleteSection = async (section) => {
        if (!window.confirm("Bạn có chắc muốn xóa section này không?")) {
            return;
        }

        try {
            const res = await DeleteClinicContentSection({
                id: section.id,
                clinicId: Number(this.state.clinicId),
            });

            if (res && res.errCode === 0) {
                toast.success("Xóa section thành công.");
                await this.loadContentSections(this.state.clinicId);
                return;
            }

            toast.error(res?.errMessage || "Xóa section thất bại.");
        } catch (error) {
            console.log("handleDeleteSection error", error);
            toast.error("Xóa section thất bại.");
        }
    };

    handleToggleSectionStatus = async (section) => {
        const nextStatus = Number(section.isActive) === 1 ? 0 : 1;

        try {
            const res = await ChangeStatusClinicContentSection({
                id: section.id,
                clinicId: Number(this.state.clinicId),
                isActive: nextStatus,
            });

            if (res && res.errCode === 0) {
                await this.loadContentSections(this.state.clinicId);
                return;
            }

            toast.error(res?.errMessage || "Cập nhật trạng thái thất bại.");
        } catch (error) {
            console.log("handleToggleSectionStatus error", error);
            toast.error("Cập nhật trạng thái thất bại.");
        }
    };

    handleSectionDragStart = (index) => (event) => {
        if (event.target.closest(".prevent-row-drag")) {
            event.preventDefault();
            return;
        }

        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(index));
        this.setState({ draggedSectionIndex: index });
    };

    handleSectionDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    };

    handleSectionDrop = (dropIndex) => (event) => {
        event.preventDefault();
        const dragIndexFromData = Number(event.dataTransfer.getData("text/plain"));
        const draggedIndex = Number.isInteger(dragIndexFromData)
            ? dragIndexFromData
            : this.state.draggedSectionIndex;

        if (!Number.isInteger(draggedIndex) || draggedIndex < 0 || draggedIndex === dropIndex) {
            this.setState({ draggedSectionIndex: null });
            return;
        }

        const updatedSections = cloneSections(this.state.contentSections);
        const [draggedItem] = updatedSections.splice(draggedIndex, 1);
        updatedSections.splice(dropIndex, 0, draggedItem);
        const reorderedSections = updatedSections.map((section, index) => ({
            ...section,
            displayOrder: index + 1,
        }));

        this.setState({
            contentSections: reorderedSections,
            isSectionOrderChanged: true,
            draggedSectionIndex: null,
        });
    };

    handleSectionDragEnd = () => {
        this.setState({ draggedSectionIndex: null });
    };

    handleResetSectionOrder = () => {
        this.setState({
            contentSections: cloneSections(this.state.originalContentSections),
            isSectionOrderChanged: false,
            draggedSectionIndex: null,
        });
    };

    handleSaveSectionOrder = async () => {
        const items = this.state.contentSections.map((section) => ({
            id: section.id,
            displayOrder: Number(section.displayOrder),
        }));

        try {
            const res = await updateClinicContentSectionOrder(this.state.clinicId, items);
            if (res && res.errCode === 0) {
                toast.success("Cập nhật thứ tự section thành công.");
                await this.loadContentSections(this.state.clinicId);
                return;
            }

            toast.error(res?.errMessage || "Cập nhật thứ tự section thất bại.");
        } catch (error) {
            console.log("handleSaveSectionOrder error", error);
            toast.error("Cập nhật thứ tự section thất bại.");
        }
    };

    renderSectionManager = () => {
        const {
            contentSections,
            sectionForm,
            sectionErrors,
            editingSectionId,
            isSectionSubmitting,
            isSectionOrderChanged,
        } = this.state;

        return (
            <div className="clinic-section-manager">
                <div className="clinic-section-manager__inner">
                    <div className="clinic-section-manager__header">
                        <h3>Section nội dung</h3>
                        <div className="clinic-section-manager__actions">
                            {isSectionOrderChanged && (
                                <>
                                    <Button color="primary" onClick={this.handleSaveSectionOrder}>
                                        Lưu thứ tự
                                    </Button>
                                    <Button color="secondary" onClick={this.handleResetSectionOrder}>
                                        Hủy
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="clinic-section-manager__grid">
                        <div className="clinic-section-manager__form-card">
                            <div className="row g-3">
                                <div className="col-md-8">
                                    <label className="form-label">Tiêu đề</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        value={sectionForm.title}
                                        onChange={(event) => this.handleSectionInputChange(event, "title")}
                                    />
                                    {sectionErrors.title && (
                                        <span className="field-error">{sectionErrors.title}</span>
                                    )}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Hiển thị</label>
                                    <div className="form-check form-switch clinic-section-manager__switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={Number(sectionForm.isActive) === 1}
                                            onChange={(event) =>
                                                this.handleSectionInputChange(
                                                    { target: { value: event.target.checked ? "1" : "0" } },
                                                    "isActive"
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <ReactQuill
                                        theme="snow"
                                        value={sectionForm.contentHTML}
                                        onChange={this.handleSectionEditorChange}
                                        modules={editorModules}
                                        formats={editorFormats}
                                    />
                                </div>
                            </div>

                            <div className="clinic-section-manager__form-actions">
                                <Button color="secondary" onClick={this.resetSectionForm}>
                                    {editingSectionId ? "Hủy sửa" : "Làm mới"}
                                </Button>
                                <Button color="primary" onClick={this.handleSaveSection} disabled={isSectionSubmitting}>
                                    {editingSectionId ? "Cập nhật section" : "Thêm section"}
                                </Button>
                            </div>
                        </div>

                        <div className="clinic-section-manager__table-card">
                            <table>
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Tên</th>
                                        <th>Xóa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contentSections.length > 0 ? (
                                        contentSections.map((section, index) => (
                                            <tr
                                                key={section.id}
                                                className={editingSectionId === section.id ? "active" : ""}
                                                draggable
                                                tabIndex="0"
                                                aria-label={`Mở section ${section.title || index + 1}`}
                                                onClick={() => this.handleEditSection(section)}
                                                onKeyDown={this.handleSectionRowKeyDown(section)}
                                                onDragStart={this.handleSectionDragStart(index)}
                                                onDragOver={this.handleSectionDragOver}
                                                onDrop={this.handleSectionDrop(index)}
                                                onDragEnd={this.handleSectionDragEnd}
                                            >
                                                <td className="clinic-section-manager__order">
                                                    {section.displayOrder || index + 1}
                                                </td>
                                                <td className="clinic-section-manager__title">{section.title}</td>
                                                <td className="prevent-row-drag">
                                                    <div className="clinic-section-manager__row-actions">
                                                        <button
                                                            type="button"
                                                            className="clinic-section-manager__icon-button clinic-section-manager__icon-button--delete"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                this.handleDeleteSection(section);
                                                            }}
                                                            onKeyDown={(event) => event.stopPropagation()}
                                                            aria-label="Xóa section"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="clinic-section-manager__empty">
                                                Chưa có section.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    render() {
        return (
            <>
                <ClinicForm
                    mode="EDIT"
                    formData={this.state.formData}
                    previewImg={this.state.previewImg}
                    previewBannerImg={this.state.previewBannerImg}
                    errors={this.state.errors}
                    isSubmitting={this.state.isSubmitting}
                    language={this.props.language}
                    clinicTypeOptions={this.state.clinicTypeOptions}
                    managerOptions={this.state.managerOptions}
                    managerLocked={this.isDoctorRoute()}
                    provinceOptions={this.state.provinceOptions}
                    districtOptions={this.state.districtOptions}
                    wardOptions={this.state.wardOptions}
                    onInputChange={this.handleInputChange}
                    onImageChange={this.handleImageChange}
                    onRemoveImage={this.handleRemoveImage}
                    onSubmit={this.handleSaveContent}
                    onBack={this.handleBack}
                />
                {this.state.clinicId && this.renderSectionManager()}
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
    adminInfo: state.adminAuth.adminInfo,
    doctorInfo: state.doctor.doctorInfo,
});

export default connect(mapStateToProps)(EditClinic);
