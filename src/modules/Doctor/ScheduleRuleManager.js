import React, { Component } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import DatePicker from "../../components/Input/DatePicker";
import {
  createDoctorScheduleRule,
  deleteDoctorScheduleRule,
  getDoctorScheduleRules,
  previewDoctorScheduleRule,
  updateDoctorScheduleRule,
} from "../../services/userService";

const TABS = [
  { id: "FIXED", vi: "Lịch cố định", en: "Fixed schedule" },
  { id: "OFF", vi: "Lịch nghỉ", en: "Time off" },
  { id: "FLEXIBLE", vi: "Lịch làm việc linh hoạt", en: "Flexible schedule" },
];

const WEEKDAYS = [
  { value: 1, vi: "Thứ 2", en: "Monday" },
  { value: 2, vi: "Thứ 3", en: "Tuesday" },
  { value: 3, vi: "Thứ 4", en: "Wednesday" },
  { value: 4, vi: "Thứ 5", en: "Thursday" },
  { value: 5, vi: "Thứ 6", en: "Friday" },
  { value: 6, vi: "Thứ 7", en: "Saturday" },
  { value: 7, vi: "Chủ nhật", en: "Sunday" },
];

const APPOINTMENT_TYPES = [
  { value: "AT1", vi: "Lịch khám", en: "In-person" },
  { value: "AT2", vi: "Lịch tư vấn trực tuyến", en: "Online" },
];

const DEFAULT_MAX_BOOKING_AHEAD_DAYS = 30;
const PROJECT_TIME_ZONE = "Asia/Ho_Chi_Minh";

const emptyForm = () => ({
  id: null,
  weekday: 1,
  date: moment().format("YYYY-MM-DD"),
  appointmentTypeId: "AT1",
  startTime: "07:00",
  endTime: "11:00",
  slotDurationMinutes: 30,
  capacity: 1,
  minBookingNoticeDays: 0,
  maxBookingAheadDays: DEFAULT_MAX_BOOKING_AHEAD_DAYS,
  price: "",
  discountPercent: 0,
  isFullDay: false,
  isActive: 1,
});

const toTimeInput = (value) => String(value || "").slice(0, 5);

const getTodayIso = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PROJECT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = parts.reduce((acc, item) => {
    if (item.type !== "literal") acc[item.type] = item.value;
    return acc;
  }, {});
  return `${values.year}-${values.month}-${values.day}`;
};

const isDateBeforeToday = (date) => {
  const target = moment(date, "YYYY-MM-DD", true).startOf("day");
  const today = moment(getTodayIso(), "YYYY-MM-DD", true).startOf("day");
  return target.isValid() && target.isBefore(today);
};

const getCalendarDays = (monthDate) => {
  const first = monthDate.clone().startOf("month");
  const start = first.clone().subtract(first.isoWeekday() - 1, "days");
  return Array.from({ length: 42 }, (_, index) => {
    const date = start.clone().add(index, "days");
    return {
      iso: date.format("YYYY-MM-DD"),
      day: date.date(),
      isCurrentMonth: date.month() === monthDate.month(),
    };
  });
};

