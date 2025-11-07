import React, { Component } from "react";
import { connect } from "react-redux";
import * as action from "../../../store/actions";
import "./ManageDoctor.scss";

import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
// import style manually
import "react-markdown-editor-lite/lib/index.css";
import Select from "react-select";
import { FormattedMessage } from "react-intl";
import { List } from "reactstrap";
// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */);

class ManageDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contentMarkdown: "",
      contentHTML: "",
      selectDoctor: "",
      selectPrice: "",
      selectPayment: "",
      description: "",
      options: [],

      ListPrice: [],
      ListPayment: [],
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

  buidlDataSelect = (InputData, type) => {
    let result = [];
    if (InputData && InputData.length > 0) {
      InputData.map((item, index) => {
        let Object = {};
        Object.label = type === "USERS" ? `${item.firstName} ${item.lastName}` : item.value_vi;
        Object.value = item.id;
        result.push(Object);
      });
    }
    return result;
  };

  componentDidMount() {
    this.props.fetchAllDoctor();
    this.props.GetDAllRequire();
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.ListDoctor !== this.props.ListDoctor) {
      let List = this.buidlDataSelect(this.props.ListDoctor, 'USERS');
      console.log("List doctor", this.props.ListDoctor);
      this.setState({
        options: List,
      });


    }
    if (prevProps.AllRequire !== this.props.AllRequire) {
      let ListPri = this.buidlDataSelect(this.props.AllRequire.ResPri);
      let ListPay = this.buidlDataSelect(this.props.AllRequire.ResPay);

      this.setState({
        ListPrice: ListPri,
        ListPayment: ListPay,
      })

    };
  }
  render() {
    console.log("select doctor", this.state.selectDoctor);

    return (
      <div className="manage-doctor-container">
        <div className="manage-doctor-title">
          <FormattedMessage id="admin.manage-doctor.title" />
        </div>
        <div className="more-info-doctor">
          {/* content left */}
          <div className="content-left">
            <label>
              <FormattedMessage id="admin.manage-doctor.select-doctor" />
            </label>
            <Select
              value={this.state.selectDoctor}
              onChange={this.handleChangeSelect}
              options={this.state.options}
            />
          </div>
          {/* content right */}
          <div className="content-right">
            <label>
              <FormattedMessage id="admin.manage-doctor.intro" />
            </label>
            <textarea
              className="form-control"
              placeholder={this.props.language === 'vi' ? 'Giới thiệu bác sĩ ...' : 'Introduce doctor ...'}
              rows={4}
              value={this.state.description}
              onChange={(e) => this.handleChangeDes(e)}
            ></textarea>
          </div>
        </div>

        {/* more info */}
        <div className="more-info-extra row mt-3">
          <div className="col-4 form-group ">
            <label>Chọn giá</label>
            <Select
              value={this.state.selectPrice}
              onChange={this.handleChangeSelect}
              options={this.state.ListPrice}
            />
          </div>

          <div className="col-4 form-group">
            <label>Chọn phương thức toán</label>
            <Select
              value={this.state.selectPayment}
              onChange={this.handleChangeSelect}
              options={this.state.ListPayment}
            />
          </div>

          <div className="col-4 form-group">
            <label>Tên phòng khám</label>
            <input className="form-control" />
          </div>

          <div className="col-4 form-group">
            <label>Địa chỉ phòng khám</label>
            <input className="form-control" />
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
          <FormattedMessage id="admin.manage-doctor.save-info" />
        </button>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    ListDoctor: state.admin.AllDoctor,
    DetailDoctor: state.admin.DetailDoctor,
    AllRequire: state.admin.AllRequire,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllDoctor: () => dispatch(action.fetchAllDoctor()),
    SaveDetailDoctor: (data) => dispatch(action.SaveDetailDoctor(data)),
    GetDetailDoctor: (id) => dispatch(action.GetDetailDoctor(id)),
    GetDAllRequire: () => dispatch(action.GetDAllRequire()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageDoctor);
