import React from "react";
import moment from "moment";

const getName = (person = {}) =>
  `${person.firstName || ""} ${person.lastName || ""}`.replace(/\s+/g, " ").trim() || "-";

const getInitial = (person = {}) => getName(person).slice(0, 1).toUpperCase();

const ChatList = ({
  rooms,
  selectedRoomId,
  isLoading,
  getText,
  language,
  onSelectRoom,
  searchValue,
  onSearch,
}) => (
  <aside className="chat-list">
    <div className="chat-list__header">
      <h3>{getText("rooms")}</h3>
      <span>{rooms.length}</span>
    </div>
    <label className="chat-list__search">
      <i className="bi bi-search" aria-hidden="true" />
      <input value={searchValue} onChange={(event) => onSearch(event.target.value)} placeholder={getText("searchPlaceholder")} aria-label={getText("searchPlaceholder")} />
    </label>

    <div className="chat-list__items">
      {rooms.length > 0 ? (
        rooms.map((room) => {
          const selected = Number(selectedRoomId) === Number(room.id);
          const timeLabel = language === "vi" ? room.timeTypeVi : room.timeTypeEn;
          const dateLabel = room.appointmentDate
            ? moment(room.appointmentDate).format("DD/MM/YYYY")
            : "-";
          const messageTime = room.lastMessageAt
            ? moment(room.lastMessageAt).format(moment(room.lastMessageAt).isSame(moment(), "day") ? "HH:mm" : "DD/MM")
            : "";
          const image = room.opponent?.image ? `data:image/jpeg;base64,${room.opponent.image}` : null;

          return (
            <button
              type="button"
              key={room.id}
              className={`chat-list__item ${selected ? "selected" : ""}`}
              onClick={() => onSelectRoom(room)}
            >
              <div className="chat-list__avatar">
                {image ? <img src={image} alt="" /> : getInitial(room.opponent)}
              </div>
              <div className="chat-list__content">
                <strong>{getName(room.opponent)}</strong>
                <span>{dateLabel} · {timeLabel || room.timeType || "-"}</span>
                <p>{room.lastMessage || getText("noMessages")}</p>
              </div>
              <time>{messageTime}</time>
              {room.unreadCount > 0 && (
                <em>{room.unreadCount > 99 ? "99+" : room.unreadCount}</em>
              )}
            </button>
          );
        })
      ) : (
        <div className="chat-list__empty">
          {isLoading ? getText("loading") : searchValue ? getText("noResults") : getText("empty")}
        </div>
      )}
    </div>
  </aside>
);

export default ChatList;
