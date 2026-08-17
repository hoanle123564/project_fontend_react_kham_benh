import MedicalRecordWorkspace from "./MedicalRecordWorkspace";
import { closeMedicalRecord } from "../../../services/userService";

jest.mock("react-toastify", () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

jest.mock("../../../services/userService", () => ({
    closeMedicalRecord: jest.fn(),
    completeMedicalRecordVisit: jest.fn(),
    ensureDoctorMedicalRecord: jest.fn(),
    getMedicalRecordDetail: jest.fn(),
    saveMedicalRecordDraft: jest.fn(),
    saveMedicalRecordParaclinicalResults: jest.fn(),
    saveMedicalRecordPrescription: jest.fn(),
}));

const MedicalRecordWorkspacePage = MedicalRecordWorkspace.WrappedComponent;
const intl = {
    formatMessage: ({ defaultMessage, id }) => defaultMessage || id,
};

const createPage = () => {
    const page = new MedicalRecordWorkspacePage({
        intl,
        selectedItem: { medicalRecordId: 7 },
        selectedVisitDetail: {
            id: 8,
            medicalRecordId: 7,
            statusId: "VS3",
        },
    });

    page.setState = (update) => {
        const nextState = typeof update === "function" ? update(page.state, page.props) : update;
        page.state = { ...page.state, ...nextState };
    };
    page.state.record = { statusId: "MR1" };
    return page;
};

describe("medical record close confirmation modal", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("opens and cancels without calling the close API", () => {
        const page = createPage();

        page.openCloseRecordModal();
        expect(page.state.closeModalOpen).toBe(true);
        expect(closeMedicalRecord).not.toHaveBeenCalled();

        page.closeCloseRecordModal();
        expect(page.state.closeModalOpen).toBe(false);
        expect(closeMedicalRecord).not.toHaveBeenCalled();
    });

    test("calls the API once after confirmation and locks the modal while pending", async () => {
        let resolveClose;
        closeMedicalRecord.mockReturnValue(
            new Promise((resolve) => {
                resolveClose = resolve;
            })
        );
        const page = createPage();

        page.openCloseRecordModal();
        const closeRequest = page.handleCloseRecord();

        expect(closeMedicalRecord).toHaveBeenCalledTimes(1);
        expect(closeMedicalRecord).toHaveBeenCalledWith({ medicalRecordId: 7 });
        expect(page.state.isClosing).toBe(true);
        expect(page.state.closeModalOpen).toBe(true);

        page.closeCloseRecordModal();
        expect(page.state.closeModalOpen).toBe(true);

        resolveClose({ errCode: 0, data: { id: 7, statusId: "MR2" } });
        await closeRequest;

        expect(page.state.isClosing).toBe(false);
        expect(page.state.closeModalOpen).toBe(false);
    });
});
