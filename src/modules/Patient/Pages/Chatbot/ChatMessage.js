import React from "react";

const ChatMessage = ({ message }) => {
  return (
    <div className={`chatbot-message ${message.role === "user" ? "is-user" : "is-bot"}`}>
      <div className="chatbot-message-bubble">
        {message.text.split("\n").map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < message.text.split("\n").length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ChatMessage;
