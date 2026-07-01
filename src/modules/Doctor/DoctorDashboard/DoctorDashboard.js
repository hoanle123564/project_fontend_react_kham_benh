import React, { Component } from "react";
import { connect } from "react-redux";
import Chart from "react-apexcharts";
import { getDoctorDashboardStatistics } from "../../../services/userService";
import "./DoctorDashboard.scss";

const RANGE_OPTIONS = [
    { value: "week", vi: "7 ngày", en: "7 days" },
    { value: "month", vi: "30 ngày", en: "30 days" },
    { value: "year", vi: "365 ngày", en: "365 days" },
];

const PATIENT_METRICS = [
    { key: "totalVisits", color: "#0ea5e9", vi: "Tổng lượt khám", en: "Total visits" },
    { key: "newPatients", color: "#0f766e", vi: "Bệnh nhân mới", en: "New patients" },
    { key: "oldPatients", color: "#7c3aed", vi: "Bệnh nhân cũ", en: "Returning patients" },
];

class DoctorDashboard extends Component {
    state = {
        range: "week",
        dashboardData: null,
        isLoading: false,
        errorMessage: "",
    };

    componentDidMount() {
        this.fetchDashboard();
    }

    getText = (vi, en) => (this.props.language === "vi" ? vi : en);

    fetchDashboard = async () => {
        const { range } = this.state;
        this.setState({ isLoading: true, errorMessage: "" });

        try {
            const response = await getDoctorDashboardStatistics(range);
            if (response && response.errCode === 0) {
                this.setState({
                    dashboardData: response.data || {},
                    isLoading: false,
                });
                return;
            }

            this.setState({
                isLoading: false,
                errorMessage: response?.errMessage || this.getText("Không tải được dashboard.", "Cannot load dashboard."),
            });
        } catch (error) {
            this.setState({
                isLoading: false,
                errorMessage: this.getText("Không tải được dashboard.", "Cannot load dashboard."),
            });
        }
    };

    handleRangeChange = (range) => {
        this.setState({ range }, this.fetchDashboard);
    };

    formatMoney = (value) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(Number(value || 0)).replace("₫", "đ");

    buildPatientVisitComboOptions = (items) => ({
        chart: {
            type: "line",
            stacked: true,
            toolbar: { show: false },
            fontFamily: "inherit",
        },
        colors: ["#2563eb", "#16a34a", "#f97316"],
        dataLabels: { enabled: false },
        stroke: {
            curve: "smooth",
            width: [0, 0, 3],
        },
        markers: {
            size: [0, 0, 5],
            strokeWidth: 3,
            strokeColors: "#ffffff",
            hover: { size: 7 },
        },
        plotOptions: {
            bar: {
                columnWidth: "42%",
                borderRadius: 4,
                borderRadiusApplication: "end",
            },
        },
        xaxis: {
            categories: items.map((item) => item.label),
            labels: {
                rotate: -30,
                trim: true,
                style: {
                    colors: "#64748b",
                    fontSize: "12px",
                },
            },
            tooltip: { enabled: false },
        },
        yaxis: {
            min: 0,
            forceNiceScale: true,
            labels: {
                formatter: (value) => `${Math.round(value)}`,
            },
        },
        legend: {
            position: "top",
            horizontalAlign: "right",
            markers: { radius: 12 },
        },
        tooltip: {
            shared: true,
            intersect: false,
            x: {
                formatter: (_value, options) => items[options.dataPointIndex]?.label || "",
            },
            y: {
                formatter: (value) => `${Math.round(value || 0)}`,
            },
        },
        grid: {
            borderColor: "#e5edf6",
            strokeDashArray: 4,
        },
    });

    buildDonutOptions = () => ({
        labels: [
            this.getText("Bệnh nhân mới", "New patients"),
            this.getText("Bệnh nhân cũ", "Returning patients"),
        ],
        colors: ["#0f766e", "#7c3aed"],
        chart: {
            type: "donut",
            fontFamily: "inherit",
        },
        dataLabels: { enabled: false },
        legend: { position: "bottom" },
    });

    buildPatientMetricOptions = (items, metric) => ({
        chart: {
            type: "area",
            toolbar: { show: false },
            fontFamily: "inherit",
        },
        colors: [metric.color],
        dataLabels: { enabled: false },
        stroke: {
            curve: "smooth",
            width: 2,
        },
        fill: {
            type: "gradient",
            gradient: {
                opacityFrom: 0.24,
                opacityTo: 0.02,
            },
        },
        xaxis: {
            categories: items.map((item) => item.label),
            labels: { show: false },
            tooltip: { enabled: false },
        },
        yaxis: {
            labels: { show: false },
        },
        tooltip: {
            x: {
                formatter: (_value, options) => items[options.dataPointIndex]?.label || "",
            },
            y: {
                formatter: (value) => `${Math.round(value)}`,
            },
        },
        grid: {
            padding: {
                left: 0,
                right: 0,
            },
        },
    });

