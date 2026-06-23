import React, { Component } from "react";
import { injectIntl } from "react-intl";
import moment from "moment";
import { toast } from "react-toastify";
import {
    closeMedicalRecord,
    completeMedicalRecordVisit,
    ensureDoctorMedicalRecord,
    getMedicalRecordDetail,
    saveMedicalRecordDraft,
    saveMedicalRecordParaclinicalResults,
    saveMedicalRecordPrescription,
} from "../../../services/userService";
import "./MedicalRecordWorkspace.scss";

const VISIT_STATUS = Object.freeze({
    WAITING: "VS1",
    IN_PROGRESS: "VS2",
    COMPLETED: "VS3",
});

const MEDICAL_RECORD_STATUS = Object.freeze({
    DRAFT: "MR1",
    CLOSED: "MR2",
});

const EMPTY_RECORD_FORM = {
    heightCm: "",
    weightKg: "",
    bloodPressure: "",
    pulsePerMinute: "",
    respiratoryRate: "",
    bmi: "",
    symptoms: "",
    preliminaryDiagnosis: "",
    doctorConclusion: "",
    followUpDate: "",
    generalNote: "",
};

const EMPTY_PRESCRIPTION_ITEM = {
    medicineName: "",
    dosageForm: "",
    usageDays: "",
    morningQty: "",
    noonQty: "",
    afternoonQty: "",
    eveningQty: "",
    totalQuantity: "",
    instruction: "",
};

const EMPTY_PARACLINICAL_ITEM = {
    type: "",
    name: "",
    resultSummary: "",
    note: "",
};

class MedicalRecordWorkspace extends Component {
    constructor(props) {
        super(props);
        this.recordRequestId = 0;
        this.state = this.getInitialState();
    }

    componentDidMount() {
        this.loadRecordFromProps();
    }

    componentDidUpdate(prevProps) {
        if (
            this.getMedicalRecordId(prevProps) !== this.getMedicalRecordId(this.props) ||
            this.getExaminationVisitId(prevProps) !== this.getExaminationVisitId(this.props)
        ) {
            this.loadRecordFromProps();
        }
    }

    getInitialState = () => ({
        record: null,
        recordForm: { ...EMPTY_RECORD_FORM },
        prescriptionNote: "",
        prescriptionItems: [{ ...EMPTY_PRESCRIPTION_ITEM }],
        paraclinicalItems: [{ ...EMPTY_PARACLINICAL_ITEM }],
        isLoading: false,
        isCreating: false,
        isSavingDraft: false,
        isSavingPrescription: false,
        isSavingParaclinical: false,
        isCompleting: false,
        isClosing: false,
    });

    getText = (key, defaultMessage = key) =>
        this.props.intl.formatMessage({
            id: `doctor.record-workspace.${key}`,
            defaultMessage,
        });

    getMedicalRecordId = (props = this.props) =>
        props.selectedVisitDetail?.medicalRecordId || props.selectedItem?.medicalRecordId || null;

    getExaminationVisitId = (props = this.props) =>
        props.selectedVisitDetail?.id ||
        props.selectedVisitDetail?.examinationVisitId ||
        props.selectedItem?.examinationVisitId ||
        null;

    getVisitStatusId = () =>
        this.props.selectedVisitDetail?.statusId ||
        this.props.selectedVisitDetail?.visitStatusId ||
        this.props.selectedItem?.visitStatusId ||
        null;

    getRecordStatusId = () =>
        this.state.record?.statusId ||
        this.props.selectedVisitDetail?.medicalRecordStatusId ||
        this.props.selectedItem?.medicalRecordStatusId ||
        null;

    canEditRecord = () => this.getRecordStatusId() !== MEDICAL_RECORD_STATUS.CLOSED;

    formatDateForInput = (value) => {
        if (!value) return "";
        const date = moment(value);
        return date.isValid() ? date.format("YYYY-MM-DD") : "";
    };

    calculateBmi = (heightCm, weightKg) => {
        const height = Number(heightCm);
        const weight = Number(weightKg);
        if (!height || !weight) return "";
        return (weight / Math.pow(height / 100, 2)).toFixed(2);
    };

