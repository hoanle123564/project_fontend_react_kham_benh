import './HomeFooter.scss';
import logoBooking from '../../assets/logo3.png';

const HomeFooter = () => {
    return (
        <footer className="home-footer">
            <div className="footer-content">
                {/* CỘT 1 - Thông tin công ty */}
                <div className="footer-col company-info">
                    <h4>Công ty Cổ phần Công nghệ LifeCare</h4>
                    <p><i className="fas fa-map-marker-alt"></i> Lô B4/D21, Khu đô thị mới Cầu Giấy, Phường Dịch Vọng Hậu, Quận Cầu Giấy, TP Hà Nội</p>
                    <p><i className="fas fa-id-card"></i> ĐKKD số 0106790291. Sở KHĐT Hà Nội cấp ngày 16/03/2015</p>
                    <p><i className="fas fa-phone"></i> 024-7301-2468 (7h30 - 18h)</p>
                    <p><i className="fas fa-envelope"></i> support@lifecare.vn (7h30 - 18h)</p>
                    <h5>Văn phòng tại TP Hồ Chí Minh</h5>
                    <p><i className="fas fa-map-marker-alt"></i> Tòa nhà H3, 384 Hoàng Diệu, Phường 6, Quận 4, TP.HCM</p>
                </div>

                {/* CỘT 2 - Logo & Liên kết */}
                <div className="footer-col links">
                    <div className="footer-logo">
                        <img src={logoBooking} alt="LifeCare Logo" />
                    </div>
                    <ul>
                        <li>Liên hệ hợp tác</li>
                        <li>Chuyển đổi số</li>
                        <li>Chính sách bảo mật</li>
                        <li>Quy chế hoạt động</li>
                        <li>Tuyển dụng</li>
                        <li>Điều khoản sử dụng</li>
                        <li>Câu hỏi thường gặp</li>
                        <li>Sức khỏe doanh nghiệp</li>
                    </ul>
                </div>

                {/* CỘT 3 - Đối tác */}
                <div className="footer-col partners">
                    <h4>Đối tác bảo trợ nội dung</h4>

                    <div className="partner">
                        <strong>Hello Doctor</strong>
                        <p>Bảo trợ chuyên mục nội dung "Sức khỏe tinh thần"</p>
                    </div>

                    <div className="partner">
                        <strong>Hệ thống y khoa chuyên sâu quốc tế Bernard</strong>
                        <p>Bảo trợ chuyên mục nội dung "Y khoa chuyên sâu"</p>
                    </div>

                    <div className="partner">
                        <strong>Doctor Check - Tầm Soát Bệnh Để Sống Thọ Hơn</strong>
                        <p>Bảo trợ chuyên mục nội dung "Sức khỏe tổng quát"</p>
                    </div>
                </div>

            </div>

            {/* DÒNG DƯỚI CÙNG */}
            <div className="footer-bottom">
                <span>© 2025 LifeCare.</span>
                <div className="socials">
                    <a href="https://www.tiktok.com" target="_blank" rel="noreferrer" className="tiktok">
                        <i className="fab fa-tiktok"></i>
                    </a>
                    <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="facebook">
                        <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="https://www.youtube.com" target="_blank" rel="noreferrer" className="youtube">
                        <i className="fab fa-youtube"></i>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default HomeFooter;
