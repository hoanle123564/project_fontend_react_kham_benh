import React, { Component } from "react";
import moment from "moment";

import { buildImageSrc } from "../../../../services/userService";
import "./PostHeroHeader.scss";

class PostHeroHeader extends Component {
  render() {
    const { title, date, bannerImage } = this.props;
    const imageSrc = buildImageSrc(bannerImage);
    const formattedDate =
      date && moment(date).isValid() ? moment(date).format("DD/MM/YYYY") : "";

    return (
      <section
        className={`post-hero-header ${imageSrc ? "has-banner" : "is-fallback"}`}
        style={imageSrc ? { backgroundImage: `url(${imageSrc})` } : undefined}
      >
        <div className="post-hero-overlay"></div>
        <div className="container post-hero-content">
          <h1>{title || ""}</h1>
          {formattedDate && (
            <div className="post-hero-date">
              <i className="far fa-calendar-alt"></i>
              <span>{formattedDate}</span>
            </div>
          )}
        </div>
      </section>
    );
  }
}

export default PostHeroHeader;
