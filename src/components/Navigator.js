import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import './Navigator.scss';

class Navigator extends Component {
    state = {
        openMenuKey: null,
    };

    componentDidMount() {
        this.autoOpenActiveMenu();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.location !== this.props.location) {
            this.autoOpenActiveMenu();
        }
    }

    autoOpenActiveMenu = () => {
        const { menus, location } = this.props;
        if (!menus) return;

        for (let gi = 0; gi < menus.length; gi++) {
            const group = menus[gi];
            if (!group.menus) continue;
            for (let mi = 0; mi < group.menus.length; mi++) {
                const menu = group.menus[mi];
                const subMenus = menu.subMenus || [];

                if (subMenus.length > 0) {
                    const isActive = subMenus.some(s => s.link === location.pathname);
                    if (isActive) {
                        this.setState({ openMenuKey: `${gi}_${mi}` });
                        return;
                    }
                }
            }
        }
    };

    toggleMenu = (key) => {
        this.setState(prev => ({
            openMenuKey: prev.openMenuKey === key ? null : key
        }));
    };

    isMenuActive = (menu) => {
        const { location } = this.props;
        if (menu.link) {
            return location.pathname === menu.link;
        }
        if (menu.subMenus) {
            return menu.subMenus.some(s => s.link === location.pathname);
        }
        return false;
    };

    isSubMenuActive = (link) => {
        return this.props.location.pathname === link;
    };

    render() {
        const { menus, onLinkClick } = this.props;
        const { openMenuKey } = this.state;

        if (!menus || menus.length === 0) return null;

        return (
            <ul className="navigator-menu list-unstyled mb-0">
                {menus.map((group, gi) => (
                    <li key={gi} className="nav-group">
                        {/* Group label */}
                        <div className="nav-group-label">
                            {group.icon && <svg className={`${group.icon} nav-group-icon`} />}
                            <span className="nav-group-title">
                                <FormattedMessage id={group.name} />
                            </span>
                        </div>

                        {/* Group menus */}
                        {group.menus && (
                            <ul className="list-unstyled mb-0">
                                {group.menus.map((menu, mi) => {
                                    const key = `${gi}_${mi}`;
                                    const hasSubMenu = menu.subMenus && menu.subMenus.length > 0;
                                    const isOpen = openMenuKey === key;
                                    const isActive = this.isMenuActive(menu);

                                    return (
                                        <li key={mi}>
                                            {hasSubMenu ? (
                                                <>
                                                    {/* Menu item with collapse */}
                                                    <button
                                                        className={`nav-menu-item w-100 text-start border-0 bg-transparent d-flex align-items-center justify-content-between${isActive ? ' active' : ''}`}
                                                        onClick={() => this.toggleMenu(key)}
                                                        aria-expanded={isOpen}
                                                    >
                                                        <span><FormattedMessage id={menu.name} /></span>
                                                        <i className={`fas fa-chevron-${isOpen ? 'down' : 'right'} nav-arrow`} />
                                                    </button>

                                                    {/* Sub-menu collapse */}
                                                    <div className={`nav-collapse${isOpen ? ' show' : ''}`}>
                                                        <ul className="list-unstyled mb-0 nav-submenu-list">
                                                            {menu.subMenus.map((sub, si) => {
                                                                const subActive = this.isSubMenuActive(sub.link);
                                                                return (
                                                                    <li key={si}>
                                                                        <Link
                                                                            to={sub.link}
                                                                            className={`nav-submenu-item d-block${subActive ? ' active' : ''}`}
                                                                            onClick={onLinkClick}
                                                                        >
                                                                            <FormattedMessage id={sub.name} />
                                                                        </Link>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                </>
                                            ) : (
                                                /* Menu item without sub-menu — no arrow */
                                                <Link
                                                    to={menu.link}
                                                    className={`nav-menu-item d-flex align-items-center${isActive ? ' active' : ''}`}
                                                    onClick={onLinkClick}
                                                >
                                                    <i className={`${menu.icon} nav-group-icon`} />
                                                    <span><FormattedMessage id={menu.name} /></span>
                                                </Link>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        );
    }
}

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

const withRouterInnerRef = (WrappedComponent) => {
    class InnerComponentWithRef extends Component {
        render() {
            const { forwardRef, ...rest } = this.props;
            return <WrappedComponent {...rest} ref={forwardRef} />;
        }
    }
    const ComponentWithRef = withRouter(InnerComponentWithRef, { withRef: true });
    return React.forwardRef((props, ref) => (
        <ComponentWithRef {...props} forwardRef={ref} />
    ));
};

export default withRouterInnerRef(connect(mapStateToProps, mapDispatchToProps)(Navigator));
