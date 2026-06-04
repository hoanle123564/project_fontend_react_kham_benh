import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import { Button } from 'reactstrap';
import { DeleteSpecialty } from '../../../services/userService';
import { toast } from 'react-toastify';
import 'react-markdown-editor-lite/lib/index.css';
import { FormattedMessage } from 'react-intl';
import * as action from "../../../store/actions";
import './ManageSpecialty.scss';

class ManageSpecialty extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ListSpecialty: [],
            specialtySearchQuery: '',
            isOpenPreview: false,
            previewImg: '',
            currentPage: 1,
            specialtiesPerPage: 10,
        }
    }

    componentDidMount() {
        this.props.getAllSpecialty();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.specialtys !== this.props.specialtys) {
            const nextSpecialties = this.props.specialtys || [];
            this.setState({
                ListSpecialty: nextSpecialties,
                currentPage: this.getClampedSpecialtyPage(nextSpecialties)
            });
            return;
        }

        if (prevState.specialtySearchQuery !== this.state.specialtySearchQuery) {
            const nextCurrentPage = this.getClampedSpecialtyPage();
            if (nextCurrentPage !== this.state.currentPage) {
                this.setState({ currentPage: nextCurrentPage });
            }
        }
    }

    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    }

    handleSpecialtySearchChange = (e) => {
        this.setState({
            specialtySearchQuery: e.target.value.trim().toLowerCase(),
            currentPage: 1
        });
    }

    getFilteredSpecialties = (specialties = this.state.ListSpecialty) => {
        const query = (this.state.specialtySearchQuery || '').trim().toLowerCase();
        if (!query) return specialties;

        return specialties.filter((specialty) =>
            (specialty.name || '').toLowerCase().includes(query)
        );
    }

    getPaginatedSpecialties = () => {
        const { currentPage, specialtiesPerPage } = this.state;
        const filteredSpecialties = this.getFilteredSpecialties();
        const indexOfLastSpecialty = currentPage * specialtiesPerPage;
        const indexOfFirstSpecialty = indexOfLastSpecialty - specialtiesPerPage;

        return filteredSpecialties.slice(indexOfFirstSpecialty, indexOfLastSpecialty);
    }

    getClampedSpecialtyPage = (specialties = this.state.ListSpecialty) => {
        const { currentPage, specialtiesPerPage } = this.state;
        const filteredSpecialties = this.getFilteredSpecialties(specialties);
        const totalPages = Math.ceil(filteredSpecialties.length / specialtiesPerPage);

        if (currentPage < 1) return 1;
        return currentPage > totalPages ? (totalPages > 0 ? totalPages : 1) : currentPage;
    }

    handleEdit = (item) => {
        this.props.history.push(`/system/edit-specialty/${item.id}`, { clinicData: item });
    }

    handleDelete = async (id) => {
        await DeleteSpecialty(id).then((res) => {
            if (res && res.errCode === 0) {
                toast.success('Specialty deleted successfully!');
                this.props.getAllSpecialty();
            } else {
                toast.error('Failed to delete specialty.');
            }
        });
    }

    openPreview = (img) => {
        this.setState({ isOpenPreview: true, previewImg: img });
    }

    closePreview = () => {
        this.setState({ isOpenPreview: false, previewImg: '' });
    }

    handleAdd = () => {
        this.props.history.push(`/system/add-specialty`);
    }

    render() {
        const { isOpenPreview, previewImg, currentPage, specialtiesPerPage } = this.state;
        const filteredSpecialties = this.getFilteredSpecialties();
        const currentSpecialties = this.getPaginatedSpecialties();
        const totalPages = Math.ceil(filteredSpecialties.length / specialtiesPerPage);

        return (
            <div className="manage-specialty-container">
                <div className="manage-specialty__inner">
                    <div className="manage-specialty__header">
                        <h3 className="manage-specialty__title">
                            <FormattedMessage id="manage-specialty.title" defaultMessage="Manage Specialties" />
                        </h3>

                        <Button color="primary" onClick={this.handleAdd} className="manage-specialty__add-button">
                            <i className="fa-solid fa-user-plus"></i>
                            <FormattedMessage id="manage-specialty.add" />
                        </Button>
                    </div>

                    <div className="manage-specialty__toolbar">
                        <FormattedMessage id="manage-specialty.search" defaultMessage="Search specialty by name...">
                            {(msg) => (
                                <div className="manage-specialty__search">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                    <input
                                        type="text"
                                        placeholder={msg}
                                        onChange={this.handleSpecialtySearchChange}
                                    />
                                </div>
                            )}
                        </FormattedMessage>

                        <div className="manage-specialty__total">
                            <FormattedMessage
                                id="manage-specialty.total"
                                defaultMessage="Total: {count} specialties"
                                values={{ count: filteredSpecialties.length }}
                            />
                        </div>
                    </div>

                    <div className="manage-specialty__table-card">
                        <div className="manage-specialty__table-scroll">
                            <table className="manage-specialty__table">
                                <thead>
                                    <tr>
                                        <th><FormattedMessage id="manage-specialty.id" defaultMessage="ID" /></th>
                                        <th><FormattedMessage id="manage-specialty.name" defaultMessage="Name" /></th>
                                        <th><FormattedMessage id="manage-specialty.image" defaultMessage="Image" /></th>
                                        <th><FormattedMessage id="manage-specialty.action" defaultMessage="Action" /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentSpecialties && currentSpecialties.length > 0 ? (
                                        currentSpecialties.map((c, index) => (
                                            <tr key={c.id}>
                                                <td>{index + 1}</td>
                                                <td className="manage-specialty__name">{c.name}</td>
                                                <td>
                                                    {c.image ? (
                                                        <img
                                                            className="manage-specialty__thumbnail"
                                                            src={c.image.startsWith('data:') ? c.image : `data:image/jpeg;base64,${c.image}`}
                                                            alt={c.name}
                                                            onClick={() => this.openPreview(c.image.startsWith('data:') ? c.image : `data:image/jpeg;base64,${c.image}`)}
                                                        />
                                                    ) : (
                                                        <span className="manage-specialty__muted">
                                                            <FormattedMessage id="manage-specialty.no-image" defaultMessage="No image" />
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="manage-specialty__actions">
                                                        <button className="manage-specialty__action-button manage-specialty__action-button--edit" onClick={() => this.handleEdit(c)}>
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button className="manage-specialty__action-button manage-specialty__action-button--delete" onClick={() => this.handleDelete(c.id)}>
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="manage-specialty__empty">
                                                <FormattedMessage id="manage-specialty.no-specialties" defaultMessage="No specialties found." />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <nav className="manage-specialty__pagination">
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
                        <div className="manage-specialty__preview-backdrop" onClick={this.closePreview}>
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
        specialtys: state.admin.specialty
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getAllSpecialty: () => dispatch(action.GetAllSpecialty()),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ManageSpecialty));
