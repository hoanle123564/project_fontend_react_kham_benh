import React, { Component } from "react";
import { connect } from "react-redux";
import { EditUser } from "../../../services/userService";
import UserRedux from "./UserRedux.js";
import UserEdit from "./userRedux_Edit.js";
import * as action from "../../../store/actions";
import "./TableManageUser.scss";
class TableManageUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Users: [],
      IsOpenModalUser: false,
      IsOpenModalEdit: false,
      userEdit: {},
    };
  }

  componentDidMount() {
    // lấy toàn bộ người dùng
    this.props.fetchAllUser();
  }

  toggleUserModal = () => {
    this.setState({
      IsOpenModalUser: !this.state.IsOpenModalUser,
    });
  };

  // Delete User
  handleDeleteUser = async (id) => {
    this.props.DeleteUser(id);
  };

  // Edit user
  handleEditUser = async (user) => {
    this.toggleUserEdit();
    this.setState({
      userEdit: user,
    });
  };
  đoEitUser = async (user) => {
    try {
      let respone = await EditUser(user);
      console.log("edit response: ", respone);

      if (respone && respone.errCode !== 0) {
        alert(respone.errMessage);
      } else {
        await this.getAllUserReact();
        this.toggleUserEdit();
      }
    } catch (error) {
      console.log(error);
    }
  };

  toggleUserEdit = () => {
    this.setState({
      IsOpenModalEdit: !this.state.IsOpenModalEdit,
    });
  };

  componentDidUpdate = (prevProps) => {
    if (prevProps.ListUser !== this.props.ListUser) {
      this.setState({
        Users: this.props.ListUser,
      });
    }
  };

  render() {
    let User = this.state.Users;
    console.log("user: ", User);

    return (
      <div className="table-manage-user container mt-4">
        <h2 className="text-center fw-bold mb-4 text-primary">
          Manage Users with Hoan
        </h2>

        {/* Modal thêm mới */}
        <UserRedux
          isOpen={this.state.IsOpenModalUser}
          toggleUser={this.toggleUserModal}
        />

        {/* Modal chỉnh sửa */}
        {this.state.IsOpenModalEdit && (
          <UserEdit
            isOpen={this.state.IsOpenModalEdit}
            toggleUser={this.toggleUserEdit}
            className={"modal-user-container"}
            CurrentUser={this.state.userEdit}
            EditUser={this.đoEitUser}
          />
        )}

        {/* Bảng người dùng */}
        <div className="table-responsive shadow-sm rounded-3 my-5">
          <table className="table table-hover align-middle table-bordered text-center mb-0">
            <thead className="table-primary">
              <tr>
                <th scope="col">#</th>
                <th scope="col">First Name</th>
                <th scope="col">Last Name</th>
                <th scope="col">Email</th>
                <th scope="col">Address</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {User?.length > 0 ? (
                User.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.firstName}</td>
                    <td>{item.lastName}</td>
                    <td>{item.email}</td>
                    <td>{item.address}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => this.handleEditUser(item)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => this.handleDeleteUser(item.id)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-muted py-4">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    ListUser: state.admin.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllUser: () => dispatch(action.fetchAllUser()),
    DeleteUser: (UserId) => dispatch(action.fetchDeleteUser(UserId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TableManageUser);
