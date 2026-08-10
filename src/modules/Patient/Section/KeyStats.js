import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { getPublicKeyStats } from '../../../services/userService';
import './KeyStats.scss';

const FALLBACK_VALUES = Object.freeze([50000, 500, 100, 98]);

const statDefinitions = [
    {
        labelKey: "homepage.key-stats.stat1-title",
        descKey: "homepage.key-stats.stat1-desc"
    },
    {
        labelKey: "homepage.key-stats.stat2-title",
        descKey: "homepage.key-stats.stat2-desc"
    },
    {
        labelKey: "homepage.key-stats.stat3-title",
        descKey: "homepage.key-stats.stat3-desc"
    },
    {
        labelKey: "homepage.key-stats.stat4-title",
        descKey: "homepage.key-stats.stat4-desc"
    }
];

const toNonNegativeInteger = (value) => {
    if (value === null || value === undefined || value === '') return null;

    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? Math.round(number) : null;
};

const normalizeKeyStats = (data) => {
    if (!data || typeof data !== 'object') return null;

    const values = [
        toNonNegativeInteger(data.patients),
        toNonNegativeInteger(data.doctors),
        toNonNegativeInteger(data.clinics),
        toNonNegativeInteger(data.satisfactionRate)
    ];

    if (values.some((value) => value === null) || values[3] > 100) return null;
    return values;
};

const resolveKeyStats = (response) => {
    if (response?.errCode !== 0) return [...FALLBACK_VALUES];
    return normalizeKeyStats(response.data) || [...FALLBACK_VALUES];
};

const trimCompactNumber = (number) => String(Number(number.toFixed(1)));

const formatCompactCount = (value) => {
    const number = toNonNegativeInteger(value) || 0;

    if (number >= 1000000) {
        return { value: trimCompactNumber(number / 1000000), suffix: 'M+' };
    }

    if (number >= 1000) {
        return { value: trimCompactNumber(number / 1000), suffix: 'K+' };
    }

    return { value: String(number), suffix: number > 0 ? '+' : '' };
};

const formatStatValue = (value, index) => {
    if (index === 3) {
        return { value: String(Math.min(toNonNegativeInteger(value) || 0, 100)), suffix: '%' };
    }

    return formatCompactCount(value);
};

class KeyStats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isCountingStarted: false,
            statValues: [...FALLBACK_VALUES],
            counts: [...FALLBACK_VALUES]
        };
        this.sectionRef = React.createRef();
        this.observer = null;
        this.counterInterval = null;
        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;
        this.loadStats();

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
        this._isMounted = false;
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        if (this.counterInterval) {
            clearInterval(this.counterInterval);
            this.counterInterval = null;
        }
    }

    loadStats = async () => {
        try {
            const response = await getPublicKeyStats();
            const statValues = resolveKeyStats(response);

            if (!this._isMounted) return;

            this.setState({ statValues }, () => {
                if (this.state.isCountingStarted && !this.counterInterval) {
                    this.setState({ counts: [...statValues] });
                }
            });
        } catch (error) {
            console.log('loadPublicKeyStats error:', error);
        }
    };

    startCounting = () => {
        if (this.state.isCountingStarted) return;
        this.setState({ isCountingStarted: true, counts: [0, 0, 0, 0] });

        const duration = 1500; // Animation duration in ms
        const steps = 50;
        const stepTime = Math.floor(duration / steps);
        let currentStep = 0;

        this.counterInterval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            // Ease out quad formula: progress * (2 - progress)
            const easeProgress = progress * (2 - progress);

            const newCounts = this.state.statValues.map((value) => {
                return Math.floor(easeProgress * value);
            });

            this.setState({ counts: newCounts });

            if (currentStep >= steps) {
                clearInterval(this.counterInterval);
                this.counterInterval = null;
                this.setState({
                    counts: [...this.state.statValues]
                });
            }
        }, stepTime);
    }

    render() {
        return (
            <div className="key-stats-wrapper" ref={this.sectionRef}>
                <div className="container">
                    <div className="stats-header">
                        <h2 className="stats-title" data-aos="fade-up">
                            <FormattedMessage id="homepage.key-stats.title" />
                        </h2>
                        <p className="stats-subtitle">
                            <FormattedMessage id="homepage.key-stats.subtitle" />
                        </p>
                    </div>

                    <div className="stats-grid">
                        {statDefinitions.map((stat, index) => {
                            const formattedValue = formatStatValue(this.state.counts[index], index);

                            return (
                                <div
                                    className="stat-card-animation"
                                    data-aos="fade-up"
                                    data-aos-delay={index * 150}
                                    key={index}
                                >
                                    <div className="stat-card">
                                        <div className="stat-value-container">
                                            <span className="stat-number">
                                                {formattedValue.value}
                                            </span>
                                            <span className="stat-suffix">{formattedValue.suffix}</span>
                                        </div>
                                        <h3 className="stat-label">
                                            <FormattedMessage id={stat.labelKey} />
                                        </h3>
                                        <p className="stat-desc">
                                            <FormattedMessage id={stat.descKey} />
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

export {
    FALLBACK_VALUES,
    formatCompactCount,
    formatStatValue,
    normalizeKeyStats,
    resolveKeyStats
};

export default connect(null, null)(KeyStats);