    isPrescriptionQuantityField = (fieldName) =>
        [
            "usageDays",
            "morningQty",
            "noonQty",
            "afternoonQty",
            "eveningQty",
            "totalQuantity",
        ].includes(fieldName);

    normalizePrescriptionQuantity = (value, integerOnly = false) => {
        if (value === undefined || value === null || String(value).trim() === "") return "";

        const normalized = Number(value);
        if (!Number.isFinite(normalized)) return "";

        const nonNegativeValue = Math.max(normalized, 0);
        return integerOnly ? String(Math.floor(nonNegativeValue)) : String(nonNegativeValue);
    };

    getPrescriptionQuantityNumber = (value) => {
        const normalized = Number(value);
        return Number.isFinite(normalized) && normalized > 0 ? normalized : 0;
    };

    calculatePrescriptionTotal = (item = {}) => {
        const usageDays = this.getPrescriptionQuantityNumber(item.usageDays);
        const dailyQuantity =
            this.getPrescriptionQuantityNumber(item.morningQty) +
            this.getPrescriptionQuantityNumber(item.noonQty) +
            this.getPrescriptionQuantityNumber(item.afternoonQty) +
            this.getPrescriptionQuantityNumber(item.eveningQty);

        return usageDays * dailyQuantity;
    };

    normalizePrescriptionItemForState = (item = {}) => {
        const nextItem = { ...EMPTY_PRESCRIPTION_ITEM, ...item };
        Object.keys(nextItem).forEach((fieldName) => {
            if (this.isPrescriptionQuantityField(fieldName)) {
                nextItem[fieldName] = this.normalizePrescriptionQuantity(
                    nextItem[fieldName],
                    fieldName === "usageDays"
                );
            }
        });
        nextItem.totalQuantity = String(this.calculatePrescriptionTotal(nextItem));
        return nextItem;
    };

    mapRecordToState = (record = {}) => {
        const prescription = record.prescription || {};
        const prescriptionItems =
            Array.isArray(prescription.items) && prescription.items.length > 0
                ? prescription.items.map(this.normalizePrescriptionItemForState)
                : [{ ...EMPTY_PRESCRIPTION_ITEM }];
        const paraclinicalItems =
            Array.isArray(record.paraclinicalResults) && record.paraclinicalResults.length > 0
                ? record.paraclinicalResults.map((item) => ({ ...EMPTY_PARACLINICAL_ITEM, ...item }))
                : [{ ...EMPTY_PARACLINICAL_ITEM }];

        return {
            record,
            recordForm: Object.keys(EMPTY_RECORD_FORM).reduce((form, fieldName) => {
                form[fieldName] =
                    fieldName === "followUpDate"
                        ? this.formatDateForInput(record[fieldName])
                        : record[fieldName] ?? "";
                return form;
            }, {}),
            prescriptionNote: prescription.note || "",
            prescriptionItems,
            paraclinicalItems,
        };
    };

    loadRecordFromProps = () => {
        const medicalRecordId = this.getMedicalRecordId();
        this.recordRequestId += 1;

        if (!medicalRecordId) {
            this.setState(this.getInitialState());
            return;
        }

        this.fetchMedicalRecord(medicalRecordId, this.recordRequestId);
    };

    fetchMedicalRecord = async (medicalRecordId, requestId = this.recordRequestId + 1) => {
        this.recordRequestId = requestId;
        this.setState({ isLoading: true });

        try {
            const response = await getMedicalRecordDetail(medicalRecordId);
            if (requestId !== this.recordRequestId) return;

            if (!response || response.errCode !== 0) {
                this.setState({ ...this.getInitialState(), isLoading: false });
                toast.error(response?.errMessage || this.getText("loadError"));
                return;
            }

            this.setState({
                ...this.mapRecordToState(response.data || {}),
                isLoading: false,
            });
        } catch (error) {
            if (requestId !== this.recordRequestId) return;
            this.setState({ ...this.getInitialState(), isLoading: false });
            toast.error(this.getText("loadError"));
        }
    };

