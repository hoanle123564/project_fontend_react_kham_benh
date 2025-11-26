import React, { Component } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { connect } from "react-redux";
import _ from "lodash";
import user_default from "../../../../assets/user_default_1.png";
import "./EditModal.scss";

class EditModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            email: "",
            firstName: "",
            lastName: "",
            phoneNumber: "",
            address: "",
            gender: "",
            avatar: "",
            previewImg: "",
            errors: {}
        };
    }

    componentDidMount() {
        const user = this.props.currentUser;
        if (user && !_.isEmpty(user)) {
            this.setState({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                address: user.address,
                gender: user.gender,
                previewImg: user.image
                    ? `data:image/jpeg;base64,${user.image}`
                    : user_default,
                avatar: user.image || ""
            });
        }
    }

    toggle = () => {
        this.props.toggle();
    };

    handleChange = (e, field) => {
        const value = e.target.value;

        this.setState(prev => ({
            ...prev,
            [field]: value,
            errors: { ...prev.errors, [field]: "" }
        }));
    };

    handleOnChangeImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                this.setState({
                    previewImg: objectUrl,
                    avatar: reader.result.split(",")[1],
                });
            };
            reader.readAsDataURL(file);
        }
    };

    // Nút xoá ảnh
    clearImage = () => {
        this.setState({
            avatar: "",
            previewImg: user_default
        });
    };

    handleImageChange = (e) => {
        let file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            const reader = new FileReader();

            reader.onloadend = () => {
                this.setState({
                    previewImg: previewUrl,
                    avatar: reader.result.split(",")[1],
                });
            };
            reader.readAsDataURL(file);
        }
    };


    validate = () => {
        let { firstName, lastName, phoneNumber, address, gender } = this.state;
        let errors = {};
        const isVi = this.props.language === 'vi';

        if (!firstName) errors.firstName = isVi ? "Vui lòng nhập tên!" : "Please enter first name!";
        if (!lastName) errors.lastName = isVi ? "Vui lòng nhập họ!" : "Please enter last name!";

        if (!phoneNumber) errors.phoneNumber = isVi ? "Vui lòng nhập số điện thoại!" : "Please enter phone number!";
        else if (!/^[0-9]{9,11}$/.test(phoneNumber))
            errors.phoneNumber = isVi ? "Số điện thoại không hợp lệ!" : "Invalid phone number!";

        if (!address) errors.address = isVi ? "Vui lòng nhập địa chỉ!" : "Please enter address!";
        if (!gender) errors.gender = isVi ? "Vui lòng chọn giới tính!" : "Please select gender!";

        this.setState({ errors });

        return Object.keys(errors).length === 0;
    };

    handleSave = () => {
        if (!this.validate()) return;
        let data = {
            id: this.state.id,
            email: this.state.email,
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            phoneNumber: this.state.phoneNumber,
            address: this.state.address,
            gender: this.state.gender,
            image: this.state.avatar,
            roleId: "R3" // bệnh nhân
        };
        this.props.onSave(data);
    };

    render() {
        const { errors } = this.state;
        const isDefaultImage = this.state.previewImg === user_default;

        return (
            <Modal isOpen={this.props.isOpen} toggle={this.toggle} size="lg" centered>
                <ModalHeader toggle={this.toggle}>
                    <i className="fa-solid fa-user-pen me-2"></i>
                    {this.props.language === 'vi' ? 'Chỉnh sửa thông tin bệnh nhân' : 'Edit patient information'}
                </ModalHeader>

                <ModalBody>
                    {/* Email */}
                    <div className="row mb-3">
                        <div className="col-md-12">
                            <label>{this.props.language === 'vi' ? 'Email' : 'Email'}</label>
                            <input
                                className="form-control"
                                value={this.state.email}
                                disabled
                            />
                        </div>
                    </div>

                    {/* Họ và tên */}
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label>{this.props.language === 'vi' ? 'Họ' : 'Last name'}</label>
                            <input
                                className={`form-control ${errors.lastName ? "input-error" : ""}`}
                                value={this.state.lastName}
                                onChange={(e) => this.handleChange(e, "lastName")}
                            />
                            {errors.lastName && <div className="error-text">{errors.lastName}</div>}
                        </div>

                        <div className="col-md-6">
                            <label>{this.props.language === 'vi' ? 'Tên' : 'First name'}</label>
                            <input
                                className={`form-control ${errors.firstName ? "input-error" : ""}`}
                                value={this.state.firstName}
                                onChange={(e) => this.handleChange(e, "firstName")}
                            />
                            {errors.firstName && <div className="error-text">{errors.firstName}</div>}
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label>{this.props.language === 'vi' ? 'Số điện thoại' : 'Phone number'}</label>
                            <input
                                className={`form-control ${errors.phoneNumber ? "input-error" : ""}`}
                                value={this.state.phoneNumber}
                                onChange={(e) => this.handleChange(e, "phoneNumber")}
                            />
                            {errors.phoneNumber && (
                                <div className="error-text">{errors.phoneNumber}</div>
                            )}
                        </div>

                        <div className="col-md-6">
                            <label>{this.props.language === 'vi' ? 'Giới tính' : 'Gender'}</label>
                            <select
                                className={`form-select ${errors.gender ? "input-error" : ""}`}
                                value={this.state.gender}
                                onChange={(e) => this.handleChange(e, "gender")}
                            >
                                <option value="">{this.props.language === 'vi' ? '-- Chọn --' : '-- Select --'}</option>
                                <option value="M">{this.props.language === 'vi' ? 'Nam' : 'Male'}</option>
                                <option value="F">{this.props.language === 'vi' ? 'Nữ' : 'Female'}</option>
                                <option value="O">{this.props.language === 'vi' ? 'Khác' : 'Other'}</option>
                            </select>
                            {errors.gender && (
                                <div className="error-text">{errors.gender}</div>
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    <div className="row mb-3">
                        <div className="col-md-12">
                            <label>{this.props.language === 'vi' ? 'Địa chỉ' : 'Address'}</label>
                            <input
                                className={`form-control ${errors.address ? "input-error" : ""}`}
                                value={this.state.address}
                                onChange={(e) => this.handleChange(e, "address")}
                            />
                            {errors.address && <div className="error-text">{errors.address}</div>}
                        </div>
                    </div>

                    {/* Avatar */}
                    <div className="row mb-4 align-items-center">
                        <div className="col-md-7">
                            <label>{this.props.language === 'vi' ? 'Ảnh đại diện' : 'Avatar'}</label>

                            <div className="d-flex align-items-center gap-3 mt-2">

                                {/* Nút chọn ảnh */}
                                <label className="btn btn-select-image">
                                    {this.props.language === 'vi' ? 'Chọn ảnh' : 'Choose image'} <i className="fa-solid fa-upload ms-1"></i>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={this.handleImageChange}
                                    />
                                </label>

                                {/* Nút bỏ ảnh */}
                                {!isDefaultImage && (
                                    <button
                                        type="button"
                                        className="btn btn-remove-image"
                                        onClick={this.clearImage}
                                    >
                                        {this.props.language === 'vi' ? 'Bỏ ảnh' : 'Remove image'} <i className="fa-solid fa-xmark ms-1"></i>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="col-md-5 text-center">
                            {isDefaultImage ? (
                                <div className="no-image-box">
                                    {this.props.language === 'vi' ? 'Chưa có ảnh' : 'No image'}
                                </div>
                            ) : (
                                <img
                                    src={this.state.previewImg}
                                    className="avatar-preview"
                                    alt="preview"
                                />
                            )}
                        </div>
                    </div>

                </ModalBody>

                <ModalFooter>
                    <Button color="primary" onClick={this.handleSave}>
                        <i className="fa-solid fa-floppy-disk me-2"></i>{this.props.language === 'vi' ? 'Lưu thay đổi' : 'Save changes'}
                    </Button>
                    <Button color="secondary" onClick={this.toggle}>
                        <i className="fa-solid fa-xmark me-2"></i>{this.props.language === 'vi' ? 'Hủy' : 'Cancel'}
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language
});

export default connect(mapStateToProps)(EditModal);