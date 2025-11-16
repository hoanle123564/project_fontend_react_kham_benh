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
      selectprovince: "",
      selectClinic: "",
      selectSpecialty: "",

      ListProvinces: [],
      ListDoctor: [],
      ListPrice: [],
      ListPayment: [],
      ListSpecialty: [],
      ListClinic: [],
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
      province: this.state.selectprovince.label,
      specialtyId: this.state.selectSpecialty.value,
      clinicId: this.state.selectClinic.value,
    });

    this.setState({
      contentMarkdown: "",
      contentHTML: "",
      selectDoctor: "",
      description: "",
      selectPrice: "",
      selectPayment: "",
      selectprovince: "",
      selectClinic: "",
      selectSpecialty: "",
    });
  };

  // Select change
  handleChangeSelect = async (e, name) => {
    console.log('name', name);
    console.log('e', e);

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
      let findSpecailty = this.state.ListSpecialty.find(item => item.value === res.specialtyId);
      let findProvince = this.state.ListProvinces.find(item => item.label === res.province);
      let findClinic = this.state.ListClinic.find(item => item.value === res.clinicId);
      if (res && res.contentHTML) {
        console.log('res', res);
        this.setState({
          contentHTML: res.contentHTML,
          contentMarkdown: res.contentMarkdown,
          description: res.description,
          selectPrice: findPrice || "",
          selectPayment: findItem || "",
          nameClinic: res.nameClinic,
          addressClinic: res.addressClinic,
          selectprovince: findProvince || "",
          selectSpecialty: findSpecailty || "",
          selectClinic: findClinic || "",
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
          selectprovince: "",
          selectSpecialty: "",
          selectClinic: "",
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
        if (type === "SPECIALTY") {
          let Object = {};
          Object.label = item.name;
          Object.value = item.id;
          result.push(Object);
        }
        if (type === "CLINIC") {
          let Object = {};
          Object.label = item.name;
          Object.value = item.id;
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
    this.props.GetAllSpecialty();
    this.props.getAllClinic();
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
      let ListSpec = this.buidlDataSelect(
        this.props.ListSpecialty,
        "SPECIALTY"
      );
      let ListClin = this.buidlDataSelect(
        this.props.ListClinic,
        "CLINIC"
      );
      //  Chuyển đổi danh sách tỉnh thành
      let ListProvinceFormatted = [];
      if (this.props.ListVietNamProvinces && this.props.ListVietNamProvinces.length > 0) {
        ListProvinceFormatted = this.props.ListVietNamProvinces.map(item => ({
          label: item,
          value: item,
        }));
      }

      this.setState({
        ListPrice: ListPri,
        ListPayment: ListPay,
        ListProvinces: ListProvinceFormatted,
        ListSpecialty: ListSpec,
        ListClinic: ListClin,
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


        {/* --- Thông tin bổ sung (chia 2 hàng: 3 + 2 cột) --- */}
        <div className="more-info-extra container">
          {/* Hàng 1: 3 cột */}
          <div className="row my-3">
            <div className="col-md-4">
              <label><FormattedMessage id="admin.manage-doctor.select-price" /></label>
              <Select
                value={this.state.selectPrice}
                onChange={this.handleChangeSelect}
                name="selectPrice"
                options={this.state.ListPrice}
                placeholder={language === "vi" ? "Chọn giá khám ..." : "Select examination fee ..."}
              />
            </div>

            <div className="col-md-4">
              <label><FormattedMessage id="admin.manage-doctor.payment" /></label>
              <Select
                value={this.state.selectPayment}
                onChange={this.handleChangeSelect}
                name="selectPayment"
                options={this.state.ListPayment}
                placeholder={language === "vi" ? "Chọn phương thức ..." : "Select payment method ..."}
              />
            </div>

            <div className="col-md-4">
              <label>Chọn tỉnh thành</label>
              <Select
                value={this.state.selectprovince}
                onChange={this.handleChangeSelect}
                name="selectprovince"
                options={this.state.ListProvinces}
                placeholder={language === "vi" ? "Chọn tỉnh thành ..." : "Select province ..."}
              />
            </div>
          </div>

          {/* Hàng 2: 2 cột */}


          {/* Hàng 2: 2 cột */}
          <div className="row my-4">
            <div className="col-md-6">
              <label>Chọn chuyên khoa</label>
              <Select
                value={this.state.selectSpecialty}
                onChange={this.handleChangeSelect}
                name="selectSpecialty"
                options={this.state.ListSpecialty}
                placeholder={language === "vi" ? "Chọn chuyên khoa ..." : "Select specialty ..."}
              />
            </div>

            <div className="col-md-6">
              <label>Chọn phòng khám</label>
              <Select
                value={this.state.selectClinic}
                onChange={this.handleChangeSelect}
                name="selectClinic"
                options={this.state.ListClinic}
                placeholder={language === "vi" ? "Chọn phòng khám ..." : "Select clinic ..."}
              />
            </div>
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
    ListVietNamProvinces: state.admin.vietnamProvinces,
    ListSpecialty: state.admin.specialty,
    ListClinic: state.admin.AllClinic,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllDoctor: () => dispatch(action.fetchAllDoctor()),
    SaveDetailDoctor: (data) => dispatch(action.SaveDetailDoctor(data)),
    GetDetailDoctor: (id) => dispatch(action.GetDetailDoctor(id)),
    GetDAllRequire: () => dispatch(action.GetDAllRequire()),
    GetAllSpecialty: () => dispatch(action.GetAllSpecialty()),
    getAllClinic: () => dispatch(action.GetAllClinic()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageDoctor);
