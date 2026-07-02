import React from "react";

const SlotCard = ({ slot, index, disabled, onSelect }) => {
  const number = slot.index || index + 1;

  return (
    <div className="chatbot-option-card">
      <div>
        <div className="chatbot-option-title">
          {number}. {slot.date || "Ngày khám"}
        </div>
        <div className="chatbot-option-meta">
          {[slot.start_time, slot.end_time].filter(Boolean).join(" - ")}
        </div>
      </div>
      <button type="button" disabled={disabled} onClick={() => onSelect(String(number))}>
        Chọn
      </button>
    </div>
  );
};

export default SlotCard;
