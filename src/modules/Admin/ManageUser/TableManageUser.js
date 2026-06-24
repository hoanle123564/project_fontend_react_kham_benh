import React, { Component } from "react";
import { connect } from "react-redux";
import UserRedux from "./UserRedux.js";
import UserEdit from "./userRedux_Edit.js";
import * as action from "../../../store/actions/index.js";
import "./TableManageUser.scss";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { FormattedMessage } from "react-intl";
import { getLookUp } from "../../../services/userService";
import { languages } from "../../../utils/constant";

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
      locationLabels: {},
    };
  }

  componentDidMount() {
    this.props.fetchAllUser();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.ListUser !== this.props.ListUser) {
      this.setState({ Users: this.props.ListUser });
      this.loadLocationLabels(this.props.ListUser || []);
    }

    if (prevProps.language !== this.props.language) {
      this.loadLocationLabels(this.state.Users || []);
    }
  }

  loadLocationLabels = async (users) => {
    const provinceCodes = [...new Set(users.map((user) => user.provinceCode).filter(Boolean))];
    const districtParents = [...new Set(users.map((user) => user.provinceCode).filter(Boolean))];
    const wardParents = [...new Set(users.map((user) => user.districtCode).filter(Boolean))];

    const [provinceRes, districtResponses, wardResponses] = await Promise.all([
      getLookUp("PROVINCE"),
      Promise.all(districtParents.map((provinceCode) => getLookUp("DISTRICT", provinceCode))),
      Promise.all(wardParents.map((districtCode) => getLookUp("WARD", districtCode))),
    ]);

    const labels = {};
    const collect = (items = []) => {
      items.forEach((item) => {
        if (item?.keyMap) {
          labels[item.keyMap] =
            this.props.language === languages.VI
              ? item.value_vi || item.value_en || item.keyMap
              : item.value_en || item.value_vi || item.keyMap;
        }
      });
    };

    collect((provinceRes?.data || []).filter((item) => provinceCodes.includes(item.keyMap)));
    districtResponses.forEach((res) => collect(res?.data || []));
    wardResponses.forEach((res) => collect(res?.data || []));

    this.setState({ locationLabels: labels });
  };

  formatFullAddress = (user) => {
    const { locationLabels } = this.state;
    return [
      user.address,
      locationLabels[user.wardCode] || user.wardCode,
      locationLabels[user.districtCode] || user.districtCode,
      locationLabels[user.provinceCode] || user.provinceCode,
    ].filter(Boolean).join(", ");
  };

  handleSearchChange = (e) => {
    this.setState({
      searchQuery: e.target.value.toLowerCase(),
      currentPage: 1,
    });
  };

  handleSort = (field) => {
    const { sortField, sortOrder } = this.state;
    const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    this.setState({ sortField: field, sortOrder: newOrder });
  };

  handleEditUser = (user) => {
    this.toggleUserEdit();
    this.setState({ userEdit: user });
  };

  handleDeleteUser = (id) => {
    this.props.DeleteUser(id);
  };

  toggleUserEdit = () => {
    this.setState({ IsOpenModalEdit: !this.state.IsOpenModalEdit });
  };

  getFilteredAndSortedUsers = () => {
    const { Users, searchQuery, sortField, sortOrder } = this.state;

    let filtered = Users.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      return fullName.includes(searchQuery);
    });

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
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const footerTotalPages = Math.max(totalPages, 1);

    const columns = [
      { field: "id", id: "user-manage.id", default: "#" },
      { field: "firstName", id: "user-manage.first-name", default: "First Name" },
      { field: "lastName", id: "user-manage.last-name", default: "Last Name" },
      { field: "email", id: "user-manage.email", default: "Email" },
      { field: "address", id: "user-manage.address", default: "Address" },
    ];

    return (
      <div className="table-manage-user">
        <div className="table-manage-user__inner">
          <div className="table-manage-user__header">
            <h2 className="table-manage-user__title">
              <FormattedMessage id="menu.admin.manage-user" defaultMessage="User Management" />
            </h2>
            <UserRedux />
          </div>


          {IsOpenModalEdit && (
            <UserEdit
              isOpen={IsOpenModalEdit}
              toggleUser={this.toggleUserEdit}
              CurrentUser={userEdit}
            />
          )}

          <div className="table-manage-user__toolbar">
            <FormattedMessage id="user-manage.search" defaultMessage="Search by name...">
              {(msg) => (
                <div className="table-manage-user__search">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <input
                    type="text"
                    placeholder={msg}
                    onChange={this.handleSearchChange}
                  />
                </div>
              )}
            </FormattedMessage>

            <div className="table-manage-user__total">
              <FormattedMessage
                id="user-manage.total"
                defaultMessage="Total: {count} users"
                values={{ count: filteredUsers.length }}
              />
            </div>
          </div>

          <div className="table-manage-user__table-card">
            <div className="table-manage-user__table-scroll">
              <table className="table-manage-user__table">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col.field}>
                        <button
                          className="table-manage-user__sort-button"
                          onClick={() => this.handleSort(col.field)}
                        >
                          <FormattedMessage id={col.id} defaultMessage={col.default} />
                          {sortField === col.field && (
                            <i
                              className={`fa-solid fa-sort-${sortOrder === "asc" ? "up" : "down"}`}
                            ></i>
                          )}
                        </button>
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
                          className="table-manage-user__address"
                          title={this.formatFullAddress(item)}
                        >
                          {this.formatFullAddress(item).length > 35
                            ? this.formatFullAddress(item).slice(0, 35) + "..."
                            : this.formatFullAddress(item) || ""}
                        </td>
                        <td>
                          {item.image ? (
                            <img
                              className="table-manage-user__avatar"
                              src={`data:image/jpeg;base64,${item.image}`}
                              alt="avatar"
                              onClick={() =>
                                this.setState({
                                  isOpen: true,
                                  previewImg: `data:image/jpeg;base64,${item.image}`,
                                })
                              }
                            />
                          ) : (
                            <span className="table-manage-user__muted">
                              <FormattedMessage id="user-manage.no-image" defaultMessage="No image" />
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="table-manage-user__actions">
                            <button
                              className="table-manage-user__action-button table-manage-user__action-button--edit"
                              aria-label="Edit user"
                              onClick={() => this.handleEditUser(item)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="table-manage-user__action-button table-manage-user__action-button--delete"
                              aria-label="Delete user"
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
                      <td colSpan="7" className="table-manage-user__empty">
                        <FormattedMessage id="user-manage.no-users" defaultMessage="No users found." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-manage-user__footer">
              <span>Trang {currentPage} trên {footerTotalPages}</span>
              <nav className="table-manage-user__pagination">
                <ul>
                  <li>
                    <button
                      type="button"
                      onClick={() => this.handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      Trước
                    </button>
                  </li>
                  {Array.from({ length: footerTotalPages }, (_, i) => (
                    <li
                      key={i}
                      className={currentPage === i + 1 ? "active" : ""}
                    >
                      <button
                        type="button"
                        onClick={() => this.handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={() => this.handlePageChange(currentPage + 1)}
                      disabled={currentPage >= footerTotalPages}
                    >
                      Sau
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

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
  language: state.app.language,
});

const mapDispatchToProps = (dispatch) => ({
  fetchAllUser: () => dispatch(action.fetchAllUser()),
  DeleteUser: (UserId) => dispatch(action.fetchDeleteUser(UserId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TableManageUser);
