import React, { Component } from "react";
import { connect } from "react-redux";
import "./ListAppointment.scss";
import moment from "moment";
import { getAppointmentDoctor } from "../../services/userService";

class ListAppointment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ListAppointment: [],
        };
    }

    async componentDidMount() {
        if (this.props.userInfo?.id) {
            let response = await getAppointmentDoctor(this.props.userInfo.id);
            this.setState({ ListAppointment: response.data || [] });
        }
    }

    // Mapping status
    renderStatus = (statusId) => {
        const statusMap = {
            S1: "Chờ xác nhận",
            S2: "Đã xác nhận",
            S3: "Đã khám",
            S4: "Đã hủy"
        };
        return statusMap[statusId] || "Không xác định";
    };

    render() {
        const { ListAppointment } = this.state;

        return (
            <div className="list-appointment-container">
                <div className="title">Lịch sử cuộc hẹn</div>

                <table className="appointment-table">
                    <thead>
                        <tr>
                            <th>Họ tên bệnh nhân</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Ngày khám</th>
                            <th>Khung giờ</th>
                            <th>Triệu chứng</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>

                    <tbody>
                        {ListAppointment && ListAppointment.length > 0 ? (
                            ListAppointment.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.firstName} {item.lastName}</td>
                                    <td>{item.email}</td>
                                    <td>{item.phoneNumber}</td>
                                    <td>
                                        {moment(item.date).format("DD/MM/YYYY")}
                                    </td>
                                    <td>{item.timeTypeVi}</td>
                                    <td>{item.reason}</td>
                                    <td>
                                        <span className={`status ${item.statusId}`}>
                                            {this.renderStatus(item.statusId)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                                    Không có lịch hẹn nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    userInfo: state.doctor?.doctorInfo || state.user?.userInfo,
});

export default connect(mapStateToProps)(ListAppointment);
