import React from "react";
import Chatbot from "./Chatbot";
import "./Chatbot.scss";

const ChatbotPage = () => {
  return (
    <div className="chatbot-page">
      <div className="container-fluid">
        <Chatbot />
      </div>
    </div>
  );
};

export default ChatbotPage;
