// ...existing code...
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
            isOpenPreview: false,
            previewImg: ''
        }
    }

    componentDidMount() {
        this.props.getAllClinic();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.clinics !== this.props.clinics) {
            this.setState({
                ListClinic: this.props.clinics
            })
        }
    }

    handleEdit = (clinic) => {
        // TODO: mở modal chỉnh sửa (nếu có). Hiện tại chỉ log.
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
        const { ListClinic, isOpenPreview, previewImg } = this.state;

        return (
            <div className="manage-clinic-container container mt-4">
                <h3 className="title-page mb-3">
                    <FormattedMessage id="manage-clinic.title" defaultMessage="Manage Clinics" />
                </h3>

                <Button color="primary" onClick={this.handleAddClinic} className="mb-3">
                    <i className="fa-solid fa-user-plus me-2"></i>
                    <FormattedMessage id="manage-clinic.add" />
                </Button>

                <div className="table-responsive shadow-sm ">
                    <table className="table table-hover align-middle table-bordered">
                        <thead className="table-primary">
                            <tr>
                                <th><FormattedMessage id="clinic-manage.id" defaultMessage="ID" /></th>
                                <th><FormattedMessage id="clinic-manage.name" defaultMessage="Name" /></th>
                                <th><FormattedMessage id="clinic-manage.image" defaultMessage="Image" /></th>
                                <th><FormattedMessage id="clinic-manage.action" defaultMessage="Action" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {ListClinic && ListClinic.length > 0 ? (
                                ListClinic.map((c) => (
                                    <tr key={c.id}>
                                        <td>{c.id}</td>
                                        <td className='name'>{c.name}</td>
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
                                                    <FormattedMessage id="clinic-manage.no-image" defaultMessage="No image" />
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
                                        <FormattedMessage id="clinic-manage.no-clinics" defaultMessage="No clinics found." />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Simple image preview modal (native) */}
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
        clinics: state.admin.AllClinic
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getAllClinic: () => dispatch(action.GetAllClinic()),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ManageClinic));