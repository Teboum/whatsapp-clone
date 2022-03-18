import React from 'react'
import Sidebar from './Sidebar'
import Chat from './Chat'

function Home({lastMessage,setChat,chat,setMessages,messages,user,token,image,homeID,setHomeID,setHomeChange,newMessage,setNewMessage}) {
    return (
        <div className="app__body">
            <Sidebar lastMessage={lastMessage} setHomeChange={setHomeChange} setHomeID={setHomeID} homeID={homeID} user={user} token={token} image={image}/>
          <Chat setChat={setChat} chat={chat} setMessages={setMessages} setNewMessage={setNewMessage} newMessage={newMessage}   homeID={homeID} user={user} token={token} messages={messages} /> 
        </div>
    )
}

export default Home