    renderRangeTabs = () => {
        const { range } = this.state;

        return (
            <div className="doctor-dashboard__range-tabs">
                {RANGE_OPTIONS.map((option) => (
                    <button
                        type="button"
                        key={option.value}
                        className={range === option.value ? "active" : ""}
                        onClick={() => this.handleRangeChange(option.value)}
                    >
                        {this.props.language === "vi" ? option.vi : option.en}
                    </button>
                ))}
            </div>
        );
    };

    renderRevenueCards = (summary = {}) => {
        const cards = [
            {
                label: this.getText("Tổng doanh thu", "Total revenue"),
                value: summary.totalRevenue,
                className: "total",
            },
            {
                label: this.getText("Tại cơ sở", "In-person revenue"),
                value: summary.clinicRevenue,
                className: "clinic",
            },
            {
                label: this.getText("Online", "Online revenue"),
                value: summary.onlineRevenue,
                className: "online",
            },
        ];

        return (
            <div className="doctor-dashboard__revenue-grid">
                {cards.map((card) => (
                    <div key={card.className} className={`doctor-dashboard__revenue-card ${card.className}`}>
                        <span>{card.label}</span>
                        <strong>{this.formatMoney(card.value)}</strong>
                    </div>
                ))}
            </div>
        );
    };

    renderPatientMetricCharts = (items) => (
        <div className="doctor-dashboard__metric-lines-grid">
            {PATIENT_METRICS.map((metric) => {
                const label = this.props.language === "vi" ? metric.vi : metric.en;
                const total = items.reduce((sum, item) => sum + (Number(item[metric.key]) || 0), 0);

                return (
                    <div className="doctor-dashboard__metric-line-card" key={metric.key}>
                        <div>
                            <span>{label}</span>
                            <strong>{total}</strong>
                        </div>
                        <Chart
                            options={this.buildPatientMetricOptions(items, metric)}
                            series={[{ name: label, data: items.map((item) => item[metric.key] || 0) }]}
                            type="area"
                            height={150}
                        />
                    </div>
                );
            })}
        </div>
    );

    renderContent = () => {
        const { dashboardData, isLoading, errorMessage } = this.state;

        if (isLoading && !dashboardData) {
            return <div className="doctor-dashboard__state">{this.getText("Đang tải...", "Loading...")}</div>;
        }

        if (errorMessage && !dashboardData) {
            return (
                <div className="doctor-dashboard__state error">
                    <p>{errorMessage}</p>
                    <button type="button" onClick={this.fetchDashboard}>
                        {this.getText("Thử lại", "Retry")}
                    </button>
                </div>
            );
        }

        const data = dashboardData || {};
        const visitItems = data.visitTrend?.items || [];
        const patientItems = data.patientLineChart?.items || visitItems;
        const donut = data.patientTypeDonut || {};

        return (
            <>
                {this.renderRevenueCards(data.revenueSummary)}

                <div className="doctor-dashboard__main-grid">
                    <div className="doctor-dashboard__patient-visit-panel doctor-dashboard__panel">
                        <div className="doctor-dashboard__panel-header">
                            <h3>{this.getText("Lượt bệnh nhân đến khám", "Patient visits")}</h3>
                        </div>
                        <Chart
                            options={this.buildPatientVisitComboOptions(patientItems)}
                            series={[
                                {
                                    name: this.getText("Bệnh nhân cũ", "Returning patients"),
                                    type: "column",
                                    data: patientItems.map((item) => Number(item.oldPatients) || 0),
                                },
                                {
                                    name: this.getText("Bệnh nhân mới", "New patients"),
                                    type: "column",
                                    data: patientItems.map((item) => Number(item.newPatients) || 0),
                                },
                                {
                                    name: this.getText("Lượt khám", "Visits"),
                                    type: "line",
                                    data: patientItems.map((item) => Number(item.totalVisits) || 0),
                                },
                            ]}
                            type="line"
                            height={320}
                        />
                    </div>

                    <div className="doctor-dashboard__panel">
                        <div className="doctor-dashboard__panel-header">
                            <h3>{this.getText("Bệnh nhân mới/cũ", "New vs Returning")}</h3>
                        </div>
                        <Chart
                            options={this.buildDonutOptions()}
                            series={[donut.newPatients || 0, donut.oldPatients || 0]}
                            type="donut"
                            height={320}
                        />
                    </div>
                </div>

                {this.renderPatientMetricCharts(patientItems)}
            </>
        );
    };

    render() {
        const doctorName = `${this.props.userInfo?.firstName || ""} ${this.props.userInfo?.lastName || ""}`.trim();

        return (
            <div className="doctor-dashboard-page">
                <div className="doctor-dashboard__header">
                    <div>
                        <h2>{this.getText("Dashboard bác sĩ", "Doctor Dashboard")}</h2>
                        <p>{doctorName || this.getText("Bác sĩ", "Doctor")}</p>
                    </div>
                    {this.renderRangeTabs()}
                </div>
                {this.state.errorMessage && this.state.dashboardData && (
                    <div className="doctor-dashboard__inline-error">{this.state.errorMessage}</div>
                )}
                {this.renderContent()}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
    userInfo: state.doctor?.doctorInfo,
});

export default connect(mapStateToProps)(DoctorDashboard);
