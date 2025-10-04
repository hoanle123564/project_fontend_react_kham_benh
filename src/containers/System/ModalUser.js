import React, { Component } from 'react';
// import { FormattedMessage } from 'react-intl';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { emitter } from '../../utils/emitter';

import { connect } from 'react-redux';
class ModalEditUser extends Component {

    constructor(props) {
        super(props)
        this.state = {
            email: '',
            password: '',
            address: '',
            firstName: '',
            lastName: ''
        }
        this.listenToEmitter();
    }

    listenToEmitter = () => {
        emitter.on('EVENT_CLEAR_MODAL_DATA', () => {
            this.setState({
                email: '',
                password: '',
                address: '',
                firstName: '',
                lastName: ''
            })
        })
    }

    componentDidMount() {
    }

    toggle = () => {
        this.props.toggleUser()
    }


    handleOnchange = (event, id) => {
        /**
         * ...this.state = { email: '', password: '', address: '', firstName: '', lastName: ''}
         */
        const copyState = { ...this.state }
        copyState[id] = event.target.value;
        this.setState({
            ...copyState
        })
    }
    checkValidateInput = () => {
        let isValid = true;
        let arrInput = ['email', 'password', 'address', 'firstName', 'lastName'];
        for (let i = 0; i < arrInput.length; i++) {
            if (!this.state[arrInput[i]]) {
                isValid = false;
                alert('Missing parameter:' + arrInput[i]);
                break;
            }
        }
        return isValid;
    }

    handleAddNewUser = async () => {

        const check = this.checkValidateInput();
        if (check === true) {
            await this.props.CreateNewUser(this.state)
        }

    }


    render() {
        return (
            <Modal isOpen={this.props.isOpen}
                toggle={() => this.toggle()}
                className={'modal-user-container'}
                size="lg"
                centered
            >
                <ModalHeader toggle={() => this.toggle()}>Create new user</ModalHeader>
                <ModalBody>
                    <div className="modal-user-body">
                        <div className="input-container">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" placeholder="Email"
                                name="email" onChange={(event) => this.handleOnchange(event, "email")}
                                value={this.state.email} />
                        </div>
                        <div className="input-container">
                            <label htmlFor="inputPassword4">Password</label>
                            <input type="password" id="inputPassword4" placeholder="Password"
                                name="password" onChange={(event) => this.handleOnchange(event, "password")}
                                value={this.state.password} />
                        </div>
                    </div>

                    <div className="modal-user-body">
                        <div className="input-container">
                            <label htmlFor="inputfirstName4">firstName</label>
                            <input type="text" id="inputfirstName4" placeholder="firstName"
                                name="firstName" onChange={(event) => this.handleOnchange(event, "firstName")}
                                value={this.state.firstName} />
                        </div>

                        <div className="input-container">
                            <label htmlFor="inputlastName4">lastName</label>
                            <input type="text" id="inputlastName4" placeholder="lastName"
                                name="lastName" onChange={(event) => this.handleOnchange(event, "lastName")}
                                value={this.state.lastName} />
                        </div>
                    </div>

                    <div className="modal-user-body">
                        <div className="input-container max-input">
                            <label htmlFor="inputlAddress4">Address</label>
                            <input type="text" id="inputlAddress4" placeholder="Address"
                                name="address" onChange={(event) => this.handleOnchange(event, "address")}
                                value={this.state.address} />
                        </div>
                    </div>

                </ModalBody>
                <ModalFooter>
                    <Button color="primary" className='px-3'
                        onClick={() => this.handleAddNewUser()}>
                        Add new
                    </Button>{' '}
                    <Button color="secondary" className='px-3' onClick={() => this.toggle()}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        )
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

export default connect(mapStateToProps, mapDispatchToProps)(ModalEditUser);
