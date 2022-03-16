import React from "react";
import "./SidebarChat.css";
import { Avatar } from "@material-ui/core";
import { ChatState } from "./context/CharProvider";

function SidebarChat({ user, chat }) {
  const { setSelectedChat, setSearch } = ChatState();
  return (
    <div
      className="sidebarChat"
      onClick={() => {
        setSearch((prev) => !prev);
        setSelectedChat(chat);
      }}
    >
      <Avatar src={user.picture} />
      <div className="sidebarChat__info">
        <h2>{user.name}</h2>
        <p>{chat.lastMessage}</p>
      </div>
    </div>
  );
}

export default SidebarChat;
