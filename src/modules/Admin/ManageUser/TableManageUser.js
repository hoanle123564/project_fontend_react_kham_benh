import React, { Component } from "react";
import { connect } from "react-redux";
import UserRedux from "./UserRedux.js";
import UserEdit from "./userRedux_Edit.js";
import * as action from "../../../store/actions/index.js";
import "./TableManageUser.scss";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { FormattedMessage } from "react-intl";

class TableManageUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Users: [],
      searchQuery: "",
      sortField: "id",
      sortOrder: "asc",
      currentPage: 1,
      usersPerPage: 10,
      isOpen: false,
      previewImg: "",
      IsOpenModalEdit: false,
      userEdit: {},
    };
  }

  componentDidMount() {
    this.props.fetchAllUser();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.ListUser !== this.props.ListUser) {
      this.setState({ Users: this.props.ListUser });
    }
  }

  // Tìm kiếm người dùng
  handleSearchChange = (e) => {
    this.setState({
      searchQuery: e.target.value.toLowerCase(),
      currentPage: 1,
    });
  };

  // Sắp xếp cột
  handleSort = (field) => {
    const { sortField, sortOrder } = this.state;
    const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    this.setState({ sortField: field, sortOrder: newOrder });
  };

  // Mở modal edit
  handleEditUser = (user) => {
    this.toggleUserEdit();
    this.setState({ userEdit: user });
  };

  // Xóa user
  handleDeleteUser = (id) => {
    this.props.DeleteUser(id);
  };

  toggleUserEdit = () => {
    this.setState({ IsOpenModalEdit: !this.state.IsOpenModalEdit });
  };

  // Lọc, sắp xếp, tìm kiếm
  getFilteredAndSortedUsers = () => {
    const { Users, searchQuery, sortField, sortOrder } = this.state;

    // Lọc theo từ khóa
    let filtered = Users.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      return fullName.includes(searchQuery);
    });

    // Sắp xếp
    filtered.sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  // Phân trang
  handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };

  render() {
    const {
      isOpen,
      previewImg,
      IsOpenModalEdit,
      userEdit,
      currentPage,
      usersPerPage,
      sortField,
      sortOrder,
    } = this.state;

    const filteredUsers = this.getFilteredAndSortedUsers();

    // Phân trang
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(
      indexOfFirstUser,
      indexOfLastUser
    );
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const columns = [
      { field: "id", id: "user-manage.id", default: "#" },
      { field: "firstName", id: "user-manage.first-name", default: "First Name" },
      { field: "lastName", id: "user-manage.last-name", default: "Last Name" },
      { field: "email", id: "user-manage.email", default: "Email" },
      { field: "address", id: "user-manage.address", default: "Address" },
    ];

    return (
      <div className="table-manage-user container mt-4">
        <h2 className="text-center fw-bold mb-4 text-primary">
          <FormattedMessage id="menu.admin.manage-user" defaultMessage="User Management" />
        </h2>

        {/* Modal thêm mới */}
        <UserRedux />

        {/* Modal chỉnh sửa */}
        {IsOpenModalEdit && (
          <UserEdit
            isOpen={IsOpenModalEdit}
            toggleUser={this.toggleUserEdit}
            CurrentUser={userEdit}
          />
        )}

        {/* Thanh tìm kiếm */}
        <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
          <FormattedMessage id="user-manage.search" defaultMessage="🔍 Search by name...">
            {(msg) => (
              <input
                type="text"
                className="form-control w-25"
                placeholder={msg}
                onChange={this.handleSearchChange}
              />
            )}
          </FormattedMessage>

          <span className="text-muted">
            <FormattedMessage
              id="user-manage.total"
              defaultMessage="Total: {count} users"
              values={{ count: filteredUsers.length }}
            />
          </span>
        </div>

        {/* Bảng */}
        <div className="table-responsive shadow-sm rounded-3 my-3">
          <table className="table table-hover align-middle table-bordered mb-0">
            <thead className="table-primary">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.field}
                    onClick={() => this.handleSort(col.field)}
                    style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    <FormattedMessage id={col.id} defaultMessage={col.default} />{" "}
                    {sortField === col.field && (
                      <i
                        className={`fa-solid fa-sort-${sortOrder === "asc" ? "up" : "down"
                          } ms-1`}
                      ></i>
                    )}
                  </th>
                ))}
                <th>
                  <FormattedMessage id="user-manage.avatar" defaultMessage="Avatar" />
                </th>
                <th>
                  <FormattedMessage id="user-manage.action" defaultMessage="Action" />
                </th>
              </tr>
            </thead>

            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.firstName}</td>
                    <td>{item.lastName}</td>
                    <td>{item.email}</td>
                    <td
                      className="truncate-address"
                      title={item.address} // Tooltip khi hover
                    >
                      {item.address?.length > 25
                        ? item.address.slice(0, 25) + "..."
                        : item.address || ""}
                    </td>
                    <td>
                      {item.image ? (
                        <img
                          src={`data:image/jpeg;base64,${item.image}`}
                          alt="avatar"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                          }}
                          onClick={() =>
                            this.setState({
                              isOpen: true,
                              previewImg: `data:image/jpeg;base64,${item.image}`,
                            })
                          }
                        />
                      ) : (
                        <span className="text-muted">
                          <FormattedMessage id="user-manage.no-image" defaultMessage="No image" />
                        </span>
                      )}
                    </td>
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
                  <td colSpan="7" className="text-muted py-4">
                    <FormattedMessage id="user-manage.no-users" defaultMessage="No users found." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-3">
              <ul className="pagination justify-content-center mb-0">
                {Array.from({ length: totalPages }, (_, i) => (
                  <li
                    key={i}
                    className={`page-item ${currentPage === i + 1 ? "active" : ""
                      }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => this.handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Phóng to ảnh */}
          {isOpen && (
            <Lightbox
              mainSrc={previewImg}
              onCloseRequest={() => this.setState({ isOpen: false })}
            />
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  ListUser: state.admin.user,
});

const mapDispatchToProps = (dispatch) => ({
  fetchAllUser: () => dispatch(action.fetchAllUser()),
  DeleteUser: (UserId) => dispatch(action.fetchDeleteUser(UserId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TableManageUser);