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
      description: "",
      options: [],
    };
  }

  // Edit Markdown
  handleEditorChange = ({ html, text }) => {
    this.setState({
      contentMarkdown: text,
      contentHTML: html,
    });
  };

  // Save content Markdown
  handleSaveContent = async (data) => {
    console.log("check state", this.state);
    await this.props.SaveDetailDoctor({
      contentHTML: this.state.contentHTML,
      contentMarkdown: this.state.contentMarkdown,
      description: this.state.description,
      doctorId: this.state.selectDoctor.value,
    });
    this.setState({
      contentMarkdown: "",
      contentHTML: "",
      selectDoctor: "",
      description: "",
    });
  };

  // Select change
  handleChangeSelect = async (selectDoctor) => {
    this.setState({
      selectDoctor: selectDoctor,
    });
    let res = await this.props.GetDetailDoctor(selectDoctor.value);
    if (res && res.contentHTML) {
      this.setState({
        contentHTML: res.contentHTML,
        contentMarkdown: res.contentMarkdown,
        description: res.description,
      });
    } else {
      this.setState({
        contentHTML: "",
        contentMarkdown: "",
        description: "",
      });
    }
    console.log("select doctor", this.state);
  };

  // change description
  handleChangeDes = (e) => {
    this.setState({
      description: e.target.value,
    });
  };

  buidlDataSelect = (InputData) => {
    let result = [];
    if (InputData && InputData.length > 0) {
      InputData.map((item, index) => {
        let Object = {};
        Object.label = `${item.firstName} ${item.lastName}`;
        Object.value = item.id;
        result.push(Object);
      });
    }
    return result;
  };

  componentDidMount() {
    this.props.fetchAllDoctor();
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.ListDoctor !== this.props.ListDoctor) {
      let List = this.buidlDataSelect(this.props.ListDoctor);
      this.setState({
        options: List,
      });
    }
  };

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
                onChange={this.handleChangeSelect}
                options={this.state.options}
              />
            </div>
            {/* content right */}
            <div className="content-right">
              <label>Thông tin giới thiệu</label>
              <textarea
                className="form-control"
                placeholder="Nhập thông tin giới thiệu bác sĩ"
                rows={4}
                value={this.state.description}
                onChange={(e) => this.handleChangeDes(e)}
              ></textarea>
            </div>
          </div>

          <div className="manage-doctor-editor">
            <MdEditor
              style={{ height: "500px" }}
              renderHTML={(text) => mdParser.render(text)}
              value={this.state.contentMarkdown}
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
    language: state.app.language,
    ListDoctor: state.admin.AllDoctor,
    DetailDoctor: state.admin.DetailDoctor,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllDoctor: () => dispatch(action.fetchAllDoctor()),
    SaveDetailDoctor: (data) => dispatch(action.SaveDetailDoctor(data)),
    GetDetailDoctor: (id) => dispatch(action.GetDetailDoctor(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageDoctor);
