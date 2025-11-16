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
            isOpenPreview: false,
            previewImg: ''
        }
    }

    componentDidMount() {
        this.props.getAllSpecialty();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.specialtys !== this.props.specialtys) {
            this.setState({
                ListSpecialty: this.props.specialtys
            })
        }
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
        const { ListSpecialty, isOpenPreview, previewImg } = this.state;

        return (
            <div className="manage-specialty-container container mt-4">
                <h3 className="title-page mb-3">
                    <FormattedMessage id="specialty-manage.title" defaultMessage="Manage Specialties" />
                </h3>

                <Button color="primary" onClick={this.handleAdd} className="mb-3">
                    <i className="fa-solid fa-user-plus me-2"></i>
                    <FormattedMessage id="user-manage.add" />
                </Button>

                <div className="table-responsive shadow-sm">
                    <table className="table table-hover align-middle table-bordered">
                        <thead className="table-primary">
                            <tr>
                                <th><FormattedMessage id="specialty-manage.id" defaultMessage="ID" /></th>
                                <th><FormattedMessage id="specialty-manage.name" defaultMessage="Name" /></th>
                                <th><FormattedMessage id="specialty-manage.image" defaultMessage="Image" /></th>
                                <th><FormattedMessage id="specialty-manage.action" defaultMessage="Action" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {ListSpecialty && ListSpecialty.length > 0 ? (
                                ListSpecialty.map((c) => (
                                    <tr key={c.id}>
                                        <td>{c.id}</td>
                                        <td>{c.name}</td>
                                        <td>
                                            {c.image ? (
                                                <img
                                                    src={c.image.startsWith('data:') ? c.image : `data:image/jpeg;base64,${c.image}`}
                                                    alt={c.name}
                                                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }}
                                                    onClick={() => this.openPreview(c.image.startsWith('data:') ? c.image : `data:image/jpeg;base64,${c.image}`)}
                                                />
                                            ) : (
                                                <span className="text-muted">
                                                    <FormattedMessage id="specialty-manage.no-image" defaultMessage="No image" />
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-2">
                                                <button className="btn btn-md btn-warning" onClick={() => this.handleEdit(c)}>
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button className="btn btn-md btn-danger" onClick={() => this.handleDelete(c.id)}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-4 text-muted">
                                        <FormattedMessage id="specialty-manage.no-specialties" defaultMessage="No specialties found." />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {isOpenPreview && (
                    <div className="preview-backdrop" onClick={this.closePreview} style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                    }}>
                        <img src={previewImg} alt="preview" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 8 }} />
                    </div>
                )}
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