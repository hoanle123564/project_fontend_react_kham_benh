import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { toast } from "react-toastify";
import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import PatientSidebar from "../../Layout/PatientSidebar";
import { createPatientRefund, getPatientRefunds } from "../../../../services/userService";
import "./PatientRefunds.scss";

const EMPTY_FORM = {
    bookingId: "",
    bankBin: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
    reason: "",
};

class PatientRefunds extends Component {
    state = {
        form: { ...EMPTY_FORM },
        refunds: [],
        loading: true,
        submitting: false,
        errorMessage: "",
    };

    componentDidMount() {
        const query = new URLSearchParams(this.props.location?.search || "");
        const bookingId = query.get("bookingId") || "";
        this.setState((state) => ({ form: { ...state.form, bookingId } }));
        this.loadRefunds();
    }

    getText = (key, defaultMessage = key, values) => this.props.intl.formatMessage({
        id: `patient.refunds.${key}`,
        defaultMessage,
    }, values);

    getErrorMessage = (error, fallback) => error?.response?.data?.errMessage || error?.message || fallback;

    loadRefunds = async () => {
        this.setState({ loading: true, errorMessage: "" });
        try {
            const response = await getPatientRefunds();
            if (response?.errCode !== 0) throw new Error(response?.errMessage);
            this.setState({ refunds: response.data || [], loading: false });
        } catch (error) {
            this.setState({ loading: false, errorMessage: this.getErrorMessage(error, this.getText("loadError")) });
        }
    };

    handleChange = (event) => {
        const { name, value } = event.target;
        this.setState((state) => ({ form: { ...state.form, [name]: value }, errorMessage: "" }));
    };

    handleSubmit = async (event) => {
        event.preventDefault();
        if (this.state.submitting) return;
        this.setState({ submitting: true, errorMessage: "" });
        const payload = { ...this.state.form };
        if (!payload.reason.trim()) delete payload.reason;
        try {
            const response = await createPatientRefund(payload);
            if (response?.errCode !== 0) throw new Error(response?.errMessage);
            toast.success(this.getText("created"));
            this.setState({ form: { ...EMPTY_FORM, bookingId: this.state.form.bookingId }, submitting: false });
            await this.loadRefunds();
        } catch (error) {
            this.setState({ submitting: false, errorMessage: this.getErrorMessage(error, this.getText("submitError")) });
        }
    };

    getStatusLabel = (statusId) => {
        const key = {
            RFS1: "pending",
            RFS2: "processing",
            RFS3: "completed",
            RFS4: "failed",
            RFS5: "approved",
            RFS6: "rejected",
        }[statusId];
        return key ? this.getText(`status.${key}`) : this.getText("status.unknown");
    };

    formatAmount = (amount) => `${Number(amount || 0).toLocaleString("vi-VN")} VND`;

    formatDate = (value) => value ? new Date(value).toLocaleString() : this.getText("notAvailable");

    renderField = (name, labelKey, options = {}) => (
        <label className="patient-refunds__field" htmlFor={`refund-${name}`}>
            <span>{this.getText(labelKey)}</span>
            <input
                id={`refund-${name}`}
                name={name}
                value={this.state.form[name]}
                onChange={this.handleChange}
                maxLength={options.maxLength}
                pattern={options.pattern}
                required={options.required !== false}
                inputMode={options.inputMode}
            />
        </label>
    );

    render() {
        const { form, refunds, loading, submitting, errorMessage } = this.state;
        return (
            <>
                <HomeHeader showBanner={false} />
                <div className="patient-dashboard-layout patient-refunds-page">
                    <div className="container d-flex flex-start gap-3">
                        <PatientSidebar />
                        <main className="patient-page-content patient-refunds">
                            <h2>{this.getText("title")}</h2>
                            <p className="patient-refunds__intro">{this.getText("intro")}</p>
                            <form className="patient-refunds__form" onSubmit={this.handleSubmit}>
                                {this.renderField("bookingId", "bookingId", { inputMode: "numeric" })}
                                {this.renderField("bankBin", "bankBin", { maxLength: 10, pattern: "[0-9]{6,10}", inputMode: "numeric" })}
                                {this.renderField("bankName", "bankName", { maxLength: 100 })}
                                {this.renderField("bankAccountNumber", "bankAccountNumber", { maxLength: 64, inputMode: "numeric" })}
                                {this.renderField("bankAccountName", "bankAccountName", { maxLength: 120 })}
                                <label className="patient-refunds__field patient-refunds__field--wide" htmlFor="refund-reason">
                                    <span>{this.getText("reason")}</span>
                                    <textarea id="refund-reason" name="reason" value={form.reason} onChange={this.handleChange} maxLength={500} rows="3" />
                                </label>
                                {errorMessage && <div className="patient-refunds__error">{errorMessage}</div>}
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? this.getText("submitting") : this.getText("submit")}
                                </button>
                            </form>

                            <section className="patient-refunds__history">
                                <h3>{this.getText("history")}</h3>
                                {loading ? <p>{this.getText("loading")}</p> : refunds.length === 0 ? <p>{this.getText("empty")}</p> : (
                                    <div className="table-responsive">
                                        <table className="table">
                                            <thead><tr><th>{this.getText("bookingId")}</th><th>{this.getText("amount")}</th><th>{this.getText("account")}</th><th>{this.getText("status.label")}</th><th>{this.getText("requestedAt")}</th></tr></thead>
                                            <tbody>{refunds.map((refund) => <tr key={refund.id}>
                                                <td>{refund.bookingId}</td>
                                                <td>{this.formatAmount(refund.amount)}</td>
                                                <td>{[refund.receiverBank, refund.receiverBankBin, refund.receiverAccountNumber].filter(Boolean).join(" - ") || this.getText("notAvailable")}</td>
                                                <td>{this.getStatusLabel(refund.statusId)}</td>
                                                <td>{this.formatDate(refund.requestedAt)}</td>
                                            </tr>)}</tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        </main>
                    </div>
                </div>
                <HomeFooter />
            </>
        );
    }
}

export default injectIntl(PatientRefunds);
