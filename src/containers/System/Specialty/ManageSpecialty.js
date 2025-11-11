import React, { Component } from 'react';
// import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import 'react-markdown-editor-lite/lib/index.css';
import { FormattedMessage } from 'react-intl';
import './ManageSpecialty.scss';
import * as action from "../../../store/actions";

// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */);
class ManageSpecialty extends Component {

    constructor(props) {
        super(props)
        this.state = {
            previewImg: '',
            name: '',
            descriptionHTML: '',
            contentMarkdown: '',
            imageSpecialty: '',
        }
    }

    componentDidMount() {

    }
    handleSaveContent = async () => {
        console.log('check state', this.state);
        let res = await this.props.SaveSpecialty({
            name: this.state.name,
            image: this.state.imageSpecialty,
            descriptionHTML: this.state.descriptionHTML,
            contentMarkdown: this.state.contentMarkdown,
        })
        console.log('check res', res);
        if (res && res.errCode === 0) {
            this.setState({
                previewImg: '',
                name: '',
                descriptionHTML: '',
                contentMarkdown: '',
                imageSpecialty: '',
            })
        }

    }
    // Edit Markdown
    handleEditorChange = ({ html, text }) => {
        this.setState({
            contentMarkdown: text,
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

                {/* --- Form input hàng đầu --- */}
                <div className="row align-items-center mb-4">
                    {/* === Tên chuyên khoa === */}
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

                    {/* === Ảnh chuyên khoa === */}
                    <div className="col-md-6">
                        <label className="form-label">Ảnh chuyên khoa</label>
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
                                    onClick={() => this.setState({ previewImg: '', imageSpecialty: '' })}
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
                                    <span className="text-muted">Chưa có ảnh</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Markdown Editor --- */}
                <MdEditor
                    style={{ height: '500px' }}
                    renderHTML={(text) => mdParser.render(text)}
                    value={this.state.contentMarkdown}
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

const mapStateToProps = state => {
    return {
    };
};

const mapDispatchToProps = dispatch => {
    return {
        SaveSpecialty: (data) => dispatch(action.SaveSpecialty(data)),

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageSpecialty);
