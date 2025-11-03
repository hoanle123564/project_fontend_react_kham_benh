import React, { Component } from "react";
import { connect } from "react-redux";
import * as action from "../../../store/actions";
import "./ManageDoctor.scss";

import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
// import style manually
import "react-markdown-editor-lite/lib/index.css";
import Select from "react-select";

// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */);

class ManageDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contentMarkdown: "",
      contentHTML: "",
      selectDoctor: "",
      options: [
        { value: "chocolate", label: "Chocolate" },
        { value: "strawberry", label: "Strawberry" },
        { value: "vanilla", label: "Vanilla" },
      ],
    };
  }

  // Edit Markdown
  handleEditorChange = ({ html, text }) => {
    this.setState(
      {
        contentMarkdown: html,
        contentHTML: text,
      },
      () => {
        console.log("check state", this.state);
      }
    );
  };

  // Save content Markdown
  handleSaveContent = () => {
    console.log("check state", this.state);
  };

  // Select change
  handleChange = (selectDoctor) => {
    this.setState(
      {
        selectDoctor,
      },
      () => console.log(`Option selected:`, this.state.selectDoctor)
    );
  };

  // change description
  handleChangeDes = (e) => {
    this.setState({
      description: e.target.value,
    });
  };

  componentDidMount() {}

  componentDidUpdate = (prevProps) => {};

  render() {
    return (
      <>
        <div className="manage-doctor-container">
          <div className="manage-doctor-title">Tạo thêm thông tin doctors</div>
          <div className="more-info-doctor">
            {/* content left */}
            <div className="content-left">
              <label>Chọn bác sĩ</label>
              <Select
                value={this.state.selectDoctor}
                onChange={this.handleChange}
                options={this.state.options}
              />{" "}
            </div>
            {/* content right */}
            <div className="content-right">
              <label>Thông tin giới thiệu</label>
              <textarea
                className="form-control"
                placeholder="Nhập thông tin giới thiệu bác sĩ"
                rows={4}
                onChange={(e) => this.handleChangeDes(e)}
              ></textarea>
            </div>
          </div>

          <div className="manage-doctor-editor">
            <MdEditor
              style={{ height: "500px" }}
              renderHTML={(text) => mdParser.render(text)}
              onChange={this.handleEditorChange}
            />
          </div>

          <button
            className="save-content-doctor"
            onClick={this.handleSaveContent}
          >
            Lưu thông tin
          </button>
        </div>
      </>
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

export default connect(mapStateToProps, mapDispatchToProps)(ManageDoctor);
