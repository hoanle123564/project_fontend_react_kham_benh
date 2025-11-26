import React, { Component } from "react";
import { connect } from "react-redux";
import "./DashBoard.scss";
import * as actions from "../../store/actions";
import { getAllBooking } from "../../services/userService";

// Recharts 2.1 compatible
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

class DashBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allBooking: [],
        };
    }

    async componentDidMount() {
        this.props.fetchAllUser();
        this.props.fetchAllDoctor();
        this.props.GetAllClinic();
        this.props.GetAllSpecialty();

        let res = await getAllBooking();
        if (res && res.errCode === 0) {
            this.setState({ allBooking: res.data });
        }
    }

    render() {
        const { userList, doctorList, clinics, specialty, language } = this.props;
        const { allBooking } = this.state;

        const patientCount = userList?.filter(u => u.roleId === "R3")?.length || 0;
        const statusNew = allBooking.filter(b => b.statusId === "S1").length;
        const statusConfirmed = allBooking.filter(b => b.statusId === "S2").length;
        const statusDone = allBooking.filter(b => b.statusId === "S3").length;
        const statusCancel = allBooking.filter(b => b.statusId === "S4").length;

        // Dữ liệu PieChart (Recharts 2.1 version)
        const pieData = [
            { name: language === 'vi' ? "Lịch mới (S1)" : "New (S1)", value: statusNew },
            { name: language === 'vi' ? "Đã xác nhận (S2)" : "Confirmed (S2)", value: statusConfirmed },
            { name: language === 'vi' ? "Hoàn thành (S3)" : "Completed (S3)", value: statusDone },
            { name: language === 'vi' ? "Huỷ (S4)" : "Cancelled (S4)", value: statusCancel },
        ];

        const COLORS = ["#0ea5e9", "#f59e0b", "#16a34a", "#dc2626"];

        return (
            <div className="dashboard-container">
                <h1 className="dashboard-title">{language === 'vi' ? 'Thống kê hệ thống' : 'System Statistics'}</h1>
                <div className="top-stats">
                    <div className="stat-box blue-box">
                        <div className="stat-number">{patientCount}</div>
                        <div className="stat-label">{language === 'vi' ? 'Bệnh nhân' : 'Patients'}</div>
                        <div className="stat-manage">{language === 'vi' ? 'Quản lý' : 'Manage'}</div>
                    </div>

                    <div className="stat-box green-box">
                        <div className="stat-number">{doctorList?.length || 0}</div>
                        <div className="stat-label">{language === 'vi' ? 'Bác sĩ' : 'Doctors'}</div>
                        <div className="stat-manage">{language === 'vi' ? 'Quản lý' : 'Manage'}</div>
                    </div>

                    <div className="stat-box orange-box">
                        <div className="stat-number">{clinics?.length || 0}</div>
                        <div className="stat-label">{language === 'vi' ? 'Cơ sở y tế' : 'Clinics'}</div>
                        <div className="stat-manage">{language === 'vi' ? 'Quản lý' : 'Manage'}</div>
                    </div>

                    <div className="stat-box red-box">
                        <div className="stat-number">{specialty?.length || 0}</div>
                        <div className="stat-label">{language === 'vi' ? 'Chuyên khoa' : 'Specialties'}</div>
                        <div className="stat-manage">{language === 'vi' ? 'Quản lý' : 'Manage'}</div>
                    </div>
                </div>

                {/* BIỂU ĐỒ TRÒN  */}
                <div className="chart-container">
                    <h2 style={{ marginBottom: "20px" }}>
                        {language === 'vi' ? 'Biểu đồ trạng thái lịch khám' : 'Appointment Status Chart'}
                    </h2>

                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    userList: state.admin.user,
    doctorList: state.admin.AllDoctor,
    clinics: state.admin.AllClinic,
    specialty: state.admin.specialty,
    language: state.app.language,
});

const mapDispatchToProps = (dispatch) => ({
    fetchAllUser: () => dispatch(actions.fetchAllUser()),
    fetchAllDoctor: () => dispatch(actions.fetchAllDoctor()),
    GetAllClinic: () => dispatch(actions.GetAllClinic()),
    GetAllSpecialty: () => dispatch(actions.GetAllSpecialty()),
});

export default connect(mapStateToProps, mapDispatchToProps)(DashBoard);
