import React, { Component } from 'react';
import { connect } from 'react-redux';

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FormattedMessage } from 'react-intl';
import './EditClinic.scss';
import { EditClinicId } from '../../../services/userService';
import { toast } from 'react-toastify';

const editorModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link", "image"],
    ["clean"],
  ],
};

const editorFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "blockquote",
  "code-block",
  "link",
  "image",
];

class EditClinic extends Component {

    constructor(props) {
        super(props)
        this.state = {
            clinicId: null,
            previewImg: '',
            name: '',
            address: '',
            descriptionHTML: '',
            descriptionMarkdown: '',
            imageClinic: '',
        }
    }

    componentDidMount() {
        // Nếu route truyền clinicData => điền tự động
        const clinicData = this.props.location?.state?.clinicData;
        if (clinicData) {
            const image = clinicData.image || '';
            let previewImg = '';
            let imageClinic = '';

            if (image) {
                // nếu là data URL giữ nguyên preview, lấy phần base64 cho imageClinic
                if (typeof image === 'string' && image.startsWith('data:')) {
                    previewImg = image;
                    const parts = image.split(',');
                    imageClinic = parts.length > 1 ? parts[1] : '';
                } else {
                    // nếu backend chỉ trả base64 (no data prefix)
                    previewImg = `data:image/jpeg;base64,${image}`;
                    imageClinic = image;
                }
            }

            this.setState({
                clinicId: clinicData.id || null,
                previewImg,
                imageClinic,
                name: clinicData.name || '',
                address: clinicData.address || '',
                descriptionHTML: clinicData.descriptionHTML || '',
                descriptionMarkdown: clinicData.descriptionMarkdown || '',
            });
        }
    }

    handleSaveContent = async () => {
        const payload = {
            id: this.state.clinicId,
            name: this.state.name,
            image: this.state.imageClinic,
            address: this.state.address,
            descriptionHTML: this.state.descriptionHTML,
            descriptionMarkdown: this.state.descriptionMarkdown,
        };

        try {
            const res = await EditClinicId(payload);
            if (res && res.errCode === 0) {
                toast.success('Clinic updated successfully!');
                // redirect trở về danh sách clinic
                this.props.history.push('/system/manage-clinic');
            } else {
                toast.error(res?.message || 'Failed to update clinic.');
            }
        } catch (error) {
            console.error('EditClinicId error', error);
            toast.error('An error occurred while saving.');
        }
    }
    // Edit HTML
    handleEditorChange = (value) => {
        this.setState({
            descriptionMarkdown: value,
            descriptionHTML: value,
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
                    imageClinic: reader.result.split(",")[1],
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
            <div className="manage-specialty-container ">
                <div className="container">
                    <h3 className="title-page">
                        <FormattedMessage id="manage-clinic.title" />
                    </h3>

                    {/* --- Form input hàng đầu --- */}
                    <div className="row align-items-center mb-4">
                        {/* === Tên phòng khám === */}
                        <div className="col-lg-6">
                            <label className="form-label">
                                <FormattedMessage id="manage-clinic.name-clinic" />
                            </label>
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Nhập tên phòng khám..."
                                onChange={(event) => this.handleOnchange(event, 'name')}
                                value={this.state.name || ''}
                            />
                        </div>

                        {/* === Ảnh phòng khám === */}
                        <div className="col-lg-6">
                            <h6 className="form-label">
                                <FormattedMessage id="manage-clinic.image-clinic" />
                            </h6>
                            <div className="d-flex align-items-center">
                                {/* Nút chọn ảnh */}
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

                                {/* Nút xóa ảnh */}
                                {this.state.previewImg && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger me-3"
                                        onClick={() => this.setState({ previewImg: '', imageClinic: '' })}
                                    >
                                        <FormattedMessage id="user-manage.remove-image" defaultMessage="Xóa ảnh" />
                                        <i className="fa-solid fa-xmark ms-2"></i>
                                    </button>
                                )}

                                {/* Khu vực xem trước ảnh */}
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
                                        <span className="text-muted">
                                            <FormattedMessage id="user-manage.no-image" defaultMessage="Chưa có ảnh" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row align-items-center mb-4">
                        {/* Địa chỉ phòng khám */}
                        <div className="col-md-6">
                            <label className="form-label">
                                <FormattedMessage id="manage-clinic.address-clinic" />
                            </label>
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Nhập địa chỉ phòng khám..."
                                onChange={(event) => this.handleOnchange(event, 'address')}
                                value={this.state.address || ''}
                            />
                        </div>
                    </div>
                    {/* --- React Quill Editor --- */}
                    <div className="manage-specialty-editor mb-4">
                        <ReactQuill
                            theme="snow"
                            value={this.state.descriptionHTML}
                            onChange={this.handleEditorChange}
                            modules={editorModules}
                            formats={editorFormats}
                            placeholder="Nhập mô tả phòng khám..."
                        />
                    </div>
                    <button
                        className="save-specialty"
                        onClick={this.handleSaveContent}
                    >
                        <FormattedMessage id="admin.manage-doctor.save-info" />
                    </button>
                </div>
            </div>
        );
    }


}

const mapStateToProps = state => {
    return {
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditClinic);