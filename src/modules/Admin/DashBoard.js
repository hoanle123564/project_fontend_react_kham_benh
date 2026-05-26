import React, { Component } from "react";
import { connect } from "react-redux";
import "./DashBoard.scss";
import * as actions from "../../store/actions";
import { getAllBooking, getAdminDashboardStatistics } from "../../services/userService";
import Chart from "react-apexcharts";

class DashBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allBooking: [],
            revenueType: "month",
            topDoctorType: "month",
            dashboardData: {
                revenue: {
                    total: 0,
                    chartData: [],
                },
                topDoctors: [],
                doctorRatio: {
                    newDoctors: 0,
                    oldDoctors: 0,
                    totalDoctors: 0,
                },
            },
            isLoadingStatistics: false,
        };
    }

    async componentDidMount() {
        this.props.fetchAllUser();
        this.props.fetchAllDoctor();
        this.props.GetAllClinic();
        this.props.GetAllSpecialty();

        await Promise.all([
            this.fetchAllBooking(),
            this.fetchDashboardStatistics(),
        ]);
    }

    fetchAllBooking = async () => {
        try {
            let res = await getAllBooking();
            if (res && res.errCode === 0) {
                this.setState({ allBooking: res.data || [] });
            }
        } catch (error) {
            console.log("fetchAllBooking error", error);
        }
    };

    fetchDashboardStatistics = async () => {
        const { revenueType, topDoctorType } = this.state;

        this.setState({ isLoadingStatistics: true });

        try {
            const res = await getAdminDashboardStatistics(revenueType, topDoctorType);
            if (res && res.errCode === 0) {
                this.setState({
                    dashboardData: res.data,
                    isLoadingStatistics: false,
                });
                return;
            }
        } catch (error) {
            console.log("fetchDashboardStatistics error", error);
        }

        this.setState({ isLoadingStatistics: false });
    };

    handleChangeRevenueType = async (event) => {
        this.setState({ revenueType: event.target.value }, this.fetchDashboardStatistics);
    };

    handleChangeTopDoctorType = async (event) => {
        this.setState({ topDoctorType: event.target.value }, this.fetchDashboardStatistics);
    };

    formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(Number(value) || 0);
    };

    buildStatusChartOptions = (language) => ({
        labels: [
            language === "vi" ? "Lịch mới" : "New",
            language === "vi" ? "Đã xác nhận" : "Confirmed",
            language === "vi" ? "Hoàn thành" : "Completed",
            language === "vi" ? "Huỷ" : "Cancelled",
        ],
        colors: ["#3498db", "#f39c12", "#2ecc71", "#e74c3c"],
        chart: {
            type: "donut",
            fontFamily: "inherit",
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "65%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: language === "vi" ? "Tổng cộng" : "Total",
                        },
                    },
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        legend: {
            position: "bottom",
            horizontalAlign: "center",
            fontSize: "13px",
        },
        tooltip: {
            y: {
                formatter: (val) => `${val} ${language === "vi" ? "ca khám" : "appointments"}`,
            },
        },
    });

    buildRevenueChartOptions = (revenueData, language) => ({
        chart: {
            type: "area",
            toolbar: {
                show: false,
            },
            fontFamily: "inherit",
        },
        colors: ["#1e90ff"],
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: "smooth",
            width: 3,
        },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.35,
                opacityTo: 0.05,
                stops: [0, 90, 100],
            },
        },
        xaxis: {
            categories: revenueData.map((item) => item.label),
            labels: {
                rotate: -35,
                style: {
                    fontSize: "12px",
                },
            },
        },
        yaxis: {
            labels: {
                formatter: (value) => this.formatCurrency(value).replace("₫", "đ"),
            },
        },
        tooltip: {
            y: {
                formatter: (value) => this.formatCurrency(value).replace("₫", "đ"),
                title: {
                    formatter: () => language === "vi" ? "Doanh thu" : "Revenue",
                },
            },
        },
    });

    buildTopDoctorChartOptions = (topDoctors, language) => ({
        chart: {
            type: "bar",
            toolbar: {
                show: false,
            },
            fontFamily: "inherit",
        },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 4,
                barHeight: "55%",
            },
        },
        colors: ["#2ecc71"],
        dataLabels: {
            enabled: true,
            formatter: (value) => `${value}`,
        },
        xaxis: {
            categories: topDoctors.map((doctor) => doctor.doctorName),
            labels: {
                formatter: (value) => `${Math.round(value)}`,
            },
        },
        tooltip: {
            y: {
                formatter: (value) => `${value} ${language === "vi" ? "lượt khám" : "visits"}`,
            },
        },
    });

    buildDoctorRatioOptions = (language) => ({
        labels: [
            language === "vi" ? "Bác sĩ mới" : "New doctors",
            language === "vi" ? "Bác sĩ cũ" : "Existing doctors",
        ],
        colors: ["#9b59b6", "#16a085"],
        chart: {
            type: "donut",
            fontFamily: "inherit",
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "65%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: language === "vi" ? "Tổng" : "Total",
                        },
                    },
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        legend: {
            position: "bottom",
        },
    });

    renderFilter = (value, onChange, options) => (
        <select className="dashboard-filter" value={value} onChange={onChange}>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );

    render() {
        const { userList, doctorList, clinics, specialty, language } = this.props;
        const {
            allBooking,
            revenueType,
            topDoctorType,
            dashboardData,
            isLoadingStatistics,
        } = this.state;

        const patientCount = userList?.filter((u) => u.roleId === "R3")?.length || 0;

        const statusNew = allBooking.filter((b) => b.statusId === "S1").length;
        const statusConfirmed = allBooking.filter((b) => b.statusId === "S2").length;
        const statusDone = allBooking.filter((b) => b.statusId === "S3").length;
        const statusCancel = allBooking.filter((b) => b.statusId === "S4").length;
        const statusSeries = [statusNew, statusConfirmed, statusDone, statusCancel];

        const revenueData = dashboardData?.revenue?.chartData || [];
        const revenueSeries = [
            {
                name: language === "vi" ? "Doanh thu" : "Revenue",
                data: revenueData.map((item) => item.revenue),
            },
        ];

        const topDoctors = dashboardData?.topDoctors || [];
        const topDoctorSeries = [
            {
                name: language === "vi" ? "Lượt khám" : "Visits",
                data: topDoctors.map((doctor) => doctor.examinationCount),
            },
        ];

        const doctorRatio = dashboardData?.doctorRatio || {};
        const doctorRatioSeries = [
            doctorRatio.newDoctors || 0,
            doctorRatio.oldDoctors || 0,
        ];

        const revenueFilterOptions = [
            { value: "week", label: language === "vi" ? "Theo tuần" : "Weekly" },
            { value: "month", label: language === "vi" ? "Theo tháng" : "Monthly" },
            { value: "year", label: language === "vi" ? "Theo năm" : "Yearly" },
        ];

        const topDoctorFilterOptions = [
            { value: "month", label: language === "vi" ? "Theo tháng" : "Monthly" },
            { value: "quarter", label: language === "vi" ? "Theo quý" : "Quarterly" },
            { value: "year", label: language === "vi" ? "Theo năm" : "Yearly" },
        ];

        return (
            <div className="dashboard-container">
                <div className="container">
                    <h1 className="dashboard-title">
                        {language === "vi" ? "Thống kê hệ thống" : "System Statistics"}
                    </h1>

                    <div className="top-stats">
                        <div className="row g-4">
                            <div className="col-12 col-md-6 col-xl-3">
                                <div className="stat-box blue-line">
                                    <div className="content-box">
                                        <div className="stat-label">{language === "vi" ? "Bệnh nhân" : "Patients"}</div>
                                        <div className="stat-number">{patientCount}</div>
                                    </div>
                                    <div className="icon-box">
                                        <i className="fas fa-users"></i>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-6 col-xl-3">
                                <div className="stat-box green-line">
                                    <div className="content-box">
                                        <div className="stat-label">{language === "vi" ? "Bác sĩ" : "Doctors"}</div>
                                        <div className="stat-number">{doctorList?.length || 0}</div>
                                    </div>
                                    <div className="icon-box">
                                        <i className="fas fa-user-md"></i>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-6 col-xl-3">
                                <div className="stat-box orange-line">
                                    <div className="content-box">
                                        <div className="stat-label">{language === "vi" ? "Cơ sở y tế" : "Clinics"}</div>
                                        <div className="stat-number">{clinics?.length || 0}</div>
                                    </div>
                                    <div className="icon-box">
                                        <i className="fas fa-hospital"></i>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-md-6 col-xl-3">
                                <div className="stat-box red-line">
                                    <div className="content-box">
                                        <div className="stat-label">{language === "vi" ? "Chuyên khoa" : "Specialties"}</div>
                                        <div className="stat-number">{specialty?.length || 0}</div>
                                    </div>
                                    <div className="icon-box">
                                        <i className="fas fa-briefcase-medical"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card revenue-card">
                        <div className="chart-header">
                            <h2 className="chart-title">
                                {language === "vi" ? "Doanh thu hệ thống" : "System Revenue"}
                            </h2>
                            {this.renderFilter(revenueType, this.handleChangeRevenueType, revenueFilterOptions)}
                        </div>

                        <div className="revenue-content">
                            <div className="revenue-summary">
                                <span>{language === "vi" ? "Tổng doanh thu" : "Total revenue"}</span>
                                <strong>{this.formatCurrency(dashboardData?.revenue?.total).replace("₫", "đ")}</strong>
                                {isLoadingStatistics && (
                                    <small>{language === "vi" ? "Đang tải..." : "Loading..."}</small>
                                )}
                            </div>

                            <div className="revenue-chart">
                                <Chart
                                    options={this.buildRevenueChartOptions(revenueData, language)}
                                    series={revenueSeries}
                                    type="area"
                                    height={320}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <div className="chart-header">
                                <h2 className="chart-title">
                                    {language === "vi" ? "Top 5 bác sĩ" : "Top 5 Doctors"}
                                </h2>
                                {this.renderFilter(topDoctorType, this.handleChangeTopDoctorType, topDoctorFilterOptions)}
                            </div>

                            <Chart
                                options={this.buildTopDoctorChartOptions(topDoctors, language)}
                                series={topDoctorSeries}
                                type="bar"
                                height={300}
                            />
                        </div>

                        <div className="dashboard-card">
                            <div className="chart-header">
                                <h2 className="chart-title">
                                    {language === "vi" ? "Tỷ lệ bác sĩ mới/cũ" : "Doctor Ratio"}
                                </h2>
                            </div>

                            <Chart
                                options={this.buildDoctorRatioOptions(language)}
                                series={doctorRatioSeries}
                                type="donut"
                                height={300}
                            />
                        </div>
                    </div>

                    <div className="dashboard-card status-card">
                        <div className="chart-header">
                            <h2 className="chart-title">
                                {language === "vi" ? "Trạng thái lịch khám" : "Appointment Status"}
                            </h2>
                        </div>

                        <Chart
                            options={this.buildStatusChartOptions(language)}
                            series={statusSeries}
                            type="donut"
                            height={280}
                        />
                    </div>
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
