import React, { Component } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
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

        if (!firstName) errors.firstName = "Vui lòng nhập tên!";
        if (!lastName) errors.lastName = "Vui lòng nhập họ!";

        if (!phoneNumber) errors.phoneNumber = "Vui lòng nhập số điện thoại!";
        else if (!/^[0-9]{9,11}$/.test(phoneNumber))
            errors.phoneNumber = "Số điện thoại không hợp lệ!";

        if (!address) errors.address = "Vui lòng nhập địa chỉ!";
        if (!gender) errors.gender = "Vui lòng chọn giới tính!";

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

        return (
            <Modal isOpen={this.props.isOpen} toggle={this.toggle} size="lg" centered>
                <ModalHeader toggle={this.toggle}>
                    <i className="fa-solid fa-user-pen me-2"></i>
                    Chỉnh sửa thông tin bệnh nhân
                </ModalHeader>

                <ModalBody>
                    {/* Email */}
                    <div className="row mb-3">
                        <div className="col-md-12">
                            <label>Email</label>
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
                            <label>Họ</label>
                            <input
                                className={`form-control ${errors.lastName ? "input-error" : ""}`}
                                value={this.state.lastName}
                                onChange={(e) => this.handleChange(e, "lastName")}
                            />
                            {errors.lastName && <div className="error-text">{errors.lastName}</div>}
                        </div>

                        <div className="col-md-6">
                            <label>Tên</label>
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
                            <label>Số điện thoại</label>
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
                            <label>Giới tính</label>
                            <select
                                className={`form-select ${errors.gender ? "input-error" : ""}`}
                                value={this.state.gender}
                                onChange={(e) => this.handleChange(e, "gender")}
                            >
                                <option value="">-- Chọn --</option>
                                <option value="M">Nam</option>
                                <option value="F">Nữ</option>
                                <option value="O">Khác</option>
                            </select>
                            {errors.gender && (
                                <div className="error-text">{errors.gender}</div>
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    <div className="row mb-3">
                        <div className="col-md-12">
                            <label>Địa chỉ</label>
                            <input
                                className={`form-control ${errors.address ? "input-error" : ""}`}
                                value={this.state.address}
                                onChange={(e) => this.handleChange(e, "address")}
                            />
                            {errors.address && <div className="error-text">{errors.address}</div>}
                        </div>
                    </div>

                    {/* Avatar */}
                    <div className="row mb-4">
                        <div className="col-md-12">
                            <label>Ảnh đại diện</label>
                            <input type="file" className="form-control" onChange={this.handleImageChange} />
                        </div>

                        <div className="col-md-12 text-center mt-3">
                            <img src={this.state.previewImg} className="avatar-preview" alt="preview" />
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button color="primary" onClick={this.handleSave}>
                        <i className="fa-solid fa-floppy-disk me-2"></i>Lưu thay đổi
                    </Button>
                    <Button color="secondary" onClick={this.toggle}>
                        <i className="fa-solid fa-xmark me-2"></i>Hủy
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}

export default EditModal;