    handleCreateRecord = async () => {
        const examinationVisitId = this.getExaminationVisitId();
        if (!examinationVisitId || this.state.isCreating) return;

        this.setState({ isCreating: true });
        try {
            const response = await ensureDoctorMedicalRecord(examinationVisitId);
            if (!response || response.errCode !== 0) {
                toast.error(response?.errMessage || this.getText("createError"));
                this.setState({ isCreating: false });
                return;
            }

            const record = response.data || {};
            this.props.onRecordChanged && this.props.onRecordChanged(record);
            this.setState({ isCreating: false });
            if (record.id) {
                this.fetchMedicalRecord(record.id);
            }
        } catch (error) {
            toast.error(this.getText("createError"));
            this.setState({ isCreating: false });
        }
    };

    handleRecordFieldChange = (fieldName, value) => {
        this.setState((prevState) => {
            const recordForm = {
                ...prevState.recordForm,
                [fieldName]: value,
            };

            if (fieldName === "heightCm" || fieldName === "weightKg") {
                recordForm.bmi = this.calculateBmi(recordForm.heightCm, recordForm.weightKg);
            }

            return { recordForm };
        });
    };

    handlePrescriptionItemChange = (index, fieldName, value) => {
        this.setState((prevState) => {
            const prescriptionItems = prevState.prescriptionItems.map((item, itemIndex) =>
                itemIndex === index
                    ? this.normalizePrescriptionItemForState({
                        ...item,
                        [fieldName]: this.isPrescriptionQuantityField(fieldName)
                            ? this.normalizePrescriptionQuantity(value, fieldName === "usageDays")
                            : value,
                    })
                    : item
            );
            return { prescriptionItems };
        });
    };

