import React, { Component } from 'react';
import { connect } from 'react-redux';

import 'react-markdown-editor-lite/lib/index.css';
import { FormattedMessage } from 'react-intl';
import './ManageClinic.scss';
import * as action from "../../../store/actions";
import { withRouter } from "react-router";
import { Button } from 'reactstrap';
import { DeleteClinic } from '../../../services/userService';
import { toast } from 'react-toastify';

class ManageClinic extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ListClinic: [],
            clinicSearchQuery: '',
            isOpenPreview: false,
            previewImg: '',
            currentPage: 1,
            clinicsPerPage: 10,
        }
    }

    componentDidMount() {
        this.props.getAllClinic();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.clinics !== this.props.clinics) {
            const nextClinics = this.props.clinics || [];
            this.setState({
                ListClinic: nextClinics,
                currentPage: this.getClampedClinicPage(nextClinics)
            });
            return;
        }

        if (prevState.clinicSearchQuery !== this.state.clinicSearchQuery) {
            const nextCurrentPage = this.getClampedClinicPage();
            if (nextCurrentPage !== this.state.currentPage) {
                this.setState({ currentPage: nextCurrentPage });
            }
        }
    }

    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    }

    handleClinicSearchChange = (e) => {
        this.setState({
            clinicSearchQuery: e.target.value.trim().toLowerCase(),
            currentPage: 1
        });
    }

    getFilteredClinics = (clinics = this.state.ListClinic) => {
        const query = (this.state.clinicSearchQuery || '').trim().toLowerCase();
        if (!query) return clinics;

        return clinics.filter((clinic) =>
            (clinic.name || '').toLowerCase().includes(query)
        );
    }

    getPaginatedClinics = () => {
        const { currentPage, clinicsPerPage } = this.state;
        const filteredClinics = this.getFilteredClinics();
        const indexOfLastClinic = currentPage * clinicsPerPage;
        const indexOfFirstClinic = indexOfLastClinic - clinicsPerPage;

        return filteredClinics.slice(indexOfFirstClinic, indexOfLastClinic);
    }

    getClampedClinicPage = (clinics = this.state.ListClinic) => {
        const { currentPage, clinicsPerPage } = this.state;
        const filteredClinics = this.getFilteredClinics(clinics);
        const totalPages = Math.ceil(filteredClinics.length / clinicsPerPage);

        if (currentPage < 1) return 1;
        return currentPage > totalPages ? (totalPages > 0 ? totalPages : 1) : currentPage;
    }

    handleEdit = (clinic) => {
        this.props.history.push(`/system/edit-clinic/${clinic.id}`, { clinicData: clinic });
    }

    handleDelete = async (id) => {
        await DeleteClinic(id).then((res) => {
            if (res && res.errCode === 0) {
                toast.success('Clinic deleted successfully!');
                this.props.getAllClinic();
            } else {
                toast.error('Failed to delete clinic.');
            }
        });
    }

    openPreview = (img) => {
        this.setState({ isOpenPreview: true, previewImg: img });
    }

    closePreview = () => {
        this.setState({ isOpenPreview: false, previewImg: '' });
    }

    handleAddClinic = () => {
        this.props.history.push(`/system/add-clinic`);
    }

    render() {
        const { isOpenPreview, previewImg, currentPage, clinicsPerPage } = this.state;
        const filteredClinics = this.getFilteredClinics();
        const currentClinics = this.getPaginatedClinics();
        const totalPages = Math.ceil(filteredClinics.length / clinicsPerPage);

        return (
            <div className="manage-clinic-container">
                <div className="manage-clinic__inner">
                    <div className="manage-clinic__header">
                        <h3 className="manage-clinic__title">
                            <FormattedMessage id="manage-clinic.title" defaultMessage="Manage Clinics" />
                        </h3>

                        <Button color="primary" onClick={this.handleAddClinic} className="manage-clinic__add-button">
                            <i className="fa-solid fa-user-plus"></i>
                            <FormattedMessage id="manage-clinic.add" />
                        </Button>
                    </div>

                    <div className="manage-clinic__toolbar">
                        <FormattedMessage id="clinic-manage.search" defaultMessage="Search clinic by name...">
                            {(msg) => (
                                <div className="manage-clinic__search">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                    <input
                                        type="text"
                                        placeholder={msg}
                                        onChange={this.handleClinicSearchChange}
                                    />
                                </div>
                            )}
                        </FormattedMessage>

                        <div className="manage-clinic__total">
                            <FormattedMessage
                                id="clinic-manage.total"
                                defaultMessage="Total: {count} clinics"
                                values={{ count: filteredClinics.length }}
                            />
                        </div>
                    </div>

                    <div className="manage-clinic__table-card">
                        <div className="manage-clinic__table-scroll">
                            <table className="manage-clinic__table">
                                <thead>
                                    <tr>
                                        <th><FormattedMessage id="clinic-manage.id" defaultMessage="ID" /></th>
                                        <th><FormattedMessage id="clinic-manage.name" defaultMessage="Name" /></th>
                                        <th><FormattedMessage id="clinic-manage.image" defaultMessage="Image" /></th>
                                        <th><FormattedMessage id="clinic-manage.action" defaultMessage="Action" /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentClinics && currentClinics.length > 0 ? (
                                        currentClinics.map((c, index) => (
                                            <tr key={c.id}>
                                                <td>{index + 1}</td>
                                                <td className="manage-clinic__name">{c.name}</td>
                                                <td>
                                                    {c.image ? (
                                                        <img
                                                            className="manage-clinic__thumbnail"
                                                            src={c.image.startsWith('data:') ? c.image : `data:image/jpeg;base64,${c.image}`}
                                                            alt={c.name}
                                                            onClick={() => this.openPreview(c.image.startsWith('data:') ? c.image : `data:image/jpeg;base64,${c.image}`)}
                                                        />
                                                    ) : (
                                                        <span className="manage-clinic__muted">
                                                            <FormattedMessage id="clinic-manage.no-image" defaultMessage="No image" />
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="manage-clinic__actions">
                                                        <button className="manage-clinic__action-button manage-clinic__action-button--edit" onClick={() => this.handleEdit(c)}>
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button className="manage-clinic__action-button manage-clinic__action-button--delete" onClick={() => this.handleDelete(c.id)}>
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="manage-clinic__empty">
                                                <FormattedMessage id="clinic-manage.no-clinics" defaultMessage="No clinics found." />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <nav className="manage-clinic__pagination">
                            <ul>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <li
                                        key={i}
                                        className={currentPage === i + 1 ? 'active' : ''}
                                    >
                                        <button
                                            onClick={() => this.handlePageChange(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}

                    {isOpenPreview && (
                        <div className="manage-clinic__preview-backdrop" onClick={this.closePreview}>
                            <img src={previewImg} alt="preview" />
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        clinics: state.admin.AllClinic
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getAllClinic: () => dispatch(action.GetAllClinic()),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ManageClinic));
