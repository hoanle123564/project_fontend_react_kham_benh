import React, { Component } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { FormattedMessage } from "react-intl";

class PostCategoryModal extends Component {
    render() {
        const { isOpen, mode, formData, errors, onChange, onSubmit, onCancel } = this.props;
        const titleId = mode === "EDIT" ? "manage-post-category.edit" : "manage-post-category.add";
        const titleDefaultMessage =
            mode === "EDIT" ? "Edit post category" : "Add new post category";

        return (
            <Modal
                isOpen={isOpen}
                toggle={onCancel}
                centered
                className="post-category-modal"
            >
                <ModalHeader toggle={onCancel}>
                    <FormattedMessage id={titleId} defaultMessage={titleDefaultMessage} />
                </ModalHeader>

                <ModalBody>
                    <div className="row">
                        <div className="col-md-12 mb-3">
                            <label className="form-label">
                                <FormattedMessage id="manage-post-category.name" defaultMessage="Category name" />
                            </label>
                            <input
                                type="text"
                                className={`form-control ${errors.name ? "input-error" : ""}`}
                                value={formData.name}
                                onChange={(event) => onChange("name", event.target.value)}
                            />
                            {errors.name && <div className="error-text">{errors.name}</div>}
                        </div>

                        <div className="col-md-12 mb-3">
                            <label className="form-label">
                                <FormattedMessage id="manage-post-category.slug" defaultMessage="Slug" />
                            </label>
                            <input
                                type="text"
                                className={`form-control ${errors.slug ? "input-error" : ""}`}
                                value={formData.slug}
                                onChange={(event) => onChange("slug", event.target.value)}
                            />
                            {errors.slug && <div className="error-text">{errors.slug}</div>}
                        </div>

                        <div className="col-md-12">
                            <label className="form-label d-block">
                                <FormattedMessage id="manage-post-category.is-active" defaultMessage="Visible" />
                            </label>
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={Number(formData.isActive) === 1}
                                    onChange={(event) => onChange("isActive", event.target.checked ? 1 : 0)}
                                />
                            </div>
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button color="primary" onClick={onSubmit}>
                        <FormattedMessage id="manage-post-category.save" defaultMessage="Save category" />
                    </Button>
                    <Button color="secondary" onClick={onCancel}>
                        <FormattedMessage id="manage-post-category.cancel" defaultMessage="Cancel" />
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}

export default PostCategoryModal;
