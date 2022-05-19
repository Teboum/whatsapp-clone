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
import { Buffer } from "buffer";

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
    friendList,
    setFriendList,
    setSelectedPic,
  } = ChatState();
  const searchChange = (e) => {
    setInput(e.target.value);
    if (e.target.value === "") {
      setFriendListSearch([]);
    } else {
      axios
        .get("/search-friend", {
          params: { value: e.target.value, userId: user._id },
        })
        .then(({ data }) => {
          setFriendListSearch(data);
        })
        .catch((err) => console.log(err));
    }
  };
  useEffect(() => {
    axios
      .get(`/friend-list?_id=${user._id}`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then(({ data }) => {
        setFriendList(data.chats);
      })
      .catch((err) => {
        console.log(err);
        if (err.message === "invalid Token") {
          setUser(false);
          localStorage.setItem("user", false);
        }
      });

    return () => {};
  }, []);
  const openChat = async (id) => {
    try {
      const { data } = await axios.get(`/set-chat?contactId=${id}`, {
        headers: { Authorization: "Bearer " + token },
      });
      sessionStorage.setItem("selectedChat", data);
      setSelectedChat(data);
      setFriendListSearch([]);
      setSearch(!search);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <Avatar src={user.picture} />
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
        {friendList.map((elem, i) =>
          elem.users.map((ey, iy) => {
            if (ey._id !== user._id) {
              return <SidebarChat key={i} chat={elem} contact={ey} />;
            }
          })
        )}
      </div>
    </div>
  );
}

export default Sidebar;
