import React, { useEffect, useRef, useState } from "react";
import "./Chat.css";
import { Avatar, IconButton } from "@material-ui/core";
import { SearchOutlined, AttachFile, MoreVert } from "@material-ui/icons";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import MicIcon from "@material-ui/icons/Mic";
import axios from "./axios";
import { ChatState } from "./context/CharProvider";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:9000";
var socket;

function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [inRoom, setInRoom] = useState([]);
  const [displayNotifications, setDisplayNotifications] = useState(false);
  const [prevSelectedId, setPrevSelectedId] = useState("");

  const [test, setTest] = useState(false);

  const socketRef = useRef(null);

  const {
    user,
    selectedChat,
    search,
    chat,
    notifications,
    setNotifications,
    remoteId,
    setRemoteId,
  } = ChatState();

  useEffect(() => {
    if (socketRef.current == null) {
      socketRef.current = io(ENDPOINT);
    }
    socket = socketRef.current;
    socket.emit("setup", user._id);

    return () => socket.close();
  }, []);

  useEffect(() => {
    socket.on("message received", (newMessage) => {
      if (
        selectedChat._id &&
        selectedChat.users.find((e) => {
          console.log(e._id, newMessage);
          return e._id === newMessage.sender;
        })
      ) {
        setMessages([...messages, newMessage]);
      } else {
        setNotifications([...notifications, newMessage]);
      }
    });
    socket.on("inRoom", (id) => {
      console.log(inRoom);
      if (inRoom.find((e) => e.id === id)) {
        setInRoom((prev) => {
          let state = [...prev];
          state[state.map((e) => e.id).indexOf(id)].status = true;
          return state;
        });
      } else {
        setInRoom((prev) => {
          let state = [...prev];
          return [...state, { id: id, status: true }];
        });
      }
    });
    socket.on("leave", (id) => {
      console.log(inRoom, id);
      if (inRoom.find((e) => e.id === id && selectedChat._id)) {
        setInRoom((prev) => {
          let state = [...prev];
          state[state.map((e) => e.id).indexOf(id)].status = false;
          return state;
        });
      }
    });

    return () => {
      socket.off();
    };
  });

  useEffect(() => {
    if (selectedChat && selectedChat._id) {
      setMessages([]);
      if (remoteId) {
        socket.emit("outRoom", {
          id: user._id,
          remoteId: remoteId,
        });
      }
      axios
        .get(`/messages/sync?chatId=${selectedChat._id}`)
        .then(({ data }) => {
          setMessages(data);
          socket.emit("inRoom", {
            id: user._id,
            remoteId: selectedChat.users.find((e) => {
              return e._id !== user._id;
            })._id,
          });

          setRemoteId(selectedChat.users.find((e) => e._id !== user._id)._id);
        });
    }
    return;
  }, [search]);
  useEffect(() => {
    console.log(inRoom);
  }, [test]);
  const sendMessage = async (e) => {
    e.preventDefault();
    var date = new Date();
    date = date.toString();
    try {
      const { data } = await axios.post("messages/new", {
        message: input,
        sender: user._id,
        _id: selectedChat._id,
        userName: user.name,
      });
      socket.emit("newMessage", {
        message: input,
        sender: user._id,
        remoteId: selectedChat.users.find((e) => e._id !== user._id)._id,
      });
      setMessages([...messages, data]);
    } catch (err) {
      console.log(err);
    }
    setInput("");
  };
  const notificationsHandler = (i) => {
    setNotifications(notifications.splice(i, 1));
  };

  return (
    <div className="chat">
      <div className="chat__header">
        <Avatar />
        <div className="chat__headerInfo">
          <h3>Room name</h3>
          {selectedChat._id &&
            inRoom.find(
              (e) =>
                e.id === selectedChat.users.find((e) => e._id !== user._id)._id
            ) &&
            inRoom.find(
              (e) =>
                e.id === selectedChat.users.find((e) => e._id !== user._id)._id
            ).status && <strong style={{ color: "green" }}>In Room</strong>}

          <p>Last seen at ...</p>
        </div>
        <div className="chat__headerRight">
          <IconButton>
            <SearchOutlined />
          </IconButton>
          <IconButton>
            <AttachFile />
          </IconButton>
          <IconButton
            style={{ position: "relative" }}
            onClick={() =>
              notifications.length > 0 &&
              setDisplayNotifications(!displayNotifications)
            }
          >
            {!displayNotifications && <span>{notifications.length}</span>}
            <MoreVert />

            {displayNotifications && (
              <ul
                id="ntifications"
                style={{
                  position: "absolute",
                  display: "block",
                  top: "60%",
                  right: "10%",
                  backgroundColor: "white",
                  display: "flex",
                  flexDirection: "column",

                  justifyContent: "center",
                  alignItems: "space-between",
                }}
              >
                {notifications.map((e, i) => {
                  console.log(notifications);
                  return (
                    <li
                      id="notification"
                      style={{
                        borderBottom: "1px solid black",
                        listStyleType: "none",
                      }}
                      key={i}
                      onClick={() => notificationsHandler(i)}
                    >
                      <h4>{e.name}</h4>
                      <p>{e.message}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </IconButton>
        </div>
      </div>
      <div className="chat__body">
        {messages.map((message, i) => (
          <p
            key={i}
            className={`chat__message ${
              message.sender === user._id && "chat__receiver"
            }`}
          >
            <span className="chat__name">{message.name}</span>
            {message.message}
            <span className="chat__timestamp">{message.timestamp}</span>
          </p>
        ))}
      </div>
      <div className="chat__footer">
        <InsertEmoticonIcon />
        <form>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
          />
          <button onClick={sendMessage} type="submit">
            send a message
          </button>
        </form>
        <MicIcon />
      </div>
    </div>
  );
}

export default Chat;
