import React, { Component } from "react";
import { connect } from "react-redux";
import "./ClinicChoRay.scss";
import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import ChoRay from '../../../../assets/ChoRay/benh-vien-cho-ray.png'
import quy_trinh from '../../../../assets/ChoRay/164236-khu-nhan-benh--huong-dan.jpg'
import so_do from '../../../../assets/ChoRay/160246-so-do-bv-rut-gon.jpg'
class ClinicChoRay extends Component {
    render() {
        const infoSections = [
            {
                title: "Giới thiệu",
                image: ChoRay,

                content: [
                    "Địa chỉ: 201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP. Hồ Chí Minh.",
                    "Bệnh viện Chợ Rẫy là bệnh viện đa khoa trung ương hạng đặc biệt, trực thuộc Bộ Y tế, là một trong những cơ sở y tế lâu đời và lớn nhất Việt Nam.",
                    "Được thành lập từ năm 1900, trải qua hơn một thế kỷ phát triển, bệnh viện đã trở thành trung tâm y tế hàng đầu trong khu vực Đông Nam Á, đảm nhiệm công tác khám, chữa bệnh, đào tạo, nghiên cứu khoa học và chỉ đạo tuyến.",
                    "Hiện nay, Bệnh viện Chợ Rẫy có quy mô hơn 4.000 nhân viên, trong đó có hàng trăm giáo sư, tiến sĩ, bác sĩ chuyên khoa đầu ngành, phục vụ hơn 10.000 lượt khám mỗi ngày.",
                    "Bệnh viện tiếp nhận bệnh nhân từ các tỉnh, đặc biệt là khu vực miền Nam và Tây Nam Bộ, đồng thời hợp tác với nhiều bệnh viện quốc tế như Nhật Bản, Hàn Quốc, Pháp, Hoa Kỳ..."
                ]
            },
            {
                title: "Thế mạnh chuyên môn",
                content: [
                    "Bệnh viện Chợ Rẫy có hơn 40 khoa lâm sàng, 10 khoa cận lâm sàng và 11 phòng chức năng, với thế mạnh trong nhiều lĩnh vực.",
                    "Một số chuyên khoa mũi nhọn: Ngoại thần kinh, Tim mạch, Huyết học – Truyền máu, Chấn thương chỉnh hình, Phẫu thuật tiêu hóa, Ung bướu, Tiết niệu, Nội tiết – Đái tháo đường, Gan mật tụy, và Hồi sức cấp cứu.",
                    "Khoa Phẫu thuật tim, ghép thận, ghép gan và ghép giác mạc của bệnh viện nằm trong nhóm dẫn đầu cả nước.",
                    "Ngoài ra, bệnh viện còn nổi bật trong lĩnh vực xét nghiệm và chẩn đoán hình ảnh, sở hữu nhiều thiết bị hiện đại như máy MRI, CT-scan 640 lát cắt, PET/CT, và hệ thống phẫu thuật robot.",
                    "Bệnh viện là nơi thực hiện nhiều ca phẫu thuật khó và các kỹ thuật cao được chuyển giao cho tuyến dưới."
                ]
            },
            {
                title: "Sơ đồ Bệnh viện Chợ Rẫy",
                image: so_do,
                content: []
            },
            {
                title: "Quy trình đi khám",
                image: quy_trinh,
                content: [
                    "Bước 1: Đặt khám online qua BookingCare hoặc gọi tổng đài 1900 7123 để lấy số khám.",
                    "Bước 2: Đến khu tiếp nhận bệnh nhân tại Nhà A (Cổng số 1 – 201B Nguyễn Chí Thanh) hoặc Nhà D (Cổng số 6 – 184 Bà Triệu) trước giờ hẹn 30 phút.",
                    "Bước 3: Đăng ký, đóng phí, nhận số thứ tự và chờ tại khu khám bệnh theo chuyên khoa đã chọn.",
                    "Bước 4: Thực hiện khám lâm sàng, cận lâm sàng (nếu có chỉ định xét nghiệm, chụp X-quang, siêu âm...).",
                    "Bước 5: Nhận kết quả, đơn thuốc hoặc hướng dẫn nhập viện (nếu cần).",
                    "Lưu ý: Khi đi khám nên mang theo thẻ BHYT, CMND/CCCD, giấy chuyển tuyến (nếu có) để được hưởng quyền lợi bảo hiểm y tế đúng tuyến.",
                    "Giờ làm việc: Từ thứ 2 đến thứ 6 (7h00 – 16h00); thứ 7 làm việc buổi sáng (7h00 – 11h00). Bệnh viện nghỉ chiều thứ 7, Chủ nhật và các ngày lễ."
                ]
            },
            {
                title: "Giá khám bệnh",
                content: [
                    "Chi phí khám thường: 38.700 VNĐ/lượt (đối với người bệnh không có BHYT).",
                    "Khám dịch vụ tại các phòng VIP: dao động từ 150.000 – 500.000 VNĐ/lượt, tùy theo chuyên khoa và bác sĩ.",
                    "Chi phí xét nghiệm, chụp X-quang, siêu âm, CT, MRI... được tính riêng theo quy định của Bộ Y tế và bảng giá của bệnh viện.",
                    "Bệnh viện có chính sách hỗ trợ và miễn giảm cho bệnh nhân nghèo, người có công với cách mạng và các đối tượng chính sách.",
                    "Người bệnh có thể thanh toán qua thẻ ngân hàng, ví điện tử hoặc quầy thu phí trực tiếp."
                ]
            },
            {
                title: "Lý do nên chọn Bệnh viện Chợ Rẫy",
                content: [
                    "Bệnh viện Chợ Rẫy là một trong những bệnh viện có đội ngũ chuyên gia y tế hàng đầu Việt Nam, nhiều bác sĩ đạt danh hiệu Thầy thuốc Nhân dân, Thầy thuốc Ưu tú.",
                    "Cơ sở vật chất hiện đại, khu khám bệnh mới rộng rãi, có hệ thống đặt hẹn trước giúp giảm thời gian chờ.",
                    "Là bệnh viện tuyến cuối của cả nước, có khả năng xử lý các ca bệnh phức tạp, hiếm gặp mà nhiều nơi khác không thể điều trị.",
                    "Là cơ sở thực hành của nhiều trường Đại học Y Dược lớn: ĐH Y Dược TP.HCM, ĐH Phạm Ngọc Thạch...",
                    "Bệnh viện có đội ngũ tình nguyện viên và phòng công tác xã hội hỗ trợ hướng dẫn, đưa đón bệnh nhân khó khăn.",
                    "Người bệnh đánh giá cao về chất lượng điều trị, thái độ phục vụ chuyên nghiệp và sự tận tâm của nhân viên y tế."
                ]
            }
        ];

        return (
            <div className="clinic-choray-page">
                <HomeHeader showBanner={false} />

                <div className="clinic-choray-container">
                    <div className="clinic-choray-content">

                        <div className="clinic-header-card">
                            <div className="clinic-logo">
                                <img src={ChoRay} alt="Logo Bệnh viện Chợ Rẫy" />
                            </div>
                            <div className="clinic-title">
                                <h2>Bệnh viện Chợ Rẫy</h2>
                                <p>201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP. Hồ Chí Minh</p>
                            </div>
                        </div>


                        {infoSections.map((section, index) => (
                            <div key={index} className="clinic-section">
                                <h3>{section.title}</h3>

                                {section.content.map((line, idx) => (
                                    <p key={idx}>{line}</p>
                                ))}
                                {section.image && (
                                    <div className="clinic-section-image">
                                        <img src={section.image} alt={section.title} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <HomeFooter />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        language: state.app.language,
    };
};

export default connect(mapStateToProps)(ClinicChoRay);
