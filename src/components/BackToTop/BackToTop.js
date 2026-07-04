import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import chatbotIcon from '../../assets/chatbot/chatbot.png';
import './BackToTop.scss';

class BackToTop extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showBackToTop: false
        }
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
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

    handleOpenChatbot = () => {
        if (this.props.history) {
            this.props.history.push('/chatbot');
        }
    }

    render() {
        const pathname = this.props.location?.pathname || '';
        const hideChatbot = pathname.startsWith('/system') || pathname.startsWith('/doctor');

        return (
            <>
                {!hideChatbot && (
                    <button
                        className='chatbot-floating-button'
                        type='button'
                        aria-label='Mở chatbot'
                        onClick={this.handleOpenChatbot}
                    >
                        <img src={chatbotIcon} alt='' />
                    </button>
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
