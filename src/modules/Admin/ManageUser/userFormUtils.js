export const loadLocationOptions = async (getLookUp, provinceCode = "", districtCode = "") => {
  const [provinceRes, districtRes, wardRes] = await Promise.all([
    getLookUp("PROVINCE"),
    provinceCode ? getLookUp("DISTRICT", provinceCode) : Promise.resolve({ data: [] }),
    districtCode ? getLookUp("WARD", districtCode) : Promise.resolve({ data: [] }),
  ]);

  return {
    provinceOptions: provinceRes?.errCode === 0 ? provinceRes.data || [] : [],
    districtOptions: districtRes?.errCode === 0 ? districtRes.data || [] : [],
    wardOptions: wardRes?.errCode === 0 ? wardRes.data || [] : [],
  };
};

export const loadDistrictOptions = async (getLookUp, provinceCode) => {
  if (!provinceCode) return { districtOptions: [], wardOptions: [] };

  const response = await getLookUp("DISTRICT", provinceCode);
  return {
    districtOptions: response?.errCode === 0 ? response.data || [] : [],
    wardOptions: [],
  };
};

export const loadWardOptions = async (getLookUp, districtCode) => {
  if (!districtCode) return { wardOptions: [] };

  const response = await getLookUp("WARD", districtCode);
  return { wardOptions: response?.errCode === 0 ? response.data || [] : [] };
};

export const getUserLocationFieldState = (field, value, roleField, positionField) => {
  const nextState = { [field]: value };

  if (field === roleField && value !== "R2") nextState[positionField] = "";
  if (field === "provinceCode") {
    nextState.districtCode = "";
    nextState.wardCode = "";
    nextState.districtOptions = [];
    nextState.wardOptions = [];
  }
  if (field === "districtCode") {
    nextState.wardCode = "";
    nextState.wardOptions = [];
  }

  return nextState;
};
