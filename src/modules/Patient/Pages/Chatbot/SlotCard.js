import React from "react";

const formatMoney = (value) => {
  const amount = Number(value);
  return Number.isInteger(amount) && amount > 0 ? `${amount.toLocaleString("vi-VN")}đ` : "";
};

const SlotCard = ({ slot, index, disabled, onSelect, readOnly = false }) => {
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
        {formatMoney(slot.effectivePrice || slot.price) && (
          <div className="chatbot-option-meta">Giá khám: {formatMoney(slot.effectivePrice || slot.price)}</div>
        )}
      </div>
      {readOnly ? (
        <span className="chatbot-option-readonly">Chỉ xem</span>
      ) : (
        <button type="button" disabled={disabled} onClick={() => onSelect(String(number))}>
          Chọn
        </button>
      )}
    </div>
  );
};

export default SlotCard;
