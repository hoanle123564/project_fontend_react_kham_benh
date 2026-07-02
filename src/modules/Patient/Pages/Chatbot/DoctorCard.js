import React from "react";

const DoctorCard = ({ doctor, index, disabled, onSelect }) => {
  const number = doctor.index || index + 1;
  const consultation = doctor.supports_online ? "Online" : "Tại phòng khám";

  return (
    <div className="chatbot-option-card">
      <div>
        <div className="chatbot-option-title">
          {number}. {doctor.name || "Bác sĩ"}
        </div>
        <div className="chatbot-option-meta">{doctor.specialty || "Chuyên khoa chưa rõ"}</div>
        <div className="chatbot-option-meta">
          {[doctor.city, consultation, doctor.price].filter(Boolean).join(" • ")}
        </div>
      </div>
      <button type="button" disabled={disabled} onClick={() => onSelect(String(number))}>
        Chọn
      </button>
    </div>
  );
};

export default DoctorCard;
