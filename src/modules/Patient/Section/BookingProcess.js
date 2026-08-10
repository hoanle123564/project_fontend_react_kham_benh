import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import './BookingProcess.scss';

class BookingProcess extends Component {
    render() {
        const steps = [
            {
                number: "01",
                titleKey: "homepage.booking-process.step1-title",
                descKey: "homepage.booking-process.step1-desc",
                icon: (
                    <svg className="step-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M11 8V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 11H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                )
            },
            {
                number: "02",
                titleKey: "homepage.booking-process.step2-title",
                descKey: "homepage.booking-process.step2-desc",
                icon: (
                    <svg className="step-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 14V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                )
            },
            {
                number: "03",
                titleKey: "homepage.booking-process.step3-title",
                descKey: "homepage.booking-process.step3-desc",
                icon: (
                    <svg className="step-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 11L11 13L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                )
            },
            {
                number: "04",
                titleKey: "homepage.booking-process.step4-title",
                descKey: "homepage.booking-process.step4-desc",
                icon: (
                    <svg className="step-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 14C20.49 12.54 22 10.79 22 8.5C22 7.0087 21.4029 5.57864 20.3402 4.52132C19.2776 3.464 17.8358 2.87 16.3333 2.87C14.75 2.87 13.5 3.5 12 5C10.5 3.5 9.25 2.87 7.66667 2.87C6.16417 2.87 4.72242 3.464 3.65979 4.52132C2.59717 5.57864 2 7.0087 2 8.5C2 10.79 3.51 12.54 5 14L12 21L19 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M10 10H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                )
            }
        ];

        return (
            <div className="booking-process-wrapper">
                <div className="container">
                    <div className="process-header">
                        <h2 className="process-title" data-aos="fade-up">
                            <FormattedMessage id="homepage.booking-process.title" />
                        </h2>
                        <p className="process-subtitle">
                            <FormattedMessage id="homepage.booking-process.subtitle" />
                        </p>
                    </div>
                    <div className="process-grid">
                        {steps.map((step, index) => (
                            <div
                                className="process-step-animation"
                                data-aos="fade-up"
                                data-aos-delay={index * 150}
                                key={index}
                            >
                                <div className="process-step-card">
                                    <div className="step-icon-container">
                                        <div className="step-badge">{step.number}</div>
                                        {step.icon}
                                    </div>
                                    <h3 className="step-title">
                                        <FormattedMessage id={step.titleKey} />
                                    </h3>
                                    <p className="step-desc">
                                        <FormattedMessage id={step.descKey} />
                                    </p>
                                    {index < steps.length - 1 && (
                                        <div className="step-connector">
                                            <svg viewBox="0 0 100 10" fill="none" preserveAspectRatio="none">
                                                <line x1="0" y1="5" x2="100" y2="5" stroke="#00a896" strokeWidth="2" strokeDasharray="5 5" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(null, null)(BookingProcess);
