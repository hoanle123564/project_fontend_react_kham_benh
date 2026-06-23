import React, { Component } from "react";

const VISIT_STATUS_TABS = ["VS1", "VS2", "VS3"];

class DoctorQueueSidePanel extends Component {
    getStatusLabel = (statusId) => {
        const { getText } = this.props;

        switch (statusId) {
            case "VS2":
                return getText("inProgress");
            case "VS3":
                return getText("completed");
            default:
                return getText("waiting");
        }
    };

    renderStatusTabs = () => {
        const { queue, activeStatusTab, onStatusTabChange } = this.props;

        return (
            <div className="doctor-queue__status-tabs">
                {VISIT_STATUS_TABS.map((statusId) => {
                    const count = queue.filter((item) => item.visitStatusId === statusId).length;
                    return (
                        <button
                            type="button"
                            key={statusId}
                            className={activeStatusTab === statusId ? "active" : ""}
                            onClick={() => onStatusTabChange(statusId)}
                        >
                            <span>{this.getStatusLabel(statusId)}</span>
                            <strong>{count}</strong>
                        </button>
                    );
                })}
            </div>
        );
    };

    renderQueueList = () => {
        const {
            queue,
            selectedBookingId,
            activeStatusTab,
            isLoading,
            getText,
            getPatientName,
            onSelectRow,
        } = this.props;
        const visibleItems = queue.filter((item) => item.visitStatusId === activeStatusTab);

        return (
            <div className="doctor-queue__side-list">
                {visibleItems.length > 0 ? (
                    visibleItems.map((item) => (
                        <button
                            type="button"
                            key={item.bookingId}
                            className={Number(item.bookingId) === Number(selectedBookingId) ? "active" : ""}
                            onClick={() => onSelectRow(item)}
                        >
                            <span>#{item.queueNumber || "-"}</span>
                            <div className="doctor-queue__side-patient">
                                <strong>{getPatientName(item)}</strong>
                                <small>{item.patientPhoneNumber || "-"}</small>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="doctor-queue__side-empty">
                        {isLoading ? `${getText("loading")}...` : getText("noQueue")}
                    </div>
                )}
            </div>
        );
    };

    render() {
        const { appointmentDate, getText, formatDate } = this.props;

        return (
            <aside className="doctor-queue__side-panel">
                <div className="doctor-queue__side-header">
                    <span>{formatDate(appointmentDate)}</span>
                    <strong>{getText("queueNumber")}</strong>
                </div>
                {this.renderStatusTabs()}
                {this.renderQueueList()}
            </aside>
        );
    }
}

export default DoctorQueueSidePanel;
