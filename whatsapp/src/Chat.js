import React, { useEffect, useRef, useState } from 'react';
import './Chat.css';
import { Avatar, IconButton } from '@material-ui/core';
import { SearchOutlined, MoreVert } from '@material-ui/icons';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import MicIcon from '@material-ui/icons/Mic';
import { BiLogOut } from 'react-icons/bi';
import SendIcon from '@material-ui/icons/Send';
import axios from './axios';
import { ChatState } from './context/CharProvider';
import io from 'socket.io-client';
import { useReactMediaRecorder } from 'react-media-recorder';
import CancelIcon from '@material-ui/icons/Cancel';
import Audio from './Audio';
import Cookies from 'js-cookie';

const ENDPOINT = 'https://whatsclone.onrender.com/';
var socket;

function Chat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [inRoom, setInRoom] = useState([]);
  const [displayNotifications, setDisplayNotifications] = useState(false);
  const [limit, setLimit] = useState(15);
  const [media, setMedia] = useState();
  const [scrollBoolean, setScrollBoolean] = useState(true);
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({
      audio: true,
    });

  const step = 5;
  const chatBody = useRef(null);
  const socketRef = useRef(null);
  const chatMessage = useRef(null);

  const {
    user,
    setUser,
    selectedChat,
    setSelectedChat,
    search,
    setSearch,
    notifications,
    setNotifications,
    remoteId,
    setRemoteId,
    setFriendList,
    selectedPic,
    friendList,
    setSelectedPic,
    selectedUser,
    setSelectedUser,
  } = ChatState();

  useEffect(() => {
    mediaBlobUrl &&
      fetch(mediaBlobUrl)
        .then((r) => {
          return r.blob();
        })
        .then(
          (file) =>
            new File(
              [file],
              selectedUser._id + '-' + user._id + '-' + Date.now(),
              {
                type: 'audio/wav',
              }
            )
        )
        .then((file) => setMedia(file));
  }, [mediaBlobUrl]);

  useEffect(() => {
    if (socketRef.current == null) {
      socketRef.current = io(ENDPOINT);
    }
    socket = socketRef.current;
    socket.emit('setup', user._id);

    return () => socket.close();
  }, []);

  useEffect(() => {
    !scrollBoolean &&
      chatBody.current &&
      chatMessage.current &&
      chatBody.current.scroll(0, chatMessage.current.offsetTop);
    return () => {};
  }, [messages]);

  useEffect(() => {
    socket.on('message received', (newMessage) => {
      setLimit((e) => e++);
      if (
        selectedChat._id &&
        selectedChat.users.find((e) => {
          return e._id === newMessage.sender;
        })
      ) {
        setMessages([...messages, newMessage]);
      } else {
        setNotifications((prev) => {
          if (prev.find((e) => e._id === newMessage._id)) {
            prev[prev.map((e) => e._id).indexOf(newMessage._id)].message =
              newMessage.message;
            prev.sort((x, y) => {
              return x._id ===
                prev[prev.map((e) => e._id).indexOf(newMessage._id)]._id
                ? -1
                : y === prev[prev.map((e) => e._id).indexOf(newMessage._id)]._id
                ? 1
                : 0;
            });
            return prev;
          } else {
            setNotifications([newMessage, ...notifications]);
          }
        });
      }
      setFriendList((prev) => {
        const latestMessage = [...prev];
        if (friendList.find((e) => e._id === newMessage._id)) {
          latestMessage[
            prev.map((e) => e._id).indexOf(newMessage._id)
          ].lastMessage = newMessage.message;
          latestMessage.sort((x, y) => {
            return x._id ===
              latestMessage[prev.map((e) => e._id).indexOf(newMessage._id)]._id
              ? -1
              : y ===
                latestMessage[prev.map((e) => e._id).indexOf(newMessage._id)]
                  ._id
              ? 1
              : 0;
          });
          return latestMessage;
        } else {
          return [
            {
              _id: newMessage._id,
              lastMessage: newMessage.message,
              users: [
                {
                  _id: newMessage.sender,
                  name: newMessage.senderName,
                  picture: newMessage.picture,
                },
              ],
            },
            ...latestMessage,
          ];
        }
      });
    });
    socket.on('inRoom', (id) => {
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
    socket.on('leave', (id) => {
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
    setLimit(15);
    setScrollBoolean(false);
    if (selectedChat && selectedChat._id) {
      setSelectedPic(
        selectedChat.users.find((e) => e._id !== user._id).picture
      );

      setSelectedUser(selectedChat.users.find((e) => e._id !== user._id));
      setMessages([]);
      if (remoteId) {
        socket.emit('outRoom', {
          id: user._id,
          remoteId: remoteId,
        });
      }
      axios
        .get(`/messages/sync?chatId=${selectedChat._id}`)
        .then(({ data }) => {
          setMessages(data);
          socket.emit('inRoom', {
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

  const sendMessage = async (e) => {
    e.preventDefault();
    if (input || media) {
      var formData = new FormData();
      media
        ? formData.append('message', media, media.name)
        : formData.append('message', input);

      formData.append('sender', user._id);
      formData.append('_id', selectedChat._id);
      formData.append('userName', user.name);

      var date = new Date();
      date = date.toString();
      try {
        const { data } = await axios.post('messages/new', formData);
        socket.emit('newMessage', {
          message: media ? data.message : input,
          vocal: media ? true : false,
          sender: user._id,
          senderName: user.name,
          senderPicture: user.picture,
          remoteId: selectedChat.users.find((e) => e._id !== user._id)._id,
          _id: selectedChat._id,
        });
        setMedia(null);
        setLimit((e) => e++);
        setMessages([...messages, data]);
        setFriendList((prev) => {
          const latestMessage = [...prev];
          if (friendList.find((e) => e._id === selectedChat._id)) {
            latestMessage[
              prev.map((e) => e._id).indexOf(selectedChat._id)
            ].lastMessage = data.message;
            latestMessage.sort((x, y) => {
              return x._id ===
                latestMessage[prev.map((e) => e._id).indexOf(selectedChat._id)]
                  ._id
                ? -1
                : y ===
                  latestMessage[
                    prev.map((e) => e._id).indexOf(selectedChat._id)
                  ]._id
                ? 1
                : 0;
            });
            return latestMessage;
          } else {
            return [
              {
                _id: selectedChat._id,
                lastMessage: data.message,
                users: [
                  {
                    _id: selectedChat.users.find((e) => e._id !== user._id)._id,
                    name: selectedChat.users.find((e) => e._id !== user._id)
                      .name,
                    picture: selectedChat.users.find((e) => e._id !== user._id)
                      .picture,
                  },
                ],
              },
              ...latestMessage,
            ];
          }
        });
      } catch (err) {
        console.log(err);
      }
      setInput('');
    }
  };

  const notificationsHandler = (e, i) => {
    setNotifications((prev) => (prev.length === 1 ? [] : prev.splice(i, 1)));
    setSelectedChat({
      _id: e._id,
      lastMessage: e.message,
      users: [{ _id: e.sender, name: e.senderName, picture: e.picture }],
    });
    setSearch((e) => !e);
  };

  // const messagesScrollHandler = (e) => {
  //   if (
  //     e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight <=
  //     100
  //   )
  //     setScrollBoolean(false);
  //   else setScrollBoolean(true);
  //   if (e.target.scrollTop <= 0) {
  //     axios
  //       .get(
  //         `/messages/sync?chatId=${selectedChat._id}&limit=${limit}&step=${step}`
  //       )
  //       .then(({ data }) => {
  //         setScrollBoolean(true);
  //         setMessages((prev) => [...data, ...prev]);
  //         console.log(data);
  //         socket.emit("inRoom", {
  //           id: user._id,
  //           remoteId: selectedChat.users.find((e) => {
  //             return e._id !== user._id;
  //           })._id,
  //         });

  //         setRemoteId(selectedChat.users.find((e) => e._id !== user._id)._id);
  //       });
  //     setLimit((e) => e + 5);
  //   }
  // };
  const logout = () => {
    setUser('');
    localStorage.setItem('user', false);
    Cookies.set('token', false);
    sessionStorage.setItem('image', '');
    sessionStorage.setItem('selectedChat', '');
  };
  return (
    <div className="chat">
      <div className="chat__header">
        <Avatar src={selectedPic ? selectedPic : null} />
        <div className="chat__headerInfo">
          <h3>{selectedUser && selectedUser.name}</h3>
          {selectedChat._id &&
            inRoom.find(
              (e) =>
                e.id === selectedChat.users.find((e) => e._id !== user._id)._id
            ) &&
            inRoom.find(
              (e) =>
                e.id === selectedChat.users.find((e) => e._id !== user._id)._id
            ).status && <strong style={{ color: 'green' }}>In Room</strong>}
        </div>
        <div className="chat__headerRight">
          <IconButton onClick={logout}>
            <BiLogOut style={{ color: 'red' }} title="Logout" />
          </IconButton>
          <IconButton
            title="New Message"
            style={{ position: 'relative' }}
            onClick={() =>
              notifications.length > 0 &&
              setDisplayNotifications(!displayNotifications)
            }
          >
            <MoreVert />

            {!displayNotifications && (
              <span
                style={{ marginLeft: '2px' }}
                className={
                  notifications.length > 0 ? 'notifications-number' : null
                }
              >
                {notifications.length}
              </span>
            )}

            {displayNotifications && (
              <ul id="notifications">
                {notifications.map((e, i) => (
                  <li
                    key={i}
                    style={{
                      borderBottom: '1px solid black',
                      listStyleType: 'none',
                    }}
                    className="notification"
                    onClick={() => notificationsHandler(e, i)}
                  >
                    <span
                      style={{
                        paddingRight: '6px',
                        borderRight: '1px solid black',
                      }}
                    >
                      {e.senderName.charAt(0).toUpperCase() +
                        e.senderName.slice(1)}
                    </span>
                    <span
                      style={{
                        paddingLeft: '4px',
                      }}
                    >
                      {e.message}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </IconButton>
        </div>
      </div>
      {
        <div
          className="chat__body"
          ref={chatBody}
          // onScroll={messagesScrollHandler}
        >
          {scrollBoolean && (
            <img
              title="Scroll To Bottom"
              className="scroll__arrow"
              src="arrow.png"
              onClick={(e) =>
                chatBody.current.scroll(0, chatMessage.current.offsetTop)
              }
            />
          )}
          {messages.map((message, i) => {
            if (message.message && message.vocal) {
              return <Audio message={message} key={message._id} />;
            } else {
              return (
                <p
                  key={i}
                  className={`chat__message ${
                    message.sender === user._id && 'chat__receiver'
                  }`}
                  ref={i === messages.length - 1 ? chatMessage : null}
                >
                  <span className="chat__name">{message.name}</span>
                  {message.message}
                  <span className="chat__timestamp">{message.createdAt}</span>
                </p>
              );
            }
          })}
        </div>
      }
      {selectedChat && (
        <div className="chat__footer">
          <InsertEmoticonIcon />
          <form>
            {media ? (
              <audio src={mediaBlobUrl} controls autoPlay />
            ) : (
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message"
              />
            )}
            <button onClick={sendMessage} type="submit">
              send a message
            </button>
          </form>
          {!media ? (
            <>
              <p style={{ position: 'absolute', right: '10%', bottom: '0%' }}>
                {status}
              </p>
              <SendIcon
                style={{ cursor: 'pointer' }}
                title={'Send'}
                onClick={sendMessage}
              />
              <MicIcon
                tabIndex="0"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
              />
            </>
          ) : (
            <>
              <CancelIcon
                style={{
                  color: 'red',
                  backgroundColor: 'lightgrey',
                  cursor: 'pointer',
                }}
                title={'cancel'}
                onClick={(e) => setMedia(null)}
              />{' '}
              <SendIcon
                style={{ cursor: 'pointer' }}
                title={'Send'}
                onClick={sendMessage}
              />
            </>
          )}{' '}
        </div>
      )}
    </div>
  );
}

export default Chat;