const getTimeMinutes = (value) => {
  const [hours, minutes] = toTimeInput(value).split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

class ScheduleRuleManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: "FIXED",
      rules: [],
      form: emptyForm(),
      loading: false,
      calendarMonth: moment(getTodayIso(), "YYYY-MM-DD").month(),
      calendarYear: moment(getTodayIso(), "YYYY-MM-DD").year(),
      selectedDate: getTodayIso(),
      isRuleModalOpen: false,
      ruleModalMode: "create",
      ruleReadOnly: false,
      isConfirmOpen: false,
      confirmAction: "create",
      confirmPayload: null,
      previewImpact: null,
      saving: false,
      fieldErrors: {},
      modalError: "",
      confirmError: "",
      isFixedSetupOpen: false,
      isFixedEditOpen: false,
      fixedSetupType: "AT1",
      fixedDraft: [],
      fixedEditForm: emptyForm(),
      fixedSaving: false,
    };
    this.fixedDraftKey = 1;
  }

  componentDidMount() {
    this.loadRules();
    window.addEventListener("keydown", this.handleShortcut);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleShortcut);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.doctorId !== this.props.doctorId) {
      this.setState({ form: emptyForm(), rules: [] }, this.loadRules);
    }
  }

  label = (item) => (this.props.language === "vi" ? item.vi : item.en);

  getMonthDate = () =>
    moment()
      .year(this.state.calendarYear)
      .month(this.state.calendarMonth)
      .date(1)
      .startOf("day");

  getCalendarRange = () => {
    const days = getCalendarDays(this.getMonthDate());
    return {
      fromDate: days[0]?.iso,
      toDate: days[days.length - 1]?.iso,
    };
  };

  getEditableSelectedDate = () =>
    isDateBeforeToday(this.state.selectedDate) ? getTodayIso() : this.state.selectedDate;

  getInitialRuleForm = (ruleType = this.state.activeTab, date = this.getEditableSelectedDate()) => {
    const form = {
      ...emptyForm(),
      date,
      ruleType,
      appointmentTypeId: "AT1",
      isActive: 1,
      isFullDay: false,
    };

    if (ruleType === "OFF") {
      return {
        ...form,
        startTime: "00:00",
        endTime: "23:59",
        slotDurationMinutes: "",
        capacity: "",
        price: "",
      };
    }

    if (ruleType === "FLEXIBLE") {
      return {
        ...form,
        startTime: "",
        endTime: "",
        slotDurationMinutes: "",
        capacity: 1,
        price: "",
      };
    }

    return form;
  };

  handleShortcut = (event) => {
    if (
      event.key === "F2" &&
      !this.state.isRuleModalOpen &&
      !this.state.isConfirmOpen &&
      !this.state.isFixedSetupOpen &&
      !this.state.isFixedEditOpen
    ) {
      event.preventDefault();
      if (this.state.activeTab === "FIXED") {
        this.openFixedSetup();
      } else {
        this.openRuleCreateModal();
      }
    }
  };

  loadRules = async () => {
    if (!this.props.doctorId) return;
    this.setState({ loading: true });
    try {
      const { activeTab } = this.state;
      const range = activeTab === "FIXED" ? {} : this.getCalendarRange();
      const res = await getDoctorScheduleRules(
        this.props.doctorId,
        { isActive: 1, ruleType: activeTab, ...range },
        { authRole: this.props.authRole }
      );
      if (res?.errCode === 0) {
        this.setState({ rules: res.data || [] });
      } else {
        toast.error(res?.errMessage || "Cannot load schedule rules");
      }
    } finally {
      this.setState({ loading: false });
    }
  };

  setTab = (activeTab) => {
    this.setState(
      {
        activeTab,
        rules: [],
        form: this.getInitialRuleForm(activeTab),
        isRuleModalOpen: false,
        isConfirmOpen: false,
        fieldErrors: {},
        modalError: "",
        confirmError: "",
      },
      this.loadRules
    );
  };

  updateForm = (key, value) => {
    this.setState((prev) => ({
      form: {
        ...prev.form,
        [key]: value,
      },
      modalError: "",
      confirmError: "",
    }));
  };

  buildPayload = (override = {}) => {
    const { activeTab, form } = this.state;
    const isOff = activeTab === "OFF";
    const startTime = toTimeInput(form.startTime);
    const endTime = toTimeInput(form.endTime);
    const isFullDay = isOff && startTime === "00:00" && endTime === "23:59";
    const appointmentTypeId =
      isOff && form.appointmentTypeId === "ALL" ? null : form.appointmentTypeId;

    return {
      id: form.id || undefined,
      doctorId: this.props.doctorId,
      ruleType: activeTab,
      weekday: activeTab === "FIXED" ? Number(form.weekday) : null,
      date: activeTab === "FIXED" ? null : form.date,
      appointmentTypeId: isOff ? null : appointmentTypeId,
      startTime: isFullDay ? "00:00" : startTime,
      endTime: isFullDay ? "23:59" : endTime,
      slotDurationMinutes: isOff ? null : Number(form.slotDurationMinutes),
      capacity: isOff ? null : Number(form.capacity),
      minBookingNoticeDays: Number(form.minBookingNoticeDays),
      maxBookingAheadDays:
        form.maxBookingAheadDays === "" ||
          form.maxBookingAheadDays === null ||
          form.maxBookingAheadDays === undefined
          ? DEFAULT_MAX_BOOKING_AHEAD_DAYS
          : Number(form.maxBookingAheadDays),
      price: form.price === "" ? null : Number(form.price),
      discountPercent: Number(form.discountPercent) || 0,
      isFullDay: isFullDay ? 1 : 0,
      isActive: Number(form.isActive) ? 1 : 0,
      ...override,
    };
  };

  confirmImpact = async (payload) => {
    const preview = await previewDoctorScheduleRule(payload, { authRole: this.props.authRole });
    if (preview?.errCode !== 0) {
      toast.error(preview?.errMessage || "Cannot preview schedule impact");
      return false;
    }

    const count = Number(preview.data?.affectedBookingCount) || 0;
    if (count === 0) return true;

    return window.confirm(
      `Thay đổi này sẽ hủy ${count} lịch hẹn không còn hợp lệ hoặc vượt sức chứa. Bạn có muốn tiếp tục?`
    );
  };

  handleSave = async () => {
    if (!this.props.doctorId) {
      toast.error("Chưa xác định bác sĩ");
      return;
    }

    const payload = this.buildPayload();
    const canContinue = await this.confirmImpact(payload);
    if (!canContinue) return;

    const request = payload.id
      ? updateDoctorScheduleRule(payload.id, payload, { authRole: this.props.authRole })
      : createDoctorScheduleRule(payload, { authRole: this.props.authRole });
    const res = await request;
    if (res?.errCode === 0) {
      toast.success(payload.id ? "Đã cập nhật lịch" : "Đã thêm lịch");
      this.setState({ form: emptyForm() }, this.loadRules);
    } else {
      toast.error(res?.errMessage || "Lưu lịch thất bại");
    }
  };

  handleEdit = (rule) => {
    this.setState({
      activeTab: rule.ruleType,
      form: {
        ...emptyForm(),
        id: rule.id,
        weekday: rule.weekday || 1,
        date: rule.date ? moment(rule.date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
        appointmentTypeId: rule.appointmentTypeId || "ALL",
        startTime: toTimeInput(rule.startTime),
        endTime: toTimeInput(rule.endTime),
        slotDurationMinutes: rule.slotDurationMinutes || 30,
        capacity: rule.capacity || 1,
        minBookingNoticeDays: rule.minBookingNoticeDays || 0,
        maxBookingAheadDays: rule.maxBookingAheadDays || 30,
        price: rule.price === null || rule.price === undefined ? "" : rule.price,
        discountPercent: rule.discountPercent || 0,
        isFullDay: Number(rule.isFullDay) === 1,
        isActive: rule.isActive,
      },
    });
  };

  handleDelete = async (rule) => {
    const payload = {
      ...rule,
      id: rule.id,
      doctorId: rule.doctorId,
      isActive: 0,
    };
    const canContinue = await this.confirmImpact(payload);
    if (!canContinue) return;

    const res = await deleteDoctorScheduleRule(rule.id, { authRole: this.props.authRole });
    if (res?.errCode === 0) {
      toast.success("Đã tắt lịch");
      this.loadRules();
    } else {
      toast.error(res?.errMessage || "Không thể tắt lịch");
    }
  };

  validateRuleForm = (form = this.state.form) => {
    const { activeTab } = this.state;
    const errors = {};
    const startMinutes = getTimeMinutes(form.startTime);
    const endMinutes = getTimeMinutes(form.endTime);
    const duration = Number(form.slotDurationMinutes);
    const capacity = Number(form.capacity);
    const price =
      form.price === "" || form.price === null || form.price === undefined ? null : Number(form.price);

    if (!form.date) {
      errors.date = activeTab === "OFF" ? "Vui lòng chọn ngày nghỉ" : "Vui lòng chọn ngày khám";
    } else if (isDateBeforeToday(form.date)) {
      errors.date = "Ngày không được thuộc thời gian quá khứ";
    }

    if (startMinutes === null) errors.startTime = "Vui lòng chọn giờ bắt đầu";
    if (endMinutes === null) errors.endTime = "Vui lòng chọn giờ kết thúc";
    if (startMinutes !== null && endMinutes !== null && startMinutes >= endMinutes) {
      errors.endTime = "Giờ kết thúc phải sau giờ bắt đầu";
    }

    if (activeTab === "FLEXIBLE") {
      if (!form.appointmentTypeId) {
        errors.appointmentTypeId = "Vui lòng chọn loại lịch làm việc";
      }
      if (!Number.isInteger(capacity) || capacity < 1) {
        errors.capacity = "Số lượt khám trên một slot phải lớn hơn hoặc bằng 1";
      }
      if (!Number.isInteger(duration) || duration < 1) {
        errors.slotDurationMinutes = "Thời gian 1 slot phải lớn hơn hoặc bằng 1 phút";
      } else if (startMinutes !== null && endMinutes !== null && duration > endMinutes - startMinutes) {
        errors.slotDurationMinutes = "Thời lượng slot phải tạo được ít nhất một slot hoàn chỉnh";
      }
      if (price === null || !Number.isInteger(price) || price < 0) {
        errors.price = "Phí khám phải là số nguyên lớn hơn hoặc bằng 0";
      }
    }

    return errors;
  };

  isRuleFormValid = () => Object.keys(this.validateRuleForm()).length === 0;

  getRuleModalTitle = () => {
    const { activeTab, ruleModalMode } = this.state;
    if (activeTab === "OFF") {
      return ruleModalMode === "edit" ? "Điều chỉnh lịch nghỉ" : "Thêm lịch nghỉ";
    }
    return ruleModalMode === "edit"
      ? "Điều chỉnh lịch làm việc linh hoạt"
      : "Thêm lịch làm việc linh hoạt";
  };

  getConfirmCopy = () => {
    const { activeTab, confirmAction } = this.state;
    const isOff = activeTab === "OFF";
    const create = confirmAction === "create";
    const update = confirmAction === "update";

    if (isOff) {
      return {
        title: create
          ? "Xác nhận tạo khung giờ nghỉ này"
          : update
            ? "Xác nhận cập nhật lịch nghỉ này"
            : "Xác nhận xóa lịch nghỉ này",
        message:
          "Khách hàng sẽ không thể đặt lịch khám hoặc tư vấn vào khung giờ nghỉ. Các lịch đã được bệnh nhân đặt trước đó cũng sẽ bị hủy.",
        cancelLabel: create ? "Hủy" : "Đóng",
      };
    }

    return {
      title: create
        ? "Xác nhận tạo khung giờ khám này"
        : update
          ? "Xác nhận cập nhật khung giờ khám này"
          : "Xác nhận xóa khung giờ khám này",
      message:
        "Trong trường hợp có các lịch hẹn khám của bệnh nhân đã được đặt trước trùng với ngày của lịch mới, những lịch này sẽ bị hủy tự động. Vui lòng kiểm tra và thông báo lại cho bệnh nhân nếu cần.",
      cancelLabel: "Đóng",
    };
  };

  changeCalendarMonth = (month, year) => {
    const next = moment().year(year).month(month).date(1);
    this.setState(
      {
        calendarMonth: next.month(),
        calendarYear: next.year(),
        selectedDate: next.format("YYYY-MM-DD"),
        rules: this.state.activeTab === "FIXED" ? this.state.rules : [],
      },
      this.loadRules
    );
  };

  goToAdjacentMonth = (amount) => {
    const next = this.getMonthDate().add(amount, "month");
    this.changeCalendarMonth(next.month(), next.year());
  };

  selectCalendarDate = (date) => {
    this.setState({ selectedDate: date });
  };

  openRuleCreateModal = () => {
    if (!this.props.doctorId) {
      toast.error("Chưa xác định bác sĩ");
      return;
    }

    const { activeTab } = this.state;
    this.setState({
      form: this.getInitialRuleForm(activeTab),
      ruleModalMode: "create",
      ruleReadOnly: false,
      isRuleModalOpen: true,
      fieldErrors: {},
      modalError: "",
      confirmError: "",
    });
  };

  openRuleEditModal = (rule) => {
    const readOnly = isDateBeforeToday(rule.date);
    this.setState({
      activeTab: rule.ruleType,
      ruleModalMode: "edit",
      ruleReadOnly: readOnly,
      isRuleModalOpen: true,
      fieldErrors: {},
      modalError: "",
      confirmError: "",
      form: {
        ...this.getInitialRuleForm(rule.ruleType, rule.date || getTodayIso()),
        id: rule.id,
        date: rule.date ? moment(rule.date).format("YYYY-MM-DD") : getTodayIso(),
        appointmentTypeId: rule.appointmentTypeId || "AT1",
        startTime: toTimeInput(rule.startTime),
        endTime: toTimeInput(rule.endTime),
        slotDurationMinutes: rule.slotDurationMinutes || "",
        capacity: rule.capacity || 1,
        minBookingNoticeDays: rule.minBookingNoticeDays || 0,
        maxBookingAheadDays:
          rule.maxBookingAheadDays === null || rule.maxBookingAheadDays === undefined
            ? DEFAULT_MAX_BOOKING_AHEAD_DAYS
            : rule.maxBookingAheadDays,
        price: rule.price === null || rule.price === undefined ? "" : rule.price,
        discountPercent: rule.discountPercent || 0,
        isFullDay: Number(rule.isFullDay) === 1,
        isActive: Number(rule.isActive) ? 1 : 0,
      },
    });
  };

  closeRuleModal = () => {
    if (this.state.saving) return;
    this.setState({
      isRuleModalOpen: false,
      ruleReadOnly: false,
      ruleModalMode: "create",
      fieldErrors: {},
      modalError: "",
    });
  };

  openConfirmModal = async (action, payload) => {
    this.setState({ saving: true, modalError: "", confirmError: "" });
    try {
      const preview = await previewDoctorScheduleRule(payload, { authRole: this.props.authRole });
      if (preview?.errCode !== 0) {
        const message = preview?.errMessage || "Không thể xem trước ảnh hưởng lịch";
        this.setState({ modalError: message, saving: false });
        toast.error(message);
        return;
      }

      this.setState({
        isConfirmOpen: true,
        confirmAction: action,
        confirmPayload: payload,
        previewImpact: preview.data || null,
        saving: false,
      });
    } catch (error) {
      const message = error?.message || "Không thể xem trước ảnh hưởng lịch";
      this.setState({ modalError: message, saving: false });
      toast.error(message);
    }
  };

  closeConfirmModal = () => {
    if (this.state.saving) return;
    this.setState({
      isConfirmOpen: false,
      confirmPayload: null,
      previewImpact: null,
      confirmError: "",
    });
  };

  handleRuleSubmit = () => {
    const fieldErrors = this.validateRuleForm();
    this.setState({ fieldErrors });
    if (Object.keys(fieldErrors).length > 0) return;

    const payload = this.buildPayload();
    this.openConfirmModal(payload.id ? "update" : "create", payload);
  };

  handleRuleDelete = () => {
    const { form } = this.state;
    if (!form.id) return;
    this.openConfirmModal("delete", this.buildPayload({ isActive: 0 }));
  };

  handleConfirmSubmit = async () => {
    const { confirmAction, confirmPayload } = this.state;
    if (!confirmPayload || this.state.saving) return;

    this.setState({ saving: true, confirmError: "" });
    try {
      const request =
        confirmAction === "delete"
          ? deleteDoctorScheduleRule(confirmPayload.id, { authRole: this.props.authRole })
          : confirmPayload.id
            ? updateDoctorScheduleRule(confirmPayload.id, confirmPayload, { authRole: this.props.authRole })
            : createDoctorScheduleRule(confirmPayload, { authRole: this.props.authRole });
      const res = await request;
      if (res?.errCode !== 0) {
        throw new Error(res?.errMessage || "Lưu lịch thất bại");
      }

      const successMessage =
        confirmAction === "delete"
          ? "Đã xóa lịch"
          : confirmAction === "update"
            ? "Đã cập nhật lịch"
            : "Đã thêm lịch";
      toast.success(successMessage);
      this.setState(
        {
          isConfirmOpen: false,
          isRuleModalOpen: false,
          confirmPayload: null,
          previewImpact: null,
          saving: false,
          fieldErrors: {},
          modalError: "",
          confirmError: "",
        },
        this.loadRules
      );
    } catch (error) {
      const message = error?.message || "Lưu lịch thất bại";
      this.setState({ confirmError: message, saving: false });
      toast.error(message);
    }
  };

  getWeekdayLabel = (value) => {
    const weekday = WEEKDAYS.find((item) => Number(item.value) === Number(value));
    return weekday ? weekday.vi : "Thứ 2";
  };

  getAppointmentTypeLabel = (appointmentTypeId) => {
    const type = APPOINTMENT_TYPES.find((item) => item.value === appointmentTypeId);
    return type ? type.vi : "Lịch khám";
  };

  getFixedRules = () =>
    (this.state.rules || []).filter(
      (rule) => rule.ruleType === "FIXED" && Number(rule.isActive) !== 0
    );

  getFixedRulesForWeekday = (weekday) =>
    this.getFixedRules().filter((rule) => Number(rule.weekday) === Number(weekday));

  timeToMinutes = (value) => {
    const [hours, minutes] = toTimeInput(value).split(":").map(Number);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
    return hours * 60 + minutes;
  };

  getSlotMinutes = (slot) =>
    Math.max(0, this.timeToMinutes(slot.endTime) - this.timeToMinutes(slot.startTime));

  getSlotBookingTotal = (slot) => {
    const duration = Number(slot.slotDurationMinutes) || 0;
    const capacity = Number(slot.capacity) || 0;
    if (duration <= 0 || capacity <= 0) return 0;
    return Math.floor(this.getSlotMinutes(slot) / duration) * capacity;
  };

  formatSlotDuration = (slot) => {
    const minutes = this.getSlotMinutes(slot);
    if (minutes <= 0) return "0 phút";
    if (minutes % 60 === 0) return `${minutes / 60}h`;
    return `${minutes} phút`;
  };

  fixedSlotSignature = (slot) =>
    JSON.stringify({
      weekday: Number(slot.weekday) || 1,
      appointmentTypeId: slot.appointmentTypeId || "AT1",
      startTime: toTimeInput(slot.startTime),
      endTime: toTimeInput(slot.endTime),
      slotDurationMinutes: Number(slot.slotDurationMinutes) || 30,
      capacity: Number(slot.capacity) || 1,
      price:
        slot.price === "" || slot.price === null || slot.price === undefined
          ? null
          : Number(slot.price),
      isActive: Number(slot.isActive) ? 1 : 0,
    });

  ruleToFixedDraftSlot = (rule) => {
    const slot = {
      ...emptyForm(),
      _key: `rule-${rule.id}`,
      id: rule.id,
      weekday: rule.weekday || 1,
      appointmentTypeId: rule.appointmentTypeId || "AT1",
      startTime: toTimeInput(rule.startTime),
      endTime: toTimeInput(rule.endTime),
      slotDurationMinutes: rule.slotDurationMinutes || 30,
      capacity: rule.capacity || 1,
      minBookingNoticeDays: rule.minBookingNoticeDays || 0,
      maxBookingAheadDays:
        rule.maxBookingAheadDays === null || rule.maxBookingAheadDays === undefined
          ? DEFAULT_MAX_BOOKING_AHEAD_DAYS
          : rule.maxBookingAheadDays,
      price: rule.price === null || rule.price === undefined ? "" : rule.price,
      discountPercent: rule.discountPercent || 0,
      isFullDay: false,
      isActive: Number(rule.isActive) ? 1 : 0,
    };

    return {
      ...slot,
      _originalSignature: this.fixedSlotSignature(slot),
    };
  };

  buildFixedDraft = (appointmentTypeId) =>
    this.getFixedRules()
      .filter((rule) => rule.appointmentTypeId === appointmentTypeId)
      .map(this.ruleToFixedDraftSlot);

  newFixedDraftSlot = (weekday, appointmentTypeId) => ({
    ...emptyForm(),
    _key: `draft-${this.fixedDraftKey++}`,
    id: null,
    weekday,
    appointmentTypeId,
    ruleType: "FIXED",
    startTime: "09:00",
    endTime: "10:00",
  });

  openFixedSetup = () => {
    if (!this.props.doctorId) {
      toast.error("Chưa xác định bác sĩ");
      return;
    }

    const fixedSetupType = this.state.fixedSetupType || "AT1";
    this.setState({
      isFixedSetupOpen: true,
      fixedSetupType,
      fixedDraft: this.buildFixedDraft(fixedSetupType),
    });
  };

  closeFixedSetup = () => {
    if (this.state.fixedSaving) return;
    this.setState({ isFixedSetupOpen: false, fixedDraft: [] });
  };

  changeFixedSetupType = (appointmentTypeId) => {
    this.setState({
      fixedSetupType: appointmentTypeId,
      fixedDraft: this.buildFixedDraft(appointmentTypeId),
    });
  };

  getVisibleDraftSlots = (weekday) =>
    this.state.fixedDraft.filter(
      (slot) => Number(slot.weekday) === Number(weekday) && !slot._deleted
    );

  toggleFixedDay = (weekday) => {
    this.setState((prev) => {
      const hasVisible = prev.fixedDraft.some(
        (slot) => Number(slot.weekday) === Number(weekday) && !slot._deleted
      );
      const hasDeleted = prev.fixedDraft.some(
        (slot) => Number(slot.weekday) === Number(weekday) && slot._deleted
      );

      if (hasVisible) {
        return {
          fixedDraft: prev.fixedDraft.map((slot) =>
            Number(slot.weekday) === Number(weekday) ? { ...slot, _deleted: true } : slot
          ),
        };
      }

      if (hasDeleted) {
        return {
          fixedDraft: prev.fixedDraft.map((slot) =>
            Number(slot.weekday) === Number(weekday) ? { ...slot, _deleted: false } : slot
          ),
        };
      }

      return {
        fixedDraft: [
          ...prev.fixedDraft,
          this.newFixedDraftSlot(weekday, prev.fixedSetupType || "AT1"),
        ],
      };
    });
  };

  addFixedSlot = (weekday) => {
    this.setState((prev) => ({
      fixedDraft: [
        ...prev.fixedDraft,
        this.newFixedDraftSlot(weekday, prev.fixedSetupType || "AT1"),
      ],
    }));
  };

  removeFixedSlot = (slotKey) => {
    this.setState((prev) => ({
      fixedDraft: prev.fixedDraft
        .map((slot) => (slot._key === slotKey ? { ...slot, _deleted: true } : slot))
        .filter((slot) => slot.id || !slot._deleted),
    }));
  };

  updateFixedDraftSlot = (slotKey, key, value) => {
    this.setState((prev) => ({
      fixedDraft: prev.fixedDraft.map((slot) =>
        slot._key === slotKey ? { ...slot, [key]: value } : slot
      ),
    }));
  };

  buildFixedPayload = (slot, override = {}) => ({
    id: slot.id || undefined,
    doctorId: this.props.doctorId,
    ruleType: "FIXED",
    weekday: Number(slot.weekday) || 1,
    date: null,
    appointmentTypeId: slot.appointmentTypeId || this.state.fixedSetupType || "AT1",
    startTime: toTimeInput(slot.startTime),
    endTime: toTimeInput(slot.endTime),
    slotDurationMinutes: Number(slot.slotDurationMinutes) || 30,
    capacity: Number(slot.capacity) || 1,
    minBookingNoticeDays: Number(slot.minBookingNoticeDays) || 0,
    maxBookingAheadDays:
      slot.maxBookingAheadDays === "" ||
        slot.maxBookingAheadDays === null ||
        slot.maxBookingAheadDays === undefined
        ? DEFAULT_MAX_BOOKING_AHEAD_DAYS
        : Number(slot.maxBookingAheadDays),
    price: slot.price === "" || slot.price === null || slot.price === undefined ? null : Number(slot.price),
    discountPercent: Number(slot.discountPercent) || 0,
    isFullDay: 0,
    isActive: Number(slot.isActive) ? 1 : 0,
    ...override,
  });

  validateFixedSlots = (slots) => {
    for (const slot of slots) {
      const dayLabel = this.getWeekdayLabel(slot.weekday);
      const startMinutes = this.timeToMinutes(slot.startTime);
      const endMinutes = this.timeToMinutes(slot.endTime);
      const duration = Number(slot.slotDurationMinutes);
      const capacity = Number(slot.capacity);
      const price = slot.price === "" || slot.price === null || slot.price === undefined ? null : Number(slot.price);

      if (!toTimeInput(slot.startTime) || !toTimeInput(slot.endTime) || endMinutes <= startMinutes) {
        toast.error(`${dayLabel}: Giờ kết thúc phải sau giờ bắt đầu`);
        return false;
      }

      if (!Number.isFinite(capacity) || capacity < 1) {
        toast.error(`${dayLabel}: Số lượt khám trên một slot phải lớn hơn 0`);
        return false;
      }

      if (!Number.isFinite(duration) || duration < 1 || duration > endMinutes - startMinutes) {
        toast.error(`${dayLabel}: Thời gian 1 slot không hợp lệ`);
        return false;
      }

      if (price !== null && (!Number.isFinite(price) || price < 0)) {
        toast.error(`${dayLabel}: Phí khám không hợp lệ`);
        return false;
      }
    }

    return true;
  };

  hasFixedSlotChanged = (slot) =>
    !slot.id || this.fixedSlotSignature(slot) !== slot._originalSignature;

  handleFixedSetupApply = async () => {
    const { fixedDraft } = this.state;
    const activeSlots = fixedDraft.filter((slot) => !slot._deleted);
    if (!this.validateFixedSlots(activeSlots)) return;

    const deletedSlots = fixedDraft.filter((slot) => slot.id && slot._deleted);
    const changedSlots = activeSlots.filter(this.hasFixedSlotChanged);

    if (deletedSlots.length === 0 && changedSlots.length === 0) {
      toast.info("Không có thay đổi mới");
      this.setState({ isFixedSetupOpen: false, fixedDraft: [] });
      return;
    }

    this.setState({ fixedSaving: true });
    try {
      for (const slot of deletedSlots) {
        const canContinue = await this.confirmImpact(this.buildFixedPayload(slot, { isActive: 0 }));
        if (!canContinue) {
          this.setState({ fixedSaving: false });
          return;
        }
      }

      for (const slot of changedSlots) {
        const canContinue = await this.confirmImpact(this.buildFixedPayload(slot));
        if (!canContinue) {
          this.setState({ fixedSaving: false });
          return;
        }
      }

      for (const slot of deletedSlots) {
        const res = await deleteDoctorScheduleRule(slot.id, { authRole: this.props.authRole });
        if (res?.errCode !== 0) throw new Error(res?.errMessage || "Xóa lịch thất bại");
      }

      for (const slot of changedSlots) {
        const payload = this.buildFixedPayload(slot);
        const request = payload.id
          ? updateDoctorScheduleRule(payload.id, payload, { authRole: this.props.authRole })
          : createDoctorScheduleRule(payload, { authRole: this.props.authRole });
        const res = await request;
        if (res?.errCode !== 0) throw new Error(res?.errMessage || "Lưu lịch thất bại");
      }

      toast.success("Đã áp dụng lịch cố định");
      this.setState(
        { isFixedSetupOpen: false, fixedDraft: [], fixedSaving: false },
        this.loadRules
      );
    } catch (error) {
      toast.error(error.message || "Áp dụng lịch thất bại");
      this.setState({ fixedSaving: false }, this.loadRules);
    }
  };

  openFixedEdit = (rule) => {
    this.setState({
      isFixedEditOpen: true,
      fixedEditForm: this.ruleToFixedDraftSlot(rule),
    });
  };

  closeFixedEdit = () => {
    if (this.state.fixedSaving) return;
    this.setState({ isFixedEditOpen: false, fixedEditForm: emptyForm() });
  };

  updateFixedEditForm = (key, value) => {
    this.setState((prev) => ({
      fixedEditForm: {
        ...prev.fixedEditForm,
        [key]: value,
      },
    }));
  };

  handleFixedEditUpdate = async () => {
    const { fixedEditForm } = this.state;
    if (!fixedEditForm.id || !this.validateFixedSlots([fixedEditForm])) return;

    const payload = this.buildFixedPayload(fixedEditForm);
    this.setState({ fixedSaving: true });
    try {
      const canContinue = await this.confirmImpact(payload);
      if (!canContinue) {
        this.setState({ fixedSaving: false });
        return;
      }

      const res = await updateDoctorScheduleRule(payload.id, payload, { authRole: this.props.authRole });
      if (res?.errCode === 0) {
        toast.success("Đã cập nhật lịch cố định");
        this.setState(
          { isFixedEditOpen: false, fixedEditForm: emptyForm(), fixedSaving: false },
          this.loadRules
        );
      } else {
        throw new Error(res?.errMessage || "Cập nhật lịch thất bại");
      }
    } catch (error) {
      toast.error(error.message || "Cập nhật lịch thất bại");
      this.setState({ fixedSaving: false });
    }
  };

  handleFixedEditDelete = async () => {
    const { fixedEditForm } = this.state;
    if (!fixedEditForm.id) return;

    this.setState({ fixedSaving: true });
    try {
      const canContinue = await this.confirmImpact(this.buildFixedPayload(fixedEditForm, { isActive: 0 }));
      if (!canContinue) {
        this.setState({ fixedSaving: false });
        return;
      }

      const res = await deleteDoctorScheduleRule(fixedEditForm.id, { authRole: this.props.authRole });
      if (res?.errCode === 0) {
        toast.success("Đã xóa lịch cố định");
        this.setState(
          { isFixedEditOpen: false, fixedEditForm: emptyForm(), fixedSaving: false },
          this.loadRules
        );
      } else {
        throw new Error(res?.errMessage || "Xóa lịch thất bại");
      }
    } catch (error) {
      toast.error(error.message || "Xóa lịch thất bại");
      this.setState({ fixedSaving: false });
    }
  };

  renderRuleCard = (rule) => {
    const weekday = WEEKDAYS.find((item) => Number(item.value) === Number(rule.weekday));
    const type = APPOINTMENT_TYPES.find((item) => item.value === rule.appointmentTypeId);
    const title = rule.ruleType === "OFF"
      ? "Lịch nghỉ"
      : type
        ? this.label(type)
        : "Tất cả loại lịch";
    const dateLabel = rule.ruleType === "FIXED"
      ? this.label(weekday || WEEKDAYS[0])
      : moment(rule.date).format("DD/MM/YYYY");

    return (
      <div className={`schedule-rule-card schedule-rule-card--${rule.ruleType}`} key={rule.id}>
        <div>
          <strong>{title}</strong>
          <span>{dateLabel}</span>
          <small>{toTimeInput(rule.startTime)} - {toTimeInput(rule.endTime)}</small>
        </div>
        <div className="schedule-rule-card__meta">
          {rule.ruleType !== "OFF" && (
            <span>{rule.capacity || 1} lượt/slot · {rule.slotDurationMinutes || 30} phút</span>
          )}
          <button type="button" onClick={() => this.handleEdit(rule)}>Sửa</button>
          <button type="button" className="danger" onClick={() => this.handleDelete(rule)}>Tắt</button>
        </div>
      </div>
    );
  };

  renderFixedRuleCard = (rule) => {
    const typeClass = rule.appointmentTypeId === "AT2" ? "online" : "clinic";

    return (
      <button
        type="button"
        className={`fixed-schedule-card fixed-schedule-card--${typeClass}`}
        key={rule.id}
        onClick={() => this.openFixedEdit(rule)}
      >
        <strong>{this.getAppointmentTypeLabel(rule.appointmentTypeId)}</strong>
        <span>{toTimeInput(rule.startTime)} - {toTimeInput(rule.endTime)}</span>
      </button>
    );
  };

  renderFixedDraftSlot = (slot) => (
    <div className="fixed-schedule-slot-card" key={slot._key}>
      <div className="fixed-schedule-slot-card__head">
        <div className="fixed-schedule-slot-card__meta">
          <span className="fixed-schedule-draft-badge">
            <i className="bi bi-pencil" aria-hidden="true" />
            Nháp
          </span>
          <span>
            <i className="bi bi-clock" aria-hidden="true" />
            {this.formatSlotDuration(slot)}
          </span>
          <span>
            <i className="bi bi-people" aria-hidden="true" />
            {this.getSlotBookingTotal(slot)} lượt
          </span>
        </div>
        <button
          type="button"
          className="fixed-schedule-icon-button fixed-schedule-icon-button--danger"
          onClick={() => this.removeFixedSlot(slot._key)}
          title="Xóa khung giờ"
          aria-label="Xóa khung giờ"
        >
          <i className="bi bi-trash" aria-hidden="true" />
        </button>
      </div>

      <div className="fixed-schedule-slot-grid">
        <label className="fixed-schedule-field">
          Giờ bắt đầu <span>*</span>
          <input
            type="time"
            value={slot.startTime}
            onChange={(event) => this.updateFixedDraftSlot(slot._key, "startTime", event.target.value)}
          />
        </label>
        <label className="fixed-schedule-field">
          Giờ kết thúc <span>*</span>
          <input
            type="time"
            value={slot.endTime}
            onChange={(event) => this.updateFixedDraftSlot(slot._key, "endTime", event.target.value)}
          />
        </label>
        <label className="fixed-schedule-field">
          Số lượt khám trên một slot <span>*</span>
          <input
            type="number"
            min="1"
            value={slot.capacity}
            onChange={(event) => this.updateFixedDraftSlot(slot._key, "capacity", event.target.value)}
          />
        </label>
        <label className="fixed-schedule-field">
          Thời gian 1 slot (phút) <span>*</span>
          <input
            type="number"
            min="1"
            value={slot.slotDurationMinutes}
            onChange={(event) =>
              this.updateFixedDraftSlot(slot._key, "slotDurationMinutes", event.target.value)
            }
          />
        </label>
        <label className="fixed-schedule-field fixed-schedule-field--price">
          Phí khám
          <input
            type="number"
            min="0"
            value={slot.price}
            placeholder="Phí khám"
            onChange={(event) => this.updateFixedDraftSlot(slot._key, "price", event.target.value)}
          />
        </label>
      </div>
    </div>
  );

  renderFixedDayItem = (day) => {
    const slots = this.getVisibleDraftSlots(day.value);
    const isActive = slots.length > 0;
    const totalBookings = slots.reduce((total, slot) => total + this.getSlotBookingTotal(slot), 0);

    return (
      <div className={`fixed-schedule-day-item ${isActive ? "is-active" : ""}`} key={day.value}>
        <div className="fixed-schedule-day-item__head">
          <div className="fixed-schedule-day-item__title">
            <button
              type="button"
              className={`fixed-schedule-toggle ${isActive ? "is-on" : ""}`}
              onClick={() => this.toggleFixedDay(day.value)}
              aria-pressed={isActive}
              aria-label={`${isActive ? "Tắt" : "Bật"} ${this.getWeekdayLabel(day.value)}`}
            >
              <span />
            </button>
            <i className="bi bi-calendar-week" aria-hidden="true" />
            <div>
              <strong>{this.getWeekdayLabel(day.value)}</strong>
              {isActive && (
                <small>
                  <i className="bi bi-clock" aria-hidden="true" />
                  {slots.length} khung giờ
                  <i className="bi bi-people" aria-hidden="true" />
                  {totalBookings} lượt
                </small>
              )}
            </div>
          </div>
          {isActive && (
            <button
              type="button"
              className="fixed-schedule-add-slot"
              onClick={() => this.addFixedSlot(day.value)}
            >
              <i className="bi bi-plus-lg" aria-hidden="true" />
              Thêm khung giờ
            </button>
          )}
        </div>
        {isActive && (
          <div className="fixed-schedule-day-item__slots">
            {slots.map(this.renderFixedDraftSlot)}
          </div>
        )}
      </div>
    );
  };

  renderFixedSetupModal = () => {
    const { isFixedSetupOpen, fixedSetupType, fixedSaving } = this.state;

    return (
      <Modal
        isOpen={isFixedSetupOpen}
        toggle={this.closeFixedSetup}
        size="xl"
        centered
        scrollable
        className="schedule-rule-modal fixed-schedule-modal user-modal"
      >
        <ModalHeader toggle={this.closeFixedSetup}>
          <div className="fixed-schedule-modal-title">
            <span>Thiết lập khung thời gian để khách hàng đặt lịch khám</span>
            <small>Khung thời gian được lặp lại cố định theo các thứ trong tuần.</small>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="fixed-schedule-modal-toolbar">
            <label>
              Loại lịch làm việc:
              <select
                value={fixedSetupType}
                onChange={(event) => this.changeFixedSetupType(event.target.value)}
                disabled={fixedSaving}
              >
                {APPOINTMENT_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.vi}
                  </option>
                ))}
              </select>
            </label>
            <Button
              color="primary"
              type="button"
              className="fixed-schedule-apply-button"
              onClick={this.handleFixedSetupApply}
              disabled={fixedSaving}
            >
              <i className="bi bi-floppy" aria-hidden="true" />
              {fixedSaving ? "Đang lưu..." : "Áp dụng"}
            </Button>
          </div>

          <div className="fixed-schedule-day-list">
            {WEEKDAYS.map(this.renderFixedDayItem)}
          </div>
        </ModalBody>
      </Modal>
    );
  };

  renderFixedEditModal = () => {
    const { isFixedEditOpen, fixedEditForm, fixedSaving } = this.state;

    return (
      <Modal
        isOpen={isFixedEditOpen}
        toggle={this.closeFixedEdit}
        size="lg"
        centered
        scrollable
        className="schedule-rule-modal fixed-schedule-edit-modal user-modal"
      >
        <ModalHeader toggle={this.closeFixedEdit}>Điều chỉnh lịch làm việc cố định</ModalHeader>
        <ModalBody>
          <div className="fixed-schedule-edit-grid">
            <label className="fixed-schedule-field fixed-schedule-field--wide">
              Thứ trong tuần <span>*</span>
              <select
                value={fixedEditForm.weekday}
                onChange={(event) => this.updateFixedEditForm("weekday", event.target.value)}
              >
                {WEEKDAYS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.vi}
                  </option>
                ))}
              </select>
            </label>
            <label className="fixed-schedule-field fixed-schedule-field--wide">
              Loại lịch làm việc <span>*</span>
              <select
                value={fixedEditForm.appointmentTypeId}
                onChange={(event) => this.updateFixedEditForm("appointmentTypeId", event.target.value)}
              >
                {APPOINTMENT_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.vi}
                  </option>
                ))}
              </select>
            </label>
            <label className="fixed-schedule-field">
              Giờ bắt đầu <span>*</span>
              <input
                type="time"
                value={fixedEditForm.startTime}
                onChange={(event) => this.updateFixedEditForm("startTime", event.target.value)}
              />
            </label>
            <label className="fixed-schedule-field">
              Giờ kết thúc <span>*</span>
              <input
                type="time"
                value={fixedEditForm.endTime}
                onChange={(event) => this.updateFixedEditForm("endTime", event.target.value)}
              />
            </label>
            <label className="fixed-schedule-field">
              Số lượt khám trên một slot <span>*</span>
              <input
                type="number"
                min="1"
                value={fixedEditForm.capacity}
                onChange={(event) => this.updateFixedEditForm("capacity", event.target.value)}
              />
            </label>
            <label className="fixed-schedule-field">
              Thời gian 1 slot (phút) <span>*</span>
              <input
                type="number"
                min="1"
                value={fixedEditForm.slotDurationMinutes}
                onChange={(event) => this.updateFixedEditForm("slotDurationMinutes", event.target.value)}
              />
            </label>
            <label className="fixed-schedule-field fixed-schedule-field--wide">
              Phí khám
              <input
                type="number"
                min="0"
                value={fixedEditForm.price}
                placeholder="Phí khám"
                onChange={(event) => this.updateFixedEditForm("price", event.target.value)}
              />
            </label>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" type="button" onClick={this.handleFixedEditDelete} disabled={fixedSaving}>
            Xóa
          </Button>
          <Button color="secondary" type="button" onClick={this.closeFixedEdit} disabled={fixedSaving}>
            Đóng
          </Button>
          <Button color="primary" type="button" onClick={this.handleFixedEditUpdate} disabled={fixedSaving}>
            {fixedSaving ? "Đang lưu..." : "Cập nhật"}
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  renderFixedOverview = () => {
    const { loading } = this.state;

    return (
      <>
        <div className="fixed-schedule-overview-head">
          {loading && <span className="fixed-schedule-loading">Đang tải...</span>}
          <div className="fixed-schedule-legend">
            <span>
              <i className="fixed-schedule-dot fixed-schedule-dot--clinic" />
              Lịch khám
            </span>
            <span>
              <i className="fixed-schedule-dot fixed-schedule-dot--online" />
              Lịch tư vấn trực tuyến
            </span>
          </div>
        </div>

        <div className="fixed-schedule-week-scroll">
          <div className="fixed-schedule-week-grid">
            {WEEKDAYS.map((day) => (
              <div className="fixed-schedule-week-day" key={day.value}>
                <div className="fixed-schedule-week-day__head">{this.getWeekdayLabel(day.value)}</div>
                <div className="fixed-schedule-week-day__body">
                  {this.getFixedRulesForWeekday(day.value).map(this.renderFixedRuleCard)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {this.renderFixedSetupModal()}
        {this.renderFixedEditModal()}
      </>
    );
  };

  renderFieldError = (key, errors) =>
    errors[key] ? <small className="schedule-rule-field-error">{errors[key]}</small> : null;

  renderDateInput = (label, errors, disabled) => {
    const { form } = this.state;
    const value = form.date ? moment(form.date, "YYYY-MM-DD").toDate() : null;

    return (
      <label className="schedule-rule-modal-field schedule-rule-modal-field--wide">
        {label} <span>*</span>
        <DatePicker
          className="form-control schedule-rule-date-input"
          value={value}
          minDate={getTodayIso()}
          disabled={disabled}
          onChange={(dates) => {
            const date = dates && dates[0] ? moment(dates[0]).format("YYYY-MM-DD") : "";
            this.updateForm("date", date);
          }}
        />
        {this.renderFieldError("date", errors)}
      </label>
    );
  };

  renderRuleNotice = () => {
    const { activeTab, ruleReadOnly } = this.state;
    if (ruleReadOnly) {
      return (
        <div className="schedule-rule-readonly-note">
          Lịch này đã thuộc thời gian quá khứ nên chỉ có thể xem, không thể chỉnh sửa hoặc xóa.
        </div>
      );
    }

    const text =
      activeTab === "OFF"
        ? "Khách hàng sẽ không thể đặt lịch khám hoặc tư vấn vào khung giờ nghỉ. Các lịch đã được bệnh nhân đặt trước đó cũng sẽ bị hủy."
        : "Lịch khám này chỉ áp dụng cho ngày bạn đã chọn, không lặp lại và không áp dụng cho các ngày khác.\n\nTrong trường hợp có các lịch hẹn khám của bệnh nhân đã được đặt trước trùng với ngày của lịch mới, những lịch này sẽ bị hủy tự động. Vui lòng kiểm tra và thông báo lại cho bệnh nhân nếu cần.";

    return (
      <div className="schedule-rule-warning">
        <i className="bi bi-exclamation-circle-fill" aria-hidden="true" />
        <div>
          {activeTab === "OFF" && <strong>Lưu ý</strong>}
          {text.split("\n").map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>
    );
  };

  renderRuleFormFields = () => {
    const { activeTab, form, ruleReadOnly } = this.state;
    const errors = this.state.fieldErrors;
    const liveErrors = this.validateRuleForm();
    const shownErrors = { ...liveErrors, ...errors };
    const disabled = ruleReadOnly || this.state.saving;
    const isOff = activeTab === "OFF";

    return (
      <div className="schedule-rule-modal-grid">
        {this.renderDateInput(isOff ? "Ngày nghỉ" : "Ngày khám", shownErrors, disabled)}

        {!isOff && (
          <label className="schedule-rule-modal-field schedule-rule-modal-field--wide">
            Loại lịch làm việc <span>*</span>
            <select
              value={form.appointmentTypeId}
              disabled={disabled}
              onChange={(event) => this.updateForm("appointmentTypeId", event.target.value)}
            >
              {APPOINTMENT_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.value === "AT2" ? "Tư vấn trực tuyến" : "Lịch khám"}
                </option>
              ))}
            </select>
            {this.renderFieldError("appointmentTypeId", shownErrors)}
          </label>
        )}

        <label className="schedule-rule-modal-field">
          Giờ bắt đầu <span>*</span>
          <input
            type="time"
            value={form.startTime}
            disabled={disabled}
            onChange={(event) => this.updateForm("startTime", event.target.value)}
          />
          {this.renderFieldError("startTime", shownErrors)}
        </label>

        <label className="schedule-rule-modal-field">
          Giờ kết thúc <span>*</span>
          <input
            type="time"
            value={form.endTime}
            disabled={disabled}
            onChange={(event) => this.updateForm("endTime", event.target.value)}
          />
          {this.renderFieldError("endTime", shownErrors)}
        </label>

        {!isOff && (
          <>
            <label className="schedule-rule-modal-field">
              Số lượt khám trên một slot <span>*</span>
              <input
                type="number"
                min="1"
                value={form.capacity}
                disabled={disabled}
                onChange={(event) => this.updateForm("capacity", event.target.value)}
              />
              {this.renderFieldError("capacity", shownErrors)}
            </label>

            <label className="schedule-rule-modal-field">
              Thời gian 1 slot (phút) <span>*</span>
              <input
                type="number"
                min="1"
                value={form.slotDurationMinutes}
                disabled={disabled}
                placeholder="Phút"
                onChange={(event) => this.updateForm("slotDurationMinutes", event.target.value)}
              />
              {this.renderFieldError("slotDurationMinutes", shownErrors)}
            </label>

            <label className="schedule-rule-modal-field schedule-rule-modal-field--wide">
              Phí khám <span>*</span>
              <input
                type="number"
                min="0"
                value={form.price}
                disabled={disabled}
                placeholder="Nhập phí khám"
                onChange={(event) => this.updateForm("price", event.target.value)}
              />
              {this.renderFieldError("price", shownErrors)}
            </label>
          </>
        )}

        {this.state.ruleModalMode === "edit" && (
          <label className="schedule-rule-switch schedule-rule-modal-field--wide">
            <input
              type="checkbox"
              checked={Number(form.isActive) === 1}
              disabled={disabled}
              onChange={(event) => this.updateForm("isActive", event.target.checked ? 1 : 0)}
            />
            <span>Bật/Tắt lịch</span>
          </label>
        )}
      </div>
    );
  };

  renderRuleModal = () => {
    const { isRuleModalOpen, ruleModalMode, ruleReadOnly, saving, modalError } = this.state;
    const isEdit = ruleModalMode === "edit";
    const valid = this.isRuleFormValid();

    return (
      <Modal
        isOpen={isRuleModalOpen}
        toggle={this.closeRuleModal}
        size="lg"
        centered
        className="schedule-rule-modal schedule-rule-modal--rule user-modal"
      >
        <ModalHeader toggle={this.closeRuleModal}>{this.getRuleModalTitle()}</ModalHeader>
        <ModalBody>
          {this.renderRuleNotice()}
          {this.renderRuleFormFields()}
          {modalError && <div className="schedule-rule-modal-error">{modalError}</div>}
        </ModalBody>
        <ModalFooter>
          {isEdit && !ruleReadOnly && (
            <Button color="danger" type="button" onClick={this.handleRuleDelete} disabled={saving}>
              Xóa lịch
            </Button>
          )}
          <Button color="secondary" type="button" onClick={this.closeRuleModal} disabled={saving}>
            Đóng
          </Button>
          {!ruleReadOnly && (
            <Button color="primary" type="button" onClick={this.handleRuleSubmit} disabled={saving || !valid}>
              {saving ? "Đang xử lý..." : isEdit ? "Cập nhật" : "Thêm mới"}
            </Button>
          )}
        </ModalFooter>
      </Modal>
    );
  };

  renderConfirmModal = () => {
    const { isConfirmOpen, saving, previewImpact, confirmError } = this.state;
    const copy = this.getConfirmCopy();
    const count = Number(previewImpact?.affectedBookingCount) || 0;

    return (
      <Modal
        isOpen={isConfirmOpen}
        toggle={this.closeConfirmModal}
        centered
        className="schedule-rule-modal schedule-rule-confirm-modal user-modal"
      >
        <ModalHeader toggle={this.closeConfirmModal}>{copy.title}</ModalHeader>
        <ModalBody>
          <p>{copy.message}</p>
          {count > 0 && (
            <div className="schedule-rule-impact-count">
              Có {count} lịch hẹn có thể bị ảnh hưởng bởi thay đổi này.
            </div>
          )}
          {confirmError && <div className="schedule-rule-modal-error">{confirmError}</div>}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" type="button" onClick={this.closeConfirmModal} disabled={saving}>
            {copy.cancelLabel}
          </Button>
          <Button color="danger" type="button" onClick={this.handleConfirmSubmit} disabled={saving}>
            {saving ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  getRulesForCalendarDate = (date) =>
    (this.state.rules || [])
      .filter(
        (rule) =>
          rule.ruleType === this.state.activeTab &&
          Number(rule.isActive) !== 0 &&
          moment(rule.date).format("YYYY-MM-DD") === date
      )
      .sort((a, b) => toTimeInput(a.startTime).localeCompare(toTimeInput(b.startTime)));

  renderCalendarRuleCard = (rule) => {
    const isOff = rule.ruleType === "OFF";
    const isOnline = rule.appointmentTypeId === "AT2";
    const isPast = isDateBeforeToday(rule.date);
    const typeClass = isOff ? "off" : isOnline ? "online" : "clinic";
    const title = isOff ? "Lịch nghỉ" : isOnline ? "Tư vấn trực tuyến" : "Lịch khám";

    return (
      <button
        type="button"
        key={rule.id}
        className={`schedule-calendar-card schedule-calendar-card--${typeClass} ${isPast ? "is-past" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          this.openRuleEditModal(rule);
        }}
      >
        <span className="schedule-calendar-card__title">{title}</span>
        <span className="schedule-calendar-card__time">
          {toTimeInput(rule.startTime)} - {toTimeInput(rule.endTime)}
        </span>
        {isPast && <i className="bi bi-lock" aria-hidden="true" />}
      </button>
    );
  };

  renderMonthlyCalendar = () => {
    const { calendarMonth, calendarYear, selectedDate, loading } = this.state;
    const monthDate = this.getMonthDate();
    const today = getTodayIso();
    const days = getCalendarDays(monthDate);
    const hasVisibleRules = days.some((day) => this.getRulesForCalendarDate(day.iso).length > 0);
    const years = Array.from({ length: 9 }, (_, index) => moment(today).year() - 2 + index);
    if (!years.includes(calendarYear)) years.push(calendarYear);

    return (
      <div className="schedule-month-shell">
        <div className="schedule-month-toolbar">
          <div className="schedule-month-controls">
            <button type="button" className="schedule-month-nav" onClick={() => this.goToAdjacentMonth(-1)}>
              <i className="bi bi-chevron-left" aria-hidden="true" />
            </button>
            <select value={calendarMonth} onChange={(event) => this.changeCalendarMonth(Number(event.target.value), calendarYear)}>
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index} value={index}>
                  Tháng {index + 1}
                </option>
              ))}
            </select>
            <select value={calendarYear} onChange={(event) => this.changeCalendarMonth(calendarMonth, Number(event.target.value))}>
              {years.sort((a, b) => a - b).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button type="button" className="schedule-month-nav" onClick={() => this.goToAdjacentMonth(1)}>
              <i className="bi bi-chevron-right" aria-hidden="true" />
            </button>
          </div>

          <div className="schedule-month-actions">
            <div className="fixed-schedule-legend">
              <span>
                <i className="fixed-schedule-dot fixed-schedule-dot--clinic" />
                Lịch khám
              </span>
              <span>
                <i className="fixed-schedule-dot fixed-schedule-dot--online" />
                Lịch tư vấn trực tuyến
              </span>
            </div>

          </div>
        </div>

        {loading && <div className="schedule-calendar-state">Đang tải lịch...</div>}
        {!loading && !hasVisibleRules && (
          <div className="schedule-calendar-state">Chưa có lịch trong tháng đang xem.</div>
        )}

        <div className="schedule-calendar-scroll">
          <div className="schedule-calendar-grid">
            {WEEKDAYS.map((day) => (
              <div className="schedule-calendar-head" key={day.value}>
                {this.getWeekdayLabel(day.value)}
              </div>
            ))}
            {days.map((day) => {
              const rules = this.getRulesForCalendarDate(day.iso);
              const isToday = day.iso === today;
              const isSelected = day.iso === selectedDate;
              return (
                <div
                  role="button"
                  tabIndex="0"
                  key={day.iso}
                  className={`schedule-calendar-day ${day.isCurrentMonth ? "is-current" : "is-outside"} ${isToday || isSelected ? "is-highlighted" : ""
                    }`}
                  onClick={() => this.selectCalendarDate(day.iso)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      this.selectCalendarDate(day.iso);
                    }
                  }}
                >
                  <span className="schedule-calendar-day__number">{day.day}</span>
                  <div className="schedule-calendar-day__cards">
                    {rules.map(this.renderCalendarRuleCard)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {this.renderRuleModal()}
        {this.renderConfirmModal()}
      </div>
    );
  };

  renderForm = () => {
    const { activeTab, form } = this.state;
    const isOff = activeTab === "OFF";
    const isFixed = activeTab === "FIXED";

    return (
      <div className="schedule-rule-form">
        {isFixed ? (
          <label>
            Thứ trong tuần
            <select value={form.weekday} onChange={(event) => this.updateForm("weekday", event.target.value)}>
              {WEEKDAYS.map((item) => (
                <option key={item.value} value={item.value}>{this.label(item)}</option>
              ))}
            </select>
          </label>
        ) : (
          <label>
            Ngày áp dụng
            <input
              type="date"
              value={form.date}
              onChange={(event) => this.updateForm("date", event.target.value)}
            />
          </label>
        )}

        <label>
          Loại lịch
          <select
            value={form.appointmentTypeId}
            onChange={(event) => this.updateForm("appointmentTypeId", event.target.value)}
          >
            {isOff && <option value="ALL">Tất cả loại lịch</option>}
            {APPOINTMENT_TYPES.map((item) => (
              <option key={item.value} value={item.value}>{this.label(item)}</option>
            ))}
          </select>
        </label>

        {isOff && (
          <label className="schedule-rule-checkbox">
            <input
              type="checkbox"
              checked={form.isFullDay}
              onChange={(event) => this.updateForm("isFullDay", event.target.checked)}
            />
            Nghỉ cả ngày
          </label>
        )}

        <label>
          Giờ bắt đầu
          <input
            type="time"
            value={form.startTime}
            disabled={isOff && form.isFullDay}
            onChange={(event) => this.updateForm("startTime", event.target.value)}
          />
        </label>

        <label>
          Giờ kết thúc
          <input
            type="time"
            value={form.endTime}
            disabled={isOff && form.isFullDay}
            onChange={(event) => this.updateForm("endTime", event.target.value)}
          />
        </label>

        {!isOff && (
          <>
            <label>
              Số lượt khám trên một slot
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(event) => this.updateForm("capacity", event.target.value)}
              />
            </label>

            <label>
              Thời gian 1 slot (phút)
              <input
                type="number"
                min="1"
                value={form.slotDurationMinutes}
                onChange={(event) => this.updateForm("slotDurationMinutes", event.target.value)}
              />
            </label>

            <label>
              Số ngày phải đặt khám trước
              <input
                type="number"
                min="0"
                value={form.minBookingNoticeDays}
                onChange={(event) => this.updateForm("minBookingNoticeDays", event.target.value)}
              />
            </label>

            <label>
              Số ngày đặt khám xa nhất
              <input
                type="number"
                min="0"
                value={form.maxBookingAheadDays}
                onChange={(event) => this.updateForm("maxBookingAheadDays", event.target.value)}
              />
            </label>

            <label>
              Phí khám
              <input
                type="number"
                min="0"
                value={form.price}
                placeholder="Dùng giá mặc định"
                onChange={(event) => this.updateForm("price", event.target.value)}
              />
            </label>

            <label>
              Giảm giá (%)
              <input
                type="number"
                min="0"
                max="100"
                value={form.discountPercent}
                onChange={(event) => this.updateForm("discountPercent", event.target.value)}
              />
            </label>
          </>
        )}
      </div>
    );
  };

  render() {
    const { activeTab, rules, loading } = this.state;
    const visibleRules = rules.filter((rule) => rule.ruleType === activeTab);
    const isFixed = activeTab === "FIXED";

    if (!isFixed) {
      return (
        <div className="schedule-rule-manager">
          <div className="schedule-rule-header">
            <div>
              <h2>Lịch làm việc</h2>
              {this.props.doctorLabel && <p>{this.props.doctorLabel}</p>}
            </div>
            <button type="button" className="schedule-rule-primary" onClick={this.openRuleCreateModal}>
              Thêm mới <span>F2</span>
            </button>
          </div>

          <div className="schedule-rule-tabs">
            {TABS.map((tab) => (
              <button
                type="button"
                key={tab.id}
                className={activeTab === tab.id ? "active" : ""}
                onClick={() => this.setTab(tab.id)}
              >
                {this.label(tab)}
              </button>
            ))}
          </div>

          {this.renderMonthlyCalendar()}
        </div>
      );
    }

    return (
      <div className="schedule-rule-manager">
        <div className="schedule-rule-header">
          <div>
            <h2>Lịch làm việc</h2>
            {this.props.doctorLabel && <p>{this.props.doctorLabel}</p>}
          </div>
          {isFixed && (
            <button type="button" className="schedule-rule-primary" onClick={this.openFixedSetup}>
              Điều chỉnh <span>F2</span>
            </button>
          )}
          {/*
            <button type="button" className="schedule-rule-primary" onClick={this.handleSave}>
              {form.id ? "Cập nhật" : "Thêm mới"}
            </button>
          )}
          */}
        </div>

        <div className="schedule-rule-tabs">
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => this.setTab(tab.id)}
            >
              {this.label(tab)}
            </button>
          ))}
        </div>

        {isFixed ? (
          this.renderFixedOverview()
        ) : (
          <>
            <div className="schedule-rule-note">
              {activeTab === "OFF" &&
                "Lịch nghỉ được ưu tiên cao nhất. Booking trùng khung nghỉ sẽ bị hủy theo preview impact."}
              {activeTab === "FLEXIBLE" &&
                "Lịch linh hoạt chỉ áp dụng cho ngày đã chọn và thay toàn bộ lịch cố định cùng loại khám trong ngày đó."}
            </div>

            {this.renderForm()}

            <div className="schedule-rule-list">
              <div className="schedule-rule-list__title">
                <strong>Danh sách hiện có</strong>
                {loading && <span>Đang tải...</span>}
              </div>
              {visibleRules.length === 0 ? (
                <div className="schedule-rule-empty">Chưa có lịch trong mục này.</div>
              ) : (
                visibleRules.map(this.renderRuleCard)
              )}
            </div>
          </>
        )}
      </div>
    );
  }
}

export default ScheduleRuleManager;
