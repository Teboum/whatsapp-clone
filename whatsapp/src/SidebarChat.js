import React, { useEffect, useState } from "react";
import "./SidebarChat.css";
import { Avatar } from "@material-ui/core";
import { ChatState } from "./context/CharProvider";
import { Buffer } from "buffer";

function SidebarChat({ contact, chat }) {
  const { setSelectedChat, setSearch, selectedChat } = ChatState();
  const [pic, setPic] = useState(false);
  console.log(chat);
  return (
    <div
      className={`sidebarChat ${
        chat._id === selectedChat._id ? "selected-chat" : ""
      }`}
      onClick={() => {
        setSearch((prev) => !prev);
        setSelectedChat(chat);
      }}
    >
      <Avatar src={contact.picture} />
      <div className="sidebarChat__info">
        <h2>{contact.name}</h2>
        <p>{chat.lastMessage}</p>
      </div>
    </div>
  );
}

export default SidebarChat;
