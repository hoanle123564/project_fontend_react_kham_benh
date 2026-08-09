import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { FormattedMessage } from 'react-intl';
import chatbotIcon from '../../assets/chatbot/chatbot.png';
import './BackToTop.scss';

class BackToTop extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showBackToTop: false,
            showChatbotTooltip: false
        }
        this.timerId = null;
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);

        this.timerId = setTimeout(() => {
            this.setState({ showChatbotTooltip: true });
        }, 1500);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
    }

    handleScroll = () => {
        if (window.scrollY > 0) {
            this.setState({ showBackToTop: true });
        } else {
            this.setState({ showBackToTop: false });
        }
    }

    handleBackToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    dismissChatbotTooltip = (e) => {
        if (e) {
            e.stopPropagation();
        }
        this.setState({ showChatbotTooltip: false });
    }

    handleOpenChatbot = () => {
        if (this.props.history) {
            this.props.history.push('/chatbot');
        }
    }

    render() {
        const pathname = this.props.location?.pathname || '';
        const hideChatbot = pathname.startsWith('/system') || pathname.startsWith('/doctor');
        const { showChatbotTooltip } = this.state;

        return (
            <>
                {!hideChatbot && (
                    <div className="chatbot-floating-container">
                        {showChatbotTooltip && (
                            <div className="chatbot-tooltip-bubble">
                                <span className="tooltip-text">
                                    <FormattedMessage id="homepage.chatbot.tooltip" />
                                </span>
                                <button
                                    type="button"
                                    className="tooltip-close-btn"
                                    onClick={this.dismissChatbotTooltip}
                                    aria-label="Đóng gợi ý"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                                <div className="tooltip-arrow"></div>
                            </div>
                        )}
                        <button
                            className='chatbot-floating-button'
                            type='button'
                            aria-label='Mở chatbot'
                            onClick={this.handleOpenChatbot}
                        >
                            <img src={chatbotIcon} alt='' />
                        </button>
                    </div>
                )}
                {this.state.showBackToTop && (
                    <button className='back-to-top' onClick={this.handleBackToTop}>
                        <i className="fa-solid fa-angle-up"></i>
                    </button>
                )}
            </>
        );
    }
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BackToTop));
