import React, { Component } from "react";
import { connect } from "react-redux";
import "./RemedyModal.scss";
import * as action from "../../store/actions";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { injectIntl } from "react-intl";
import { FormattedMessage } from "react-intl";

class RemedyModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            imageSpecialty: '',
            previewImg: '',
        };
    }

    toggleModal = () => {
        this.props.toggleModal();
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

    async componentDidMount() {
        if (this.props.dataModal) {
            this.setState({
                email: this.props.dataModal.email
            })
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.dataModal !== prevProps.dataModal) {
            this.setState({
                email: this.props.dataModal.email
            })
        }
    }

    handleSendRemedy = async () => {
        let { imageSpecialty, email } = this.state;
        let { dataModal } = this.props;

        this.props.SendRedemy(
            {
                email: email,
                image: imageSpecialty,
                doctorId: dataModal.doctorId,
                patientId: dataModal.patientId,
                time: dataModal.timeTypeVi,
                date: dataModal.date,
                firstNamePatient: dataModal.firstName,
                lastNamePatient: dataModal.lastName,
                reason: dataModal.reason
            }
        );
    }




    render() {
        return (
            <Modal
                isOpen={this.props.isOpen}
                toggle={this.toggleModal}
                className={"booking-modal-container"}
                size="lg"
                centered
            >
                <ModalHeader toggle={this.toggleModal}>

                </ModalHeader>
                <ModalBody>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label>Email bệnh nhân</label>
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.email}
                            />

                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Ảnh toa thuốc</label>
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
                </ModalBody>

                <ModalFooter>
                    <Button color="primary" onClick={this.handleSendRemedy}>
                        Gửi đơn thuốc
                    </Button>
                    <Button color="secondary" onClick={this.toggleModal}>
                        Đóng
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
    isLoggedIn: state.doctor.isLoggedIn,
    doctorInfo: state.doctor.doctorInfo,
    gender: state.admin.genderArr,
});

const mapDispatchToProps = (dispatch) => ({
    getGender: () => dispatch(action.fetchGender()),
    postPatientBooking: (data) => dispatch(action.SavePatientBooking(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(RemedyModal));
