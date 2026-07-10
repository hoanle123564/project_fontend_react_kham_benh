import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import HomeHeader from "../../Layout/HomeHeader";
import HomeFooter from "../../Layout/HomeFooter";
import "./DetailClinic.scss";
import * as action from "../../../../store/actions";
import DoctorSchdule from "../Doctor/DoctorSchdule";
import DoctorExtendInfo from "../Doctor/DoctorExtendInfo";
import { buildImageSrc, getDetailClinicBySlug } from "../../../../services/userService";
import BackToTop from "../../../../components/BackToTop/BackToTop";
import "react-quill/dist/quill.snow.css";

const BOOKING_KEY = "booking";
const BOOKING_TITLE = "\u0110\u1eb7t l\u1ecbch kh\u00e1m";
const IMAGE_CAPTION_CLASS = "clinic-detail-image-caption";

const getActiveSortedDoctors = (doctors = []) =>
    [...doctors]
        .filter((doctor) => Number(doctor.isActive) === 1)
        .sort((a, b) => {
            const orderA = Number(a.displayOrder) || 0;
            const orderB = Number(b.displayOrder) || 0;

            if (orderA !== orderB) return orderA - orderB;
            return Number(a.id) - Number(b.id);
        });

const hasVisibleContent = (value) =>
    String(value || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .trim().length > 0;

const getContentSectionKey = (section = {}) => {
    if (section.id) return `content-${section.id}`;
    if (section.displayOrder) return `content-order-${section.displayOrder}`;
    return `content-${String(section.title || "").trim() || "section"}`;
};

const hasCaptionAfterImage = (image) => {
    let node = image.nextSibling;

    while (node) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) return true;

        if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            if (tagName !== "br" && node.textContent.trim()) return true;
        }

        node = node.nextSibling;
    }

    return false;
};

const renderClinicSectionHTML = (html = "") => {
    if (typeof DOMParser === "undefined" || typeof Node === "undefined") {
        return html;
    }

    const documentBody = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html").body;
    const root = documentBody.firstElementChild;

    root.querySelectorAll("img").forEach((image) => {
        const parent = image.parentElement;
        if (parent && parent.tagName.toLowerCase() === "p") {
            parent.classList.add("clinic-detail-image-block");
        }

        const title = String(image.getAttribute("title") || "").trim();
        if (!title || hasCaptionAfterImage(image)) return;

        const caption = documentBody.ownerDocument.createElement("span");
        caption.className = IMAGE_CAPTION_CLASS;
        caption.textContent = title;
        image.insertAdjacentElement("afterend", caption);
    });

    return root.innerHTML;
};

