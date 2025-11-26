import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import DatePicker from "../../components/Input/DatePicker";
import * as action from "../../store/actions";
import "./ManagePatient.scss";
import moment from "moment";
import { getAllPatientForDoctor, postSendRemedy } from "../../services/userService";
import RemedyModal from "./RemedyModal";
import { toast } from "react-toastify";

class ManageSchedulePrivate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentDate: new Date(),
            ListPatient: [],
            searchQuery: "",
            sortField: "timeTypeVi",
            sortOrder: "asc",
            isOpenRemedyModal: false,
            dataModal: {}
        };
    }

    async componentDidMount() {
        this.props.fetchAllHour();
        await this.fetchPatientList();
    }

    async componentDidUpdate(prevProps, prevState) {
        if (prevState.currentDate !== this.state.currentDate) {
            await this.fetchPatientList();
        }
    }

    fetchPatientList = async () => {
        const date = moment(this.state.currentDate).format("DD/MM/YYYY");
        const doctorId = this.props.userInfo?.id;
        try {
            const res = await getAllPatientForDoctor(doctorId, date);
            if (res && res.errCode === 0) {
                this.setState({ ListPatient: res.data });
            }
        } catch (err) {
            console.error(err);
        }
    };

    handleOnchangeDatePicker = (date) => {
        this.setState({ currentDate: date[0] });
    };

    handleConfirm = (item) => {
        this.setState({ isOpenRemedyModal: true, dataModal: item });
    };

    SendRedemy = async (datachild) => {
        const res = await postSendRemedy(datachild);
        if (res && res.errCode === 0) {
            toast.success('Send remedy successfully');
            this.setState({ isOpenRemedyModal: false });
            await this.fetchPatientList();
        } else {
            toast.error('Send remedy failed');
            console.log('check res', res);
        }
    };

    // Search input
    handleSearchChange = (e) => {
        this.setState({ searchQuery: e.target.value.toLowerCase() });
    };

    // Sort column
    handleSort = (field) => {
        const { sortField, sortOrder } = this.state;
        const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
        this.setState({ sortField: field, sortOrder: newOrder });
    };

    // Filter + sort patients
    getFilteredPatients = () => {
        const { ListPatient, searchQuery, sortField, sortOrder } = this.state;
        let filtered = ListPatient.filter(item => {
            const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
            return fullName.includes(searchQuery);
        });

        filtered.sort((a, b) => {
            let valA = a[sortField] || "";
            let valB = b[sortField] || "";
            if (typeof valA === "string") valA = valA.toLowerCase();
            if (typeof valB === "string") valB = valB.toLowerCase();
            if (valA < valB) return sortOrder === "asc" ? -1 : 1;
            if (valA > valB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        return filtered;
    };

    render() {
        const {
            currentDate,
            sortField,
            sortOrder,
            isOpenRemedyModal,
            dataModal
        } = this.state;

        const filteredPatients = this.getFilteredPatients();

        return (
            <>
                <div className="manage-schedule-container">
                    <div className="m-s-title">
                        <FormattedMessage id="manage-patient.title" />
                    </div>

                    <div className="container">
                        <div className="row">
                            {/* Thông tin bác sĩ */}
                            <div className="col-6 form-group">
                                <label style={{ marginRight: "10px", fontWeight: "600" }}>
                                    <FormattedMessage id="manage-patient.choose-doctor" />:
                                </label>
                                <span style={{ fontSize: "16px" }}>
                                    {this.props.userInfo
                                        ? `${this.props.userInfo.firstName} ${this.props.userInfo.lastName}`
                                        : ""}
                                </span>
                            </div>

                            {/* Chọn ngày */}
                            <div className="col-6 form-group">
                                <label>
                                    <FormattedMessage id="manage-patient.select-date" />
                                </label>
                                <DatePicker
                                    onChange={this.handleOnchangeDatePicker}
                                    value={currentDate}
                                    className="form-control"
                                    minDate={moment().startOf('day').toDate()}
                                />
                            </div>

                            {/* Search + Table */}
                            <div className="col-12 mt-4">
                                {/* Search */}
                                <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
                                    <input
                                        type="text"
                                        className="form-control w-25"
                                        placeholder={this.props.language === 'vi' ? '🔍 Tìm theo tên bệnh nhân...' : '🔍 Search patient by name...'}
                                        onChange={this.handleSearchChange}
                                    />
                                    <span className="text-muted">
                                        {this.props.language === 'vi' ? `Tổng: ${filteredPatients.length} lịch khám` : `Total: ${filteredPatients.length} appointments`}
                                    </span>
                                </div>

                                {/* Table */}
                                <div className="table-manage-patient table-responsive shadow-sm rounded-3 my-3">
                                    <table className="table table-hover align-middle table-bordered mb-0">
                                        <thead className="table-primary">
                                            <tr>
                                                <th>#</th>
                                                {[
                                                    { field: "timeTypeVi", labelVi: "Thời gian", labelEn: "Time" },
                                                    { field: "firstName", labelVi: "Họ và tên", labelEn: "Full name" },
                                                    { field: "address", labelVi: "Địa chỉ", labelEn: "Address" },
                                                    { field: "reason", labelVi: "Lý do", labelEn: "Reason" }
                                                ].map(col => (
                                                    <th
                                                        key={col.field}
                                                        onClick={() => col.field !== "address" && this.handleSort(col.field)}
                                                        style={{ cursor: col.field !== "address" ? "pointer" : "default", whiteSpace: "nowrap" }}
                                                    >
                                                        {this.props.language === 'vi' ? col.labelVi : col.labelEn}{" "}
                                                        {sortField === col.field && (
                                                            <i className={`fa-solid fa-sort-${sortOrder === "asc" ? "up" : "down"} ms-1`}></i>
                                                        )}
                                                    </th>
                                                ))}
                                                <th>{this.props.language === 'vi' ? 'Hành động' : 'Actions'}</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredPatients.length > 0 ? (
                                                filteredPatients.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{item.timeTypeVi}</td>
                                                        <td>{item.firstName} {item.lastName}</td>
                                                        <td>{item.address}</td>
                                                        <td>{item.reason}</td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-warning"
                                                                onClick={() => this.handleConfirm(item)}
                                                            >
                                                                {this.props.language === 'vi' ? 'Xác nhận khám xong' : 'Confirm completion'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center text-muted py-3">
                                                        {this.props.language === 'vi' ? 'Không có lịch khám' : 'No appointments'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Remedy Modal */}
                <RemedyModal
                    isOpen={isOpenRemedyModal}
                    toggleModal={() => this.setState({ isOpenRemedyModal: false })}
                    SendRedemy={this.SendRedemy}
                    dataModal={dataModal}
                />
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    isLoggedIn: state.doctor.isLoggedIn,
    language: state.app.language,
    userInfo: state.doctor.doctorInfo,
    AllScheduleTime: state.admin.AllTime,
});

const mapDispatchToProps = (dispatch) => ({
    fetchAllHour: () => dispatch(action.fetchAllHour()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedulePrivate);
