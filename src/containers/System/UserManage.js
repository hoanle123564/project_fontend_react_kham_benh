import React, { Component } from 'react';
// import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import './UserManage.scss'
import { getAllUser, CreateUser, DeleteUser, EditUser } from '../../services/userService'
import ModalUser from './ModalUser';
import { emitter } from '../../utils/emitter';
import ModalEditUser from './ModalEditUser';
class UserManage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            Users: [],
            IsOpenModalUser: false,
            IsOpenModalEdit: false,
            userEdit: {}
        }
    }


    async componentDidMount() {
        let response = await getAllUser('ALL')
        if (response && response.errCode === 0) {
            // setState là hàm bất đồng bộ
            this.setState({
                Users: response.users
            })
        }
        // console.log('get user from nodejs:', this.state.Users);
        // console.log('get user from nodejs:', response);
    }
    getAllUserReact = async () => {
        let response = await getAllUser('ALL')
        if (response && response.errCode === 0) {
            // setState là hàm bất đồng bộ
            this.setState({
                Users: response.users
            })
        }
    }
    // Add new user
    handleAddNewUser = () => {
        this.setState({
            IsOpenModalUser: true
        })
    }

    toggleUserModal = () => {
        this.setState({
            IsOpenModalUser: !this.state.IsOpenModalUser
        })
    }
    CreateNewUser = async (data) => {
        try {
            let respone = await CreateUser(data);
            console.log('respone:', respone);
            if (respone && respone.errCode !== 0) {
                alert(respone.errMessage)
            } else {
                await this.getAllUserReact();
                this.toggleUserModal();
            }
            emitter.emit('EVENT_CLEAR_MODAL_DATA', { 'id': 'your_id' })
        } catch (error) {
            console.log(error);
        }
    }
    // Delete User
    handleDeleteUser = async (id) => {
        try {
            await DeleteUser(id);
            await this.getAllUserReact();

        } catch (error) {
            console.log(error);
        }
    }
    // Edit user
    handleEditUser = async (user) => {
        this.toggleUserEdit()
        this.setState({
            userEdit: user
        })
    }
    đoEitUser = async (user) => {
        try {
            let respone = await EditUser(user);
            console.log("edit response: ", respone);

            if (respone && respone.errCode !== 0) {
                alert(respone.errMessage)
            } else {
                await this.getAllUserReact();
                this.toggleUserEdit();
            }
        } catch (error) {
            console.log(error);
        }

    }

    toggleUserEdit = () => {
        this.setState({
            IsOpenModalEdit: !this.state.IsOpenModalEdit
        })
    }



    render() {
        let User = this.state.Users;

        return (
            <>
                <h1 className="title text-center">Manage users with Hoan</h1>
                <ModalUser
                    isOpen={this.state.IsOpenModalUser}
                    toggleUser={this.toggleUserModal}
                    className={'modal-user-container'}
                    CreateNewUser={this.CreateNewUser}
                />
                {this.state.IsOpenModalEdit &&
                    <ModalEditUser
                        isOpen={this.state.IsOpenModalEdit}
                        toggleUser={this.toggleUserEdit}
                        className={'modal-user-container'}
                        CurrentUser={this.state.userEdit}
                        EditUser={this.đoEitUser}
                    />
                }

                <div className='m-1'>
                    <button className='btn btn-primary px-3' style={{ width: '150px' }}
                        onClick={() => this.handleAddNewUser()}>
                        <i className="fa-solid fa-plus"></i> Add new user
                    </button>
                </div>
                <div className='table-container'>
                    <table>
                        <tbody>
                            <tr>
                                <th>ID</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Email</th>
                                <th>Address</th>
                                <th>Action</th>
                            </tr>
                            {
                                User && User.map((item, index) => {
                                    return (
                                        < tr key={item.id} >

                                            <td>
                                                {item.id}
                                            </td>
                                            <td>
                                                {item.firstName}
                                            </td>
                                            <td>
                                                {item.lastName}
                                            </td>
                                            <td>
                                                {item.email}
                                            </td>
                                            <td>
                                                {item.address}
                                            </td>
                                            <td className='d-flex'>
                                                <button className="btn btn-warning mx-auto"
                                                    style={{ width: '80px', height: ' 40px' }}
                                                    onClick={() => this.handleEditUser(item)}><i className="fas fa-edit"></i>
                                                </button>
                                                <button className="btn btn-danger mx-auto"
                                                    style={{ width: '80px ', height: '40px' }}
                                                    onClick={() => this.handleDeleteUser(item.id)}><i className="fa-solid fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table >
                </div>
            </>
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

export default connect(mapStateToProps, mapDispatchToProps)(UserManage);