    handleParaclinicalItemChange = (index, fieldName, value) => {
        this.setState((prevState) => {
            const paraclinicalItems = prevState.paraclinicalItems.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [fieldName]: value } : item
            );
            return { paraclinicalItems };
        });
    };

    addPrescriptionItem = () => {
        this.setState((prevState) => ({
            prescriptionItems: [...prevState.prescriptionItems, { ...EMPTY_PRESCRIPTION_ITEM }],
        }));
    };

    removePrescriptionItem = (index) => {
        this.setState((prevState) => ({
            prescriptionItems:
                prevState.prescriptionItems.length > 1
                    ? prevState.prescriptionItems.filter((_, itemIndex) => itemIndex !== index)
                    : [{ ...EMPTY_PRESCRIPTION_ITEM }],
        }));
    };

    addParaclinicalItem = () => {
        this.setState((prevState) => ({
            paraclinicalItems: [...prevState.paraclinicalItems, { ...EMPTY_PARACLINICAL_ITEM }],
        }));
    };

    removeParaclinicalItem = (index) => {
        this.setState((prevState) => ({
            paraclinicalItems:
                prevState.paraclinicalItems.length > 1
                    ? prevState.paraclinicalItems.filter((_, itemIndex) => itemIndex !== index)
                    : [{ ...EMPTY_PARACLINICAL_ITEM }],
        }));
    };

    getRecordPayload = () => ({
        medicalRecordId: this.getMedicalRecordId(),
        draft: this.state.recordForm,
    });

    getPrescriptionPayload = () => ({
        medicalRecordId: this.getMedicalRecordId(),
        note: this.state.prescriptionNote,
        items: this.state.prescriptionItems.map(this.normalizePrescriptionItemForState),
    });

    getParaclinicalPayload = () => ({
        medicalRecordId: this.getMedicalRecordId(),
        items: this.state.paraclinicalItems,
    });

    validatePrescriptionItems = () => {
        const invalidItem = this.state.prescriptionItems.some((item) =>
            ["usageDays", "morningQty", "noonQty", "afternoonQty", "eveningQty"].some(
                (fieldName) => Number(item[fieldName] || 0) < 0
            )
        );

        if (invalidItem) {
            toast.error(this.getText("prescriptionNumberInvalid", "Prescription quantities must not be negative."));
            return false;
        }

        return true;
    };

    validateCompleteVisit = () => {
        const symptoms = String(this.state.recordForm.symptoms || "").trim();

        if (!symptoms) {
            toast.error(this.getText("symptomsRequired", "Please enter symptoms."));
            return false;
        }

        return this.validatePrescriptionItems();
    };

    handleSaveDraft = async () => {
        const medicalRecordId = this.getMedicalRecordId();
        if (!medicalRecordId || this.state.isSavingDraft) return false;

        this.setState({ isSavingDraft: true });
        try {
            const response = await saveMedicalRecordDraft(this.getRecordPayload());
            if (!response || response.errCode !== 0) {
                toast.error(response?.errMessage || this.getText("saveError"));
                this.setState({ isSavingDraft: false });
                return false;
            }

            const mappedRecord = this.mapRecordToState({
                ...(this.state.record || {}),
                ...(response.data || {}),
                prescription: this.state.record?.prescription,
                paraclinicalResults: this.state.record?.paraclinicalResults,
            });
            this.setState({
                record: mappedRecord.record,
                recordForm: mappedRecord.recordForm,
                isSavingDraft: false,
            });
            toast.success(this.getText("draftSaved"));
            return true;
        } catch (error) {
            toast.error(this.getText("saveError"));
            this.setState({ isSavingDraft: false });
            return false;
        }
    };

    handleSavePrescription = async () => {
        const medicalRecordId = this.getMedicalRecordId();
        if (!medicalRecordId || this.state.isSavingPrescription) return false;
        if (!this.validatePrescriptionItems()) return false;

        this.setState({ isSavingPrescription: true });
        try {
            const response = await saveMedicalRecordPrescription(this.getPrescriptionPayload());
            if (!response || response.errCode !== 0) {
                toast.error(response?.errMessage || this.getText("saveError"));
                this.setState({ isSavingPrescription: false });
                return false;
            }

            this.setState((prevState) => ({
                record: {
                    ...(prevState.record || {}),
                    prescription: response.data || null,
                },
                prescriptionNote: response.data?.note || "",
                prescriptionItems:
                    response.data?.items?.length > 0
                        ? response.data.items.map(this.normalizePrescriptionItemForState)
                        : [{ ...EMPTY_PRESCRIPTION_ITEM }],
                isSavingPrescription: false,
            }));
            toast.success(this.getText("prescriptionSaved"));
            return true;
        } catch (error) {
            toast.error(this.getText("saveError"));
            this.setState({ isSavingPrescription: false });
            return false;
        }
    };

    handleSaveParaclinical = async () => {
        const medicalRecordId = this.getMedicalRecordId();
        if (!medicalRecordId || this.state.isSavingParaclinical) return false;

        this.setState({ isSavingParaclinical: true });
        try {
            const response = await saveMedicalRecordParaclinicalResults(this.getParaclinicalPayload());
            if (!response || response.errCode !== 0) {
                toast.error(response?.errMessage || this.getText("saveError"));
                this.setState({ isSavingParaclinical: false });
                return false;
            }

            this.setState((prevState) => ({
                record: {
                    ...(prevState.record || {}),
                    paraclinicalResults: response.data || [],
                },
                paraclinicalItems:
                    response.data?.length > 0
                        ? response.data.map((item) => ({ ...EMPTY_PARACLINICAL_ITEM, ...item }))
                        : [{ ...EMPTY_PARACLINICAL_ITEM }],
                isSavingParaclinical: false,
            }));
            toast.success(this.getText("paraclinicalSaved"));
            return true;
        } catch (error) {
            toast.error(this.getText("saveError"));
            this.setState({ isSavingParaclinical: false });
            return false;
        }
    };

    handleCompleteVisit = async () => {
        const medicalRecordId = this.getMedicalRecordId();
        if (!medicalRecordId || this.state.isCompleting) return;
        if (!this.validateCompleteVisit()) return;

        this.setState({ isCompleting: true });
        try {
            const response = await completeMedicalRecordVisit({
                ...this.getRecordPayload(),
                prescription: {
                    note: this.state.prescriptionNote,
                    items: this.state.prescriptionItems,
                },
                paraclinicalResults: this.state.paraclinicalItems,
            });

            if (!response || response.errCode !== 0) {
                toast.error(response?.errMessage || this.getText("completeError"));
                this.setState({ isCompleting: false });
                return;
            }

            const record = response.data?.record || this.state.record || {};
            this.setState({
                ...this.mapRecordToState({
                    ...record,
                    prescription: this.state.record?.prescription,
                    paraclinicalResults: this.state.record?.paraclinicalResults,
                }),
                isCompleting: false,
            });
            toast.success(this.getText("completedSaved"));
            this.props.onVisitCompleted && this.props.onVisitCompleted(response.data || {});
            this.fetchMedicalRecord(medicalRecordId);
        } catch (error) {
            toast.error(this.getText("completeError"));
            this.setState({ isCompleting: false });
        }
    };

    handleCloseRecord = async () => {
        const medicalRecordId = this.getMedicalRecordId();
        const visitCompleted = this.getVisitStatusId() === VISIT_STATUS.COMPLETED;

        if (!medicalRecordId || this.state.isClosing || !this.canEditRecord()) return;
        if (!visitCompleted) {
            toast.error(this.getText("completeBeforeClose"));
            return;
        }

        if (!window.confirm(this.getText("closeConfirm"))) return;

        this.setState({ isClosing: true });
        try {
            const response = await closeMedicalRecord({ medicalRecordId });
            if (!response || response.errCode !== 0) {
                toast.error(response?.errMessage || this.getText("closeError"));
                this.setState({ isClosing: false });
                return;
            }

            const record = response.data || {};
            const nextRecord = {
                ...(this.state.record || {}),
                ...record,
                statusId: record.statusId || MEDICAL_RECORD_STATUS.CLOSED,
            };

            this.setState({
                record: nextRecord,
                isClosing: false,
            });
            toast.success(
                response.closedNow === false ? this.getText("recordClosed") : this.getText("closeSuccess")
            );
            this.props.onRecordChanged && this.props.onRecordChanged(nextRecord);
        } catch (error) {
            toast.error(this.getText("closeError"));
            this.setState({ isClosing: false });
        }
    };

    renderInput = (fieldName, options = {}) => {
        const { recordForm } = this.state;
        const ComponentTag = options.multiline ? "textarea" : "input";
        return (
            <label className={options.wide ? "wide" : ""}>
                <span>{this.getText(fieldName)}</span>
                <ComponentTag
                    type={options.type || "text"}
                    value={recordForm[fieldName]}
                    rows={options.rows || 3}
                    disabled={!this.canEditRecord()}
                    onChange={(event) => this.handleRecordFieldChange(fieldName, event.target.value)}
                />
            </label>
        );
    };

    renderVitals = () => (
        <section className="medical-record-workspace__section">
            <h4>{this.getText("vitals")}</h4>
            <div className="medical-record-workspace__grid compact">
                {this.renderInput("heightCm", { type: "number" })}
                {this.renderInput("weightKg", { type: "number" })}
                {this.renderInput("bloodPressure")}
                {this.renderInput("pulsePerMinute", { type: "number" })}
                {this.renderInput("respiratoryRate", { type: "number" })}
                {this.renderInput("bmi", { type: "number" })}
            </div>
        </section>
    );

    renderClinical = () => (
        <section className="medical-record-workspace__section">
            <h4>{this.getText("clinical")}</h4>
            <div className="medical-record-workspace__grid">
                {this.renderInput("symptoms", { multiline: true })}
                {this.renderInput("preliminaryDiagnosis", { multiline: true })}
                {this.renderInput("doctorConclusion", { multiline: true })}
            </div>
        </section>
    );

    renderFollowUp = () => (
        <section className="medical-record-workspace__section">
            <h4>{this.getText("followUp")}</h4>
            <div className="medical-record-workspace__grid">
                {this.renderInput("followUpDate", { type: "date" })}
                {this.renderInput("generalNote", { multiline: true, wide: true })}
            </div>
        </section>
    );

    renderPrescription = () => (
        <section className="medical-record-workspace__section">
            <div className="medical-record-workspace__section-title">
                <h4>{this.getText("prescription")}</h4>
                <button type="button" onClick={this.addPrescriptionItem} disabled={!this.canEditRecord()}>
                    <i className="bi bi-plus-lg" />
                    {this.getText("addMedicine")}
                </button>
            </div>

            <div className="medical-record-workspace__table-scroll">
                <table className="medical-record-workspace__mini-table prescription">
                    <thead>
                        <tr>
                            <th>{this.getText("medicineName")}</th>
                            <th>{this.getText("dosageForm")}</th>
                            <th>{this.getText("usageDays")}</th>
                            <th>{this.getText("morningQty")}</th>
                            <th>{this.getText("noonQty")}</th>
                            <th>{this.getText("afternoonQty")}</th>
                            <th>{this.getText("eveningQty")}</th>
                            <th>{this.getText("totalQuantity")}</th>
                            <th>{this.getText("instruction")}</th>
                            <th>{this.getText("remove")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.prescriptionItems.map((item, index) => (
                            <tr key={`prescription-${index}`}>
                                <td>{this.renderPrescriptionTableField(index, item, "medicineName")}</td>
                                <td>{this.renderPrescriptionTableField(index, item, "dosageForm")}</td>
                                <td>{this.renderPrescriptionTableField(index, item, "usageDays", "number")}</td>
                                <td>{this.renderPrescriptionTableField(index, item, "morningQty", "number")}</td>
                                <td>{this.renderPrescriptionTableField(index, item, "noonQty", "number")}</td>
                                <td>{this.renderPrescriptionTableField(index, item, "afternoonQty", "number")}</td>
                                <td>{this.renderPrescriptionTableField(index, item, "eveningQty", "number")}</td>
                                <td>
                                    {this.renderPrescriptionTableField(index, item, "totalQuantity", "number", {
                                        readOnly: true,
                                    })}
                                </td>
                                <td>{this.renderPrescriptionTableField(index, item, "instruction")}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="medical-record-workspace__remove icon-only"
                                        onClick={() => this.removePrescriptionItem(index)}
                                        disabled={!this.canEditRecord()}
                                        title={this.getText("remove")}
                                    >
                                        <i className="bi bi-trash" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <label className="medical-record-workspace__single-field mt-4">
                <span>{this.getText("note")}</span>
                <textarea
                    value={this.state.prescriptionNote}
                    rows={2}
                    disabled={!this.canEditRecord()}
                    onChange={(event) => this.setState({ prescriptionNote: event.target.value })}
                />
            </label>
            <button
                type="button"
                className="medical-record-workspace__secondary"
                onClick={this.handleSavePrescription}
                disabled={!this.canEditRecord() || this.state.isSavingPrescription}
            >
                <i className="bi bi-capsule" />
                {this.state.isSavingPrescription ? this.getText("saving") : this.getText("savePrescription")}
            </button>
        </section>
    );

    renderPrescriptionTableField = (index, item, fieldName, type = "text", options = {}) => (
        <input
            type={type}
            min={type === "number" ? "0" : undefined}
            value={item[fieldName] ?? ""}
            readOnly={options.readOnly}
            disabled={!this.canEditRecord()}
            onChange={(event) =>
                this.handlePrescriptionItemChange(index, fieldName, event.target.value)
            }
        />
    );

    renderParaclinical = () => (
        <section className="medical-record-workspace__section">
            <div className="medical-record-workspace__section-title">
                <h4>{this.getText("paraclinical")}</h4>
                <button type="button" onClick={this.addParaclinicalItem} disabled={!this.canEditRecord()}>
                    <i className="bi bi-plus-lg" />
                    {this.getText("addParaclinical")}
                </button>
            </div>
            <div className="medical-record-workspace__table-scroll">
                <table className="medical-record-workspace__mini-table paraclinical">
                    <thead>
                        <tr>
                            <th>{this.getText("type")}</th>
                            <th>{this.getText("name")}</th>
                            <th>{this.getText("resultSummary")}</th>
                            <th>{this.getText("note")}</th>
                            <th>{this.getText("remove")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.paraclinicalItems.map((item, index) => (
                            <tr key={`paraclinical-${index}`}>
                                <td>{this.renderParaclinicalField(index, item, "type")}</td>
                                <td>{this.renderParaclinicalField(index, item, "name")}</td>
                                <td>{this.renderParaclinicalField(index, item, "resultSummary")}</td>
                                <td>{this.renderParaclinicalField(index, item, "note")}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="medical-record-workspace__remove icon-only"
                                        onClick={() => this.removeParaclinicalItem(index)}
                                        disabled={!this.canEditRecord()}
                                        title={this.getText("remove")}
                                    >
                                        <i className="bi bi-trash" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button
                type="button"
                className="medical-record-workspace__secondary"
                onClick={this.handleSaveParaclinical}
                disabled={!this.canEditRecord() || this.state.isSavingParaclinical}
            >
                <i className="bi bi-clipboard2-pulse" />
                {this.state.isSavingParaclinical
                    ? this.getText("saving")
                    : this.getText("saveParaclinical")}
            </button>
        </section>
    );

    renderParaclinicalField = (index, item, fieldName) => (
        <input
            value={item[fieldName] ?? ""}
            disabled={!this.canEditRecord()}
            onChange={(event) =>
                this.handleParaclinicalItemChange(index, fieldName, event.target.value)
            }
        />
    );

    renderActions = () => {
        const visitCompleted = this.getVisitStatusId() === VISIT_STATUS.COMPLETED;
        const recordClosed = this.getRecordStatusId() === MEDICAL_RECORD_STATUS.CLOSED;
        return (
            <div className="medical-record-workspace__actions">
                {recordClosed && <span>{this.getText("recordClosed")}</span>}
                {visitCompleted && <span>{this.getText("completed")}</span>}
                <button
                    type="button"
                    onClick={this.handleSaveDraft}
                    disabled={!this.canEditRecord() || this.state.isSavingDraft}
                >
                    <i className="bi bi-save" />
                    {this.state.isSavingDraft ? this.getText("saving") : this.getText("saveDraft")}
                </button>
                <button
                    type="button"
                    className="complete"
                    onClick={this.handleCompleteVisit}
                    disabled={
                        !this.canEditRecord() ||
                        visitCompleted ||
                        this.state.isCompleting ||
                        this.getVisitStatusId() !== VISIT_STATUS.IN_PROGRESS
                    }
                >
                    <i className="bi bi-check2-circle" />
                    {this.state.isCompleting ? this.getText("saving") : this.getText("completeVisit")}
                </button>
                <button
                    type="button"
                    className="close-record"
                    onClick={this.handleCloseRecord}
                    disabled={
                        !this.canEditRecord() ||
                        !visitCompleted ||
                        this.state.isClosing ||
                        this.getRecordStatusId() === MEDICAL_RECORD_STATUS.CLOSED
                    }
                >
                    <i className="bi bi-lock-fill" />
                    {this.state.isClosing ? this.getText("saving") : this.getText("closeRecord")}
                </button>
            </div>
        );
    };

    render() {
        const visitStatusId = this.getVisitStatusId();
        const examinationVisitId = this.getExaminationVisitId();
        const medicalRecordId = this.getMedicalRecordId();

        if (!examinationVisitId || visitStatusId === VISIT_STATUS.WAITING) {
            return (
                <div className="medical-record-workspace">
                    <h3>{this.getText("title")}</h3>
                    <div className="medical-record-workspace__notice">{this.getText("startFirst")}</div>
                </div>
            );
        }

        if (!medicalRecordId) {
            return (
                <div className="medical-record-workspace">
                    <h3>{this.getText("title")}</h3>
                    <div className="medical-record-workspace__notice">{this.getText("noRecord")}</div>
                    <button
                        type="button"
                        className="medical-record-workspace__create"
                        onClick={this.handleCreateRecord}
                        disabled={this.state.isCreating}
                    >
                        <i className="bi bi-journal-plus" />
                        {this.state.isCreating ? this.getText("loading") : this.getText("createRecord")}
                    </button>
                </div>
            );
        }

        return (
            <div className="medical-record-workspace">
                <div className="medical-record-workspace__header">
                    <h3>{this.getText("title")}</h3>
                    {this.state.isLoading && <small>{this.getText("loading")}...</small>}
                </div>
                {this.renderVitals()}
                {this.renderClinical()}
                {this.renderPrescription()}
                {this.renderParaclinical()}
                {this.renderFollowUp()}
                {this.renderActions()}
            </div>
        );
    }
}

export default injectIntl(MedicalRecordWorkspace);
