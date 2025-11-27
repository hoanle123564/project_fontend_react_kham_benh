import './HomeFooter.scss';
import logoBooking from '../../../assets/logo3.png';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { languages } from '../../../utils/constant';

const HomeFooter = ({ language }) => {
    return (
        <footer className="home-footer">
            <div className="footer-content">
                {/* CỘT 1 - Thông tin công ty */}
                <div className="footer-col company-info">
                    <h4>
                        <FormattedMessage
                            id="footer.company-name"
                            defaultMessage="Công ty Cổ phần Công nghệ LifeCare"
                        />
                    </h4>
                    <p>
                        <i className="fas fa-map-marker-alt"></i>
                        {language === languages.VI
                            ? 'Lô B4/D21, Khu đô thị mới Cầu Giấy, Phường Dịch Vọng Hậu, Quận Cầu Giấy, TP Hà Nội'
                            : 'B4/D21, Cau Giay New Urban Area, Dich Vong Hau Ward, Cau Giay District, Hanoi'
                        }
                    </p>
                    <p>
                        <i className="fas fa-id-card"></i>
                        {language === languages.VI
                            ? 'ĐKKD số 0106790291. Sở KHĐT Hà Nội cấp ngày 16/03/2015'
                            : 'Business Registration No. 0106790291. Issued by Hanoi Department of Planning and Investment on March 16, 2015'
                        }
                    </p>
                    <p>
                        <i className="fas fa-phone"></i> 024-7301-2468
                        {language === languages.VI ? '(7h30 - 18h)' : '(7:30 AM - 6:00 PM)'}
                    </p>
                    <p>
                        <i className="fas fa-envelope"></i> support@lifecare.vn
                        {language === languages.VI ? '(7h30 - 18h)' : '(7:30 AM - 6:00 PM)'}
                    </p>
                    <h5>
                        <FormattedMessage
                            id="footer.office-hcm"
                            defaultMessage="Văn phòng tại TP Hồ Chí Minh"
                        />
                    </h5>
                    <p>
                        <i className="fas fa-map-marker-alt"></i>
                        {language === languages.VI
                            ? 'Tòa nhà H3, 384 Hoàng Diệu, Phường 6, Quận 4, TP.HCM'
                            : 'H3 Building, 384 Hoang Dieu, Ward 6, District 4, Ho Chi Minh City'
                        }
                    </p>
                </div>

                {/* CỘT 2 - Logo & Liên kết */}
                <div className="footer-col links">
                    <div className="footer-logo">
                        <img src={logoBooking} alt="LifeCare Logo" />
                    </div>
                    <ul>
                        <li><FormattedMessage id="footer.contact-cooperation" defaultMessage="Liên hệ hợp tác" /></li>
                        <li><FormattedMessage id="footer.digital-transformation" defaultMessage="Chuyển đổi số" /></li>
                        <li><FormattedMessage id="footer.privacy-policy" defaultMessage="Chính sách bảo mật" /></li>
                        <li><FormattedMessage id="footer.operating-regulations" defaultMessage="Quy chế hoạt động" /></li>
                        <li><FormattedMessage id="footer.recruitment" defaultMessage="Tuyển dụng" /></li>
                        <li><FormattedMessage id="footer.terms-of-use" defaultMessage="Điều khoản sử dụng" /></li>
                        <li><FormattedMessage id="footer.faq" defaultMessage="Câu hỏi thường gặp" /></li>
                        <li><FormattedMessage id="footer.corporate-health" defaultMessage="Sức khỏe doanh nghiệp" /></li>
                    </ul>
                </div>

                {/* CỘT 3 - Đối tác */}
                <div className="footer-col partners">
                    <h4>
                        <FormattedMessage
                            id="footer.content-partners"
                            defaultMessage="Đối tác bảo trợ nội dung"
                        />
                    </h4>

                    <div className="partner">
                        <strong>Hello Doctor</strong>
                        <p>
                            <FormattedMessage
                                id="footer.partner-mental-health"
                                defaultMessage='Bảo trợ chuyên mục nội dung "Sức khỏe tinh thần"'
                            />
                        </p>
                    </div>

                    <div className="partner">
                        <strong>
                            {language === languages.VI
                                ? 'Hệ thống y khoa chuyên sâu quốc tế Bernard'
                                : 'Bernard International Advanced Medical System'
                            }
                        </strong>
                        <p>
                            <FormattedMessage
                                id="footer.partner-advanced-medical"
                                defaultMessage='Bảo trợ chuyên mục nội dung "Y khoa chuyên sâu"'
                            />
                        </p>
                    </div>

                    <div className="partner">
                        <strong>
                            {language === languages.VI
                                ? 'Doctor Check - Tầm Soát Bệnh Để Sống Thọ Hơn'
                                : 'Doctor Check - Disease Screening For Longer Life'
                            }
                        </strong>
                        <p>
                            <FormattedMessage
                                id="footer.partner-general-health"
                                defaultMessage='Bảo trợ chuyên mục nội dung "Sức khỏe tổng quát"'
                            />
                        </p>
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

const mapStateToProps = (state) => ({
    language: state.app.language,
});

export default connect(mapStateToProps)(HomeFooter);
