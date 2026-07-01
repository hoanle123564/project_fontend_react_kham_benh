import React, { Component } from "react";

class DoctorQueueTable extends Component {
    renderRow = (item) => {
        const {
            selectedBookingId,
            startingBookingId,
            getText,
            getPatientName,
            getVisitStatusLabel,
            getPaymentStatusLabel,
            getAppointmentTypeLabel,
            getVideoStatusLabel,
            renderStatusBadge,
            canStartVisit,
            canCollectPayment,
            onSelectRow,
            onStartVisit,
            onOpenPaymentModal,
            onOpenVideoRoom,
        } = this.props;

        return (
            <tr
                key={item.bookingId}
                className={Number(selectedBookingId) === Number(item.bookingId) ? "selected" : ""}
                onClick={() => onSelectRow(item)}
            >
                <td>
                    <span className="doctor-queue__number">{item.queueNumber || "-"}</span>
                </td>
                <td>
                    <button
                        type="button"
                        className="doctor-queue__patient"
                        onClick={(event) => {
                            event.stopPropagation();
                            onSelectRow(item);
                        }}
                    >
                        {getPatientName(item)}
                    </button>
                    <small>{item.medicalCode || "-"}</small>
                </td>
                <td>
                    {item.timeTypeVi || item.timeTypeEn || item.timeType || "-"}
                    <span className={`doctor-queue__type-badge ${item.appointmentTypeId || "AT1"}`}>
                        {getAppointmentTypeLabel(item)}
                    </span>
                </td>
                <td>{item.patientPhoneNumber || "-"}</td>
                <td>{item.reason || "-"}</td>
                <td>{getVideoStatusLabel(item)}</td>
                <td>{renderStatusBadge("visit", getVisitStatusLabel(item), item.visitStatusId)}</td>
                <td>{renderStatusBadge("payment", getPaymentStatusLabel(item), item.paymentStatusId)}</td>
                <td>
                    <div className="doctor-queue__actions">
                        <button
                            type="button"
                            className="doctor-queue__start"
                            disabled={
                                !canStartVisit(item) ||
                                Number(startingBookingId) === Number(item.bookingId)
                            }
                            onClick={(event) => {
                                event.stopPropagation();
                                onStartVisit(item);
                            }}
                        >
                            <i className="bi bi-play-fill" />
                            {Number(startingBookingId) === Number(item.bookingId)
                                ? `${getText("loading")}...`
                                : getText("start")}
                        </button>
                        <button
                            type="button"
                            className="doctor-queue__icon-button"
                            disabled={!canCollectPayment(item)}
                            title={getText("collectPayment")}
                            onClick={(event) => {
                                event.stopPropagation();
                                onOpenPaymentModal(item);
                            }}
                        >
                            <i className="bi bi-cash-coin" />
                        </button>
                        {item.appointmentTypeId === "AT2" && (
                            <button
                                type="button"
                                className="doctor-queue__icon-button doctor-queue__video-icon"
                                disabled={!item.canJoinVideo}
                                title={getText("openVideo", "Open video")}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onOpenVideoRoom(item);
                                }}
                            >
                                <i className="bi bi-camera-video" />
                            </button>
                        )}
                        <button
                            type="button"
                            className="doctor-queue__icon-button"
                            title={getText("detail")}
                            onClick={(event) => {
                                event.stopPropagation();
                                onSelectRow(item);
                            }}
                        >
                            <i className="bi bi-eye" />
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    render() {
        const { queue, isLoading, getText } = this.props;

        return (
            <div className="doctor-queue__table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>{getText("queueNumber")}</th>
                            <th>{getText("patient")}</th>
                            <th>{getText("time")}</th>
                            <th>{getText("phone")}</th>
                            <th>{getText("reason")}</th>
                            <th>{getText("videoStatus", "Video")}</th>
                            <th>{getText("status")}</th>
                            <th>{getText("paymentStatus")}</th>
                            <th>{getText("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {queue.length > 0 ? (
                            queue.map(this.renderRow)
                        ) : (
                            <tr>
                                <td colSpan="9" className="doctor-queue__empty">
                                    {isLoading ? `${getText("loading")}...` : getText("noQueue")}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default DoctorQueueTable;
