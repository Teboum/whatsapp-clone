import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import ChatIcon from "@material-ui/icons/Chat";
import DonutLargeIcon from "@material-ui/icons/DonutLarge";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { Avatar, IconButton } from "@material-ui/core";
import { SearchOutlined } from "@material-ui/icons";
import SidebarChat from "./SidebarChat";
import { ChatState } from "./context/CharProvider";
import axios from "./axios";

function Sidebar() {
  const [input, setInput] = useState("");
  const [friendListSearch, setFriendListSearch] = useState([]);

  const {
    user,
    setUser,
    setToken,
    token,
    selectedChat,
    setSelectedChat,
    image,
    search,
    setSearch,
    setRemoteId,
  } = ChatState();
  const searchChange = (e) => {
    setInput(e.target.value);
    axios
      .get("/search-friend", {
        params: { value: e.target.value, userId: user._id },
      })
      .then(({ data }) => {
        setFriendListSearch(data);
      })
      .catch((err) => console.log(err));
  };

  const openChat = async (id) => {
    try {
      const { data } = await axios.get(`/set-chat?contactId=${id}`, {
        headers: { authorization: "Bearer " + token },
      });
      sessionStorage.setItem("selectedChat", data);
      setSelectedChat(data);
      setSearch(!search);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <Avatar src={image} />
        <div className="sidebar__headerRight">
          <IconButton>
            <DonutLargeIcon />
          </IconButton>
          <IconButton>
            <ChatIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </div>
      </div>
      <div className="sidebar__search" style={{ position: "relative" }}>
        <div className="sidebar__searchContainer">
          <SearchOutlined />
          <div className={search ? "search__container" : null}>
            <input
              placeholder="Search or start new chat"
              type="text"
              value={input}
              onChange={searchChange}
            />

            <ul
              className="dropdpwn"
              style={{
                minWidth: "23%",
                position: "absolute",
                backgroundColor: "white",
              }}
            >
              {friendListSearch.map((elem, i) => (
                <li
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid black",
                  }}
                  key={i}
                  className="dropdown__list"
                  onClick={() => {
                    openChat(elem._id);
                  }}
                >
                  <h4>{elem.name}</h4>
                  <p>
                    {elem.phone}
                    <span className={search ? "active" : null}>
                      {elem.active ? " Active" : ""}
                    </span>
                  </p>
                </li>
              ))}{" "}
            </ul>
          </div>
        </div>
      </div>
      <div className="sidebar__chats">
        <SidebarChat />
        <SidebarChat />
        <SidebarChat />
      </div>
    </div>
  );
}

export default Sidebar;
