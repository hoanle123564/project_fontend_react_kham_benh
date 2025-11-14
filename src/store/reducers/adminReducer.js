import actionTypes from "../actions/actionTypes";

const initialState = {
  genderArr: [],
  positionArr: [],
  roleArr: [],
  user: [],
  doctor: [],
  AllDoctor: [],
  DetailDoctor: {},
  AllTime: [],
  vietnamProvinces: [
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bạc Liêu",
    "Bắc Giang",
    "Bắc Kạn",
    "Bắc Ninh",
    "Bến Tre",
    "Bình Dương",
    "Bình Định",
    "Bình Phước",
    "Bình Thuận",
    "Cà Mau",
    "Cao Bằng",
    "Cần Thơ",
    "Đà Nẵng",
    "Đắk Lắk",
    "Đắk Nông",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hà Giang",
    "Hà Nam",
    "Hà Nội",
    "Hà Tĩnh",
    "Hải Dương",
    "Hải Phòng",
    "Hậu Giang",
    "Hòa Bình",
    "Hưng Yên",
    "Khánh Hòa",
    "Kiên Giang",
    "Kon Tum",
    "Lai Châu",
    "Lạng Sơn",
    "Lào Cai",
    "Lâm Đồng",
    "Long An",
    "Nam Định",
    "Nghệ An",
    "Ninh Bình",
    "Ninh Thuận",
    "Phú Thọ",
    "Phú Yên",
    "Quảng Bình",
    "Quảng Nam",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Thừa Thiên Huế",
    "Tiền Giang",
    "TP. Hồ Chí Minh",
    "Trà Vinh",
    "Tuyên Quang",
    "Vĩnh Long",
    "Vĩnh Phúc",
    "Yên Bái",
  ],
  AllRequire: [],
  specialty: [],
  AllClinic: [],
};

const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    // gender
    case actionTypes.FETCH_GENDER:
      state.genderArr = action.data;
      return {
        ...state,
      };

    case actionTypes.FETCH_GENDER_FAIL:
      state.genderArr = [];
      return {
        ...state,
      };
    // positon
    case actionTypes.FETCH_POSITION:
      state.positionArr = action.data;
      return {
        ...state,
      };

    case actionTypes.FETCH_POSITION_FAIL:
      state.positionArr = [];
      return {
        ...state,
      };
    // role
    case actionTypes.FETCH_ROLE:
      state.roleArr = action.data;
      return {
        ...state,
      };

    case actionTypes.FETCH_ROLE_FAIL:
      state.roleArr = [];
      return {
        ...state,
      };
    // save / create user
    case actionTypes.SAVE_USER:
      return {
        ...state,
      };
    case actionTypes.SAVE_USER_FAILD:
      return {
        ...state,
      };
    // get all user
    case actionTypes.FETCH_USERS:
      state.user = action.data;
      return {
        ...state,
      };

    case actionTypes.FETCH_USERS_FAIL:
      state.user = [];
      return {
        ...state,
      };

    // get doctor
    case actionTypes.FETCH_DOCTOR:
      state.doctor = action.data;
      return {
        ...state,
      };

    case actionTypes.FETCH_DOCTOR_FAIL:
      state.doctor = [];
      return {
        ...state,
      };

    // get all doctor
    case actionTypes.FETCH_ALL_DOCTOR:
      state.AllDoctor = action.data;
      return {
        ...state,
      };
    case actionTypes.FETCH_ALL_DOCTOR_FAIL:
      state.AllDoctor = [];
      return {
        ...state,
      };

    // get detail doctor
    case actionTypes.GET_DETAIL_DOCTOR:
      state.DetailDoctor = action.data;
      return {
        ...state,
      };
    case actionTypes.GET_DETAIL_DOCTOR_FAIL:
      state.DetailDoctor = {};
      return {
        ...state,
      };

    // get all doctor
    case actionTypes.FETCH_ALL_HOUR:
      state.AllTime = action.data;
      return {
        ...state,
      };
    case actionTypes.FETCH_ALL_HOUR_FAIL:
      state.AllTime = [];
      return {
        ...state,
      };

    // get all require
    case actionTypes.FETCH_ALL_REQUIRED:
      state.AllRequire = action.data;
      return {
        ...state,
      };
    case actionTypes.FETCH_ALL_REQUIRED_FAIL:
      state.AllRequire = [];
      return {
        ...state,
      };

    // get all specialty
    case actionTypes.FETCH_ALL_SPECIALTY:
      state.specialty = action.data;
      return {
        ...state,
      };
    case actionTypes.FETCH_ALL_SPECIALTY_FAIL:
      state.specialty = [];
      return {
        ...state,
      };
    // get all clinic
    case actionTypes.FETCH_ALL_CLINIC:
      state.AllClinic = action.data;
      return {
        ...state,
      };
    case actionTypes.FETCH_ALL_CLINIC_FAIL:
      state.AllClinic = [];
      return {
        ...state,
      };

    default:
      return state;
  }

};

export default adminReducer;