class DetailClinic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ListDoctor: [],
            DetailClinic: [],
            ListDoctorId: [],
            activeSectionKey: "",
        };
        this.sectionRefs = {};
        this.scrollFrame = null;
    }

    async componentDidMount() {
        this.props.fetchTopDoctor();
        await this.fetchClinicDetail("ALL");
        window.addEventListener("scroll", this.handleScroll, { passive: true });
    }

    async componentDidUpdate(prevProps, prevState) {
        const prevSlug = prevProps.match?.params?.slug;
        const currentSlug = this.props.match?.params?.slug;

        if (prevSlug !== currentSlug) {
            await this.fetchClinicDetail("ALL");
            return;
        }

        if (
            prevProps.ListDoctor !== this.props.ListDoctor ||
            prevState.ListDoctorId !== this.state.ListDoctorId
        ) {
            const { ListDoctorId } = this.state;
            const { ListDoctor } = this.props;

            if (ListDoctorId.length > 0 && ListDoctor.length > 0) {
                const filterDoctors = getActiveSortedDoctors(
                    ListDoctor.filter((doc) => ListDoctorId.includes(doc.id))
                );

                this.setState({ ListDoctor: filterDoctors }, this.ensureActiveSection);
            }
        }

        if (
            prevState.DetailClinic !== this.state.DetailClinic ||
            prevState.ListDoctor !== this.state.ListDoctor
        ) {
            this.ensureActiveSection();
        }
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.handleScroll);
        if (this.scrollFrame) {
            window.cancelAnimationFrame(this.scrollFrame);
        }
    }

    getClinic = () => {
        const { DetailClinic } = this.state;
        return Array.isArray(DetailClinic) ? DetailClinic[0] || {} : DetailClinic || {};
    };

    getContentSections = () => {
        const sections = this.getClinic()?.contentSections || [];

        return [...sections]
            .filter((section) =>
                Number(section.isActive) === 1 &&
                hasVisibleContent(section.contentHTML)
            )
            .sort((a, b) => {
                const orderA = Number(a.displayOrder) || 0;
                const orderB = Number(b.displayOrder) || 0;

                if (orderA !== orderB) return orderA - orderB;
                return Number(a.id) - Number(b.id);
            });
    };

    getNavItems = () => {
        const items = [];

        if (this.state.ListDoctor.length > 0) {
            items.push({ key: BOOKING_KEY, title: BOOKING_TITLE });
        }

        this.getContentSections().forEach((section) => {
            items.push({
                key: getContentSectionKey(section),
                title: section.title,
            });
        });

        return items;
    };

    setSectionRef = (key) => (node) => {
        if (node) {
            this.sectionRefs[key] = node;
        }
    };

    ensureActiveSection = () => {
        const navItems = this.getNavItems();
        if (navItems.length === 0) return;

        const currentExists = navItems.some((item) => item.key === this.state.activeSectionKey);
        const shouldUseFirst = !currentExists || window.scrollY < 20;

        if (shouldUseFirst && this.state.activeSectionKey !== navItems[0].key) {
            this.setState({ activeSectionKey: navItems[0].key });
        }
    };

    handleScroll = () => {
        if (this.scrollFrame) return;

        this.scrollFrame = window.requestAnimationFrame(() => {
            this.scrollFrame = null;
            const navItems = this.getNavItems();
            if (navItems.length === 0) return;

            let activeKey = navItems[0].key;
            const offset = 145;

            navItems.forEach((item) => {
                const node = this.sectionRefs[item.key];
                if (node && node.getBoundingClientRect().top <= offset) {
                    activeKey = item.key;
                }
            });

            if (activeKey !== this.state.activeSectionKey) {
                this.setState({ activeSectionKey: activeKey });
            }
        });
    };

    fetchClinicDetail = async (location) => {
        const slug = this.props.match?.params?.slug;
        if (!slug) return;

        const res = await getDetailClinicBySlug(slug, location);
        if (res && res.errCode === 0) {
            const data = res.data || [];
            const doctorClinic = data[0]?.doctorClinic || [];
            const arrDoctor = [];

            doctorClinic.forEach((item) => {
                arrDoctor.push(item.doctorId);
            });

            this.setState({
                DetailClinic: data,
                ListDoctorId: arrDoctor,
                activeSectionKey: "",
            }, this.ensureActiveSection);
        }
    };

    handleViewDetailDoctor = (doctor) => {
        const targetSlug = doctor?.slug || doctor?.id;
        if (targetSlug) {
            this.props.history.push(`/detail-doctor/${targetSlug}`);
        }
    };

    scrollToSection = (key) => {
        const node = this.sectionRefs[key];
        if (!node) return;

        this.setState({ activeSectionKey: key });
        node.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    renderHero = () => {
        const clinic = this.getClinic();
        const bannerSrc = buildImageSrc(clinic.banner_img || clinic.image);
        const logoSrc = buildImageSrc(clinic.image);
        const fallbackLetter = String(clinic.name || "C").trim().charAt(0).toUpperCase() || "C";

        return (
            <section
                className={`clinic-detail-hero ${bannerSrc ? "clinic-detail-hero--image" : "clinic-detail-hero--fallback"}`}
                style={bannerSrc ? { backgroundImage: `url(${bannerSrc})` } : undefined}
            >
                <div className="clinic-detail-hero__overlay">
                    <div className="clinic-detail-hero__content">
                        <div className="clinic-detail-hero__logo">
                            {logoSrc ? (
                                <img src={logoSrc} alt={clinic.name || "Cơ sở y tế"} />
                            ) : (
                                <span>{fallbackLetter}</span>
                            )}
                        </div>
                        <div className="clinic-detail-hero__main">
                            <h1>{clinic.name || ""}</h1>
                            {clinic.address && (
                                <div className="clinic-detail-hero__address">
                                    <i className="fa-solid fa-location-dot"></i>
                                    <span>{clinic.address}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        );
    };

    renderNav = () => {
        const navItems = this.getNavItems();
        if (navItems.length === 0) return null;

        const activeKey = this.state.activeSectionKey || navItems[0].key;

        return (
            <nav className="clinic-detail-nav">
                <div className="clinic-detail-nav__inner">
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            className={activeKey === item.key ? "active" : ""}
                            onClick={() => this.scrollToSection(item.key)}
                        >
                            {item.title}
                        </button>
                    ))}
                </div>
            </nav>
        );
    };

    renderBookingSection = () => {
        const { ListDoctor } = this.state;
        if (!ListDoctor || ListDoctor.length === 0) return null;

        return (
            <section
                className="clinic-detail-section clinic-detail-booking-section"
                ref={this.setSectionRef(BOOKING_KEY)}
            >
                <h2>{BOOKING_TITLE}</h2>
                <div className="detail-specialty-body">
                    {ListDoctor.map((item) => {
                        const doctorImage = buildImageSrc(item.image) || "/default-doctor.png";

                        return (
                            <div className="each-doctor" key={item.id}>
                                <div className="dt-content-left">
                                    <div className="doctor-image">
                                        <img src={doctorImage} alt="avatar" />
                                    </div>
                                    <div className="doctor-info">
                                        <strong>
                                            {item.positionVi}, {item.firstName} {item.lastName}
                                        </strong>
                                        <div className="doctor-description">
                                            {item.description ||
                                                "Bác sĩ có nhiều năm kinh nghiệm khám và điều trị."}
                                        </div>

                                        <button
                                            type="button"
                                            className="see-more"
                                            onClick={() => this.handleViewDetailDoctor(item)}
                                        >
                                            Xem thêm
                                        </button>
                                    </div>
                                </div>

                                <div className="dt-content-right">
                                    <DoctorSchdule doctorId={item.id} doctorProfile={item} />
                                    <DoctorExtendInfo doctorId={item.id} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        );
    };

    renderContentSections = () =>
        this.getContentSections().map((section) => {
            const key = getContentSectionKey(section);

            return (
                <section
                    className="clinic-detail-section clinic-detail-content-section"
                    key={key}
                    ref={this.setSectionRef(key)}
                >
                    <h2>{section.title}</h2>
                    <div
                        className="clinic-detail-content-section__body ql-editor"
                        dangerouslySetInnerHTML={{
                            __html: renderClinicSectionHTML(section.contentHTML || ""),
                        }}
                    />
                </section>
            );
        });

    render() {
        return (
            <>
                <HomeHeader showBanner={false} />
                <BackToTop />
                <main className="clinic-detail-page">
                    {this.renderHero()}
                    {this.renderNav()}
                    <div className="clinic-detail-container container">
                        {this.renderBookingSection()}
                        {this.renderContentSections()}
                    </div>
                </main>
                <HomeFooter />
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
    ListDoctor: state.admin.doctor,
});

const mapDispatchToProps = (dispatch) => ({
    fetchTopDoctor: () => dispatch(action.fetchTopDoctor()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DetailClinic));
