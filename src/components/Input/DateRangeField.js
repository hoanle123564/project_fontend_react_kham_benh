import React from "react";
import Flatpickr from "react-flatpickr";
import "./DatePicker.scss";
import "./DateRangeField.scss";

const DateRangeField = ({ id, className = "", value = [], onChange, placeholder, ...props }) => {
    const normalizedPlaceholder = String(placeholder || "").replace(/\?+/g, "\u2192");

    return (
        <div className={`date-range-field ${className}`.trim()}>
        <Flatpickr
            {...props}
            id={id}
            className="date-range-field__input"
            value={value}
            onChange={onChange}
            options={{
                mode: "range",
                dateFormat: "d/m/Y",
                conjunction: " \u2192 ",
                allowInput: false,
                disableMobile: true,
            }}
            placeholder={normalizedPlaceholder}
        />
        <i className="bi bi-calendar3" aria-hidden="true"></i>
        </div>
    );
};

export default DateRangeField;
