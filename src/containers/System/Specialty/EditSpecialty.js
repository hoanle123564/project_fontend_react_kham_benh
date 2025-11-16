import React, { Component } from 'react';
import { connect } from 'react-redux';
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import 'react-markdown-editor-lite/lib/index.css';
import { FormattedMessage } from 'react-intl';
import './EditSpecialty.scss';
import { EditSpecialtyId } from '../../../services/userService';
import { toast } from 'react-toastify';

// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */);
class EditSpecialty extends Component {

    constructor(props) {
        super(props)
        this.state = {
            specialtyId: null,
            previewImg: '',
            name: '',
            descriptionHTML: '',
            descriptionMarkdown: '',
            imageSpecialty: '',
        }
    }

    componentDidMount() {
        const item = this.props.location?.state?.clinicData;
        if (item) {
            const image = item.image || '';
            let previewImg = '';
            let imageSpecialty = '';

            if (image) {
                if (typeof image === 'string' && image.startsWith('data:')) {
                    previewImg = image;
                    const parts = image.split(',');
                    imageSpecialty = parts.length > 1 ? parts[1] : '';
                } else {
                    previewImg = `data:image/jpeg;base64,${image}`;
                    imageSpecialty = image;
                }
            }

            this.setState({
                specialtyId: item.id || null,
                previewImg,
                imageSpecialty,
                name: item.name || '',
                descriptionHTML: item.descriptionHTML || '',
                descriptionMarkdown: item.descriptionMarkdown || '',
            });
        }
    }

    handleSaveContent = async () => {
        const payload = {
            id: this.state.specialtyId,
            name: this.state.name,
            image: this.state.imageSpecialty,
            descriptionHTML: this.state.descriptionHTML,
            descriptionMarkdown: this.state.descriptionMarkdown,
        };

        try {
            const res = await EditSpecialtyId(payload);
            if (res && res.errCode === 0) {
                toast.success('Specialty updated successfully!');
                this.props.history.push('/system/manage-specialty');
            } else {
                toast.error(res?.message || 'Failed to update specialty.');
            }
        } catch (error) {
            console.error('EditSpecialtyId error', error);
            toast.error('An error occurred while saving.');
        }
    }

    handleEditorChange = ({ html, text }) => {
        this.setState({
            descriptionMarkdown: text,
            descriptionHTML: html,
        });
    };

    handleOnChangeImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                this.setState({
                    previewImg: objectUrl,
                    imageSpecialty: reader.result.split(",")[1],
                });
            };
            reader.readAsDataURL(file);
        }
    };

    handleOnchange = (event, id) => {
        const copyState = { ...this.state }
        copyState[id] = event.target.value;
        this.setState({
            ...copyState
        })
    }

    render() {
        return (
            <div className="manage-specialty-container">
                <h3 className="title-page">Quản lý chuyên khoa</h3>

                <div className="row align-items-center mb-4">
                    <div className="col-md-6">
                        <label className="form-label">Tên chuyên khoa</label>
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Nhập tên chuyên khoa..."
                            onChange={(event) => this.handleOnchange(event, 'name')}
                            value={this.state.name || ''}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Ảnh chuyên khoa</label>
                        <div className="d-flex align-items-center">
                            <div className="upload-btn-wrapper me-3">
                                <input
                                    type="file"
                                    id="specialtyImg"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) => this.handleOnChangeImage(e)}
                                />
                                <label htmlFor="specialtyImg" className="btn btn-outline-primary">
                                    <FormattedMessage id="user-manage.choose-image" defaultMessage="Chọn ảnh" />
                                    <i className="fa-solid fa-upload ms-2"></i>
                                </label>
                            </div>

                            {this.state.previewImg && (
                                <button
                                    type="button"
                                    className="btn btn-outline-danger me-3"
                                    onClick={() => this.setState({ previewImg: '', imageSpecialty: '' })}
                                >
                                    <FormattedMessage id="user-manage.remove-image" defaultMessage="Xóa ảnh" />
                                    <i className="fa-solid fa-xmark ms-2"></i>
                                </button>
                            )}

                            <div
                                className="preview-image-container"
                                onClick={() =>
                                    this.state.previewImg && this.setState({ isOpen: true })
                                }
                            >
                                {this.state.previewImg ? (
                                    <img
                                        src={this.state.previewImg}
                                        alt="preview"
                                        className="preview-image"
                                    />
                                ) : (
                                    <span className="text-muted">Chưa có ảnh</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* === Mô tả chuyên khoa === */}
                <MdEditor
                    style={{ height: '500px' }}
                    renderHTML={(text) => mdParser.render(text)}
                    value={this.state.descriptionMarkdown}
                    onChange={this.handleEditorChange}
                />
                <button
                    className="save-specialty"
                    onClick={this.handleSaveContent}
                >
                    <FormattedMessage id="admin.manage-doctor.save-info" />
                </button>
            </div>
        );
    }
}

export default connect(null, null)(EditSpecialty);