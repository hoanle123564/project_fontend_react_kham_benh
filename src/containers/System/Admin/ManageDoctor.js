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
      nameClinic: "",
      addressClinic: "",

      ListDoctor: [],
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
  handleSaveContent = async () => {
    await this.props.SaveDetailDoctor({
      contentHTML: this.state.contentHTML,
      contentMarkdown: this.state.contentMarkdown,
      description: this.state.description,
      doctorId: this.state.selectDoctor.value,
      priceId: this.state.selectPrice.value,
      paymentId: this.state.selectPayment.value,
      nameClinic: this.state.nameClinic,
      addressClinic: this.state.addressClinic,
    });

    this.setState({
      contentMarkdown: "",
      contentHTML: "",
      selectDoctor: "",
      description: "",
    });
  };

  // Select change
  handleChangeSelect = async (e, name) => {
    console.log("e", e);
    let stateCopy = { ...this.state };
    stateCopy[name.name] = e;
    this.setState({
      ...stateCopy,
    });
    if (name.name === "selectDoctor") {
      let res = await this.props.GetDetailDoctor(e.value);

      let { ListPayment, ListPrice } = this.state;
      let findItem = ListPayment.find(item => item.value === res.paymentId);
      let findPrice = ListPrice.find(item => item.value === res.priceId);
      if (res && res.contentHTML) {
        this.setState({
          contentHTML: res.contentHTML,
          contentMarkdown: res.contentMarkdown,
          description: res.description,
          selectPrice: findPrice || "",
          selectPayment: findItem || "",
          nameClinic: res.nameClinic,
          addressClinic: res.addressClinic,
        });
      } else {
        this.setState({
          contentHTML: "",
          contentMarkdown: "",
          description: "",
          selectPrice: "",
          selectPayment: "",
          nameClinic: "",
          addressClinic: "",
        });
      }
    }
  };

  // change description
  handleChangeDes = (e) => {
    this.setState({
      description: e.target.value,
    });
  };
  handleOnChangeText = (e, id) => {
    let stateCopy = { ...this.state };
    stateCopy[id] = e.target.value;
    this.setState({
      ...stateCopy,
    });
  }
  buidlDataSelect = (InputData, type) => {
    let result = [];
    if (InputData && InputData.length > 0) {
      InputData.forEach((item) => {
        if (type === "USERS") {
          let Object = {};
          Object.label = `${item.firstName} ${item.lastName}`;
          Object.value = item.id;
          result.push(Object);
        }
        if (type === "PRICE") {
          let Object = {};
          Object.label =
            this.props.language === "vi"
              ? `${item.value_vi} VNĐ`
              : `${item.value_en} USD`;
          Object.value = item.keyMap;
          result.push(Object);
        }
        if (type === "PAYMENT") {
          let Object = {};
          Object.label =
            this.props.language === "vi" ? item.value_vi : item.value_en;
          Object.value = item.keyMap;
          result.push(Object);
        }
      });
    }
    return result;
  };

  hadleOnchangeText = (e, id) => {
    let stateCopy = { ...this.state };
    stateCopy[id] = e.target.value;
    this.setState({
      ...stateCopy,
    });
  };

  componentDidMount() {
    this.props.fetchAllDoctor();
    this.props.GetDAllRequire();
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.ListDoctor !== this.props.ListDoctor) {
      let List = this.buidlDataSelect(this.props.ListDoctor, "USERS");
      console.log("List doctor", this.props.ListDoctor);
      this.setState({
        ListDoctor: List,
      });
    }
    if (prevProps.AllRequire !== this.props.AllRequire) {
      let ListPri = this.buidlDataSelect(this.props.AllRequire.ResPri, "PRICE");
      let ListPay = this.buidlDataSelect(
        this.props.AllRequire.ResPay,
        "PAYMENT"
      );

      this.setState({
        ListPrice: ListPri,
        ListPayment: ListPay,
      });

    }

    if (prevProps.language !== this.props.language) {
      let ListPri = this.buidlDataSelect(this.props.AllRequire.ResPri, "PRICE");
      let ListPay = this.buidlDataSelect(this.props.AllRequire.ResPay, "PAYMENT");

      // Tìm lại item đang chọn (vì label thay đổi)
      let selectedPrice = ListPri.find(
        (item) => item.value === this.state.selectPrice?.value
      );
      let selectedPayment = ListPay.find(
        (item) => item.value === this.state.selectPayment?.value
      );
      this.setState({
        ListPrice: ListPri,
        ListPayment: ListPay,
        selectPrice: selectedPrice || "",
        selectPayment: selectedPayment || "",
      });
    }
  };
  render() {
    const { language } = this.props;
    console.log('this.props.DetailDoctor', this.props.DetailDoctor);

    return (
      <div className="manage-doctor-container">
        <div className="manage-doctor-title">
          <FormattedMessage id="admin.manage-doctor.title" />
        </div>

        {/* --- Chọn bác sĩ + mô tả --- */}
        <div className="more-info-doctor">
          <div className="content-left">
            <label>
              <FormattedMessage id="admin.manage-doctor.select-doctor" />
            </label>
            <Select
              value={this.state.selectDoctor}
              onChange={this.handleChangeSelect}
              name="selectDoctor"
              options={this.state.ListDoctor}
              placeholder={
                language === "vi" ? "Chọn bác sĩ ..." : "Select doctor ..."
              }
            />
          </div>

          <div className="content-right">
            <label>
              <FormattedMessage id="admin.manage-doctor.intro" />
            </label>
            <textarea
              className="form-control"
              placeholder={
                language === "vi"
                  ? "Giới thiệu bác sĩ ..."
                  : "Introduce the doctor ..."
              }
              rows={4}
              value={this.state.description}
              onChange={(e) => this.handleOnChangeText(e, "description")}
            />
          </div>
        </div>

        {/* --- Thông tin bổ sung (2 hàng 2 cột) --- */}
        <div className="more-info-extra">
          {/* Hàng 1 */}
          <div className="form-group">
            <label>
              <FormattedMessage id="admin.manage-doctor.select-price" />
            </label>
            <Select
              value={this.state.selectPrice}
              onChange={this.handleChangeSelect}
              name="selectPrice"
              options={this.state.ListPrice}
              placeholder={
                language === "vi"
                  ? "Chọn giá khám ..."
                  : "Select examination fee ..."
              }
            />
          </div>

          <div className="form-group">
            <label>
              <FormattedMessage id="admin.manage-doctor.payment" />
            </label>
            <Select
              value={this.state.selectPayment}
              onChange={this.handleChangeSelect}
              name="selectPayment"
              options={this.state.ListPayment}
              placeholder={
                language === "vi"
                  ? "Chọn phương thức ..."
                  : "Select payment method ..."
              }
            />
          </div>

          {/* Hàng 2 */}
          <div className="form-group">
            <label>
              <FormattedMessage id="admin.manage-doctor.name-clinic" />
            </label>
            <input
              className="form-control"
              value={this.state.nameClinic}
              onChange={(e) => this.handleOnChangeText(e, "nameClinic")}
              placeholder={
                language === "vi" ? "Tên phòng khám" : "Clinic name"
              }
            />
          </div>

          <div className="form-group">
            <label>
              <FormattedMessage id="admin.manage-doctor.address-clinic" />
            </label>
            <input
              className="form-control"
              value={this.state.addressClinic}
              onChange={(e) => this.handleOnChangeText(e, "addressClinic")}
              placeholder={
                language === "vi" ? "Địa chỉ phòng khám" : "Clinic address"
              }
            />
          </div>
        </div>

        {/* --- Markdown Editor --- */}
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
