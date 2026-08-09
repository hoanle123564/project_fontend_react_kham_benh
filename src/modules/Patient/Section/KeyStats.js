import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import './KeyStats.scss';

const stats = [
    {
        value: 50,
        suffix: "K+",
        labelKey: "homepage.key-stats.stat1-title",
        descKey: "homepage.key-stats.stat1-desc"
    },
    {
        value: 500,
        suffix: "+",
        labelKey: "homepage.key-stats.stat2-title",
        descKey: "homepage.key-stats.stat2-desc"
    },
    {
        value: 100,
        suffix: "+",
        labelKey: "homepage.key-stats.stat3-title",
        descKey: "homepage.key-stats.stat3-desc"
    },
    {
        value: 98,
        suffix: "%",
        labelKey: "homepage.key-stats.stat4-title",
        descKey: "homepage.key-stats.stat4-desc"
    }
];

class KeyStats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isCountingStarted: false,
            counts: [0, 0, 0, 0]
        };
        this.sectionRef = React.createRef();
        this.observer = null;
        this.counterInterval = null;
    }

    componentDidMount() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.startCounting();
                        if (this.observer) {
                            this.observer.disconnect();
                            this.observer = null;
                        }
                    }
                });
            }, {
                threshold: 0.1
            });

            if (this.sectionRef.current) {
                this.observer.observe(this.sectionRef.current);
            }
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            this.startCounting();
        }
    }

    componentWillUnmount() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        if (this.counterInterval) {
            clearInterval(this.counterInterval);
            this.counterInterval = null;
        }
    }

    startCounting = () => {
        if (this.state.isCountingStarted) return;
        this.setState({ isCountingStarted: true });

        const duration = 1500; // Animation duration in ms
        const steps = 50;
        const stepTime = Math.floor(duration / steps);
        let currentStep = 0;

        this.counterInterval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            // Ease out quad formula: progress * (2 - progress)
            const easeProgress = progress * (2 - progress);

            const newCounts = stats.map((stat) => {
                return Math.floor(easeProgress * stat.value);
            });

            this.setState({ counts: newCounts });

            if (currentStep >= steps) {
                clearInterval(this.counterInterval);
                this.counterInterval = null;
                this.setState({
                    counts: stats.map(s => s.value)
                });
            }
        }, stepTime);
    }

    render() {
        return (
            <div className="key-stats-wrapper" ref={this.sectionRef}>
                <div className="container">
                    <div className="stats-header">
                        <h2 className="stats-title">
                            <FormattedMessage id="homepage.key-stats.title" />
                        </h2>
                        <p className="stats-subtitle">
                            <FormattedMessage id="homepage.key-stats.subtitle" />
                        </p>
                    </div>

                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div className="stat-card" key={index}>
                                <div className="stat-value-container">
                                    <span className="stat-number">
                                        {this.state.counts[index]}
                                    </span>
                                    <span className="stat-suffix">{stat.suffix}</span>
                                </div>
                                <h3 className="stat-label">
                                    <FormattedMessage id={stat.labelKey} />
                                </h3>
                                <p className="stat-desc">
                                    <FormattedMessage id={stat.descKey} />
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(null, null)(KeyStats);
