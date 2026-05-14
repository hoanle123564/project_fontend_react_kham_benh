import React, { Component } from 'react';
import { connect } from 'react-redux';
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

    render() {
        return (
            <>
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

export default connect(mapStateToProps, mapDispatchToProps)(BackToTop);