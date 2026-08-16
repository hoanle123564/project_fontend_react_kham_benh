jest.mock("../../../store/actions", () => ({
  fetchGender: jest.fn(),
  fetchPosition: jest.fn(),
  fetchRole: jest.fn(),
  saveUser: jest.fn(),
}));

jest.mock("../../../services/userService", () => ({
  getLookUp: jest.fn(),
}));

import { UserRedux } from "./UserRedux";

const intl = {
  formatMessage: ({ defaultMessage }) => defaultMessage || "",
};

const validFields = {
  email: "doctor@example.com",
  password: "password",
  firstName: "An",
  lastName: "Doctor",
  phoneNumber: "0123456789",
  address: "1 Clinic Street",
  provinceCode: "01",
  districtCode: "001",
  wardCode: "00001",
};

const createForm = (props = {}) => {
  const form = new UserRedux({
    language: "en",
    intl,
    clinicManagerMode: true,
    onSave: jest.fn(),
    ...props,
  });

  form.setState = (update) => {
    const nextState =
      typeof update === "function" ? update(form.state, form.props) : update;
    form.state = { ...form.state, ...nextState };
  };
  Object.assign(form.state, validFields);
  return form;
};

describe("UserRedux clinic manager mode", () => {
  test("fixes the role to R2 and submits through onSave", async () => {
    const onSave = jest.fn().mockResolvedValue({ errCode: 0 });
    const form = createForm({ onSave });
    form.state.isModalOpen = true;

    form.handleChangeInput({ target: { value: "R1" } }, "role");
    await form.handleSaveUser();

    expect(form.state.role).toBe("R2");
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ roleId: "R2" })
    );
    expect(form.state.isModalOpen).toBe(false);
  });

  test("keeps the modal open when onSave fails", async () => {
    const form = createForm({
      onSave: jest.fn().mockResolvedValue({ errCode: 409 }),
    });
    form.state.isModalOpen = true;

    await form.handleSaveUser();

    expect(form.state.isModalOpen).toBe(true);
    expect(form.state.isSaving).toBe(false);
  });

  test("keeps the existing R1 saveUser flow", async () => {
    const saveUser = jest.fn();
    const form = createForm({
      clinicManagerMode: false,
      onSave: undefined,
      saveUser,
    });
    form.state.isModalOpen = true;

    await form.handleSaveUser();

    expect(saveUser).toHaveBeenCalledWith(
      expect.objectContaining({ roleId: "" })
    );
    expect(form.state.isModalOpen).toBe(false);
  });
});
