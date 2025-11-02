import React, { Component } from 'react';
import { connect } from 'react-redux'; // kết nối như router
import './HomeHeader.scss'
// thêm các ảnh thừ assets
import logoSrc from '../../assets/logo2.png';
import iconChuyenKhoa from '../../assets/icon-khoa/iconkham-chuyen-khoa.png';
import iconNhaKhoa from '../../assets/icon-khoa/iconkham-nha-khoa.png';
import iconCTongquat from '../../assets/icon-khoa/iconkham-tong-quan.png';
import iconTuXa from '../../assets/icon-khoa/iconkham-tu-xa.png';
import iconSuckhoeTinhthan from '../../assets/icon-khoa/iconsuc-khoe-tinh-than.png';
import iconXetNghiep from '../../assets/icon-khoa/iconxet-nghiem-y-hoc.png';
import vietnam from '../../assets/flag/vietnam.png'
import united from '../../assets/flag/united_kingdom.png'
import { FormattedMessage } from 'react-intl';  // chuyển đổi ngôn ngữ
import { languages } from '../../utils/constant';
import { changeLangguageApp } from '../../store/actions/appActions';



class HomeHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            changeLanguage: true
        }
    }
    change = (language) => {
        this.props.changeLangguageAppRedux(language);
        // this.setState({
        //     changeLanguage: !this.state.changeLanguage
        // })
    }

    render() {
        // let language = this.state.changeLanguage;

        // Lấy đường dẫn ảnh từ file message
        const { language } = this.props;
        // chọn cờ dựa trên language1
        const flagSrc = language === languages.VI ? vietnam : united;

        return (
            <>
                <div className='home-header-container'>
                    <div className='home-header-content'>
                        <div className='left-content'>
                            <i className="fa-solid fa-bars"></i>
                            <img src={logoSrc} alt="logo" />
                            {/* <div className='header-logo'></div> */}
                        </div>
                        <div className='center-content'>
                            <div className='child-content'>
                                <div><b><FormattedMessage id='home-header.specility' /> </b></div>
                            </div>
                            <div className='child-content'>
                                <div><b><FormattedMessage id='home-header.place_home' /> </b></div>
                            </div>
                            <div className='child-content'>
                                <div><b><FormattedMessage id='home-header.place_hospital' /></b></div>
                            </div>
                            <div className='child-content'>
                                <div><b><FormattedMessage id='home-header.message' /></b></div>
                            </div>
                        </div>
                        <div className='right-content'>
                            <div className='support'>
                                <span>
                                    <i className="fa-solid fa-circle-question"></i>
                                    <FormattedMessage id='home-header.support' />
                                </span>
                            </div>
                            {flagSrc ?
                                (language === languages.VI ?
                                    <div className='language-vi' onClick={() => this.change(languages.EN)}>
                                        <img src={flagSrc} alt='vietnam' width='30' /> <FormattedMessage id='home-header.language' />
                                    </div>
                                    :
                                    <div className='language-en' onClick={() => this.change(languages.VI)}>
                                        <img src={flagSrc} alt='united' width='30' /> <FormattedMessage id='home-header.language' />
                                    </div>
                                )
                                : null
                            }
                        </div>
                    </div>

                </div>
                {this.props.showBanner === true &&
                    <div className='home-header-banner '>
                        <div className='content-up pt-5'>
                            <div className='title1'><FormattedMessage id='banner.title1' /></div>
                            <div className='search '>
                                <i className="fa-solid fa-magnifying-glass"></i>
                                <input type='text' placeholder='Tìm kiếm ....' />
                            </div>
                        </div>
                        <div className='content-down'>
                            <div className='options'>
                                {/* Chuyên khoa */}
                                <div className='option-child'>
                                    <div className='icon-child'>
                                        <img src={iconChuyenKhoa} alt='icon khám chuyên khoa' />
                                    </div>
                                    <div className='text-child'><FormattedMessage id='banner.child1' /></div>
                                </div>
                                {/* Chuyên khoa */}
                                <div className='option-child'>
                                    <div className='icon-child'>
                                        <img src={iconNhaKhoa} alt='icon khám nha khoa' />
                                    </div>
                                    <div className='text-child'><FormattedMessage id='banner.child2' /></div>
                                </div>
                                {/* Chuyên khoa */}
                                <div className='option-child'>
                                    <div className='icon-child'>
                                        <img src={iconCTongquat} alt='icon khám tổng quát' />
                                    </div>
                                    <div className='text-child'><FormattedMessage id='banner.child3' /></div>
                                </div>
                                {/* Chuyên khoa */}
                                <div className='option-child'>
                                    <div className='icon-child'>
                                        <img src={iconTuXa} alt='icon khám từ xa' />
                                    </div>
                                    <div className='text-child'><FormattedMessage id='banner.child4' /></div>
                                </div>
                                {/* Chuyên khoa */}
                                <div className='option-child'>
                                    <div className='icon-child'>
                                        <img src={iconSuckhoeTinhthan} alt='icon sức khỏe tinh thần' />
                                    </div>
                                    <div className='text-child'><FormattedMessage id='banner.child5' /></div>
                                </div>
                                {/* Chuyên khoa */}
                                <div className='option-child'>
                                    <div className='icon-child'>
                                        <img src={iconXetNghiep} alt='icon xét ngiệm' />
                                    </div>
                                    <div className='text-child'><FormattedMessage id='banner.child6' /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        language: state.app.language,
        userInfo: state.user.userInfo   // <-- thêm dòng này nếu cần hiển thị thông tin user

    };
};

const mapDispatchToProps = dispatch => {
    return {
        changeLangguageAppRedux: (languages) => dispatch(changeLangguageApp(languages))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeHeader);