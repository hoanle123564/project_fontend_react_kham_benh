import React, { Component } from 'react';
import { connect } from 'react-redux';
import DanTri from '../../../assets/communicate/dantrilogo.png'
import SucKhoeDoiSong from '../../../assets/communicate/suckhoedoisong.png'
import VNexpress from '../../../assets/communicate/vnexpress.png'
import VNNet from '../../../assets/communicate/vnnet.png'
import VTCNews from '../../../assets/communicate/vtcnews.png'
import VTV1 from '../../../assets/communicate/vtv1.png'
import { FormattedMessage } from 'react-intl';
class AboutUs extends Component {

    render() {


        return (
            <>
                <div className='section-share section-about'>
                    <div className='section-container'>
                        <div className='secton-header-about'>
                            <FormattedMessage id="banner.About-life-care" />
                        </div>
                        <div className='secton-body-about'>
                            <div className='secton-left-about'>
                                <iframe width="560" height="330"
                                    src="https://www.youtube.com/embed/HwGzmRVBsdw?list=PLearCtxlLjlcKWhwO3k9PGtDdxUNb6YCC"
                                    title="Medical Hospital Clinic Background Music For Videos" frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin" allowFullScreen >

                                </iframe>
                            </div>
                            <div className='secton-right-about'>
                                <div className='section-row'>
                                    <div className='section-items'>
                                        <img src={VNexpress} alt='VNexpress' />
                                    </div>
                                    <div className='section-items'>
                                        <img src={SucKhoeDoiSong} alt='SucKhoeDoiSong' />
                                    </div>
                                </div>
                                <div className='section-row'>
                                    <div className='section-items'>
                                        <img src={VNNet} alt='VNNet' />
                                    </div>
                                    <div className='section-items'>
                                        <img src={VTV1} alt='VTV1' />
                                    </div>
                                </div>
                                <div className='section-row'>
                                    <div className='section-items'>
                                        <img src={VTCNews} alt='VTCNews' />
                                    </div>
                                    <div className='section-items'>
                                        <img src={DanTri} alt='DanTri' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.patient.isLoggedIn
    };
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(AboutUs);